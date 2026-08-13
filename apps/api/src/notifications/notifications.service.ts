import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  DevicePlatform,
  DeviceTokenStatus,
  EntityStatus,
  NotificationChannelSetting,
  NotificationDeliveryStatus,
  NotificationReadStatus,
  NotificationSmsSetting,
} from '../common/enums';
import { PushService } from '../common/push/push.service';
import { SmsService } from '../common/sms/sms.service';
import {
  DeviceToken,
  DeviceTokenDocument,
} from '../schemas/device-token.schema';
import {
  Notification,
  NotificationDocument,
} from '../schemas/notification.schema';
import {
  NotificationTemplate,
  NotificationTemplateDocument,
} from '../schemas/notification-template.schema';
import { UsersService } from '../users/users.service';
import { DEFAULT_NOTIFICATION_TEMPLATES } from './notification-defaults';

export interface DispatchInput {
  userId: string | Types.ObjectId;
  templateKey: string;
  /** Values for `{placeholder}` tokens in title/body. */
  params?: Record<string, string | number>;
  /** Structured context stored on the inbox item (for client deep-links). */
  payload?: Record<string, unknown>;
  /**
   * Critical sends fall back to SMS when push delivery fails
   * (templates configured as `critical_fallback`).
   */
  critical?: boolean;
  /** Dedupe key so retried triggers (callbacks, crons) never double-send. */
  idempotencyKey?: string;
  /** Ordered tokens for the SMS provider template; defaults to param values. */
  smsTokens?: string[];
}

export interface DispatchResult {
  notificationId: string | null;
  push: NotificationDeliveryStatus | null;
  sms: NotificationDeliveryStatus | null;
  deduplicated: boolean;
}

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
    @InjectModel(NotificationTemplate.name)
    private readonly templateModel: Model<NotificationTemplateDocument>,
    @InjectModel(DeviceToken.name)
    private readonly deviceTokenModel: Model<DeviceTokenDocument>,
    private readonly push: PushService,
    private readonly sms: SmsService,
    private readonly users: UsersService,
  ) {}

  /** Seed missing default templates; never overwrite admin-edited copy. */
  async onModuleInit(): Promise<void> {
    const operations = DEFAULT_NOTIFICATION_TEMPLATES.map((template) => ({
      updateOne: {
        filter: { key: template.key },
        update: { $setOnInsert: template },
        upsert: true,
      },
    }));
    const result = await this.templateModel.bulkWrite(operations, {
      ordered: false,
    });
    if (result.upsertedCount > 0) {
      this.logger.log(
        `Seeded ${result.upsertedCount} notification template(s)`,
      );
    }
  }

  private render(
    text: string,
    params: Record<string, string | number>,
  ): string {
    return text.replace(/\{(\w+)\}/g, (match, token: string) =>
      params[token] !== undefined ? String(params[token]) : match,
    );
  }

  /**
   * Single entry point for all transactional notifications:
   * inbox record + push + SMS fallback, idempotent per `idempotencyKey`.
   * Never throws — delivery failures are recorded, not propagated to the
   * business flow that triggered the notification.
   */
  async dispatch(input: DispatchInput): Promise<DispatchResult> {
    try {
      return await this.dispatchInternal(input);
    } catch (error) {
      this.logger.error(
        `dispatch failed template=${input.templateKey} user=${String(input.userId)}`,
        error instanceof Error ? error.stack : String(error),
      );
      return { notificationId: null, push: null, sms: null, deduplicated: false };
    }
  }

  private async dispatchInternal(
    input: DispatchInput,
  ): Promise<DispatchResult> {
    if (input.idempotencyKey) {
      const existing = await this.notificationModel
        .findOne({ idempotencyKey: input.idempotencyKey })
        .select('_id delivery')
        .lean();
      if (existing) {
        return {
          notificationId: existing._id.toString(),
          push: existing.delivery?.push?.status ?? null,
          sms: existing.delivery?.sms?.status ?? null,
          deduplicated: true,
        };
      }
    }

    const template = await this.templateModel
      .findOne({ key: input.templateKey, status: EntityStatus.ACTIVE })
      .lean();
    if (!template) {
      this.logger.warn(`Unknown/inactive template: ${input.templateKey}`);
      return { notificationId: null, push: null, sms: null, deduplicated: false };
    }

    const params = input.params ?? {};
    const title = this.render(template.title, params);
    const body = this.render(template.body, params);
    const userId = new Types.ObjectId(input.userId);

    let notification: NotificationDocument;
    try {
      notification = await this.notificationModel.create({
        userId,
        templateKey: template.key,
        title,
        body,
        payload: input.payload,
        readStatus:
          template.channels.inbox === NotificationChannelSetting.ENABLED
            ? NotificationReadStatus.UNREAD
            : NotificationReadStatus.ARCHIVED,
        idempotencyKey: input.idempotencyKey,
      });
    } catch (error) {
      // Duplicate idempotencyKey inserted by a concurrent trigger — treat as dedup.
      if ((error as { code?: number }).code === 11000 && input.idempotencyKey) {
        return { notificationId: null, push: null, sms: null, deduplicated: true };
      }
      throw error;
    }

    const pushStatus = await this.deliverPush(notification, template, userId);
    const smsStatus = await this.deliverSms(
      notification,
      template,
      userId,
      pushStatus,
      input,
    );

    await notification.save();

    return {
      notificationId: notification._id.toString(),
      push: pushStatus,
      sms: smsStatus,
      deduplicated: false,
    };
  }

  private async deliverPush(
    notification: NotificationDocument,
    template: NotificationTemplate,
    userId: Types.ObjectId,
  ): Promise<NotificationDeliveryStatus | null> {
    if (template.channels.push !== NotificationChannelSetting.ENABLED) {
      return null;
    }

    const devices = await this.deviceTokenModel
      .find({ userId, status: DeviceTokenStatus.ACTIVE })
      .select('token')
      .lean();

    if (devices.length === 0) {
      notification.delivery.push = {
        status: NotificationDeliveryStatus.SKIPPED,
        error: 'no active device tokens',
      };
      return NotificationDeliveryStatus.SKIPPED;
    }

    try {
      const result = await this.push.send(
        devices.map((device) => device.token),
        {
          title: notification.title,
          body: notification.body,
          data: {
            templateKey: notification.templateKey,
            notificationId: notification._id.toString(),
          },
        },
      );

      if (result.invalidTokens.length > 0) {
        await this.deviceTokenModel.updateMany(
          { token: { $in: result.invalidTokens } },
          { status: DeviceTokenStatus.REVOKED },
        );
      }

      const status =
        result.sent > 0
          ? NotificationDeliveryStatus.SENT
          : NotificationDeliveryStatus.FAILED;
      notification.delivery.push = {
        status,
        sentAt: status === NotificationDeliveryStatus.SENT ? new Date() : undefined,
        error:
          status === NotificationDeliveryStatus.FAILED
            ? 'provider reported zero deliveries'
            : undefined,
      };
      return status;
    } catch (error) {
      notification.delivery.push = {
        status: NotificationDeliveryStatus.FAILED,
        error: error instanceof Error ? error.message : String(error),
      };
      return NotificationDeliveryStatus.FAILED;
    }
  }

  private async deliverSms(
    notification: NotificationDocument,
    template: NotificationTemplate,
    userId: Types.ObjectId,
    pushStatus: NotificationDeliveryStatus | null,
    input: DispatchInput,
  ): Promise<NotificationDeliveryStatus | null> {
    const setting = template.channels.sms;
    if (setting === NotificationSmsSetting.DISABLED) return null;

    const pushDelivered = pushStatus === NotificationDeliveryStatus.SENT;
    const shouldSend =
      setting === NotificationSmsSetting.ALWAYS ||
      (setting === NotificationSmsSetting.CRITICAL_FALLBACK &&
        input.critical === true &&
        !pushDelivered);

    if (!shouldSend) {
      notification.delivery.sms = {
        status: NotificationDeliveryStatus.SKIPPED,
      };
      return NotificationDeliveryStatus.SKIPPED;
    }

    try {
      const user = await this.users.findById(userId.toString());
      const tokens =
        input.smsTokens ??
        Object.values(input.params ?? {}).map((value) => String(value));
      await this.sms.sendTemplate(
        user.phone,
        template.smsTemplateKey ?? template.key,
        tokens,
      );
      notification.delivery.sms = {
        status: NotificationDeliveryStatus.SENT,
        sentAt: new Date(),
      };
      return NotificationDeliveryStatus.SENT;
    } catch (error) {
      notification.delivery.sms = {
        status: NotificationDeliveryStatus.FAILED,
        error: error instanceof Error ? error.message : String(error),
      };
      return NotificationDeliveryStatus.FAILED;
    }
  }

  // ---------------------------------------------------------------- inbox

  async list(
    userId: string,
    options: { page: number; limit: number; readStatus?: NotificationReadStatus },
  ) {
    const filter: Record<string, unknown> = {
      userId: new Types.ObjectId(userId),
      // Inbox-disabled records are archived at creation; hide them by default.
      ...(options.readStatus
        ? { readStatus: options.readStatus }
        : { readStatus: { $ne: NotificationReadStatus.ARCHIVED } }),
    };

    const [items, total, unreadCount] = await Promise.all([
      this.notificationModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((options.page - 1) * options.limit)
        .limit(options.limit)
        .select('-delivery -idempotencyKey')
        .lean(),
      this.notificationModel.countDocuments(filter),
      this.notificationModel.countDocuments({
        userId: new Types.ObjectId(userId),
        readStatus: NotificationReadStatus.UNREAD,
      }),
    ]);

    return {
      items: items.map((item) => ({
        id: item._id.toString(),
        templateKey: item.templateKey,
        title: item.title,
        body: item.body,
        payload: item.payload ?? null,
        readStatus: item.readStatus,
        createdAt: item.createdAt,
      })),
      meta: { page: options.page, limit: options.limit, total, unreadCount },
    };
  }

  async markRead(userId: string, notificationId: string): Promise<void> {
    await this.notificationModel.updateOne(
      {
        _id: new Types.ObjectId(notificationId),
        userId: new Types.ObjectId(userId),
        readStatus: NotificationReadStatus.UNREAD,
      },
      { readStatus: NotificationReadStatus.READ },
    );
  }

  async markAllRead(userId: string): Promise<{ modified: number }> {
    const result = await this.notificationModel.updateMany(
      {
        userId: new Types.ObjectId(userId),
        readStatus: NotificationReadStatus.UNREAD,
      },
      { readStatus: NotificationReadStatus.READ },
    );
    return { modified: result.modifiedCount };
  }

  // --------------------------------------------------------------- devices

  async registerDevice(
    userId: string,
    token: string,
    platform: DevicePlatform,
  ) {
    const device = await this.deviceTokenModel.findOneAndUpdate(
      { token },
      {
        userId: new Types.ObjectId(userId),
        platform,
        status: DeviceTokenStatus.ACTIVE,
        lastSeenAt: new Date(),
      },
      { upsert: true, new: true },
    );
    return { id: device._id.toString(), status: device.status };
  }

  async revokeDevice(userId: string, token: string): Promise<void> {
    await this.deviceTokenModel.updateOne(
      { token, userId: new Types.ObjectId(userId) },
      { status: DeviceTokenStatus.REVOKED },
    );
  }

  // ------------------------------------------------- admin template CRUD

  async listTemplates(query: { status?: EntityStatus; search?: string }) {
    const filter: Record<string, unknown> = {};
    if (query.status) filter.status = query.status;
    if (query.search) {
      const rx = new RegExp(
        query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        'i',
      );
      filter.$or = [{ key: rx }, { title: rx }, { body: rx }];
    }
    const items = await this.templateModel.find(filter).sort({ key: 1 }).lean();
    return { items: items.map((t) => this.templateToPublic(t)) };
  }

  async getTemplate(key: string) {
    const template = await this.templateModel.findOne({ key }).lean();
    if (!template) throw new NotFoundException('Template not found');
    return this.templateToPublic(template);
  }

  async createTemplate(dto: {
    key: string;
    title: string;
    body: string;
    channels?: Partial<NotificationTemplate['channels']>;
    smsTemplateKey?: string;
  }) {
    const existing = await this.templateModel.exists({ key: dto.key });
    if (existing) {
      throw new ConflictException('Template key already exists');
    }
    const created = await this.templateModel.create({
      key: dto.key,
      title: dto.title,
      body: dto.body,
      channels: {
        push: dto.channels?.push ?? NotificationChannelSetting.ENABLED,
        sms: dto.channels?.sms ?? NotificationSmsSetting.DISABLED,
        inbox: dto.channels?.inbox ?? NotificationChannelSetting.ENABLED,
      },
      smsTemplateKey: dto.smsTemplateKey,
      status: EntityStatus.ACTIVE,
    });
    return this.templateToPublic(created.toObject());
  }

  async updateTemplate(
    key: string,
    dto: {
      title?: string;
      body?: string;
      channels?: Partial<NotificationTemplate['channels']>;
      smsTemplateKey?: string;
      status?: EntityStatus;
    },
  ) {
    const template = await this.templateModel.findOne({ key });
    if (!template) throw new NotFoundException('Template not found');

    if (dto.title !== undefined) template.title = dto.title;
    if (dto.body !== undefined) template.body = dto.body;
    if (dto.smsTemplateKey !== undefined) {
      template.smsTemplateKey = dto.smsTemplateKey;
    }
    if (dto.status !== undefined) template.status = dto.status;
    if (dto.channels) {
      template.channels = {
        push: dto.channels.push ?? template.channels.push,
        sms: dto.channels.sms ?? template.channels.sms,
        inbox: dto.channels.inbox ?? template.channels.inbox,
      };
      template.markModified('channels');
    }
    await template.save();
    return this.templateToPublic(template.toObject());
  }

  private templateToPublic(t: {
    _id: Types.ObjectId;
    key: string;
    title: string;
    body: string;
    channels: NotificationTemplate['channels'];
    smsTemplateKey?: string;
    status: EntityStatus;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    return {
      id: t._id.toString(),
      key: t.key,
      title: t.title,
      body: t.body,
      channels: {
        push: t.channels.push,
        sms: t.channels.sms,
        inbox: t.channels.inbox,
      },
      smsTemplateKey: t.smsTemplateKey ?? null,
      status: t.status,
      createdAt: t.createdAt ?? null,
      updatedAt: t.updatedAt ?? null,
    };
  }
}

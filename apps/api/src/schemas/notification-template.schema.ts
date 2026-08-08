import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  EntityStatus,
  NotificationChannelSetting,
  NotificationSmsSetting,
} from '../common/enums';

export type NotificationTemplateDocument =
  HydratedDocument<NotificationTemplate>;

@Schema({ _id: false })
export class NotificationChannels {
  @Prop({
    type: String,
    enum: NotificationChannelSetting,
    default: NotificationChannelSetting.ENABLED,
  })
  push!: NotificationChannelSetting;

  @Prop({
    type: String,
    enum: NotificationSmsSetting,
    default: NotificationSmsSetting.DISABLED,
  })
  sms!: NotificationSmsSetting;

  @Prop({
    type: String,
    enum: NotificationChannelSetting,
    default: NotificationChannelSetting.ENABLED,
  })
  inbox!: NotificationChannelSetting;
}

export const NotificationChannelsSchema =
  SchemaFactory.createForClass(NotificationChannels);

/**
 * Transactional notification templates (N1). Defaults are seeded at boot
 * and remain editable by admins without redeploys.
 * Placeholders use `{token}` syntax, e.g. `رزرو {clubName} تأیید شد`.
 */
@Schema({ timestamps: true, collection: 'notification_templates' })
export class NotificationTemplate {
  @Prop({ required: true, trim: true, unique: true })
  key!: string;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true, trim: true })
  body!: string;

  @Prop({
    type: NotificationChannelsSchema,
    default: () => ({
      push: NotificationChannelSetting.ENABLED,
      sms: NotificationSmsSetting.DISABLED,
      inbox: NotificationChannelSetting.ENABLED,
    }),
  })
  channels!: NotificationChannels;

  /** Kavenegar VerifyLookup template name; falls back to `key` when unset. */
  @Prop({ trim: true })
  smsTemplateKey?: string;

  @Prop({
    type: String,
    enum: EntityStatus,
    default: EntityStatus.ACTIVE,
    index: true,
  })
  status!: EntityStatus;

  createdAt!: Date;
  updatedAt!: Date;
}

export const NotificationTemplateSchema =
  SchemaFactory.createForClass(NotificationTemplate);

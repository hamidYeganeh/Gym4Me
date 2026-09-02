import { Inject, Injectable } from "@nestjs/common";
import { objectIdFrom, type DatabaseModels } from "../../database/index.js";
import { PERMISSIONS } from "../../security/rbac.js";
import { ApiError } from "../../common/api-error.js";
import { DATABASE_MODELS } from "../../database/database.constants.js";
import { AuditService } from "../audit/audit.service.js";
import { OrganizationAccessService } from "../organization/organization-access.service.js";
import { flattenPatch, toStorage } from "../organization/entity-mapper.js";

const interpolate = (text: string, values: Record<string, unknown>) =>
  text.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key: string) => String(values[key] ?? ""));

@Injectable()
export class NotificationService {
  constructor(
    @Inject(DATABASE_MODELS) private readonly models: DatabaseModels,
    private readonly access: OrganizationAccessService,
    private readonly audit: AuditService,
  ) {}

  async mine(userId: string, query: any) {
    const filter: any = {
      "recipient.id": objectIdFrom(userId),
      "recipient.channel": "in_app",
      "schedule.sendAt": { $lte: new Date() },
      ...(query.unread_only ? { "recipient.readAt": { $exists: false } } : {}),
      ...(query.status ? { status: query.status } : {}),
    };
    const [items, total] = await Promise.all([
      this.models.NotificationJob.find(filter)
        .sort({ createdAt: -1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .lean() as any,
      this.models.NotificationJob.countDocuments(filter),
    ]);
    const templates = (await this.models.NotificationTemplate.find({
      _id: { $in: items.map((item: any) => item.templateId) },
    }).lean()) as any[];
    return {
      items: items.map((item: any) => {
        const template = templates.find((row) => String(row._id) === String(item.templateId));
        return {
          ...item,
          content: {
            text: interpolate(
              template?.content?.text ?? item.payload?.message ?? "",
              item.payload ?? {},
            ),
            action: item.payload?.action,
          },
        };
      }),
      total,
      unread: await this.models.NotificationJob.countDocuments({
        "recipient.id": objectIdFrom(userId),
        "recipient.channel": "in_app",
        "schedule.sendAt": { $lte: new Date() },
        "recipient.readAt": { $exists: false },
      }),
    };
  }

  async read(userId: string, id: string) {
    const item = await this.models.NotificationJob.findOneAndUpdate(
      {
        _id: objectIdFrom(id),
        "recipient.id": objectIdFrom(userId),
        "recipient.channel": "in_app",
      },
      { $set: { "recipient.readAt": new Date() } },
      { returnDocument: "after" },
    ).lean();
    if (!item) throw new ApiError("NOTIFICATION_NOT_FOUND", "اعلان پیدا نشد.", 404);
    return item;
  }

  async readAll(userId: string) {
    const result = await this.models.NotificationJob.updateMany(
      {
        "recipient.id": objectIdFrom(userId),
        "recipient.channel": "in_app",
        "recipient.readAt": { $exists: false },
      },
      { $set: { "recipient.readAt": new Date() } },
    );
    return { updated: result.modifiedCount };
  }

  async preferences(userId: string) {
    return this.models.NotificationPreference.findOneAndUpdate(
      { userId: objectIdFrom(userId) },
      {
        $setOnInsert: {
          userId: objectIdFrom(userId),
          status: "active",
          createdBy: objectIdFrom(userId),
        },
      },
      { upsert: true, returnDocument: "after" },
    ).lean();
  }

  async updatePreferences(userId: string, input: any) {
    return this.models.NotificationPreference.findOneAndUpdate(
      { userId: objectIdFrom(userId) },
      {
        $set: { ...flattenPatch(toStorage(input) as any), updatedBy: objectIdFrom(userId) },
        $setOnInsert: {
          userId: objectIdFrom(userId),
          status: "active",
          createdBy: objectIdFrom(userId),
        },
      },
      { upsert: true, returnDocument: "after" },
    ).lean();
  }

  async devices(userId: string) {
    return this.models.DeviceInstallation.find({ userId: objectIdFrom(userId) })
      .select({ "push.token": 0 })
      .sort({ lastSeenAt: -1 })
      .lean();
  }

  async registerDevice(userId: string, input: any) {
    const data = toStorage(input) as any;
    return this.models.DeviceInstallation.findOneAndUpdate(
      { userId: objectIdFrom(userId), installationId: input.installation_id },
      {
        $set: {
          platform: input.platform,
          push: data.push,
          device: data.device,
          app: data.app,
          lastSeenAt: new Date(),
          status: "active",
          updatedBy: objectIdFrom(userId),
        },
        $setOnInsert: {
          userId: objectIdFrom(userId),
          installationId: input.installation_id,
          createdBy: objectIdFrom(userId),
        },
      },
      { upsert: true, returnDocument: "after" },
    )
      .select({ "push.token": 0 })
      .lean();
  }

  async revokeDevice(userId: string, installationId: string) {
    const item = await this.models.DeviceInstallation.findOneAndUpdate(
      { userId: objectIdFrom(userId), installationId, status: "active" },
      {
        $set: {
          status: "revoked",
          "push.revokedAt": new Date(),
          updatedBy: objectIdFrom(userId),
        },
      },
      { returnDocument: "after" },
    )
      .select({ "push.token": 0 })
      .lean();
    if (!item) throw new ApiError("DEVICE_INSTALLATION_NOT_FOUND", "دستگاه فعال پیدا نشد.", 404);
    return item;
  }

  async announcements(actor: string, organizationId: string, query: any) {
    await this.access.assertOrganization(
      actor,
      organizationId,
      PERMISSIONS.ORGANIZATION_ANNOUNCEMENTS_MANAGE,
    );
    const filter: any = {
      organizationId: objectIdFrom(organizationId),
      ...(query.status ? { status: query.status } : {}),
    };
    const [items, total] = await Promise.all([
      this.models.Announcement.find(filter)
        .sort({ createdAt: -1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .lean(),
      this.models.Announcement.countDocuments(filter),
    ]);
    return { items, total };
  }

  private async assertBranches(organizationId: string, branchIds: string[]) {
    if (!branchIds.length) return;
    const branches = (await this.models.Branch.find({
      _id: { $in: branchIds.map(objectIdFrom) },
      status: { $ne: "archived" },
    }).lean()) as any[];
    const clubCount = await this.models.Club.countDocuments({
      _id: { $in: branches.map((item) => item.clubId) },
      organizationId: objectIdFrom(organizationId),
    });
    if (
      branches.length !== new Set(branchIds).size ||
      clubCount !== new Set(branches.map((item) => String(item.clubId))).size
    )
      throw new ApiError(
        "ANNOUNCEMENT_BRANCH_INVALID",
        "یک یا چند شعبه متعلق به این سازمان نیست.",
        422,
      );
  }

  async createAnnouncement(actor: string, organizationId: string, input: any, requestId: string) {
    await this.access.assertOrganization(
      actor,
      organizationId,
      PERMISSIONS.ORGANIZATION_ANNOUNCEMENTS_MANAGE,
    );
    await this.assertBranches(organizationId, input.audience.branch_ids);
    const item = await this.models.Announcement.create({
      organizationId: objectIdFrom(organizationId),
      ...(toStorage(input) as any),
      metrics: { recipients: 0 },
      createdBy: objectIdFrom(actor),
    });
    await this.audit.record({
      actorUserId: actor,
      action: "notification.announcement.created",
      entityType: "announcement",
      entityId: String(item._id),
      organizationId,
      after: item.toObject(),
      requestId,
    });
    return item.toObject();
  }

  async updateAnnouncement(
    actor: string,
    organizationId: string,
    id: string,
    input: any,
    requestId: string,
  ) {
    await this.access.assertOrganization(
      actor,
      organizationId,
      PERMISSIONS.ORGANIZATION_ANNOUNCEMENTS_MANAGE,
    );
    if (input.audience?.branch_ids)
      await this.assertBranches(organizationId, input.audience.branch_ids);
    const item = await this.models.Announcement.findOneAndUpdate(
      {
        _id: objectIdFrom(id),
        organizationId: objectIdFrom(organizationId),
        status: "draft",
      },
      { $set: { ...flattenPatch(toStorage(input) as any), updatedBy: objectIdFrom(actor) } },
      { returnDocument: "after" },
    ).lean();
    if (!item)
      throw new ApiError("ANNOUNCEMENT_NOT_EDITABLE", "اطلاعیه پیدا نشد یا قابل ویرایش نیست.", 409);
    await this.audit.record({
      actorUserId: actor,
      action: "notification.announcement.updated",
      entityType: "announcement",
      entityId: id,
      organizationId,
      after: item,
      requestId,
    });
    return item;
  }

  private async audienceUserIds(organizationId: string, announcement: any) {
    const branchIds = (announcement.audience?.branchIds ?? []).map(objectIdFrom);
    const bookingFilter: any = {
      organizationId: objectIdFrom(organizationId),
      status: { $in: ["confirmed", "checked_in", "completed"] },
      ...(branchIds.length ? { branchId: { $in: branchIds } } : {}),
    };
    const bookingUsers = await this.models.Booking.distinct("customerUserId", bookingFilter);
    if (
      announcement.audience?.type === "active_bookers" ||
      announcement.audience?.type === "branch_members"
    )
      return bookingUsers.map(String);
    const productIds = await this.models.MembershipProduct.distinct("_id", {
      organizationId: objectIdFrom(organizationId),
      status: "active",
    });
    const contracts = (await this.models.MembershipContract.find({
      productId: { $in: productIds },
      status: "active",
      "validity.endsAt": { $gt: new Date() },
    })
      .select({ beneficiaries: 1 })
      .lean()) as any[];
    return [
      ...new Set([
        ...bookingUsers.map(String),
        ...contracts.flatMap((contract) =>
          (contract.beneficiaries ?? []).map((member: any) => String(member.userId)),
        ),
      ]),
    ];
  }

  async publish(actor: string, organizationId: string, id: string, requestId: string) {
    await this.access.assertOrganization(
      actor,
      organizationId,
      PERMISSIONS.ORGANIZATION_ANNOUNCEMENTS_MANAGE,
    );
    const announcement = (await this.models.Announcement.findOne({
      _id: objectIdFrom(id),
      organizationId: objectIdFrom(organizationId),
      status: "draft",
    }).lean()) as any;
    if (!announcement)
      throw new ApiError("ANNOUNCEMENT_NOT_PUBLISHABLE", "اطلاعیه قابل انتشار نیست.", 409);
    const users = await this.audienceUserIds(organizationId, announcement);
    const preferences = (await this.models.NotificationPreference.find({
      userId: { $in: users.map(objectIdFrom) },
    }).lean()) as any[];
    const template = (await this.models.NotificationTemplate.findOneAndUpdate(
      { code: "organization_announcement" },
      {
        $setOnInsert: {
          code: "organization_announcement",
          channel: "multi",
          locale: "fa-IR",
          content: { text: "{title}\n{message}" },
          provider: { code: "kavenegar" },
          status: "active",
        },
      },
      { upsert: true, returnDocument: "after" },
    ).lean()) as any;
    const sendAt = announcement.schedule?.sendAt
      ? new Date(announcement.schedule.sendAt)
      : new Date();
    const jobs: any[] = [];
    for (const userId of users) {
      const preference = preferences.find((item) => String(item.userId) === userId);
      if (preference?.topics?.announcements === "disabled") continue;
      const payload = {
        title: announcement.profile?.title,
        message: announcement.profile?.message,
        action: announcement.profile?.action,
      };
      if (
        (announcement.channels ?? []).includes("in_app") &&
        preference?.channels?.inApp !== "disabled"
      )
        jobs.push({
          templateId: template._id,
          organizationId: objectIdFrom(organizationId),
          source: { type: "announcement", id: announcement._id },
          dedupeKey: `announcement:${id}:user:${userId}:in_app`,
          recipient: { type: "user", id: objectIdFrom(userId), channel: "in_app" },
          payload,
          schedule: { sendAt },
          delivery: { attempts: 0 },
          status: "pending",
          createdBy: objectIdFrom(actor),
        });
      if ((announcement.channels ?? []).includes("sms") && preference?.channels?.sms !== "disabled")
        jobs.push({
          templateId: template._id,
          organizationId: objectIdFrom(organizationId),
          source: { type: "announcement", id: announcement._id },
          dedupeKey: `announcement:${id}:user:${userId}:sms`,
          recipient: { type: "user", id: objectIdFrom(userId), channel: "sms" },
          payload,
          schedule: { sendAt },
          delivery: { attempts: 0 },
          status: "pending",
          createdBy: objectIdFrom(actor),
        });
      if (
        (announcement.channels ?? []).includes("push") &&
        preference?.channels?.push !== "disabled"
      )
        jobs.push({
          templateId: template._id,
          organizationId: objectIdFrom(organizationId),
          source: { type: "announcement", id: announcement._id },
          dedupeKey: `announcement:${id}:user:${userId}:push`,
          recipient: { type: "user", id: objectIdFrom(userId), channel: "push" },
          payload,
          schedule: { sendAt },
          delivery: { attempts: 0 },
          status: "pending",
          createdBy: objectIdFrom(actor),
        });
    }
    if (jobs.length) await this.models.NotificationJob.insertMany(jobs, { ordered: false });
    const item = await this.models.Announcement.findByIdAndUpdate(
      id,
      {
        $set: {
          status: sendAt > new Date() ? "scheduled" : "published",
          "schedule.publishedAt": new Date(),
          "metrics.recipients": users.length,
          "metrics.jobs": jobs.length,
          updatedBy: objectIdFrom(actor),
        },
      },
      { returnDocument: "after" },
    ).lean();
    await this.audit.record({
      actorUserId: actor,
      action: "notification.announcement.published",
      entityType: "announcement",
      entityId: id,
      organizationId,
      after: item,
      requestId,
    });
    return item;
  }

  async adminJobs(query: any) {
    const filter = query.status ? { status: query.status } : {};
    const [items, total] = await Promise.all([
      this.models.NotificationJob.find(filter)
        .sort({ createdAt: -1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .lean(),
      this.models.NotificationJob.countDocuments(filter),
    ]);
    return { items, total };
  }
  async adminTemplates() {
    return this.models.NotificationTemplate.find({}).sort({ code: 1 }).lean();
  }
  async updateTemplate(actor: string, id: string, input: any, requestId: string) {
    const item = await this.models.NotificationTemplate.findByIdAndUpdate(
      id,
      { $set: { ...flattenPatch(toStorage(input) as any), updatedBy: objectIdFrom(actor) } },
      { returnDocument: "after" },
    ).lean();
    if (!item) throw new ApiError("NOTIFICATION_TEMPLATE_NOT_FOUND", "قالب اعلان پیدا نشد.", 404);
    await this.audit.record({
      actorUserId: actor,
      action: "notification.template.updated",
      entityType: "notification_template",
      entityId: id,
      after: item,
      requestId,
    });
    return item;
  }
  async retry(actor: string, id: string, reason: string, requestId: string) {
    const item = await this.models.NotificationJob.findOneAndUpdate(
      { _id: objectIdFrom(id), status: "failed" },
      {
        $set: {
          status: "pending",
          "schedule.sendAt": new Date(),
          "delivery.lastError": null,
          "delivery.retryReason": reason,
          "delivery.retriedBy": objectIdFrom(actor),
          updatedBy: objectIdFrom(actor),
        },
      },
      { returnDocument: "after" },
    ).lean();
    if (!item)
      throw new ApiError("NOTIFICATION_NOT_RETRYABLE", "اعلان در وضعیت قابل تلاش مجدد نیست.", 409);
    await this.audit.record({
      actorUserId: actor,
      action: "notification.job.retried",
      entityType: "notification_job",
      entityId: id,
      after: item,
      requestId,
    });
    return item;
  }
}

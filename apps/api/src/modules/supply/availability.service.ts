import { Inject, Injectable } from "@nestjs/common";
import { objectIdFrom, type DatabaseModels } from "../../database/index.js";
import { PERMISSIONS } from "../../security/rbac.js";
import { ApiError } from "../../common/api-error.js";
import { DATABASE_MODELS } from "../../database/database.constants.js";
import { AuditService } from "../audit/audit.service.js";
import { flattenPatch, toStorage } from "../organization/entity-mapper.js";
import { materializeSlots } from "./slot-materializer.js";
import { ResourceService } from "./resource.service.js";

@Injectable()
export class AvailabilityService {
  constructor(
    @Inject(DATABASE_MODELS) private readonly models: DatabaseModels,
    private readonly resources: ResourceService,
    private readonly audit: AuditService,
  ) {}

  async createRule(
    userId: string,
    resourceId: string,
    body: Record<string, unknown>,
    requestId?: string,
  ) {
    const { organizationId } = await this.resources.context(
      userId,
      resourceId,
      PERMISSIONS.BRANCH_AVAILABILITY_MANAGE,
    );
    const item = await this.models.AvailabilityRule.create({
      ...(toStorage(body) as any),
      resourceId: objectIdFrom(resourceId),
      createdBy: objectIdFrom(userId),
    });
    await this.audit.record({
      actorUserId: userId,
      action: "availability_rule.created",
      entityType: "availability_rule",
      entityId: String(item._id),
      organizationId,
      after: item.toObject(),
      requestId,
    });
    return item;
  }
  async rules(userId: string, resourceId: string) {
    await this.resources.context(userId, resourceId, PERMISSIONS.BRANCH_AVAILABILITY_READ);
    return this.models.AvailabilityRule.find({
      resourceId: objectIdFrom(resourceId),
      status: { $ne: "archived" },
    })
      .sort({ "schedule.dayOfWeek": 1, priority: -1 })
      .lean();
  }
  async updateRule(
    userId: string,
    ruleId: string,
    body: Record<string, unknown>,
    requestId?: string,
  ) {
    const before = (await this.models.AvailabilityRule.findById(ruleId).lean()) as any;
    if (!before) throw new ApiError("AVAILABILITY_RULE_NOT_FOUND", "قاعده زمانی پیدا نشد.", 404);
    const { organizationId } = await this.resources.context(
      userId,
      String(before.resourceId),
      PERMISSIONS.BRANCH_AVAILABILITY_MANAGE,
    );
    const after = await this.models.AvailabilityRule.findByIdAndUpdate(
      ruleId,
      { $set: { ...flattenPatch(body), updatedBy: objectIdFrom(userId) }, $inc: { version: 1 } },
      { returnDocument: "after", runValidators: true },
    ).lean();
    await this.audit.record({
      actorUserId: userId,
      action: "availability_rule.updated",
      entityType: "availability_rule",
      entityId: ruleId,
      organizationId,
      before,
      after,
      requestId,
    });
    return after;
  }
  async archiveRule(userId: string, ruleId: string, requestId?: string) {
    return this.updateRule(userId, ruleId, { status: "archived" }, requestId);
  }

  async createException(
    userId: string,
    resourceId: string,
    body: Record<string, unknown>,
    requestId?: string,
  ) {
    const { organizationId } = await this.resources.context(
      userId,
      resourceId,
      PERMISSIONS.BRANCH_AVAILABILITY_MANAGE,
    );
    const item = await this.models.AvailabilityException.create({
      ...(toStorage(body) as any),
      resourceId: objectIdFrom(resourceId),
      createdBy: objectIdFrom(userId),
    });
    await this.audit.record({
      actorUserId: userId,
      action: "availability_exception.created",
      entityType: "availability_exception",
      entityId: String(item._id),
      organizationId,
      after: item.toObject(),
      requestId,
    });
    return item;
  }
  async exceptions(userId: string, resourceId: string) {
    await this.resources.context(userId, resourceId, PERMISSIONS.BRANCH_AVAILABILITY_READ);
    return this.models.AvailabilityException.find({
      resourceId: objectIdFrom(resourceId),
      status: { $ne: "archived" },
    })
      .sort({ "period.startsAt": 1 })
      .lean();
  }
  async updateException(
    userId: string,
    exceptionId: string,
    body: Record<string, unknown>,
    requestId?: string,
  ) {
    const before = (await this.models.AvailabilityException.findById(exceptionId).lean()) as any;
    if (!before)
      throw new ApiError("AVAILABILITY_EXCEPTION_NOT_FOUND", "استثنای زمانی پیدا نشد.", 404);
    const { organizationId } = await this.resources.context(
      userId,
      String(before.resourceId),
      PERMISSIONS.BRANCH_AVAILABILITY_MANAGE,
    );
    const after = await this.models.AvailabilityException.findByIdAndUpdate(
      exceptionId,
      { $set: { ...flattenPatch(body), updatedBy: objectIdFrom(userId) }, $inc: { version: 1 } },
      { returnDocument: "after", runValidators: true },
    ).lean();
    await this.audit.record({
      actorUserId: userId,
      action: "availability_exception.updated",
      entityType: "availability_exception",
      entityId: exceptionId,
      organizationId,
      before,
      after,
      requestId,
    });
    return after;
  }
  async archiveException(userId: string, exceptionId: string, requestId?: string) {
    return this.updateException(userId, exceptionId, { status: "archived" }, requestId);
  }

  private async publicContext(resourceId: string) {
    const resource = (await this.models.Resource.findOne({
      _id: objectIdFrom(resourceId),
      status: "active",
    }).lean()) as any;
    if (!resource) throw new ApiError("RESOURCE_NOT_FOUND", "منبع فعال پیدا نشد.", 404);
    const branch = (await this.models.Branch.findOne({
      _id: resource.branchId,
      status: "active",
    }).lean()) as any;
    if (!branch) throw new ApiError("BRANCH_UNAVAILABLE", "شعبه در دسترس نیست.", 404);
    const club = (await this.models.Club.findOne({
      _id: branch.clubId,
      status: "active",
    }).lean()) as any;
    if (!club) throw new ApiError("CLUB_UNAVAILABLE", "باشگاه در دسترس نیست.", 404);
    const organization = (await this.models.Organization.findById(
      club.organizationId,
    ).lean()) as any;
    return { resource, branch, organization };
  }

  async slots(
    resourceId: string,
    query: {
      from: Date;
      to: Date;
      duration_minutes?: number | undefined;
      participants: number;
      exclude_booking_id?: string | undefined;
    },
    userId?: string,
  ) {
    const context = userId
      ? await this.resources.context(userId, resourceId, PERMISSIONS.BRANCH_AVAILABILITY_READ)
      : await this.publicContext(resourceId);
    const resource = context.resource as any;
    const [rules, exceptions, bookings] = await Promise.all([
      this.models.AvailabilityRule.find({
        resourceId: objectIdFrom(resourceId),
        status: "active",
        $or: [{ "validity.startsOn": null }, { "validity.startsOn": { $lte: query.to } }],
        $and: [{ $or: [{ "validity.endsOn": null }, { "validity.endsOn": { $gte: query.from } }] }],
      }).lean() as any,
      this.models.AvailabilityException.find({
        resourceId: objectIdFrom(resourceId),
        status: "active",
        "period.startsAt": { $lt: query.to },
        "period.endsAt": { $gt: query.from },
      }).lean() as any,
      this.models.Booking.find({
        ...(query.exclude_booking_id
          ? { _id: { $ne: objectIdFrom(query.exclude_booking_id) } }
          : {}),
        status: { $in: ["pending_payment", "confirmed", "checked_in"] },
        allocations: {
          $elemMatch: {
            resourceId: objectIdFrom(resourceId),
            startAt: { $lt: query.to },
            endAt: { $gt: query.from },
          },
        },
      }).lean() as any,
    ]);
    const reservations = (bookings as any[]).flatMap((booking) =>
      (booking.allocations ?? [])
        .filter((item: any) => String(item.resourceId) === resourceId)
        .map((item: any) => ({
          startAt: new Date(item.startAt),
          endAt: new Date(item.endAt),
          quantity: Number(item.quantity ?? booking.participants?.length ?? 1),
        })),
    );
    const organization =
      (context as any).organization ??
      ((await this.models.Organization.findById((context as any).organizationId).lean()) as any);
    const timeZone = organization?.settings?.timezone ?? "Asia/Tehran";
    return {
      resourceId,
      timeZone,
      from: query.from.toISOString(),
      to: query.to.toISOString(),
      slots: materializeSlots({
        from: query.from,
        to: query.to,
        timeZone,
        durationMinutes:
          query.duration_minutes ?? resource.bookingSettings?.slotDurationMinutes ?? 60,
        participants: query.participants,
        defaultCapacity: resource.capacity?.total ?? 1,
        rules: rules as any[],
        exceptions: exceptions as any[],
        reservations,
      }),
    };
  }
}

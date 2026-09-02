import { Inject, Injectable } from "@nestjs/common";
import { getConnectionToken } from "@nestjs/mongoose";
import { idOf, objectIdFrom, type DatabaseModels } from "../../database/index.js";
import { PERMISSIONS } from "../../security/rbac.js";
import type { Connection } from "mongoose";
import { ApiError } from "../../common/api-error.js";
import { paginationOffset, type PaginationQuery } from "../../common/query.js";
import { DATABASE_MODELS } from "../../database/database.constants.js";
import { AuditService } from "../audit/audit.service.js";
import { flattenPatch, toStorage } from "./entity-mapper.js";
import { OrganizationAccessService } from "./organization-access.service.js";

@Injectable()
export class OrganizationsService {
  constructor(
    @Inject(DATABASE_MODELS) private readonly models: DatabaseModels,
    @Inject(getConnectionToken()) private readonly connection: Connection,
    private readonly access: OrganizationAccessService,
    private readonly audit: AuditService,
  ) {}

  async create(
    userId: string,
    body: Record<string, unknown>,
    requestId?: string,
    actorUserId = userId,
  ) {
    const owner = await this.models.User.exists({ _id: objectIdFrom(userId), status: "active" });
    if (!owner) throw new ApiError("OWNER_NOT_FOUND", "مالک فعال برای سازمان پیدا نشد.", 422);
    const ownerRole = await this.models.Role.findOne({ code: "club_owner", status: "active" });
    if (!ownerRole)
      throw new ApiError("OWNER_ROLE_MISSING", "نقش مالک باشگاه تنظیم نشده است.", 500);
    let organization: any;
    await this.connection.transaction(async (session) => {
      [organization] = await this.models.Organization.create(
        [
          {
            ...(toStorage(body) as Record<string, unknown>),
            ownerUserId: objectIdFrom(userId),
            status: "draft",
            createdBy: objectIdFrom(actorUserId),
          },
        ],
        { session },
      );
      if (!organization)
        throw new ApiError("ORGANIZATION_CREATE_FAILED", "ساخت سازمان ناموفق بود.", 500);
      const [assignment] = await this.models.RoleAssignment.create(
        [
          {
            userId: objectIdFrom(userId),
            roleId: ownerRole._id,
            scope: { type: "organization", id: organization._id },
            status: "active",
            createdBy: objectIdFrom(userId),
          },
        ],
        { session },
      );
      if (!assignment)
        throw new ApiError("OWNER_ASSIGNMENT_FAILED", "اختصاص نقش مالک ناموفق بود.", 500);
      await this.models.OrganizationMember.create(
        [
          {
            organizationId: organization._id,
            userId: objectIdFrom(userId),
            employment: { title: "Owner", startedAt: new Date() },
            roleAssignmentIds: [assignment._id],
            status: "active",
            createdBy: objectIdFrom(userId),
          },
        ],
        { session },
      );
      await this.models.AuditLog.create(
        [
          {
            actor: { userId: actorUserId },
            action: "organization.created",
            entity: {
              type: "organization",
              id: idOf(organization),
              organizationId: idOf(organization),
            },
            changes: { after: organization.toObject() },
            request: { id: requestId },
            occurredAt: new Date(),
          },
        ],
        { session },
      );
    });
    return organization;
  }

  async list(userId: string, query: PaginationQuery) {
    const ids = await this.access.organizationIds(userId);
    const filter: Record<string, unknown> = {
      ...(ids ? { _id: { $in: ids.map(objectIdFrom) } } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            $or: [
              { "profile.legalName": { $regex: query.search, $options: "i" } },
              { "profile.tradeName": { $regex: query.search, $options: "i" } },
            ],
          }
        : {}),
    };
    const [items, total] = await Promise.all([
      this.models.Organization.find(filter)
        .sort({ createdAt: -1 })
        .skip(paginationOffset(query))
        .limit(query.limit)
        .lean(),
      this.models.Organization.countDocuments(filter),
    ]);
    return { items, total };
  }

  async get(userId: string, id: string) {
    await this.access.assertOrganization(userId, id, PERMISSIONS.ORGANIZATION_PROFILE_READ);
    const item = await this.models.Organization.findById(id).lean();
    if (!item) throw new ApiError("ORGANIZATION_NOT_FOUND", "سازمان پیدا نشد.", 404);
    return item;
  }

  async update(userId: string, id: string, body: Record<string, unknown>, requestId?: string) {
    await this.access.assertOrganization(userId, id, PERMISSIONS.ORGANIZATION_PROFILE_MANAGE);
    const before = await this.models.Organization.findById(id).lean();
    if (!before) throw new ApiError("ORGANIZATION_NOT_FOUND", "سازمان پیدا نشد.", 404);
    if (!["draft", "rejected", "active"].includes(String((before as any).status)))
      throw new ApiError(
        "ORGANIZATION_NOT_EDITABLE",
        "سازمان در وضعیت فعلی قابل ویرایش نیست.",
        409,
      );
    const after = await this.models.Organization.findByIdAndUpdate(
      id,
      { $set: { ...flattenPatch(body), updatedBy: objectIdFrom(userId) }, $inc: { version: 1 } },
      { returnDocument: "after", runValidators: true },
    ).lean();
    await this.audit.record({
      actorUserId: userId,
      action: "organization.updated",
      entityType: "organization",
      entityId: id,
      organizationId: id,
      before,
      after,
      requestId,
    });
    return after;
  }

  async submit(userId: string, id: string, requestId?: string) {
    await this.access.assertOrganization(userId, id, PERMISSIONS.ORGANIZATION_PROFILE_MANAGE);
    const before = await this.models.Organization.findOne({
      _id: id,
      status: { $in: ["draft", "rejected"] },
    }).lean();
    if (!before)
      throw new ApiError("ORGANIZATION_NOT_SUBMITTABLE", "سازمان در وضعیت قابل ارسال نیست.", 409);
    const after = await this.models.Organization.findByIdAndUpdate(
      id,
      {
        $set: {
          status: "pending_verification",
          "review.submittedAt": new Date(),
          "review.submittedBy": objectIdFrom(userId),
          updatedBy: objectIdFrom(userId),
        },
        $inc: { version: 1 },
      },
      { returnDocument: "after" },
    ).lean();
    await this.audit.record({
      actorUserId: userId,
      action: "organization.submitted",
      entityType: "organization",
      entityId: id,
      organizationId: id,
      before,
      after,
      requestId,
    });
    return after;
  }

  async archive(userId: string, id: string, requestId?: string) {
    await this.access.assertOrganization(userId, id, PERMISSIONS.ORGANIZATION_PROFILE_MANAGE);
    const before = await this.models.Organization.findById(id).lean();
    if (!before) throw new ApiError("ORGANIZATION_NOT_FOUND", "سازمان پیدا نشد.", 404);
    const after = await this.models.Organization.findByIdAndUpdate(
      id,
      { $set: { status: "archived", updatedBy: objectIdFrom(userId) }, $inc: { version: 1 } },
      { returnDocument: "after" },
    ).lean();
    await this.audit.record({
      actorUserId: userId,
      action: "organization.archived",
      entityType: "organization",
      entityId: id,
      organizationId: id,
      before,
      after,
      requestId,
    });
    return after;
  }
}

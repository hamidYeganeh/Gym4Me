import { Inject, Injectable } from "@nestjs/common";
import { objectIdFrom, type DatabaseModels } from "../../database/index.js";
import { PERMISSIONS } from "../../security/rbac.js";
import { ApiError } from "../../common/api-error.js";
import { paginationOffset, type PaginationQuery } from "../../common/query.js";
import { DATABASE_MODELS } from "../../database/database.constants.js";
import { AuditService } from "../audit/audit.service.js";
import { flattenPatch, toStorage } from "../organization/entity-mapper.js";
import { OrganizationAccessService } from "../organization/organization-access.service.js";

@Injectable()
export class ResourceService {
  constructor(
    @Inject(DATABASE_MODELS) private readonly models: DatabaseModels,
    private readonly access: OrganizationAccessService,
    private readonly audit: AuditService,
  ) {}

  async context(userId: string, resourceId: string, permission: string) {
    const resource = (await this.models.Resource.findById(resourceId).lean()) as any;
    if (!resource) throw new ApiError("RESOURCE_NOT_FOUND", "منبع پیدا نشد.", 404);
    const branchContext = await this.access.assertBranch(
      userId,
      String(resource.branchId),
      permission,
    );
    return { resource, ...branchContext };
  }

  async create(
    userId: string,
    branchId: string,
    body: Record<string, unknown>,
    requestId?: string,
  ) {
    const { organizationId } = await this.access.assertBranch(
      userId,
      branchId,
      PERMISSIONS.BRANCH_RESOURCES_MANAGE,
    );
    const item = await this.models.Resource.create({
      ...(toStorage(body) as any),
      branchId: objectIdFrom(branchId),
      createdBy: objectIdFrom(userId),
    });
    await this.audit.record({
      actorUserId: userId,
      action: "resource.created",
      entityType: "resource",
      entityId: String(item._id),
      organizationId,
      after: item.toObject(),
      requestId,
    });
    return item;
  }

  async list(userId: string, branchId: string, query: PaginationQuery) {
    await this.access.assertBranch(userId, branchId, PERMISSIONS.BRANCH_RESOURCES_READ);
    const filter: Record<string, unknown> = {
      branchId: objectIdFrom(branchId),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            $or: [
              { "profile.name": { $regex: query.search, $options: "i" } },
              { "profile.slug": { $regex: query.search, $options: "i" } },
            ],
          }
        : {}),
    };
    const [items, total] = await Promise.all([
      this.models.Resource.find(filter)
        .sort({ createdAt: -1 })
        .skip(paginationOffset(query))
        .limit(query.limit)
        .lean(),
      this.models.Resource.countDocuments(filter),
    ]);
    return { items, total };
  }

  async get(userId: string, resourceId: string) {
    return (await this.context(userId, resourceId, PERMISSIONS.BRANCH_RESOURCES_READ)).resource;
  }

  async update(
    userId: string,
    resourceId: string,
    body: Record<string, unknown>,
    requestId?: string,
  ) {
    const { resource: before, organizationId } = await this.context(
      userId,
      resourceId,
      PERMISSIONS.BRANCH_RESOURCES_MANAGE,
    );
    const after = await this.models.Resource.findByIdAndUpdate(
      resourceId,
      { $set: { ...flattenPatch(body), updatedBy: objectIdFrom(userId) }, $inc: { version: 1 } },
      { returnDocument: "after", runValidators: true },
    ).lean();
    await this.audit.record({
      actorUserId: userId,
      action: "resource.updated",
      entityType: "resource",
      entityId: resourceId,
      organizationId,
      before,
      after,
      requestId,
    });
    return after;
  }

  async archive(userId: string, resourceId: string, requestId?: string) {
    const { resource: before, organizationId } = await this.context(
      userId,
      resourceId,
      PERMISSIONS.BRANCH_RESOURCES_MANAGE,
    );
    const activeOfferings = await this.models.Offering.countDocuments({
      "resourceRequirements.resourceId": objectIdFrom(resourceId),
      status: "active",
    });
    if (activeOfferings)
      throw new ApiError("RESOURCE_IN_USE", "این منبع در یک خدمت فعال استفاده می‌شود.", 409, {
        active_offerings: activeOfferings,
      });
    const after = await this.models.Resource.findByIdAndUpdate(
      resourceId,
      { $set: { status: "archived", updatedBy: objectIdFrom(userId) }, $inc: { version: 1 } },
      { returnDocument: "after" },
    ).lean();
    await this.audit.record({
      actorUserId: userId,
      action: "resource.archived",
      entityType: "resource",
      entityId: resourceId,
      organizationId,
      before,
      after,
      requestId,
    });
    return after;
  }
}

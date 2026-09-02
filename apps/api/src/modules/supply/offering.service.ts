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
export class OfferingService {
  constructor(
    @Inject(DATABASE_MODELS) private readonly models: DatabaseModels,
    private readonly access: OrganizationAccessService,
    private readonly audit: AuditService,
  ) {}

  private async validateBranches(
    userId: string,
    organizationId: string,
    branchIds: string[],
    permission: string,
  ) {
    for (const branchId of branchIds) {
      const context = await this.access.assertBranch(userId, branchId, permission);
      if (context.organizationId !== organizationId)
        throw new ApiError(
          "BRANCH_ORGANIZATION_MISMATCH",
          "همه شعب باید متعلق به همین سازمان باشند.",
          422,
        );
    }
  }

  private async validateResources(
    branchIds: string[],
    requirements: Array<{ resource_id?: string; resourceId?: string }>,
  ) {
    const ids = requirements
      .map((item) => item.resource_id ?? item.resourceId)
      .filter((id): id is string => Boolean(id));
    if (!ids.length) return;
    const count = await this.models.Resource.countDocuments({
      _id: { $in: ids.map(objectIdFrom) },
      branchId: { $in: branchIds.map(objectIdFrom) },
      status: { $ne: "archived" },
    });
    if (count !== new Set(ids).size)
      throw new ApiError(
        "INVALID_RESOURCE_REQUIREMENT",
        "یکی از منابع انتخاب‌شده معتبر یا متعلق به شعب انتخاب‌شده نیست.",
        422,
      );
  }

  async context(userId: string, offeringId: string, permission: string) {
    const offering = (await this.models.Offering.findById(offeringId).lean()) as any;
    if (!offering) throw new ApiError("OFFERING_NOT_FOUND", "خدمت پیدا نشد.", 404);
    let lastError: unknown;
    for (const branchId of offering.branchIds ?? []) {
      try {
        const branchContext = await this.access.assertBranch(userId, String(branchId), permission);
        return { offering, ...branchContext };
      } catch (error) {
        lastError = error;
      }
    }
    if (lastError) throw lastError;
    throw new ApiError("FORBIDDEN", "به این خدمت دسترسی ندارید.", 403);
  }

  async create(
    userId: string,
    organizationId: string,
    body: Record<string, any>,
    requestId?: string,
  ) {
    await this.validateBranches(
      userId,
      organizationId,
      body.branch_ids,
      PERMISSIONS.BRANCH_OFFERINGS_MANAGE,
    );
    await this.validateResources(body.branch_ids, body.resource_requirements ?? []);
    const item = await this.models.Offering.create({
      ...(toStorage(body) as any),
      organizationId: objectIdFrom(organizationId),
      branchIds: body.branch_ids.map(objectIdFrom),
      resourceRequirements: (body.resource_requirements ?? []).map((item: any) => ({
        ...(toStorage(item) as Record<string, unknown>),
        resourceId: objectIdFrom(item.resource_id),
      })),
      ...(body.provider
        ? {
            provider: {
              ...(toStorage(body.provider) as any),
              ...(body.provider.coach_profile_id
                ? { coachProfileId: objectIdFrom(body.provider.coach_profile_id) }
                : {}),
              ...(body.provider.coach_user_id
                ? { coachUserId: objectIdFrom(body.provider.coach_user_id) }
                : {}),
            },
          }
        : {}),
      createdBy: objectIdFrom(userId),
    });
    await this.audit.record({
      actorUserId: userId,
      action: "offering.created",
      entityType: "offering",
      entityId: String(item._id),
      organizationId,
      after: item.toObject(),
      requestId,
    });
    return item;
  }

  async listByBranch(userId: string, branchId: string, query: PaginationQuery) {
    await this.access.assertBranch(userId, branchId, PERMISSIONS.BRANCH_OFFERINGS_READ);
    const filter: Record<string, unknown> = {
      branchIds: objectIdFrom(branchId),
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
      this.models.Offering.find(filter)
        .sort({ createdAt: -1 })
        .skip(paginationOffset(query))
        .limit(query.limit)
        .lean(),
      this.models.Offering.countDocuments(filter),
    ]);
    return { items, total };
  }

  async get(userId: string, offeringId: string) {
    return (await this.context(userId, offeringId, PERMISSIONS.BRANCH_OFFERINGS_READ)).offering;
  }

  async update(userId: string, offeringId: string, body: Record<string, any>, requestId?: string) {
    const { offering: before, organizationId } = await this.context(
      userId,
      offeringId,
      PERMISSIONS.BRANCH_OFFERINGS_MANAGE,
    );
    const branchIds = body.branch_ids ?? (before.branchIds ?? []).map(String);
    await this.validateBranches(
      userId,
      String(before.organizationId),
      branchIds,
      PERMISSIONS.BRANCH_OFFERINGS_MANAGE,
    );
    if (body.resource_requirements)
      await this.validateResources(branchIds, body.resource_requirements);
    const normalized = {
      ...body,
      ...(body.branch_ids ? { branch_ids: body.branch_ids.map(objectIdFrom) } : {}),
      ...(body.resource_requirements
        ? {
            resource_requirements: body.resource_requirements.map((item: any) => ({
              ...item,
              resource_id: objectIdFrom(item.resource_id),
            })),
          }
        : {}),
      ...(body.provider
        ? {
            provider: {
              ...body.provider,
              ...(body.provider.coach_profile_id
                ? { coach_profile_id: objectIdFrom(body.provider.coach_profile_id) }
                : {}),
              ...(body.provider.coach_user_id
                ? { coach_user_id: objectIdFrom(body.provider.coach_user_id) }
                : {}),
            },
          }
        : {}),
    };
    const after = await this.models.Offering.findByIdAndUpdate(
      offeringId,
      {
        $set: { ...flattenPatch(normalized), updatedBy: objectIdFrom(userId) },
        $inc: { version: 1 },
      },
      { returnDocument: "after", runValidators: true },
    ).lean();
    await this.audit.record({
      actorUserId: userId,
      action: "offering.updated",
      entityType: "offering",
      entityId: offeringId,
      organizationId,
      before,
      after,
      requestId,
    });
    return after;
  }

  async archive(userId: string, offeringId: string, requestId?: string) {
    const { offering: before, organizationId } = await this.context(
      userId,
      offeringId,
      PERMISSIONS.BRANCH_OFFERINGS_MANAGE,
    );
    const after = await this.models.Offering.findByIdAndUpdate(
      offeringId,
      { $set: { status: "archived", updatedBy: objectIdFrom(userId) }, $inc: { version: 1 } },
      { returnDocument: "after" },
    ).lean();
    await this.audit.record({
      actorUserId: userId,
      action: "offering.archived",
      entityType: "offering",
      entityId: offeringId,
      organizationId,
      before,
      after,
      requestId,
    });
    return after;
  }
}

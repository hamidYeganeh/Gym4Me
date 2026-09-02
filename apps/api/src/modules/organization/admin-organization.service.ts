import { Inject, Injectable } from "@nestjs/common";
import { objectIdFrom, type DatabaseModels } from "../../database/index.js";
import { ApiError } from "../../common/api-error.js";
import { paginationOffset, type PaginationQuery } from "../../common/query.js";
import { DATABASE_MODELS } from "../../database/database.constants.js";
import { AuditService } from "../audit/audit.service.js";
import { flattenPatch } from "./entity-mapper.js";

@Injectable()
export class AdminOrganizationService {
  constructor(
    @Inject(DATABASE_MODELS) private readonly models: DatabaseModels,
    private readonly audit: AuditService,
  ) {}

  async list(modelName: "Organization" | "Club" | "Branch", query: PaginationQuery) {
    const model = this.models[modelName];
    const searchFields =
      modelName === "Organization"
        ? ["profile.legalName", "profile.tradeName"]
        : ["profile.name", "profile.slug"];
    const filter: Record<string, unknown> = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            $or: searchFields.map((field) => ({
              [field]: { $regex: query.search, $options: "i" },
            })),
          }
        : {}),
    };
    const [items, total] = await Promise.all([
      model
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(paginationOffset(query))
        .limit(query.limit)
        .lean(),
      model.countDocuments(filter),
    ]);
    return { items, total };
  }

  async updateStatus(
    adminId: string,
    entityType: "organization" | "branch",
    id: string,
    status: string,
    reason?: string,
    requestId?: string,
  ) {
    const model = entityType === "organization" ? this.models.Organization : this.models.Branch;
    const before = (await model.findById(id).lean()) as any;
    if (!before)
      throw new ApiError(`${entityType.toUpperCase()}_NOT_FOUND`, "رکورد موردنظر پیدا نشد.", 404);
    const after = await model
      .findByIdAndUpdate(
        id,
        {
          $set: {
            status,
            ...(entityType === "organization"
              ? {
                  "review.reviewedAt": new Date(),
                  "review.reviewedBy": objectIdFrom(adminId),
                  "review.decisionReason": reason,
                }
              : {}),
            updatedBy: objectIdFrom(adminId),
          },
          $inc: { version: 1 },
        },
        { returnDocument: "after", runValidators: true },
      )
      .lean();
    const organizationId =
      entityType === "organization" ? id : await this.organizationIdForBranch(before.clubId);
    await this.audit.record({
      actorUserId: adminId,
      action: `admin.${entityType}.status_changed`,
      entityType,
      entityId: id,
      organizationId,
      before,
      after,
      requestId,
    });
    return after;
  }

  async verifyClub(
    adminId: string,
    id: string,
    status: string,
    reason?: string,
    requestId?: string,
  ) {
    const before = (await this.models.Club.findById(id).lean()) as any;
    if (!before) throw new ApiError("CLUB_NOT_FOUND", "باشگاه پیدا نشد.", 404);
    const entityStatus =
      status === "verified" ? "active" : status === "rejected" ? "rejected" : "draft";
    const after = await this.models.Club.findByIdAndUpdate(
      id,
      {
        $set: {
          status: entityStatus,
          "verification.status": status,
          "verification.reason": reason,
          "verification.reviewedAt": new Date(),
          "verification.reviewedBy": objectIdFrom(adminId),
          updatedBy: objectIdFrom(adminId),
        },
        $inc: { version: 1 },
      },
      { returnDocument: "after" },
    ).lean();
    await this.audit.record({
      actorUserId: adminId,
      action: "admin.club.verification_decided",
      entityType: "club",
      entityId: id,
      organizationId: String(before.organizationId),
      before,
      after,
      requestId,
    });
    return after;
  }

  private async organizationIdForBranch(clubId: unknown) {
    const club = (await this.models.Club.findById(clubId).lean()) as any;
    return String(club?.organizationId ?? "");
  }

  async updateEntity(
    adminId: string,
    entityType: "organization" | "club" | "branch",
    id: string,
    body: Record<string, unknown>,
    requestId?: string,
  ) {
    const model =
      entityType === "organization"
        ? this.models.Organization
        : entityType === "club"
          ? this.models.Club
          : this.models.Branch;
    const before = (await model.findById(id).lean()) as any;
    if (!before)
      throw new ApiError(`${entityType.toUpperCase()}_NOT_FOUND`, "رکورد موردنظر پیدا نشد.", 404);
    const patch: Record<string, unknown> = { ...body };
    if (entityType === "branch" && patch.location) {
      const location = patch.location as { latitude: number; longitude: number };
      patch.location = { type: "Point", coordinates: [location.longitude, location.latitude] };
    }
    const after = await model
      .findByIdAndUpdate(
        id,
        {
          $set: { ...flattenPatch(patch), updatedBy: objectIdFrom(adminId) },
          $inc: { version: 1 },
        },
        { returnDocument: "after", runValidators: true },
      )
      .lean();
    const organizationId =
      entityType === "organization"
        ? id
        : entityType === "club"
          ? String(before.organizationId)
          : await this.organizationIdForBranch(before.clubId);
    await this.audit.record({
      actorUserId: adminId,
      action: `admin.${entityType}.updated`,
      entityType,
      entityId: id,
      organizationId,
      before,
      after,
      requestId,
    });
    return after;
  }
}

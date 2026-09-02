import { Inject, Injectable } from "@nestjs/common";
import { objectIdFrom, type DatabaseModels } from "../../database/index.js";
import { PERMISSIONS } from "../../security/rbac.js";
import { ApiError } from "../../common/api-error.js";
import { paginationOffset, type PaginationQuery } from "../../common/query.js";
import { DATABASE_MODELS } from "../../database/database.constants.js";
import { AuditService } from "../audit/audit.service.js";
import { flattenPatch, toStorage } from "./entity-mapper.js";
import { OrganizationAccessService } from "./organization-access.service.js";

@Injectable()
export class ClubsService {
  constructor(
    @Inject(DATABASE_MODELS) private readonly models: DatabaseModels,
    private readonly access: OrganizationAccessService,
    private readonly audit: AuditService,
  ) {}

  async create(userId: string, body: Record<string, any>, requestId?: string) {
    const organizationId = String(body.organization_id);
    await this.access.assertOrganization(userId, organizationId, PERMISSIONS.CLUB_PROFILE_MANAGE);
    const organization = (await this.models.Organization.findById(organizationId).lean()) as any;
    if (!organization || ["archived", "suspended"].includes(organization.status))
      throw new ApiError("ORGANIZATION_UNAVAILABLE", "سازمان برای ساخت باشگاه در دسترس نیست.", 409);
    const storage = toStorage(body) as any;
    delete storage.organization_id;
    const item = await this.models.Club.create({
      ...storage,
      organizationId: objectIdFrom(organizationId),
      status: "draft",
      verification: { status: "unverified" },
      createdBy: objectIdFrom(userId),
    });
    await this.audit.record({
      actorUserId: userId,
      action: "club.created",
      entityType: "club",
      entityId: String(item._id),
      organizationId,
      after: item.toObject(),
      requestId,
    });
    return item;
  }

  async list(userId: string, organizationId: string, query: PaginationQuery) {
    await this.access.assertOrganization(userId, organizationId, PERMISSIONS.CLUB_PROFILE_READ);
    const filter: Record<string, unknown> = {
      organizationId: objectIdFrom(organizationId),
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
      this.models.Club.find(filter)
        .sort({ createdAt: -1 })
        .skip(paginationOffset(query))
        .limit(query.limit)
        .lean(),
      this.models.Club.countDocuments(filter),
    ]);
    return { items, total };
  }

  async getManaged(userId: string, id: string) {
    const item = (await this.models.Club.findById(id).lean()) as any;
    if (!item) throw new ApiError("CLUB_NOT_FOUND", "باشگاه پیدا نشد.", 404);
    await this.access.assertOrganization(
      userId,
      String(item.organizationId),
      PERMISSIONS.CLUB_PROFILE_READ,
    );
    return item;
  }

  async update(userId: string, id: string, body: Record<string, unknown>, requestId?: string) {
    const before = (await this.models.Club.findById(id).lean()) as any;
    if (!before) throw new ApiError("CLUB_NOT_FOUND", "باشگاه پیدا نشد.", 404);
    const organizationId = String(before.organizationId);
    await this.access.assertOrganization(userId, organizationId, PERMISSIONS.CLUB_PROFILE_MANAGE);
    if (!["draft", "rejected", "active"].includes(before.status))
      throw new ApiError("CLUB_NOT_EDITABLE", "باشگاه در وضعیت فعلی قابل ویرایش نیست.", 409);
    const after = await this.models.Club.findByIdAndUpdate(
      id,
      { $set: { ...flattenPatch(body), updatedBy: objectIdFrom(userId) }, $inc: { version: 1 } },
      { returnDocument: "after", runValidators: true },
    ).lean();
    await this.audit.record({
      actorUserId: userId,
      action: "club.updated",
      entityType: "club",
      entityId: id,
      organizationId,
      before,
      after,
      requestId,
    });
    return after;
  }

  async submit(userId: string, id: string, requestId?: string) {
    const before = (await this.models.Club.findById(id).lean()) as any;
    if (!before) throw new ApiError("CLUB_NOT_FOUND", "باشگاه پیدا نشد.", 404);
    const organizationId = String(before.organizationId);
    await this.access.assertOrganization(userId, organizationId, PERMISSIONS.CLUB_PROFILE_MANAGE);
    if (!["draft", "rejected"].includes(before.status))
      throw new ApiError("CLUB_NOT_SUBMITTABLE", "باشگاه در وضعیت قابل ارسال نیست.", 409);
    const after = await this.models.Club.findByIdAndUpdate(
      id,
      {
        $set: {
          status: "pending_verification",
          "verification.status": "pending",
          "verification.submittedAt": new Date(),
          updatedBy: objectIdFrom(userId),
        },
        $inc: { version: 1 },
      },
      { returnDocument: "after" },
    ).lean();
    await this.audit.record({
      actorUserId: userId,
      action: "club.submitted",
      entityType: "club",
      entityId: id,
      organizationId,
      before,
      after,
      requestId,
    });
    return after;
  }

  async archive(userId: string, id: string, requestId?: string) {
    const before = (await this.models.Club.findById(id).lean()) as any;
    if (!before) throw new ApiError("CLUB_NOT_FOUND", "باشگاه پیدا نشد.", 404);
    const organizationId = String(before.organizationId);
    await this.access.assertOrganization(userId, organizationId, PERMISSIONS.CLUB_PROFILE_MANAGE);
    const after = await this.models.Club.findByIdAndUpdate(
      id,
      { $set: { status: "archived", updatedBy: objectIdFrom(userId) }, $inc: { version: 1 } },
      { returnDocument: "after" },
    ).lean();
    await this.audit.record({
      actorUserId: userId,
      action: "club.archived",
      entityType: "club",
      entityId: id,
      organizationId,
      before,
      after,
      requestId,
    });
    return after;
  }
}

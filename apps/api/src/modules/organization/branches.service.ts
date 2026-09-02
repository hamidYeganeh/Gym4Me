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
export class BranchesService {
  constructor(
    @Inject(DATABASE_MODELS) private readonly models: DatabaseModels,
    private readonly access: OrganizationAccessService,
    private readonly audit: AuditService,
  ) {}

  private async clubAndAccess(userId: string, clubId: string, permission: string) {
    const club = (await this.models.Club.findById(clubId).lean()) as any;
    if (!club) throw new ApiError("CLUB_NOT_FOUND", "باشگاه پیدا نشد.", 404);
    await this.access.assertOrganization(userId, String(club.organizationId), permission);
    return club;
  }

  async create(userId: string, clubId: string, body: Record<string, any>, requestId?: string) {
    const club = await this.clubAndAccess(userId, clubId, PERMISSIONS.BRANCH_PROFILE_MANAGE);
    if (["archived", "suspended"].includes(club.status))
      throw new ApiError("CLUB_UNAVAILABLE", "باشگاه برای ساخت شعبه در دسترس نیست.", 409);
    const storage = toStorage(body) as any;
    const location = body.location;
    delete storage.location;
    const item = await this.models.Branch.create({
      ...storage,
      clubId: objectIdFrom(clubId),
      location: { type: "Point", coordinates: [location.longitude, location.latitude] },
      status: "draft",
      createdBy: objectIdFrom(userId),
    });
    await this.audit.record({
      actorUserId: userId,
      action: "branch.created",
      entityType: "branch",
      entityId: String(item._id),
      organizationId: String(club.organizationId),
      after: item.toObject(),
      requestId,
    });
    return item;
  }

  async list(userId: string, clubId: string, query: PaginationQuery) {
    await this.clubAndAccess(userId, clubId, PERMISSIONS.BRANCH_PROFILE_READ);
    const filter: Record<string, unknown> = {
      clubId: objectIdFrom(clubId),
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
      this.models.Branch.find(filter)
        .sort({ createdAt: -1 })
        .skip(paginationOffset(query))
        .limit(query.limit)
        .lean(),
      this.models.Branch.countDocuments(filter),
    ]);
    return { items, total };
  }

  async get(userId: string, id: string) {
    const context = await this.access.assertBranch(userId, id, PERMISSIONS.BRANCH_PROFILE_READ);
    return context.branch;
  }

  async update(userId: string, id: string, body: Record<string, any>, requestId?: string) {
    const { branch: before, organizationId } = await this.access.assertBranch(
      userId,
      id,
      PERMISSIONS.BRANCH_PROFILE_MANAGE,
    );
    const patch = { ...body };
    if (patch.location) {
      patch.location = {
        type: "Point",
        coordinates: [patch.location.longitude, patch.location.latitude],
      };
    }
    const after = await this.models.Branch.findByIdAndUpdate(
      id,
      { $set: { ...flattenPatch(patch), updatedBy: objectIdFrom(userId) }, $inc: { version: 1 } },
      { returnDocument: "after", runValidators: true },
    ).lean();
    await this.audit.record({
      actorUserId: userId,
      action: "branch.updated",
      entityType: "branch",
      entityId: id,
      organizationId,
      before,
      after,
      requestId,
    });
    return after;
  }

  async setWorkingHours(userId: string, id: string, days: unknown[], requestId?: string) {
    const { branch: before, organizationId } = await this.access.assertBranch(
      userId,
      id,
      PERMISSIONS.BRANCH_PROFILE_MANAGE,
    );
    const after = await this.models.Branch.findByIdAndUpdate(
      id,
      {
        $set: { workingHours: toStorage(days), updatedBy: objectIdFrom(userId) },
        $inc: { version: 1 },
      },
      { returnDocument: "after", runValidators: true },
    ).lean();
    await this.audit.record({
      actorUserId: userId,
      action: "branch.working_hours.updated",
      entityType: "branch",
      entityId: id,
      organizationId,
      before: (before as any).workingHours,
      after: (after as any)?.workingHours,
      requestId,
    });
    return after;
  }

  async addHoliday(
    userId: string,
    id: string,
    holiday: Record<string, unknown>,
    requestId?: string,
  ) {
    const { organizationId } = await this.access.assertBranch(
      userId,
      id,
      PERMISSIONS.BRANCH_PROFILE_MANAGE,
    );
    const value = { ...(toStorage(holiday) as any), id: crypto.randomUUID() };
    const after = await this.models.Branch.findByIdAndUpdate(
      id,
      {
        $push: { holidays: value },
        $set: { updatedBy: objectIdFrom(userId) },
        $inc: { version: 1 },
      },
      { returnDocument: "after", runValidators: true },
    ).lean();
    await this.audit.record({
      actorUserId: userId,
      action: "branch.holiday.created",
      entityType: "branch",
      entityId: id,
      organizationId,
      after: value,
      requestId,
    });
    return after;
  }

  async removeHoliday(userId: string, id: string, holidayId: string, requestId?: string) {
    const { organizationId } = await this.access.assertBranch(
      userId,
      id,
      PERMISSIONS.BRANCH_PROFILE_MANAGE,
    );
    const after = await this.models.Branch.findByIdAndUpdate(
      id,
      {
        $pull: { holidays: { id: holidayId } },
        $set: { updatedBy: objectIdFrom(userId) },
        $inc: { version: 1 },
      },
      { returnDocument: "after" },
    ).lean();
    await this.audit.record({
      actorUserId: userId,
      action: "branch.holiday.deleted",
      entityType: "branch",
      entityId: id,
      organizationId,
      before: { holidayId },
      requestId,
    });
    return after;
  }

  async archive(userId: string, id: string, requestId?: string) {
    const { branch: before, organizationId } = await this.access.assertBranch(
      userId,
      id,
      PERMISSIONS.BRANCH_PROFILE_MANAGE,
    );
    const after = await this.models.Branch.findByIdAndUpdate(
      id,
      { $set: { status: "archived", updatedBy: objectIdFrom(userId) }, $inc: { version: 1 } },
      { returnDocument: "after" },
    ).lean();
    await this.audit.record({
      actorUserId: userId,
      action: "branch.archived",
      entityType: "branch",
      entityId: id,
      organizationId,
      before,
      after,
      requestId,
    });
    return after;
  }
}

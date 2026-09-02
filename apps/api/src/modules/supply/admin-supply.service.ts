import { Inject, Injectable } from "@nestjs/common";
import { objectIdFrom, type DatabaseModels } from "../../database/index.js";
import { ApiError } from "../../common/api-error.js";
import { paginationOffset, type PaginationQuery } from "../../common/query.js";
import { DATABASE_MODELS } from "../../database/database.constants.js";
import { AuditService } from "../audit/audit.service.js";

@Injectable()
export class AdminSupplyService {
  constructor(
    @Inject(DATABASE_MODELS) private readonly models: DatabaseModels,
    private readonly audit: AuditService,
  ) {}
  async list(modelName: "Resource" | "Offering", query: PaginationQuery) {
    const model = this.models[modelName];
    const filter: any = {
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
  async status(
    adminId: string,
    entity: "resource" | "offering",
    id: string,
    status: string,
    reason?: string,
    requestId?: string,
  ) {
    const model = entity === "resource" ? this.models.Resource : this.models.Offering;
    const before = (await model.findById(id).lean()) as any;
    if (!before) throw new ApiError(`${entity.toUpperCase()}_NOT_FOUND`, "رکورد پیدا نشد.", 404);
    const after = await model
      .findByIdAndUpdate(
        id,
        { $set: { status, updatedBy: objectIdFrom(adminId) }, $inc: { version: 1 } },
        { returnDocument: "after", runValidators: true },
      )
      .lean();
    let organizationId = String(before.organizationId ?? "");
    if (!organizationId) {
      const branch = (await this.models.Branch.findById(before.branchId).lean()) as any;
      const club = branch
        ? ((await this.models.Club.findById(branch.clubId).lean()) as any)
        : undefined;
      organizationId = String(club?.organizationId ?? "");
    }
    await this.audit.record({
      actorUserId: adminId,
      action: `admin.${entity}.status_changed`,
      entityType: entity,
      entityId: id,
      organizationId,
      before,
      after: { entity: after, reason },
      requestId,
    });
    return after;
  }
}

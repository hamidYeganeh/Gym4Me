import { Inject, Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { objectIdFrom, type DatabaseModels } from "../../database/index.js";
import { ApiError } from "../../common/api-error.js";
import { DATABASE_MODELS } from "../../database/database.constants.js";
import { flattenPatch, toStorage } from "../organization/entity-mapper.js";

@Injectable()
export class HouseholdService {
  constructor(@Inject(DATABASE_MODELS) private readonly models: DatabaseModels) {}
  async get(userId: string) {
    return this.models.Household.findOneAndUpdate(
      { ownerUserId: objectIdFrom(userId) },
      {
        $setOnInsert: {
          ownerUserId: objectIdFrom(userId),
          profile: { name: "خانواده من" },
          members: [],
          status: "active",
          createdBy: objectIdFrom(userId),
        },
      },
      { upsert: true, returnDocument: "after" },
    ).lean();
  }
  async update(userId: string, body: Record<string, unknown>) {
    await this.get(userId);
    return this.models.Household.findOneAndUpdate(
      { ownerUserId: objectIdFrom(userId) },
      { $set: { ...flattenPatch(body), updatedBy: objectIdFrom(userId) }, $inc: { version: 1 } },
      { returnDocument: "after" },
    ).lean();
  }
  async addMember(userId: string, body: Record<string, any>) {
    await this.get(userId);
    const member = {
      id: randomUUID(),
      ...(toStorage(body) as any),
      ...(body.user_id ? { userId: objectIdFrom(body.user_id) } : {}),
      status: "active",
    };
    const household = await this.models.Household.findOneAndUpdate(
      { ownerUserId: objectIdFrom(userId) },
      {
        $push: { members: member },
        $set: { updatedBy: objectIdFrom(userId) },
        $inc: { version: 1 },
      },
      { returnDocument: "after", runValidators: true },
    ).lean();
    return { household, member };
  }
  async removeMember(userId: string, memberId: string) {
    const household = await this.models.Household.findOneAndUpdate(
      { ownerUserId: objectIdFrom(userId), "members.id": memberId },
      {
        $set: { "members.$.status": "archived", updatedBy: objectIdFrom(userId) },
        $inc: { version: 1 },
      },
      { returnDocument: "after" },
    ).lean();
    if (!household) throw new ApiError("HOUSEHOLD_MEMBER_NOT_FOUND", "عضو خانواده پیدا نشد.", 404);
    return household;
  }
}

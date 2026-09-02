import { type Connection, type Model, type Schema, Types } from "mongoose";
import { accountModels } from "../modules/account/models/index.js";
import { advertisingModels } from "../modules/advertising/models/index.js";
import { auditModels } from "../modules/audit/models/index.js";
import { coachModels } from "../modules/coach/models/index.js";
import { commerceModels } from "../modules/commerce/models/index.js";
import { financeModels } from "../modules/finance/models/index.js";
import { membershipModels } from "../modules/membership/models/index.js";
import { metaModels } from "../modules/meta/models/index.js";
import { notificationModels } from "../modules/notification/models/index.js";
import { organizationModels } from "../modules/organization/models/index.js";
import { reviewModels } from "../modules/review/models/index.js";
import { supplyModels } from "../modules/supply/models/index.js";
import { uploadModels } from "../modules/upload/models/index.js";
import { verificationModels } from "../modules/verification/models/index.js";
import { infrastructureModels } from "./infrastructure.js";

export const schemas = {
  ...accountModels,
  ...coachModels,
  ...organizationModels,
  ...supplyModels,
  ...commerceModels,
  ...financeModels,
  ...membershipModels,
  ...advertisingModels,
  ...reviewModels,
  ...verificationModels,
  ...notificationModels,
  ...metaModels,
  ...auditModels,
  ...uploadModels,
  ...infrastructureModels,
} as const;
export type ModelName = keyof typeof schemas;
export type DatabaseModels = { [K in ModelName]: Model<Record<string, unknown>> };

export function registerModels(connection: Connection): DatabaseModels {
  const models: Partial<DatabaseModels> = {};
  for (const [name, modelSchema] of Object.entries(schemas) as Array<[ModelName, Schema]>) {
    models[name] = (connection.models[name] ?? connection.model(name, modelSchema)) as Model<
      Record<string, unknown>
    >;
  }
  return models as DatabaseModels;
}

export function objectIdFrom(value: string): Types.ObjectId {
  return new Types.ObjectId(value);
}
export function idOf(value: unknown): string {
  if (value instanceof Types.ObjectId) return value.toHexString();
  if (typeof value === "object" && value !== null && "_id" in value)
    return String((value as { _id: unknown })._id);
  return String(value);
}

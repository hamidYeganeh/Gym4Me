import { Schema } from "mongoose";

export const objectId = Schema.Types.ObjectId;
export const mixed = Schema.Types.Mixed;
export const status = { type: String, default: "active", index: true } as const;
export const customData = { type: Map, of: mixed, default: () => ({}) } as const;
export const audit = {
  createdBy: { type: objectId, ref: "User" },
  updatedBy: { type: objectId, ref: "User" },
  version: { type: Number, default: 1 },
};

export function createSchema(definition: object, options: object = {}) {
  return new Schema(definition, {
    timestamps: true,
    strict: true,
    minimize: false,
    versionKey: false,
    ...options,
  });
}

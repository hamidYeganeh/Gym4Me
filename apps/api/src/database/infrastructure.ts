import { audit, createSchema, mixed } from "./mongoose.js";

export const infrastructureModels = {
  OutboxEvent: createSchema({
    type: { type: String, required: true },
    aggregate: mixed,
    payload: mixed,
    availableAt: { type: Date, default: Date.now },
    processing: mixed,
    status: { type: String, default: "pending", index: true },
    ...audit,
  }),
} as const;

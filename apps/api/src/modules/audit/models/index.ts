import { createSchema, mixed } from "../../../database/mongoose.js";

export const auditModels = {
  AuditLog: createSchema(
    {
      actor: mixed,
      action: String,
      entity: mixed,
      changes: mixed,
      request: mixed,
      occurredAt: { type: Date, default: Date.now, index: true },
    },
    { timestamps: false },
  ),
} as const;

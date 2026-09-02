import { Inject, Injectable } from "@nestjs/common";
import type { DatabaseModels } from "../../database/index.js";
import { DATABASE_MODELS } from "../../database/database.constants.js";

export interface AuditInput {
  actorUserId: string;
  action: string;
  entityType: string;
  entityId: string;
  organizationId?: string | undefined;
  before?: unknown;
  after?: unknown;
  requestId?: string | undefined;
  ipAddress?: string | undefined;
}

@Injectable()
export class AuditService {
  constructor(@Inject(DATABASE_MODELS) private readonly models: DatabaseModels) {}
  async record(input: AuditInput) {
    await this.models.AuditLog.create({
      actor: { userId: input.actorUserId },
      action: input.action,
      entity: {
        type: input.entityType,
        id: input.entityId,
        ...(input.organizationId ? { organizationId: input.organizationId } : {}),
      },
      changes: {
        ...(input.before !== undefined ? { before: input.before } : {}),
        ...(input.after !== undefined ? { after: input.after } : {}),
      },
      request: {
        ...(input.requestId ? { id: input.requestId } : {}),
        ...(input.ipAddress ? { ipAddress: input.ipAddress } : {}),
      },
      occurredAt: new Date(),
    });
  }

  async list(input: {
    page: number;
    limit: number;
    action?: string;
    entityType?: string;
    organizationId?: string;
  }) {
    const filter: Record<string, unknown> = {
      ...(input.action ? { action: { $regex: input.action, $options: "i" } } : {}),
      ...(input.entityType ? { "entity.type": input.entityType } : {}),
      ...(input.organizationId ? { "entity.organizationId": input.organizationId } : {}),
    };
    const [items, total] = await Promise.all([
      this.models.AuditLog.find(filter)
        .sort({ occurredAt: -1 })
        .skip((input.page - 1) * input.limit)
        .limit(input.limit)
        .lean(),
      this.models.AuditLog.countDocuments(filter),
    ]);
    return { items, total };
  }
}

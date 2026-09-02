import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "../../security/rbac.js";
import { z } from "zod";
import { paginated } from "../../common/response.js";
import { AuthGuard } from "../../security/auth.guard.js";
import type { AuthenticatedRequest } from "../../security/auth.types.js";
import { RequirePermission } from "../../security/permission.decorator.js";
import { PermissionGuard } from "../../security/permission.guard.js";
import { AuditService } from "./audit.service.js";

@ApiTags("Admin Audit")
@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionGuard)
@RequirePermission(PERMISSIONS.ADMIN_AUDIT_READ)
@Controller("admin/audit-logs")
export class AuditController {
  constructor(private readonly service: AuditService) {}
  @Get()
  async list(@Req() req: AuthenticatedRequest, @Query() raw: unknown) {
    const query = z
      .object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(30),
        action: z.string().optional(),
        entity_type: z.string().optional(),
        organization_id: z.string().length(24).optional(),
      })
      .parse(raw);
    const result = await this.service.list({
      page: query.page,
      limit: query.limit,
      ...(query.action ? { action: query.action } : {}),
      ...(query.entity_type ? { entityType: query.entity_type } : {}),
      ...(query.organization_id ? { organizationId: query.organization_id } : {}),
    });
    return paginated(req, result.items, {
      page: query.page,
      limit: query.limit,
      total: result.total,
    });
  }
}

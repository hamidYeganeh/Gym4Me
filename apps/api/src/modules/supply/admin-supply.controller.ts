import { Body, Controller, Get, Param, Patch, Query, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "../../security/rbac.js";
import { paginationSchema } from "../../common/query.js";
import { paginated, success } from "../../common/response.js";
import { AuthGuard } from "../../security/auth.guard.js";
import type { AuthenticatedRequest } from "../../security/auth.types.js";
import { RequirePermission } from "../../security/permission.decorator.js";
import { PermissionGuard } from "../../security/permission.guard.js";
import { AdminSupplyService } from "./admin-supply.service.js";
import { lifecycleStatusSchema, objectId } from "./schemas/supply.schemas.js";

@ApiTags("Admin / Catalog")
@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionGuard)
@RequirePermission(PERMISSIONS.ADMIN_CATALOG_MANAGE)
@Controller("admin/catalog")
export class AdminSupplyController {
  constructor(private readonly service: AdminSupplyService) {}
  @Get("resources") async resources(@Req() req: AuthenticatedRequest, @Query() raw: unknown) {
    const query = paginationSchema.parse(raw);
    const result = await this.service.list("Resource", query);
    return paginated(req, result.items, { ...query, total: result.total });
  }
  @Get("offerings") async offerings(@Req() req: AuthenticatedRequest, @Query() raw: unknown) {
    const query = paginationSchema.parse(raw);
    const result = await this.service.list("Offering", query);
    return paginated(req, result.items, { ...query, total: result.total });
  }
  @Patch("resources/:resourceId/status") async resourceStatus(
    @Req() req: AuthenticatedRequest,
    @Param("resourceId") id: string,
    @Body() raw: unknown,
  ) {
    const body = lifecycleStatusSchema.parse(raw);
    return success(
      req,
      await this.service.status(
        req.auth.sub,
        "resource",
        objectId.parse(id),
        body.status,
        body.reason,
        req.id,
      ),
    );
  }
  @Patch("offerings/:offeringId/status") async offeringStatus(
    @Req() req: AuthenticatedRequest,
    @Param("offeringId") id: string,
    @Body() raw: unknown,
  ) {
    const body = lifecycleStatusSchema.parse(raw);
    return success(
      req,
      await this.service.status(
        req.auth.sub,
        "offering",
        objectId.parse(id),
        body.status,
        body.reason,
        req.id,
      ),
    );
  }
}

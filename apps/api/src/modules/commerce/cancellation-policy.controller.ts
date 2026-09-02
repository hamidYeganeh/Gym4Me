import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "../../security/rbac.js";
import { success } from "../../common/response.js";
import { AuthGuard } from "../../security/auth.guard.js";
import type { AuthenticatedRequest } from "../../security/auth.types.js";
import { RequirePermission } from "../../security/permission.decorator.js";
import { PermissionGuard } from "../../security/permission.guard.js";
import { CancellationPolicyService } from "./cancellation-policy.service.js";
import { cancellationPolicySchema, objectId } from "./schemas/commerce.schemas.js";

@ApiTags("Cancellation Policies")
@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionGuard)
@RequirePermission(PERMISSIONS.ORGANIZATION_CANCELLATION_POLICY_MANAGE)
@Controller()
export class CancellationPolicyController {
  constructor(private readonly service: CancellationPolicyService) {}
  @Get("organizations/:organizationId/cancellation-policies") async organizations(
    @Req() req: AuthenticatedRequest,
    @Param("organizationId") id: string,
  ) {
    return success(req, await this.service.list("organization", objectId.parse(id), req.auth.sub));
  }
  @Post("organizations/:organizationId/cancellation-policies") async createOrganization(
    @Req() req: AuthenticatedRequest,
    @Param("organizationId") id: string,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.service.create(
        "organization",
        objectId.parse(id),
        cancellationPolicySchema.parse(raw),
        req.auth.sub,
        req.id,
      ),
    );
  }
  @Get("clubs/:clubId/cancellation-policies") async clubs(
    @Req() req: AuthenticatedRequest,
    @Param("clubId") id: string,
  ) {
    return success(req, await this.service.list("club", objectId.parse(id), req.auth.sub));
  }
  @Post("clubs/:clubId/cancellation-policies") async createClub(
    @Req() req: AuthenticatedRequest,
    @Param("clubId") id: string,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.service.create(
        "club",
        objectId.parse(id),
        cancellationPolicySchema.parse(raw),
        req.auth.sub,
        req.id,
      ),
    );
  }
  @Patch("cancellation-policies/:policyId") async update(
    @Req() req: AuthenticatedRequest,
    @Param("policyId") id: string,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.service.update(
        objectId.parse(id),
        cancellationPolicySchema.parse(raw),
        req.auth.sub,
        req.id,
      ),
    );
  }
  @Delete("cancellation-policies/:policyId") async archive(
    @Req() req: AuthenticatedRequest,
    @Param("policyId") id: string,
  ) {
    return success(req, await this.service.archive(objectId.parse(id), req.auth.sub, req.id));
  }
}

import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "../../security/rbac.js";
import { paginated, success } from "../../common/response.js";
import { AuthGuard } from "../../security/auth.guard.js";
import type { AuthenticatedRequest } from "../../security/auth.types.js";
import { PermissionGuard } from "../../security/permission.guard.js";
import { RequirePermission } from "../../security/permission.decorator.js";
import { VerificationService } from "./verification.service.js";
import {
  clubVerificationSubmitSchema,
  coachVerificationSubmitSchema,
  objectId,
  verificationListSchema,
  verificationReviewSchema,
} from "./schemas/verification.schemas.js";

@ApiTags("Verifications")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("verifications")
export class VerificationController {
  constructor(private readonly service: VerificationService) {}
  @Get("me") async mine(@Req() req: AuthenticatedRequest) {
    return success(req, await this.service.mine(req.auth.sub));
  }
  @Post("coach") async coach(@Req() req: AuthenticatedRequest, @Body() raw: unknown) {
    return success(
      req,
      await this.service.submitCoach(
        req.auth.sub,
        coachVerificationSubmitSchema.parse(raw),
        req.id,
      ),
    );
  }
}

@ApiTags("Organization Verifications")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("organizations/:organizationId/verifications")
export class OrganizationVerificationController {
  constructor(private readonly service: VerificationService) {}
  @Get() async list(
    @Req() req: AuthenticatedRequest,
    @Param("organizationId") id: string,
    @Query() raw: unknown,
  ) {
    const query = verificationListSchema.parse(raw),
      result = await this.service.organization(req.auth.sub, objectId.parse(id), query);
    return paginated(req, result.items, { ...query, total: result.total });
  }
  @Post("clubs") async club(
    @Req() req: AuthenticatedRequest,
    @Param("organizationId") id: string,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.service.submitClub(
        req.auth.sub,
        objectId.parse(id),
        clubVerificationSubmitSchema.parse(raw),
        req.id,
      ),
    );
  }
}

@ApiTags("Admin / Verifications")
@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionGuard)
@Controller("admin/verifications")
export class AdminVerificationController {
  constructor(private readonly service: VerificationService) {}
  @Get() @RequirePermission(PERMISSIONS.ADMIN_VERIFICATIONS_MANAGE) async list(
    @Req() req: AuthenticatedRequest,
    @Query() raw: unknown,
  ) {
    const query = verificationListSchema.parse(raw),
      result = await this.service.admin(query);
    return paginated(req, result.items, { ...query, total: result.total });
  }
  @Post(":caseId/review") @RequirePermission(PERMISSIONS.ADMIN_VERIFICATIONS_MANAGE) async review(
    @Req() req: AuthenticatedRequest,
    @Param("caseId") id: string,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.service.review(
        req.auth.sub,
        objectId.parse(id),
        verificationReviewSchema.parse(raw),
        req.id,
      ),
    );
  }
}

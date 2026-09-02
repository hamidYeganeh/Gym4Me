import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "../../security/rbac.js";
import { success } from "../../common/response.js";
import { AuthGuard } from "../../security/auth.guard.js";
import type { AuthenticatedRequest } from "../../security/auth.types.js";
import { RequirePermission } from "../../security/permission.decorator.js";
import { PermissionGuard } from "../../security/permission.guard.js";
import { AccessPassService } from "./access-pass.service.js";
import {
  accessPassIssueSchema,
  checkInSchema,
  checkOutSchema,
  objectId,
} from "./schemas/commerce.schemas.js";

@ApiTags("Access")
@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionGuard)
@Controller()
export class AccessPassController {
  constructor(private readonly service: AccessPassService) {}
  @Post("bookings/:bookingId/access-passes")
  @RequirePermission(PERMISSIONS.BOOKING_MANAGE_SELF)
  async issue(
    @Req() req: AuthenticatedRequest,
    @Param("bookingId") id: string,
    @Body() raw: unknown,
  ) {
    const body = accessPassIssueSchema.parse(raw ?? {});
    return success(
      req,
      await this.service.issue(req.auth.sub, objectId.parse(id), body.participant_indexes),
    );
  }
  @Get("access/check-ins/me")
  @RequirePermission(PERMISSIONS.BOOKING_MANAGE_SELF)
  async mine(@Req() req: AuthenticatedRequest, @Query() raw: unknown) {
    return success(req, await this.service.mine(req.auth.sub, raw));
  }
  @Post("branches/:branchId/access/check-ins")
  @RequirePermission(PERMISSIONS.BRANCH_CHECK_IN_CREATE)
  async checkIn(
    @Req() req: AuthenticatedRequest,
    @Param("branchId") branchId: string,
    @Body() raw: unknown,
  ) {
    const body = checkInSchema.parse(raw);
    return success(
      req,
      await this.service.checkIn(req.auth.sub, objectId.parse(branchId), body.token, req.id),
    );
  }
  @Post("branches/:branchId/access/check-outs/:checkInId")
  @RequirePermission(PERMISSIONS.BRANCH_CHECK_OUT_CREATE)
  async checkOut(
    @Req() req: AuthenticatedRequest,
    @Param("branchId") branchId: string,
    @Param("checkInId") checkInId: string,
    @Body() raw: unknown,
  ) {
    const body = checkOutSchema.parse(raw ?? {});
    return success(
      req,
      await this.service.checkOut(
        req.auth.sub,
        objectId.parse(branchId),
        objectId.parse(checkInId),
        body.note,
        req.id,
      ),
    );
  }
}

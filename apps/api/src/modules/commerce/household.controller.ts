import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "../../security/rbac.js";
import { success } from "../../common/response.js";
import { AuthGuard } from "../../security/auth.guard.js";
import type { AuthenticatedRequest } from "../../security/auth.types.js";
import { RequirePermission } from "../../security/permission.decorator.js";
import { PermissionGuard } from "../../security/permission.guard.js";
import { householdMemberSchema, householdSchema } from "./schemas/commerce.schemas.js";
import { HouseholdService } from "./household.service.js";

@ApiTags("Household")
@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionGuard)
@RequirePermission(PERMISSIONS.HOUSEHOLD_MANAGE_SELF)
@Controller("bookings/household")
export class HouseholdController {
  constructor(private readonly service: HouseholdService) {}
  @Get() async get(@Req() req: AuthenticatedRequest) {
    return success(req, await this.service.get(req.auth.sub));
  }
  @Patch() async update(@Req() req: AuthenticatedRequest, @Body() raw: unknown) {
    return success(req, await this.service.update(req.auth.sub, householdSchema.parse(raw)));
  }
  @Post("members") async add(@Req() req: AuthenticatedRequest, @Body() raw: unknown) {
    return success(
      req,
      await this.service.addMember(req.auth.sub, householdMemberSchema.parse(raw)),
    );
  }
  @Delete("members/:memberId") async remove(
    @Req() req: AuthenticatedRequest,
    @Param("memberId") memberId: string,
  ) {
    return success(req, await this.service.removeMember(req.auth.sub, memberId));
  }
}

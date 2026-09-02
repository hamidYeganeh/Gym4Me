import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { z } from "zod";
import { success } from "../../common/response.js";
import { AuthGuard } from "../../security/auth.guard.js";
import type { AuthenticatedRequest } from "../../security/auth.types.js";
import { invitationSchema, objectId } from "./schemas/organization.schemas.js";
import { MEMBER_STATUSES } from "./enums/index.js";
import { StaffService } from "./staff.service.js";

@ApiTags("Organization Staff")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller()
export class StaffController {
  constructor(private readonly service: StaffService) {}
  @Get("organizations/:organizationId/members") async members(
    @Req() req: AuthenticatedRequest,
    @Param("organizationId") rawId: string,
  ) {
    return success(req, await this.service.members(req.auth.sub, objectId.parse(rawId)));
  }
  @Get("organizations/:organizationId/invitations") async invitations(
    @Req() req: AuthenticatedRequest,
    @Param("organizationId") rawId: string,
  ) {
    return success(req, await this.service.invitations(req.auth.sub, objectId.parse(rawId)));
  }
  @Get("organizations/:organizationId/staff-roles") async roles(
    @Req() req: AuthenticatedRequest,
    @Param("organizationId") rawId: string,
  ) {
    return success(req, await this.service.roles(req.auth.sub, objectId.parse(rawId)));
  }
  @Post("organizations/:organizationId/invitations") async invite(
    @Req() req: AuthenticatedRequest,
    @Param("organizationId") rawId: string,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.service.invite(
        req.auth.sub,
        objectId.parse(rawId),
        invitationSchema.parse(raw),
        req.id,
      ),
    );
  }
  @Post("organization-invitations/accept") async accept(
    @Req() req: AuthenticatedRequest,
    @Body() raw: unknown,
  ) {
    const body = z.object({ invitation_token: z.string().min(32) }).parse(raw);
    return success(req, await this.service.accept(req.auth.sub, body.invitation_token, req.id));
  }
  @Delete("organizations/:organizationId/invitations/:invitationId") async revoke(
    @Req() req: AuthenticatedRequest,
    @Param("organizationId") rawOrganizationId: string,
    @Param("invitationId") rawInvitationId: string,
  ) {
    return success(
      req,
      await this.service.revokeInvitation(
        req.auth.sub,
        objectId.parse(rawOrganizationId),
        objectId.parse(rawInvitationId),
        req.id,
      ),
    );
  }
  @Patch("organizations/:organizationId/members/:memberId/status") async status(
    @Req() req: AuthenticatedRequest,
    @Param("organizationId") rawOrganizationId: string,
    @Param("memberId") rawMemberId: string,
    @Body() raw: unknown,
  ) {
    const body = z.object({ status: z.enum(MEMBER_STATUSES) }).parse(raw);
    return success(
      req,
      await this.service.changeMemberStatus(
        req.auth.sub,
        objectId.parse(rawOrganizationId),
        objectId.parse(rawMemberId),
        body.status,
        req.id,
      ),
    );
  }
  @Get("branches/:branchId/staff") async branchStaff(
    @Req() req: AuthenticatedRequest,
    @Param("branchId") rawId: string,
  ) {
    return success(req, await this.service.branchMembers(req.auth.sub, objectId.parse(rawId)));
  }
}

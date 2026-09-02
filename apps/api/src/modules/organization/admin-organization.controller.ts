import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "../../security/rbac.js";
import { paginationSchema } from "../../common/query.js";
import { paginated, success } from "../../common/response.js";
import { AuthGuard } from "../../security/auth.guard.js";
import type { AuthenticatedRequest } from "../../security/auth.types.js";
import { RequirePermission } from "../../security/permission.decorator.js";
import { PermissionGuard } from "../../security/permission.guard.js";
import { AdminOrganizationService } from "./admin-organization.service.js";
import {
  branchCreateSchema,
  branchPatchSchema,
  clubCreateSchema,
  clubPatchSchema,
  objectId,
  organizationCreateSchema,
  organizationPatchSchema,
  statusUpdateSchema,
  verificationSchema,
} from "./schemas/organization.schemas.js";
import { OrganizationsService } from "./organizations.service.js";
import { ClubsService } from "./clubs.service.js";
import { BranchesService } from "./branches.service.js";

@ApiTags("Admin / Organizations")
@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionGuard)
@Controller("admin")
export class AdminOrganizationController {
  constructor(
    private readonly service: AdminOrganizationService,
    private readonly organizationsService: OrganizationsService,
    private readonly clubsService: ClubsService,
    private readonly branchesService: BranchesService,
  ) {}

  @Get("organizations")
  @RequirePermission(PERMISSIONS.ADMIN_ORGANIZATIONS_MANAGE)
  async organizations(@Req() req: AuthenticatedRequest, @Query() raw: unknown) {
    const query = paginationSchema.parse(raw);
    const result = await this.service.list("Organization", query);
    return paginated(req, result.items, { ...query, total: result.total });
  }
  @Post("organizations")
  @RequirePermission(PERMISSIONS.ADMIN_ORGANIZATIONS_MANAGE)
  async createOrganization(@Req() req: AuthenticatedRequest, @Body() raw: unknown) {
    const input = organizationCreateSchema.extend({ owner_user_id: objectId }).parse(raw);
    const { owner_user_id: ownerId, ...body } = input;
    return success(
      req,
      await this.organizationsService.create(ownerId, body, req.id, req.auth.sub),
    );
  }
  @Patch("organizations/:organizationId")
  @RequirePermission(PERMISSIONS.ADMIN_ORGANIZATIONS_MANAGE)
  async updateOrganization(
    @Req() req: AuthenticatedRequest,
    @Param("organizationId") rawId: string,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.service.updateEntity(
        req.auth.sub,
        "organization",
        objectId.parse(rawId),
        organizationPatchSchema.parse(raw),
        req.id,
      ),
    );
  }
  @Get("clubs")
  @RequirePermission(PERMISSIONS.ADMIN_ORGANIZATIONS_MANAGE)
  async clubs(@Req() req: AuthenticatedRequest, @Query() raw: unknown) {
    const query = paginationSchema.parse(raw);
    const result = await this.service.list("Club", query);
    return paginated(req, result.items, { ...query, total: result.total });
  }
  @Post("clubs")
  @RequirePermission(PERMISSIONS.ADMIN_ORGANIZATIONS_MANAGE)
  async createClub(@Req() req: AuthenticatedRequest, @Body() raw: unknown) {
    return success(
      req,
      await this.clubsService.create(req.auth.sub, clubCreateSchema.parse(raw), req.id),
    );
  }
  @Patch("clubs/:clubId")
  @RequirePermission(PERMISSIONS.ADMIN_ORGANIZATIONS_MANAGE)
  async updateClub(
    @Req() req: AuthenticatedRequest,
    @Param("clubId") rawId: string,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.service.updateEntity(
        req.auth.sub,
        "club",
        objectId.parse(rawId),
        clubPatchSchema.parse(raw),
        req.id,
      ),
    );
  }
  @Get("branches")
  @RequirePermission(PERMISSIONS.ADMIN_ORGANIZATIONS_MANAGE)
  async branches(@Req() req: AuthenticatedRequest, @Query() raw: unknown) {
    const query = paginationSchema.parse(raw);
    const result = await this.service.list("Branch", query);
    return paginated(req, result.items, { ...query, total: result.total });
  }
  @Post("clubs/:clubId/branches")
  @RequirePermission(PERMISSIONS.ADMIN_ORGANIZATIONS_MANAGE)
  async createBranch(
    @Req() req: AuthenticatedRequest,
    @Param("clubId") rawId: string,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.branchesService.create(
        req.auth.sub,
        objectId.parse(rawId),
        branchCreateSchema.parse(raw),
        req.id,
      ),
    );
  }
  @Patch("branches/:branchId")
  @RequirePermission(PERMISSIONS.ADMIN_ORGANIZATIONS_MANAGE)
  async updateBranch(
    @Req() req: AuthenticatedRequest,
    @Param("branchId") rawId: string,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.service.updateEntity(
        req.auth.sub,
        "branch",
        objectId.parse(rawId),
        branchPatchSchema.parse(raw),
        req.id,
      ),
    );
  }
  @Patch("organizations/:organizationId/status")
  @RequirePermission(PERMISSIONS.ADMIN_ORGANIZATIONS_MANAGE)
  async organizationStatus(
    @Req() req: AuthenticatedRequest,
    @Param("organizationId") rawId: string,
    @Body() raw: unknown,
  ) {
    const body = statusUpdateSchema.parse(raw);
    return success(
      req,
      await this.service.updateStatus(
        req.auth.sub,
        "organization",
        objectId.parse(rawId),
        body.status,
        body.reason,
        req.id,
      ),
    );
  }
  @Patch("branches/:branchId/status")
  @RequirePermission(PERMISSIONS.ADMIN_ORGANIZATIONS_MANAGE)
  async branchStatus(
    @Req() req: AuthenticatedRequest,
    @Param("branchId") rawId: string,
    @Body() raw: unknown,
  ) {
    const body = statusUpdateSchema.parse(raw);
    return success(
      req,
      await this.service.updateStatus(
        req.auth.sub,
        "branch",
        objectId.parse(rawId),
        body.status,
        body.reason,
        req.id,
      ),
    );
  }
  @Patch("clubs/:clubId/verification")
  @RequirePermission(PERMISSIONS.ADMIN_VERIFICATIONS_MANAGE)
  async verifyClub(
    @Req() req: AuthenticatedRequest,
    @Param("clubId") rawId: string,
    @Body() raw: unknown,
  ) {
    const body = verificationSchema.parse(raw);
    return success(
      req,
      await this.service.verifyClub(
        req.auth.sub,
        objectId.parse(rawId),
        body.status,
        body.reason,
        req.id,
      ),
    );
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "../../security/rbac.js";
import { paginated, success } from "../../common/response.js";
import { AuthGuard } from "../../security/auth.guard.js";
import type { AuthenticatedRequest } from "../../security/auth.types.js";
import { PermissionGuard } from "../../security/permission.guard.js";
import { RequirePermission } from "../../security/permission.decorator.js";
import {
  adminUserCreateSchema,
  adminUserListSchema,
  adminUserPatchSchema,
  assignmentSchema,
  objectId,
  rolePatchSchema,
  roleSchema,
} from "./schemas/admin-account.schemas.js";
import { AdminAccountService } from "./admin-account.service.js";

@ApiTags("Admin / Users & RBAC")
@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionGuard)
@Controller("admin/access")
export class AdminAccountController {
  constructor(private readonly service: AdminAccountService) {}

  @Get("users") @RequirePermission(PERMISSIONS.ADMIN_USERS_MANAGE) async users(
    @Req() req: AuthenticatedRequest,
    @Query() raw: unknown,
  ) {
    const query = adminUserListSchema.parse(raw);
    const result = await this.service.users(query);
    return paginated(req, result.items, { ...query, total: result.total });
  }
  @Post("users") @RequirePermission(PERMISSIONS.ADMIN_USERS_MANAGE) async createUser(
    @Req() req: AuthenticatedRequest,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.service.createUser(req.auth.sub, adminUserCreateSchema.parse(raw), req.id),
    );
  }
  @Patch("users/:userId") @RequirePermission(PERMISSIONS.ADMIN_USERS_MANAGE) async patchUser(
    @Req() req: AuthenticatedRequest,
    @Param("userId") id: string,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.service.patchUser(
        req.auth.sub,
        objectId.parse(id),
        adminUserPatchSchema.parse(raw),
        req.id,
      ),
    );
  }
  @Get("permissions") @RequirePermission(PERMISSIONS.ADMIN_ROLES_MANAGE) async permissions(
    @Req() req: AuthenticatedRequest,
  ) {
    return success(req, await this.service.permissions());
  }
  @Get("roles") @RequirePermission(PERMISSIONS.ADMIN_ROLES_MANAGE) async roles(
    @Req() req: AuthenticatedRequest,
  ) {
    return success(req, await this.service.roles());
  }
  @Post("roles") @RequirePermission(PERMISSIONS.ADMIN_ROLES_MANAGE) async createRole(
    @Req() req: AuthenticatedRequest,
    @Body() raw: unknown,
  ) {
    return success(req, await this.service.createRole(req.auth.sub, roleSchema.parse(raw), req.id));
  }
  @Patch("roles/:roleId") @RequirePermission(PERMISSIONS.ADMIN_ROLES_MANAGE) async patchRole(
    @Req() req: AuthenticatedRequest,
    @Param("roleId") id: string,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.service.patchRole(
        req.auth.sub,
        objectId.parse(id),
        rolePatchSchema.parse(raw),
        req.id,
      ),
    );
  }
  @Post("assignments") @RequirePermission(PERMISSIONS.ADMIN_ROLES_MANAGE) async assign(
    @Req() req: AuthenticatedRequest,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.service.assign(req.auth.sub, assignmentSchema.parse(raw), req.id),
    );
  }
  @Delete("assignments/:assignmentId")
  @RequirePermission(PERMISSIONS.ADMIN_ROLES_MANAGE)
  async revoke(@Req() req: AuthenticatedRequest, @Param("assignmentId") id: string) {
    return success(
      req,
      await this.service.revokeAssignment(req.auth.sub, objectId.parse(id), req.id),
    );
  }
  @Post("users/:userId/impersonate")
  @RequirePermission(PERMISSIONS.ADMIN_IMPERSONATE)
  async impersonate(@Req() req: AuthenticatedRequest, @Param("userId") id: string) {
    return success(req, await this.service.impersonate(req.auth.sub, objectId.parse(id), req.id));
  }
}

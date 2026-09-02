import { CanActivate, ExecutionContext, Inject, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { DatabaseModels } from "../database/index.js";
import { PERMISSIONS, can } from "./rbac.js";
import { ApiError } from "../common/api-error.js";
import { DATABASE_MODELS } from "../database/database.constants.js";
import type { AuthenticatedRequest } from "./auth.types.js";
import { PERMISSION_KEY } from "./permission.decorator.js";

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    @Inject(Reflector) private readonly reflector: Reflector,
    @Inject(DATABASE_MODELS) private readonly models: DatabaseModels,
  ) {}
  async canActivate(context: ExecutionContext) {
    const permission = this.reflector.getAllAndOverride<string>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!permission) return true;
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const assignments = (await this.models.RoleAssignment.find({
      userId: request.auth.sub,
      status: "active",
    }).lean()) as any[];
    const roles = (await this.models.Role.find({
      _id: { $in: assignments.map((item) => item.roleId) },
      status: "active",
    }).lean()) as any[];
    const allowed = assignments.some((assignment) => {
      const role = roles.find((item) => String(item._id) === String(assignment.roleId));
      const codes = (role?.permissions ?? [])
        .filter((item: any) => item.effect === "allow")
        .map((item: any) => item.code);
      return can(
        {
          userId: request.auth.sub,
          permissionCodes: codes,
          scopeType: assignment.scope.type,
          ...(assignment.scope.id ? { scopeId: String(assignment.scope.id) } : {}),
        },
        permission,
        {
          ownerUserId: request.auth.sub,
          ...(request.auth.context?.scope.type === "organization"
            ? { organizationId: request.auth.context.scope.id }
            : {}),
          ...(request.auth.context?.scope.type === "branch"
            ? { branchId: request.auth.context.scope.id }
            : {}),
        },
      );
    });
    if (
      !allowed &&
      !roles.some((role) =>
        role.permissions?.some(
          (item: any) => item.code === PERMISSIONS.ALL && item.effect === "allow",
        ),
      )
    )
      throw new ApiError("FORBIDDEN", "دسترسی لازم برای این عملیات وجود ندارد.", 403);
    return true;
  }
}

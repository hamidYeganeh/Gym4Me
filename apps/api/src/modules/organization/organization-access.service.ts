import { Inject, Injectable } from "@nestjs/common";
import { type DatabaseModels, objectIdFrom } from "../../database/index.js";
import { PERMISSIONS } from "../../security/rbac.js";
import { ApiError } from "../../common/api-error.js";
import { DATABASE_MODELS } from "../../database/database.constants.js";

@Injectable()
export class OrganizationAccessService {
  constructor(@Inject(DATABASE_MODELS) private readonly models: DatabaseModels) {}

  private async assignments(userId: string) {
    const assignments = (await this.models.RoleAssignment.find({
      userId: objectIdFrom(userId),
      status: "active",
      $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
    }).lean()) as any[];
    const roles = (await this.models.Role.find({
      _id: { $in: assignments.map((item) => item.roleId) },
      status: "active",
    }).lean()) as any[];
    return assignments
      .map((assignment) => ({
        assignment,
        role: roles.find((role) => String(role._id) === String(assignment.roleId)),
      }))
      .filter((item) => item.role);
  }

  private permits(role: any, permission: string) {
    const allowed = (role.permissions ?? [])
      .filter((item: any) => item.effect === "allow")
      .map((item: any) => item.code);
    const denied = (role.permissions ?? [])
      .filter((item: any) => item.effect === "deny")
      .map((item: any) => item.code);
    return (
      !denied.includes(permission) &&
      (allowed.includes(PERMISSIONS.ALL) || allowed.includes(permission))
    );
  }

  async assertOrganization(userId: string, organizationId: string, permission: string) {
    const rows = await this.assignments(userId);
    const allowed = rows.some(
      ({ assignment, role }) =>
        this.permits(role, permission) &&
        (assignment.scope.type === "global" ||
          (assignment.scope.type === "organization" &&
            String(assignment.scope.id) === organizationId)),
    );
    if (!allowed) throw new ApiError("FORBIDDEN", "در این سازمان دسترسی لازم را ندارید.", 403);
  }

  async assertBranch(userId: string, branchId: string, permission: string) {
    const branch = (await this.models.Branch.findById(branchId).lean()) as any;
    if (!branch) throw new ApiError("BRANCH_NOT_FOUND", "شعبه پیدا نشد.", 404);
    const club = (await this.models.Club.findById(branch.clubId).lean()) as any;
    if (!club) throw new ApiError("CLUB_NOT_FOUND", "باشگاه پیدا نشد.", 404);
    const rows = await this.assignments(userId);
    const allowed = rows.some(
      ({ assignment, role }) =>
        this.permits(role, permission) &&
        (assignment.scope.type === "global" ||
          (assignment.scope.type === "organization" &&
            String(assignment.scope.id) === String(club.organizationId)) ||
          (assignment.scope.type === "branch" && String(assignment.scope.id) === branchId)),
    );
    if (!allowed) throw new ApiError("FORBIDDEN", "در این شعبه دسترسی لازم را ندارید.", 403);
    return { branch, club, organizationId: String(club.organizationId) };
  }

  async organizationIds(userId: string) {
    const rows = await this.assignments(userId);
    if (
      rows.some(
        ({ assignment, role }) =>
          assignment.scope.type === "global" &&
          this.permits(role, PERMISSIONS.ORGANIZATION_PROFILE_READ),
      )
    )
      return null;
    return [
      ...new Set(
        rows
          .filter(
            ({ assignment, role }) =>
              assignment.scope.type === "organization" &&
              this.permits(role, PERMISSIONS.ORGANIZATION_PROFILE_READ),
          )
          .map(({ assignment }) => String(assignment.scope.id)),
      ),
    ];
  }
}

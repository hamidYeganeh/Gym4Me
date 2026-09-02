import { Inject, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { AccessContext, AccessTokenClaims } from "../../common/contracts.js";
import { objectIdFrom, type DatabaseModels } from "../../database/index.js";
import { ApiError } from "../../common/api-error.js";
import { appConfig } from "../../config/app.config.js";
import { DATABASE_MODELS } from "../../database/database.constants.js";
import { AuditService } from "../audit/audit.service.js";
import { AccountService } from "./account.service.js";
import { randomToken, secureHash } from "./crypto.js";

@Injectable()
export class AdminAccountService {
  private readonly config = appConfig();
  constructor(
    @Inject(DATABASE_MODELS) private readonly models: DatabaseModels,
    private readonly accounts: AccountService,
    private readonly jwt: JwtService,
    private readonly audit: AuditService,
  ) {}

  async users(query: any) {
    const filter: any = { ...(query.status ? { status: query.status } : {}) };
    if (query.search) {
      const profiles = await this.models.UserProfile.find({
        $or: [
          { "identity.displayName": { $regex: query.search, $options: "i" } },
          { "identity.firstName": { $regex: query.search, $options: "i" } },
          { "identity.lastName": { $regex: query.search, $options: "i" } },
        ],
      }).distinct("userId");
      filter.$or = [
        { "contact.mobile.value": { $regex: query.search, $options: "i" } },
        { _id: { $in: profiles } },
      ];
    }
    const [users, total] = await Promise.all([
      this.models.User.find(filter)
        .sort({ createdAt: -1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .lean(),
      this.models.User.countDocuments(filter),
    ]);
    const profiles = (await this.models.UserProfile.find({
      userId: { $in: users.map((item: any) => item._id) },
    }).lean()) as any[];
    const assignments = (await this.models.RoleAssignment.find({
      userId: { $in: users.map((item: any) => item._id) },
      status: "active",
    }).lean()) as any[];
    const roles = (await this.models.Role.find({
      _id: { $in: assignments.map((item) => item.roleId) },
    }).lean()) as any[];
    return {
      items: users.map((user: any) => ({
        ...user,
        profile: profiles.find((item) => String(item.userId) === String(user._id)),
        assignments: assignments
          .filter((item) => String(item.userId) === String(user._id))
          .map((item) => ({
            ...item,
            role: roles.find((role) => String(role._id) === String(item.roleId)),
          })),
      })),
      total,
    };
  }

  async createUser(actorUserId: string, input: any, requestId: string) {
    const mobile = this.accounts.normalizeMobile(input.mobile);
    if (await this.models.User.exists({ "contact.mobile.value": mobile }))
      throw new ApiError("USER_MOBILE_EXISTS", "کاربری با این شماره وجود دارد.", 409);
    const user = await this.models.User.create({
      contact: { mobile: { value: mobile, verifiedAt: new Date() } },
      status: input.status,
      createdBy: objectIdFrom(actorUserId),
    });
    await Promise.all([
      this.models.UserProfile.create({
        userId: user._id,
        identity: {
          firstName: input.profile.first_name,
          lastName: input.profile.last_name,
          displayName: [input.profile.first_name, input.profile.last_name]
            .filter(Boolean)
            .join(" "),
        },
        status: "active",
        createdBy: objectIdFrom(actorUserId),
      }),
      this.models.AthleteProfile.create({
        userId: user._id,
        status: "active",
        createdBy: objectIdFrom(actorUserId),
      }),
    ]);
    await this.audit.record({
      actorUserId,
      action: "admin.user.created",
      entityType: "user",
      entityId: String(user._id),
      after: user.toObject(),
      requestId,
    });
    return user.toObject();
  }

  async patchUser(actorUserId: string, id: string, input: any, requestId: string) {
    const before = await this.models.User.findById(objectIdFrom(id)).lean();
    if (!before) throw new ApiError("USER_NOT_FOUND", "کاربر پیدا نشد.", 404);
    if (input.status)
      await this.models.User.updateOne(
        { _id: objectIdFrom(id) },
        { $set: { status: input.status, updatedBy: objectIdFrom(actorUserId) } },
      );
    if (input.profile)
      await this.models.UserProfile.updateOne(
        { userId: objectIdFrom(id) },
        {
          $set: {
            ...(input.profile.first_name !== undefined
              ? { "identity.firstName": input.profile.first_name }
              : {}),
            ...(input.profile.last_name !== undefined
              ? { "identity.lastName": input.profile.last_name }
              : {}),
            updatedBy: objectIdFrom(actorUserId),
          },
        },
        { upsert: true },
      );
    if (["blocked", "suspended", "archived"].includes(input.status))
      await this.models.AuthSession.updateMany(
        { userId: objectIdFrom(id), status: "active" },
        { $set: { status: "revoked", revokedAt: new Date(), revokeReason: "admin_status_change" } },
      );
    const after = await this.models.User.findById(objectIdFrom(id)).lean();
    await this.audit.record({
      actorUserId,
      action: "admin.user.updated",
      entityType: "user",
      entityId: id,
      before: before as any,
      after: after as any,
      requestId,
    });
    return after;
  }

  async permissions() {
    return this.models.Permission.find({ status: "active" }).sort({ module: 1, code: 1 }).lean();
  }
  async roles() {
    return this.models.Role.find({ status: { $ne: "archived" } })
      .sort({ type: 1, name: 1 })
      .lean();
  }
  private async assertPermissions(codes: string[]) {
    const count = await this.models.Permission.countDocuments({
      code: { $in: codes },
      status: "active",
    });
    if (count !== new Set(codes).size)
      throw new ApiError("ROLE_PERMISSION_INVALID", "یک یا چند مجوز معتبر نیست.", 422);
  }
  async createRole(actorUserId: string, input: any, requestId?: string) {
    await this.assertPermissions(input.permissions);
    const item = await this.models.Role.create({
      code: input.code,
      name: input.name,
      type: input.type,
      scopeType: input.scope_type,
      system: false,
      permissions: input.permissions.map((code: string) => ({ code, effect: "allow" })),
      status: input.status,
      createdBy: objectIdFrom(actorUserId),
    });
    await this.audit.record({
      actorUserId,
      action: "admin.role.created",
      entityType: "role",
      entityId: String(item._id),
      after: item.toObject(),
      requestId,
    });
    return item.toObject();
  }
  async patchRole(actorUserId: string, id: string, input: any, requestId?: string) {
    const role = (await this.models.Role.findById(objectIdFrom(id))) as any;
    if (!role) throw new ApiError("ROLE_NOT_FOUND", "نقش پیدا نشد.", 404);
    if (input.permissions) await this.assertPermissions(input.permissions);
    const update = {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.type !== undefined ? { type: input.type } : {}),
      ...(input.scope_type !== undefined ? { scopeType: input.scope_type } : {}),
      ...(input.permissions
        ? { permissions: input.permissions.map((code: string) => ({ code, effect: "allow" })) }
        : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      updatedBy: objectIdFrom(actorUserId),
    };
    const item = await this.models.Role.findByIdAndUpdate(
      role._id,
      { $set: update },
      { returnDocument: "after" },
    ).lean();
    await this.audit.record({
      actorUserId,
      action: "admin.role.updated",
      entityType: "role",
      entityId: id,
      before: role.toObject(),
      after: item as any,
      requestId,
    });
    return item;
  }
  async assign(actorUserId: string, input: any, requestId?: string) {
    const role = (await this.models.Role.findById(objectIdFrom(input.role_id)).lean()) as any;
    if (!role || role.status !== "active")
      throw new ApiError("ROLE_NOT_FOUND", "نقش فعال پیدا نشد.", 404);
    if (role.scopeType !== input.scope.type)
      throw new ApiError("ROLE_SCOPE_MISMATCH", "محدوده نقش با تخصیص سازگار نیست.", 422);
    if (["organization", "branch", "self"].includes(input.scope.type) && !input.scope.id)
      throw new ApiError("ROLE_SCOPE_ID_REQUIRED", "شناسه محدوده الزامی است.", 422);
    if (
      !(await this.models.User.exists({
        _id: objectIdFrom(input.user_id),
        status: { $ne: "archived" },
      }))
    )
      throw new ApiError("USER_NOT_FOUND", "کاربر پیدا نشد.", 404);
    if (input.scope.type === "self" && input.scope.id !== input.user_id)
      throw new ApiError(
        "ROLE_SELF_SCOPE_INVALID",
        "محدوده شخصی باید متعلق به همان کاربر باشد.",
        422,
      );
    if (
      input.scope.type === "organization" &&
      !(await this.models.Organization.exists({
        _id: objectIdFrom(input.scope.id),
        status: { $ne: "archived" },
      }))
    )
      throw new ApiError("ORGANIZATION_NOT_FOUND", "سازمان محدوده پیدا نشد.", 404);
    if (
      input.scope.type === "branch" &&
      !(await this.models.Branch.exists({
        _id: objectIdFrom(input.scope.id),
        status: { $ne: "archived" },
      }))
    )
      throw new ApiError("BRANCH_NOT_FOUND", "شعبه محدوده پیدا نشد.", 404);
    const item = await this.models.RoleAssignment.findOneAndUpdate(
      {
        userId: objectIdFrom(input.user_id),
        roleId: role._id,
        "scope.type": input.scope.type,
        ...(input.scope.id ? { "scope.id": objectIdFrom(input.scope.id) } : { "scope.id": null }),
      },
      {
        $set: {
          status: "active",
          expiresAt: input.expires_at,
          updatedBy: objectIdFrom(actorUserId),
        },
        $setOnInsert: { createdBy: objectIdFrom(actorUserId) },
      },
      { upsert: true, returnDocument: "after" },
    ).lean();
    await this.audit.record({
      actorUserId,
      action: "admin.role_assignment.created",
      entityType: "role_assignment",
      entityId: String((item as any)?._id),
      after: item as any,
      requestId,
    });
    return item;
  }
  async revokeAssignment(actorUserId: string, id: string, requestId?: string) {
    const before = (await this.models.RoleAssignment.findById(objectIdFrom(id)).lean()) as any;
    if (!before) throw new ApiError("ROLE_ASSIGNMENT_NOT_FOUND", "تخصیص نقش پیدا نشد.", 404);
    if (String(before.userId) === actorUserId) {
      const role = (await this.models.Role.findById(before.roleId).lean()) as any;
      if (role?.code === "super_admin")
        throw new ApiError(
          "SUPER_ADMIN_SELF_REVOKE_FORBIDDEN",
          "ادمین نمی‌تواند نقش سراسری فعال خودش را حذف کند.",
          409,
        );
    }
    const item = await this.models.RoleAssignment.findByIdAndUpdate(
      objectIdFrom(id),
      { $set: { status: "revoked", updatedBy: objectIdFrom(actorUserId) } },
      { returnDocument: "after" },
    ).lean();
    await this.audit.record({
      actorUserId,
      action: "admin.role_assignment.revoked",
      entityType: "role_assignment",
      entityId: id,
      after: item as any,
      requestId,
    });
    return item;
  }

  async impersonate(actorUserId: string, targetUserId: string, requestId?: string) {
    const target = (await this.models.User.findOne({
      _id: objectIdFrom(targetUserId),
      status: "active",
    }).lean()) as any;
    if (!target) throw new ApiError("USER_NOT_AVAILABLE", "کاربر فعال پیدا نشد.", 404);
    const assignment = (await this.models.RoleAssignment.findOne({
      userId: target._id,
      status: "active",
    }).lean()) as any;
    const role = assignment
      ? ((await this.models.Role.findById(assignment.roleId).lean()) as any)
      : undefined;
    const context: AccessContext = assignment
      ? {
          persona: role?.code === "coach" ? "coach" : role?.type === "admin" ? "admin" : "athlete",
          role_id: String(role?._id),
          scope: {
            type: assignment.scope.type,
            ...(assignment.scope.id ? { id: String(assignment.scope.id) } : {}),
          },
        }
      : { persona: "athlete", scope: { type: "self", id: targetUserId } };
    const secret = randomToken();
    const session = await this.models.AuthSession.create({
      userId: target._id,
      refreshTokenHash: secureHash(secret, this.config.JWT_ACCESS_SECRET),
      tokenFamilyId: crypto.randomUUID(),
      expiresAt: new Date(Date.now() + 15 * 60_000),
      client: { impersonatedBy: actorUserId, mode: "admin" },
      status: "active",
      createdBy: objectIdFrom(actorUserId),
    });
    const claims: AccessTokenClaims = {
      sub: targetUserId,
      session_id: String(session._id),
      token_type: "access",
      context,
    };
    const result = {
      access_token: await this.jwt.signAsync(claims, { expiresIn: 900 }),
      token_type: "Bearer" as const,
      expires_in: 900,
      context,
      impersonated_user_id: targetUserId,
    };
    await this.audit.record({
      actorUserId,
      action: "admin.user.impersonated",
      entityType: "user",
      entityId: targetUserId,
      after: { sessionId: String(session._id), expiresAt: session.get("expiresAt") },
      requestId,
    });
    return result;
  }
}

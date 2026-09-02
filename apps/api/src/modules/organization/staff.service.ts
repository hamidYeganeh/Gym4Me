import { Inject, Injectable } from "@nestjs/common";
import { getConnectionToken } from "@nestjs/mongoose";
import { idOf, objectIdFrom, type DatabaseModels } from "../../database/index.js";
import { PERMISSIONS } from "../../security/rbac.js";
import type { Connection } from "mongoose";
import { ApiError } from "../../common/api-error.js";
import { appConfig } from "../../config/app.config.js";
import { DATABASE_MODELS } from "../../database/database.constants.js";
import { AuditService } from "../audit/audit.service.js";
import { randomToken, secureHash } from "../account/crypto.js";
import { toStorage } from "./entity-mapper.js";
import { OrganizationAccessService } from "./organization-access.service.js";

@Injectable()
export class StaffService {
  private readonly config = appConfig();
  constructor(
    @Inject(DATABASE_MODELS) private readonly models: DatabaseModels,
    @Inject(getConnectionToken()) private readonly connection: Connection,
    private readonly access: OrganizationAccessService,
    private readonly audit: AuditService,
  ) {}

  private normalizeMobile(value: string) {
    const mobile = value.replace(/[\s()-]/g, "");
    if (!/^\+?[1-9]\d{9,14}$/.test(mobile))
      throw new ApiError("INVALID_MOBILE", "شماره موبایل معتبر نیست.", 422);
    return mobile.startsWith("+") ? mobile : `+${mobile}`;
  }

  async members(userId: string, organizationId: string) {
    await this.access.assertOrganization(
      userId,
      organizationId,
      PERMISSIONS.ORGANIZATION_STAFF_MANAGE,
    );
    return this.models.OrganizationMember.find({ organizationId: objectIdFrom(organizationId) })
      .sort({ createdAt: -1 })
      .populate("userId", "contact status")
      .lean();
  }

  async invitations(userId: string, organizationId: string) {
    await this.access.assertOrganization(
      userId,
      organizationId,
      PERMISSIONS.ORGANIZATION_STAFF_MANAGE,
    );
    return this.models.StaffInvitation.find({ organizationId: objectIdFrom(organizationId) })
      .select("-tokenHash")
      .sort({ createdAt: -1 })
      .lean();
  }

  async roles(userId: string, organizationId: string) {
    await this.access.assertOrganization(
      userId,
      organizationId,
      PERMISSIONS.ORGANIZATION_STAFF_MANAGE,
    );
    return this.models.Role.find({
      scopeType: { $in: ["organization", "branch"] },
      code: { $ne: "super_admin" },
      status: "active",
    })
      .select("code name scopeType permissions")
      .sort({ scopeType: 1, code: 1 })
      .lean();
  }

  async invite(
    userId: string,
    organizationId: string,
    body: Record<string, any>,
    requestId?: string,
  ) {
    await this.access.assertOrganization(
      userId,
      organizationId,
      PERMISSIONS.ORGANIZATION_STAFF_MANAGE,
    );
    const role = (await this.models.Role.findOne({
      _id: objectIdFrom(body.role_id),
      status: "active",
    }).lean()) as any;
    if (
      !role ||
      !["organization", "branch"].includes(role.scopeType) ||
      role.code === "super_admin"
    )
      throw new ApiError("STAFF_ROLE_INVALID", "نقش انتخاب‌شده برای پرسنل معتبر نیست.", 422);
    if (role.scopeType !== body.scope_type)
      throw new ApiError("STAFF_SCOPE_INVALID", "محدوده نقش با دعوت‌نامه تطابق ندارد.", 422);
    if (body.scope_type === "organization" && body.scope_id !== organizationId)
      throw new ApiError("STAFF_SCOPE_INVALID", "محدوده سازمانی معتبر نیست.", 422);
    if (body.scope_type === "branch") {
      const branchContext = await this.access.assertBranch(
        userId,
        body.scope_id,
        PERMISSIONS.ORGANIZATION_STAFF_MANAGE,
      );
      if (branchContext.organizationId !== organizationId)
        throw new ApiError("STAFF_SCOPE_INVALID", "شعبه متعلق به این سازمان نیست.", 422);
    }
    const mobile = this.normalizeMobile(body.mobile);
    const duplicate = await this.models.StaffInvitation.exists({
      organizationId: objectIdFrom(organizationId),
      mobile,
      status: "pending",
      expiresAt: { $gt: new Date() },
    });
    if (duplicate)
      throw new ApiError(
        "INVITATION_ALREADY_PENDING",
        "برای این شماره دعوت‌نامه فعال وجود دارد.",
        409,
      );
    const token = randomToken();
    const employment = toStorage(body.employment ?? {}) as Record<string, unknown>;
    if (body.scope_type === "branch")
      employment.branchIds = [
        ...new Set([...((employment.branchIds as string[] | undefined) ?? []), body.scope_id]),
      ].map(objectIdFrom);
    const invitation = await this.models.StaffInvitation.create({
      organizationId: objectIdFrom(organizationId),
      ...(body.scope_type === "branch" ? { branchId: objectIdFrom(body.scope_id) } : {}),
      mobile,
      roleId: objectIdFrom(body.role_id),
      scope: { type: body.scope_type, id: objectIdFrom(body.scope_id) },
      employment,
      tokenHash: secureHash(token, this.config.JWT_ACCESS_SECRET),
      expiresAt: new Date(Date.now() + body.expires_in_days * 86_400_000),
      invitedBy: objectIdFrom(userId),
      status: "pending",
      createdBy: objectIdFrom(userId),
    });
    await this.models.OutboxEvent.create({
      type: "organization.staff.invited",
      aggregate: { type: "staff_invitation", id: idOf(invitation) },
      payload: { invitationId: idOf(invitation), mobile },
      status: "pending",
      availableAt: new Date(),
      createdBy: objectIdFrom(userId),
    });
    await this.audit.record({
      actorUserId: userId,
      action: "staff.invited",
      entityType: "staff_invitation",
      entityId: idOf(invitation),
      organizationId,
      after: { mobile, roleId: body.role_id, scope: body.scope_type },
      requestId,
    });
    const safeInvitation = invitation.toObject() as Record<string, unknown>;
    delete safeInvitation.tokenHash;
    return { invitation: safeInvitation, invitation_token: token };
  }

  async accept(userId: string, token: string, requestId?: string) {
    const tokenHash = secureHash(token, this.config.JWT_ACCESS_SECRET);
    const invitation = await this.models.StaffInvitation.findOne({
      tokenHash,
      status: "pending",
      expiresAt: { $gt: new Date() },
      revokedAt: null,
    });
    if (!invitation) throw new ApiError("INVITATION_INVALID", "دعوت‌نامه معتبر یا فعال نیست.", 422);
    const user = (await this.models.User.findById(userId).lean()) as any;
    if (!user || user.contact?.mobile?.value !== invitation.get("mobile"))
      throw new ApiError(
        "INVITATION_MOBILE_MISMATCH",
        "دعوت‌نامه متعلق به شماره این حساب نیست.",
        403,
      );
    const organizationId = String(invitation.get("organizationId"));
    let member: any;
    await this.connection.transaction(async (session) => {
      const assignment = await this.models.RoleAssignment.findOneAndUpdate(
        {
          userId: objectIdFrom(userId),
          roleId: invitation.get("roleId"),
          "scope.type": invitation.get("scope.type"),
          "scope.id": invitation.get("scope.id"),
        },
        {
          $set: { status: "active", updatedBy: objectIdFrom(userId) },
          $setOnInsert: { createdBy: objectIdFrom(userId) },
        },
        { upsert: true, returnDocument: "after", session },
      );
      member = await this.models.OrganizationMember.findOneAndUpdate(
        { organizationId: invitation.get("organizationId"), userId: objectIdFrom(userId) },
        {
          $set: {
            employment: invitation.get("employment") ?? {},
            status: "active",
            updatedBy: objectIdFrom(userId),
          },
          $addToSet: { roleAssignmentIds: assignment._id },
          $setOnInsert: { createdBy: objectIdFrom(userId) },
        },
        { upsert: true, returnDocument: "after", session },
      );
      await invitation.updateOne(
        { $set: { status: "accepted", acceptedAt: new Date(), updatedBy: objectIdFrom(userId) } },
        { session },
      );
      await this.models.AuditLog.create(
        [
          {
            actor: { userId },
            action: "staff.invitation.accepted",
            entity: { type: "organization_member", id: idOf(member), organizationId },
            changes: { after: member.toObject() },
            request: { id: requestId },
            occurredAt: new Date(),
          },
        ],
        { session },
      );
    });
    return member;
  }

  async revokeInvitation(
    userId: string,
    organizationId: string,
    invitationId: string,
    requestId?: string,
  ) {
    await this.access.assertOrganization(
      userId,
      organizationId,
      PERMISSIONS.ORGANIZATION_STAFF_MANAGE,
    );
    const invitation = await this.models.StaffInvitation.findOneAndUpdate(
      { _id: invitationId, organizationId: objectIdFrom(organizationId), status: "pending" },
      { $set: { status: "revoked", revokedAt: new Date(), updatedBy: objectIdFrom(userId) } },
      { returnDocument: "after" },
    )
      .select("-tokenHash")
      .lean();
    if (!invitation) throw new ApiError("INVITATION_NOT_FOUND", "دعوت‌نامه فعال پیدا نشد.", 404);
    await this.audit.record({
      actorUserId: userId,
      action: "staff.invitation.revoked",
      entityType: "staff_invitation",
      entityId: invitationId,
      organizationId,
      after: invitation,
      requestId,
    });
    return invitation;
  }

  async changeMemberStatus(
    userId: string,
    organizationId: string,
    memberId: string,
    status: "active" | "suspended" | "ended",
    requestId?: string,
  ) {
    await this.access.assertOrganization(
      userId,
      organizationId,
      PERMISSIONS.ORGANIZATION_STAFF_MANAGE,
    );
    const member = await this.models.OrganizationMember.findOne({
      _id: memberId,
      organizationId: objectIdFrom(organizationId),
    });
    if (!member) throw new ApiError("MEMBER_NOT_FOUND", "عضو سازمان پیدا نشد.", 404);
    const organization = (await this.models.Organization.findById(organizationId).lean()) as any;
    if (String(organization?.ownerUserId) === String(member.get("userId")) && status !== "active")
      throw new ApiError(
        "OWNER_CANNOT_BE_DISABLED",
        "مالک اصلی سازمان قابل تعلیق یا حذف نیست.",
        409,
      );
    const before = member.toObject();
    await member.updateOne({
      $set: {
        status,
        ...(status === "ended" ? { "employment.endedAt": new Date() } : {}),
        updatedBy: objectIdFrom(userId),
      },
      $inc: { version: 1 },
    });
    if (status !== "active")
      await this.models.RoleAssignment.updateMany(
        { _id: { $in: member.get("roleAssignmentIds") ?? [] } },
        {
          $set: {
            status: status === "ended" ? "revoked" : "suspended",
            updatedBy: objectIdFrom(userId),
          },
        },
      );
    const after = await this.models.OrganizationMember.findById(memberId).lean();
    await this.audit.record({
      actorUserId: userId,
      action: `staff.${status}`,
      entityType: "organization_member",
      entityId: memberId,
      organizationId,
      before,
      after,
      requestId,
    });
    return after;
  }

  async branchMembers(userId: string, branchId: string) {
    const context = await this.access.assertBranch(
      userId,
      branchId,
      PERMISSIONS.ORGANIZATION_STAFF_MANAGE,
    );
    return this.models.OrganizationMember.find({
      organizationId: objectIdFrom(context.organizationId),
      status: { $ne: "ended" },
      "employment.branchIds": objectIdFrom(branchId),
    })
      .populate("userId", "contact status")
      .lean();
  }
}

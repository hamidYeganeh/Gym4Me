import { Inject, Injectable } from "@nestjs/common";
import { objectIdFrom, type DatabaseModels } from "../../database/index.js";
import { PERMISSIONS } from "../../security/rbac.js";
import { ApiError } from "../../common/api-error.js";
import { DATABASE_MODELS } from "../../database/database.constants.js";
import { AuditService } from "../audit/audit.service.js";
import { toStorage } from "../organization/entity-mapper.js";
import { OrganizationAccessService } from "../organization/organization-access.service.js";

@Injectable()
export class VerificationService {
  constructor(
    @Inject(DATABASE_MODELS) private readonly models: DatabaseModels,
    private readonly access: OrganizationAccessService,
    private readonly audit: AuditService,
  ) {}

  private async ensureNoPending(type: string, id: string) {
    const existing = await this.models.VerificationCase.findOne({
      "subject.type": type,
      "subject.id": objectIdFrom(id),
      status: "pending",
    }).lean();
    if (existing)
      throw new ApiError(
        "VERIFICATION_ALREADY_PENDING",
        "یک پرونده در انتظار بررسی وجود دارد.",
        409,
      );
  }

  async submitCoach(userId: string, input: any, requestId: string) {
    const profile = (await this.models.CoachProfile.findOne({
      userId: objectIdFrom(userId),
    }).lean()) as any;
    if (!profile)
      throw new ApiError("COACH_PROFILE_NOT_FOUND", "ابتدا پروفایل مربی را تکمیل کنید.", 404);
    await this.ensureNoPending("coach_profile", String(profile._id));
    const item = await this.models.VerificationCase.create({
      subject: { type: "coach_profile", id: profile._id, ownerUserId: objectIdFrom(userId) },
      type: input.type,
      documents: toStorage(input.documents),
      review: { history: [] },
      customData: toStorage(input.custom_data),
      status: "pending",
      createdBy: objectIdFrom(userId),
    });
    await this.models.CoachProfile.updateOne(
      { _id: profile._id },
      {
        $set: {
          status: "pending_verification",
          verification: { status: "pending", caseId: item._id, submittedAt: new Date() },
          updatedBy: objectIdFrom(userId),
        },
      },
    );
    await this.audit.record({
      actorUserId: userId,
      action: "verification.coach.submitted",
      entityType: "verification_case",
      entityId: String(item._id),
      after: item.toObject(),
      requestId,
    });
    return item.toObject();
  }

  async submitClub(actor: string, organizationId: string, input: any, requestId: string) {
    await this.access.assertOrganization(
      actor,
      organizationId,
      PERMISSIONS.ORGANIZATION_PROFILE_MANAGE,
    );
    const club = (await this.models.Club.findOne({
      _id: objectIdFrom(input.club_id),
      organizationId: objectIdFrom(organizationId),
    }).lean()) as any;
    if (!club) throw new ApiError("CLUB_NOT_FOUND", "باشگاه متعلق به سازمان پیدا نشد.", 404);
    await this.ensureNoPending("club", input.club_id);
    const item = await this.models.VerificationCase.create({
      subject: {
        type: "club",
        id: club._id,
        organizationId: objectIdFrom(organizationId),
        ownerUserId: objectIdFrom(actor),
      },
      type: input.type,
      documents: toStorage(input.documents),
      review: { history: [] },
      customData: toStorage(input.custom_data),
      status: "pending",
      createdBy: objectIdFrom(actor),
    });
    await this.models.Club.updateOne(
      { _id: club._id },
      {
        $set: {
          status: "pending_verification",
          verification: { status: "pending", caseId: item._id, submittedAt: new Date() },
          updatedBy: objectIdFrom(actor),
        },
      },
    );
    await this.audit.record({
      actorUserId: actor,
      action: "verification.club.submitted",
      entityType: "verification_case",
      entityId: String(item._id),
      organizationId,
      after: item.toObject(),
      requestId,
    });
    return item.toObject();
  }

  async mine(userId: string) {
    return this.models.VerificationCase.find({ "subject.ownerUserId": objectIdFrom(userId) })
      .sort({ createdAt: -1 })
      .lean();
  }

  async organization(actor: string, organizationId: string, query: any) {
    await this.access.assertOrganization(
      actor,
      organizationId,
      PERMISSIONS.ORGANIZATION_PROFILE_READ,
    );
    const filter = {
      "subject.organizationId": objectIdFrom(organizationId),
      ...(query.status ? { status: query.status } : {}),
    };
    const [items, total] = await Promise.all([
      this.models.VerificationCase.find(filter)
        .sort({ createdAt: -1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .lean(),
      this.models.VerificationCase.countDocuments(filter),
    ]);
    return { items, total };
  }

  async admin(query: any) {
    const filter = query.status ? { status: query.status } : {};
    const [items, total] = await Promise.all([
      this.models.VerificationCase.find(filter)
        .sort({ createdAt: 1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .lean(),
      this.models.VerificationCase.countDocuments(filter),
    ]);
    return { items, total };
  }

  async review(actor: string, id: string, input: any, requestId: string) {
    const item = (await this.models.VerificationCase.findById(id)) as any;
    if (!item) throw new ApiError("VERIFICATION_NOT_FOUND", "پرونده تأیید پیدا نشد.", 404);
    if (item.status !== "pending")
      throw new ApiError("VERIFICATION_REVIEWED", "این پرونده قبلاً بررسی شده است.", 409);
    const documentIds = new Set((item.documents ?? []).map((document: any) => document.id));
    if (input.document_results.some((result: any) => !documentIds.has(result.document_id)))
      throw new ApiError(
        "VERIFICATION_DOCUMENT_INVALID",
        "نتیجه یک مدرک نامعتبر ارسال شده است.",
        422,
      );
    const before = item.toObject();
    item.status = input.decision;
    item.review = {
      decision: input.decision,
      note: input.note,
      documentResults: toStorage(input.document_results),
      reviewedAt: new Date(),
      reviewedBy: objectIdFrom(actor),
      history: [
        ...(item.review?.history ?? []),
        {
          decision: input.decision,
          note: input.note,
          reviewedAt: new Date(),
          reviewedBy: objectIdFrom(actor),
        },
      ],
    };
    item.updatedBy = objectIdFrom(actor);
    await item.save();
    const entityStatus =
      input.decision === "verified"
        ? "active"
        : input.decision === "rejected"
          ? "rejected"
          : "draft";
    if (item.subject.type === "coach_profile")
      await this.models.CoachProfile.updateOne(
        { _id: item.subject.id },
        {
          $set: {
            status: entityStatus,
            verification: {
              status: input.decision,
              reason: input.note,
              caseId: item._id,
              reviewedAt: new Date(),
              reviewedBy: objectIdFrom(actor),
            },
            updatedBy: objectIdFrom(actor),
          },
        },
      );
    if (item.subject.type === "club")
      await this.models.Club.updateOne(
        { _id: item.subject.id },
        {
          $set: {
            status: entityStatus,
            verification: {
              status: input.decision,
              reason: input.note,
              caseId: item._id,
              reviewedAt: new Date(),
              reviewedBy: objectIdFrom(actor),
            },
            updatedBy: objectIdFrom(actor),
          },
        },
      );
    await this.audit.record({
      actorUserId: actor,
      action: `verification.${input.decision}`,
      entityType: "verification_case",
      entityId: id,
      ...(item.subject.organizationId
        ? { organizationId: String(item.subject.organizationId) }
        : {}),
      before,
      after: item.toObject(),
      requestId,
    });
    return item.toObject();
  }
}

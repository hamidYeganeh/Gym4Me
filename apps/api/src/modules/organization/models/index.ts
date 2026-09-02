import { audit, createSchema, customData, mixed, objectId, status } from "../../../database/mongoose.js";
import { HOLIDAY_STATUSES, ORGANIZATION_STATUSES, WORKING_HOURS_STATUSES } from "../enums/index.js";

export const organizationModels = {
  Organization: createSchema({
    ownerUserId: { type: objectId, ref: "User", required: true, index: true },
    profile: {
      legalName: { type: String, required: true },
      tradeName: String,
      type: { type: String, default: "club_business" },
      registrationNumber: String,
      taxId: String,
      description: mixed,
      contact: { phones: [String], email: String, website: String },
      address: mixed,
      logo: mixed,
    },
    settings: {
      locale: { type: String, default: "fa-IR" },
      timezone: { type: String, default: "Asia/Tehran" },
      currency: { type: String, default: "IRR" },
      booking: mixed,
    },
    review: {
      submittedAt: Date,
      submittedBy: objectId,
      reviewedAt: Date,
      reviewedBy: objectId,
      decisionReason: String,
    },
    bookingRevision: { type: Number, default: 0, select: false },
    customData,
    status: { type: String, enum: ORGANIZATION_STATUSES, default: "draft", index: true },
    ...audit,
  }),
  OrganizationMember: createSchema({
    organizationId: { type: objectId, ref: "Organization", required: true, index: true },
    userId: { type: objectId, ref: "User", required: true, index: true },
    employment: {
      title: String,
      employeeCode: String,
      branchIds: [objectId],
      startedAt: Date,
      endedAt: Date,
    },
    roleAssignmentIds: [objectId],
    status,
    ...audit,
  }),
  StaffInvitation: createSchema({
    organizationId: { type: objectId, ref: "Organization", required: true, index: true },
    branchId: { type: objectId, ref: "Branch" },
    mobile: { type: String, required: true, index: true },
    roleId: { type: objectId, ref: "Role", required: true },
    scope: { type: { type: String, required: true }, id: { type: objectId, required: true } },
    employment: mixed,
    tokenHash: { type: String, required: true, unique: true, select: false },
    expiresAt: { type: Date, required: true },
    acceptedAt: Date,
    revokedAt: Date,
    invitedBy: { type: objectId, ref: "User", required: true },
    status: { type: String, default: "pending", index: true },
    ...audit,
  }),
  Club: createSchema({
    organizationId: { type: objectId, ref: "Organization", required: true, index: true },
    profile: {
      name: { type: String, required: true },
      slug: { type: String, required: true },
      description: mixed,
      logo: mixed,
      cover: mixed,
      contact: mixed,
      policies: mixed,
    },
    sports: [mixed],
    amenities: [mixed],
    verification: {
      status: { type: String, default: "unverified" },
      submittedAt: Date,
      reviewedAt: Date,
      reviewedBy: objectId,
      reason: String,
    },
    customData,
    status: { type: String, default: "draft", index: true },
    ...audit,
  }),
  Branch: createSchema({
    clubId: { type: objectId, ref: "Club", required: true, index: true },
    profile: {
      name: { type: String, required: true },
      slug: { type: String, required: true },
      description: mixed,
      genderPolicy: String,
      contact: mixed,
      address: mixed,
      images: [mixed],
    },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true },
    },
    workingHours: [
      {
        dayOfWeek: Number,
        periods: [{ opensAt: String, closesAt: String }],
        status: { type: String, enum: WORKING_HOURS_STATUSES, default: "active" },
      },
    ],
    holidays: [
      {
        id: { type: String, required: true },
        date: Date,
        title: String,
        periods: [{ opensAt: String, closesAt: String }],
        status: { type: String, enum: HOLIDAY_STATUSES, default: "closed" },
      },
    ],
    customData,
    status: { type: String, default: "draft", index: true },
    ...audit,
  }),
} as const;

organizationModels.Branch.index({ location: "2dsphere" });
organizationModels.OrganizationMember.index({ organizationId: 1, userId: 1 }, { unique: true });
organizationModels.Club.index({ organizationId: 1, "profile.slug": 1 }, { unique: true });
organizationModels.Branch.index({ clubId: 1, "profile.slug": 1 }, { unique: true });
organizationModels.StaffInvitation.index({ organizationId: 1, mobile: 1, status: 1 });
organizationModels.StaffInvitation.index({ expiresAt: 1 }, { expireAfterSeconds: 86_400 });

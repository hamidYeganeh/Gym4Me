import { createSchema, customData, mixed, objectId, status, audit } from "../../../database/mongoose.js";
import { OTP_STATUSES, SESSION_STATUSES } from "../enums/index.js";

export const accountModels = {
  User: createSchema({
    contact: {
      mobile: { value: { type: String, required: true }, verifiedAt: Date },
      email: { value: String, verifiedAt: Date },
    },
    status,
    lastLoginAt: Date,
    customData,
    ...audit,
  }),
  UserCredential: createSchema({
    userId: { type: objectId, ref: "User", required: true, unique: true },
    passwordHash: String,
    passwordSetAt: Date,
    passwordChangedAt: Date,
    failedAttempts: { type: Number, default: 0 },
    lockedUntil: Date,
    status,
    ...audit,
  }),
  UserProfile: createSchema({
    userId: { type: objectId, ref: "User", required: true, unique: true },
    identity: {
      firstName: String,
      lastName: String,
      displayName: String,
      birthDate: Date,
      gender: String,
      avatar: mixed,
    },
    contact: { type: mixed, default: () => ({}) },
    preferences: { type: mixed, default: () => ({}) },
    privacy: { type: mixed, default: () => ({}) },
    customData,
    status,
    ...audit,
  }),
  AthleteProfile: createSchema({
    userId: { type: objectId, ref: "User", required: true, unique: true },
    sports: [mixed],
    goals: [mixed],
    health: { type: mixed, default: () => ({}) },
    customData,
    status,
    ...audit,
  }),
  OtpChallenge: createSchema({
    mobile: { type: String, required: true, index: true },
    purpose: { type: String, required: true, index: true },
    codeHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    maxAttempts: Number,
    expiresAt: { type: Date, required: true },
    consumedAt: Date,
    delivery: mixed,
    client: mixed,
    status: { type: String, enum: OTP_STATUSES, default: "pending" },
  }),
  PasswordResetChallenge: createSchema({
    userId: { type: objectId, ref: "User", required: true },
    otpChallengeId: { type: objectId, ref: "OtpChallenge", required: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: Date,
    consumedAt: Date,
    status: { type: String, enum: OTP_STATUSES, default: "pending" },
  }),
  AuthSession: createSchema({
    userId: { type: objectId, ref: "User", required: true, index: true },
    refreshTokenHash: { type: String, required: true, unique: true },
    tokenFamilyId: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true },
    revokedAt: Date,
    revokeReason: String,
    client: mixed,
    status: { type: String, enum: SESSION_STATUSES, default: "active", index: true },
  }),
  Permission: createSchema({
    code: { type: String, required: true, unique: true },
    module: String,
    resource: String,
    action: String,
    riskLevel: String,
    status,
    ...audit,
  }),
  Role: createSchema({
    code: { type: String, required: true, unique: true },
    name: String,
    type: String,
    scopeType: String,
    system: Boolean,
    permissions: [{ code: String, effect: { type: String, default: "allow" } }],
    customData,
    status,
    ...audit,
  }),
  RoleAssignment: createSchema({
    userId: { type: objectId, ref: "User", required: true, index: true },
    roleId: { type: objectId, ref: "Role", required: true },
    scope: { type: { type: String, required: true }, id: objectId },
    expiresAt: Date,
    status,
    ...audit,
  }),
} as const;

accountModels.User.index({ "contact.mobile.value": 1 }, { unique: true });
accountModels.OtpChallenge.index({ expiresAt: 1 }, { expireAfterSeconds: 86_400 });
accountModels.PasswordResetChallenge.index({ expiresAt: 1 }, { expireAfterSeconds: 86_400 });
accountModels.RoleAssignment.index(
  { userId: 1, roleId: 1, "scope.type": 1, "scope.id": 1 },
  { unique: true },
);

import { Inject, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { hash, verify } from "@node-rs/argon2";
import type { AccessContext, AccessTokenClaims, TokenPair } from "../../common/contracts.js";
import { idOf, objectIdFrom, type DatabaseModels } from "../../database/index.js";
import { ApiError } from "../../common/api-error.js";
import { appConfig } from "../../config/app.config.js";
import { DATABASE_MODELS } from "../../database/database.constants.js";
import { randomOtp, randomToken, secureHash } from "./crypto.js";
import { createSmsProvider } from "./sms-provider.js";

export interface ClientInfo {
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
}

@Injectable()
export class AccountService {
  private readonly config = appConfig();
  private readonly sms = createSmsProvider(this.config);
  constructor(
    @Inject(DATABASE_MODELS) private readonly models: DatabaseModels,
    private readonly jwt: JwtService,
  ) {}

  normalizeMobile(value: string) {
    const mobile = value.replace(/[\s()-]/g, "");
    if (!/^\+?[1-9]\d{9,14}$/.test(mobile))
      throw new ApiError("INVALID_MOBILE", "شماره موبایل معتبر نیست.", 422);
    return mobile.startsWith("+") ? mobile : `+${mobile}`;
  }

  async requestOtp(input: { mobile: string; purpose: string }, client: ClientInfo) {
    const mobile = this.normalizeMobile(input.mobile);
    const code = randomOtp();
    const challenge = await this.models.OtpChallenge.create({
      mobile,
      purpose: input.purpose,
      codeHash: secureHash(code, this.config.JWT_ACCESS_SECRET),
      expiresAt: new Date(Date.now() + this.config.OTP_TTL_SECONDS * 1000),
      maxAttempts: this.config.OTP_MAX_ATTEMPTS,
      delivery: { provider: this.config.OTP_PROVIDER, status: "queued" },
      client,
      status: "pending",
    });
    try {
      const delivery = await this.sms.sendOtp({ receptor: mobile, token: code });
      await this.models.OtpChallenge.updateOne(
        { _id: challenge._id },
        {
          $set: {
            delivery: {
              provider: this.config.OTP_PROVIDER,
              messageId: delivery.messageId,
              status: "sent",
            },
          },
        },
      );
    } catch (error) {
      await this.models.OtpChallenge.updateOne(
        { _id: challenge._id },
        { $set: { status: "failed", consumedAt: new Date(), "delivery.status": "failed" } },
      );
      throw new ApiError("OTP_DELIVERY_FAILED", "ارسال کد تأیید موقتاً ممکن نیست.", 503);
    }
    return {
      challenge_id: idOf(challenge),
      expires_in: this.config.OTP_TTL_SECONDS,
      resend_after: 60,
    };
  }

  private async consumeOtp(input: { mobile: string; purpose: string; code: string }) {
    const mobile = this.normalizeMobile(input.mobile);
    const challenge = await this.models.OtpChallenge.findOne({
      mobile,
      purpose: input.purpose,
      consumedAt: null,
      expiresAt: { $gt: new Date() },
      status: "pending",
    }).sort({ createdAt: -1 });
    if (!challenge) throw new ApiError("OTP_INVALID_OR_EXPIRED", "کد نامعتبر یا منقضی است.", 422);
    const attempts = Number(challenge.get("attempts") ?? 0) + 1;
    if (challenge.get("codeHash") !== secureHash(input.code, this.config.JWT_ACCESS_SECRET)) {
      await challenge.updateOne({
        $set: {
          attempts,
          ...(attempts >= Number(challenge.get("maxAttempts"))
            ? { consumedAt: new Date(), status: "failed" }
            : {}),
        },
      });
      throw new ApiError("OTP_INVALID_OR_EXPIRED", "کد نامعتبر یا منقضی است.", 422);
    }
    await challenge.updateOne({ $set: { attempts, consumedAt: new Date(), status: "consumed" } });
    return { mobile, challengeId: idOf(challenge) };
  }

  private async ensureUser(mobile: string) {
    const existing = await this.models.User.findOne({ "contact.mobile.value": mobile });
    if (existing) {
      if (["blocked", "suspended"].includes(String(existing.get("status"))))
        throw new ApiError("ACCOUNT_UNAVAILABLE", "حساب کاربری در دسترس نیست.", 403);
      return existing;
    }
    const user = await this.models.User.create({
      contact: { mobile: { value: mobile, verifiedAt: new Date() } },
      status: "active",
    });
    await Promise.all([
      this.models.UserProfile.create({ userId: user._id, status: "active" }),
      this.models.AthleteProfile.create({ userId: user._id, status: "active" }),
    ]);
    const role = await this.models.Role.findOne({ code: "athlete", status: "active" });
    if (role)
      await this.models.RoleAssignment.create({
        userId: user._id,
        roleId: role._id,
        scope: { type: "self", id: user._id },
        status: "active",
      });
    return user;
  }

  private async createTokenPair(
    userId: string,
    client: ClientInfo,
    input: { familyId?: string; context?: AccessContext } = {},
  ): Promise<TokenPair> {
    const refreshToken = randomToken();
    const session = await this.models.AuthSession.create({
      userId: objectIdFrom(userId),
      refreshTokenHash: secureHash(refreshToken, this.config.JWT_ACCESS_SECRET),
      tokenFamilyId: input.familyId ?? crypto.randomUUID(),
      expiresAt: new Date(Date.now() + this.config.REFRESH_TOKEN_TTL_DAYS * 86_400_000),
      client,
      status: "active",
    });
    const claims: AccessTokenClaims = {
      sub: userId,
      session_id: idOf(session),
      token_type: "access",
      context: input.context ?? { persona: "athlete", scope: { type: "self", id: userId } },
    };
    return {
      access_token: await this.jwt.signAsync(claims),
      refresh_token: refreshToken,
      token_type: "Bearer",
      expires_in: this.config.ACCESS_TOKEN_TTL_SECONDS,
    };
  }

  async verifyOtp(input: { mobile: string; purpose: string; code: string }, client: ClientInfo) {
    const { mobile } = await this.consumeOtp(input);
    const user = await this.ensureUser(mobile);
    await user.updateOne({
      $set: { "contact.mobile.verifiedAt": new Date(), lastLoginAt: new Date() },
    });
    return { user_id: idOf(user), tokens: await this.createTokenPair(idOf(user), client) };
  }

  async passwordLogin(input: { mobile: string; password: string }, client: ClientInfo) {
    const user = await this.models.User.findOne({
      "contact.mobile.value": this.normalizeMobile(input.mobile),
    });
    const credential = user ? await this.models.UserCredential.findOne({ userId: user._id }) : null;
    const passwordHash = credential?.get("passwordHash");
    if (!user || typeof passwordHash !== "string" || !(await verify(passwordHash, input.password)))
      throw new ApiError("INVALID_CREDENTIALS", "شماره موبایل یا رمز عبور نادرست است.", 401);
    if (user.get("status") !== "active")
      throw new ApiError("ACCOUNT_UNAVAILABLE", "حساب کاربری در دسترس نیست.", 403);
    await user.updateOne({ $set: { lastLoginAt: new Date() } });
    return { user_id: idOf(user), tokens: await this.createTokenPair(idOf(user), client) };
  }

  async refresh(refreshToken: string, client: ClientInfo) {
    const session = await this.models.AuthSession.findOne({
      refreshTokenHash: secureHash(refreshToken, this.config.JWT_ACCESS_SECRET),
    });
    if (!session) throw new ApiError("INVALID_REFRESH_TOKEN", "نشست معتبر نیست.", 401);
    const familyId = String(session.get("tokenFamilyId"));
    if (session.get("status") !== "active" || session.get("revokedAt")) {
      await this.models.AuthSession.updateMany(
        { tokenFamilyId: familyId },
        { $set: { status: "revoked", revokedAt: new Date(), revokeReason: "token_reuse" } },
      );
      throw new ApiError("REFRESH_TOKEN_REUSED", "برای امنیت، تمام نشست‌های مرتبط بسته شدند.", 401);
    }
    if ((session.get("expiresAt") as Date) <= new Date())
      throw new ApiError("REFRESH_TOKEN_EXPIRED", "نشست منقضی شده است.", 401);
    await session.updateOne({
      $set: { status: "rotated", revokedAt: new Date(), revokeReason: "rotated" },
    });
    return this.createTokenPair(String(session.get("userId")), client, { familyId });
  }

  async setPassword(userId: string, password: string) {
    const passwordHash = await hash(password);
    await this.models.UserCredential.updateOne(
      { userId: objectIdFrom(userId) },
      {
        $set: {
          passwordHash,
          passwordSetAt: new Date(),
          passwordChangedAt: new Date(),
          status: "active",
        },
      },
      { upsert: true },
    );
  }
  async changePassword(userId: string, current: string, next: string) {
    const credential = await this.models.UserCredential.findOne({ userId: objectIdFrom(userId) });
    const currentHash = credential?.get("passwordHash");
    if (typeof currentHash !== "string" || !(await verify(currentHash, current)))
      throw new ApiError("INVALID_CURRENT_PASSWORD", "رمز عبور فعلی نادرست است.", 422);
    await this.setPassword(userId, next);
  }
  async beginPasswordRecovery(mobile: string, client: ClientInfo) {
    await this.requestOtp({ mobile, purpose: "PASSWORD_RESET" }, client);
    return { accepted: true };
  }
  async verifyPasswordRecovery(input: { mobile: string; code: string }) {
    const { mobile, challengeId } = await this.consumeOtp({ ...input, purpose: "PASSWORD_RESET" });
    const user = await this.models.User.findOne({ "contact.mobile.value": mobile });
    const token = randomToken();
    if (user)
      await this.models.PasswordResetChallenge.create({
        userId: user._id,
        otpChallengeId: objectIdFrom(challengeId),
        tokenHash: secureHash(token, this.config.JWT_ACCESS_SECRET),
        expiresAt: new Date(Date.now() + 300_000),
        status: "pending",
      });
    return { reset_token: token, expires_in: 300 };
  }
  async resetPassword(token: string, password: string) {
    const challenge = await this.models.PasswordResetChallenge.findOne({
      tokenHash: secureHash(token, this.config.JWT_ACCESS_SECRET),
      consumedAt: null,
      expiresAt: { $gt: new Date() },
      status: "pending",
    });
    if (!challenge) throw new ApiError("RESET_TOKEN_INVALID", "توکن بازیابی معتبر نیست.", 422);
    const userId = String(challenge.get("userId"));
    await this.setPassword(userId, password);
    await challenge.updateOne({ $set: { consumedAt: new Date(), status: "consumed" } });
    await this.logoutAll(userId, "password_reset");
  }
  async logout(sessionId: string) {
    await this.models.AuthSession.updateOne(
      { _id: objectIdFrom(sessionId) },
      { $set: { status: "revoked", revokedAt: new Date(), revokeReason: "logout" } },
    );
  }
  async logoutAll(userId: string, reason = "logout_all") {
    await this.models.AuthSession.updateMany(
      { userId: objectIdFrom(userId), status: "active" },
      { $set: { status: "revoked", revokedAt: new Date(), revokeReason: reason } },
    );
  }

  async listSessions(userId: string, currentSessionId: string) {
    const sessions = await this.models.AuthSession.find({
      userId: objectIdFrom(userId),
      status: "active",
      expiresAt: { $gt: new Date() },
    })
      .select("client expiresAt createdAt status")
      .sort({ createdAt: -1 })
      .lean();
    return sessions.map((session: any) => ({
      id: String(session._id),
      client: session.client ?? {},
      created_at: session.createdAt,
      expires_at: session.expiresAt,
      status: session.status,
      current: String(session._id) === currentSessionId,
    }));
  }

  async revokeSession(userId: string, sessionId: string, currentSessionId: string) {
    const session = await this.models.AuthSession.findOneAndUpdate(
      { _id: objectIdFrom(sessionId), userId: objectIdFrom(userId), status: "active" },
      { $set: { status: "revoked", revokedAt: new Date(), revokeReason: "user_revoked" } },
      { returnDocument: "after" },
    ).lean();
    if (!session) throw new ApiError("SESSION_NOT_FOUND", "نشست فعال پیدا نشد.", 404);
    return { revoked: true, current: sessionId === currentSessionId };
  }

  async getProfile(userId: string) {
    const [user, profile, credential] = await Promise.all([
      this.models.User.findById(userId).lean(),
      this.models.UserProfile.findOne({ userId: objectIdFrom(userId) }).lean(),
      this.models.UserCredential.findOne({ userId: objectIdFrom(userId), status: "active" })
        .select("passwordSetAt")
        .lean(),
    ]);
    if (!user) throw new ApiError("USER_NOT_FOUND", "کاربر پیدا نشد.", 404);
    return {
      user,
      profile,
      security: { password_set: Boolean(credential?.passwordSetAt) },
    };
  }
  async updateProfile(userId: string, patch: Record<string, any>) {
    const set: Record<string, unknown> = {};
    const identityKeys: Record<string, string> = {
      first_name: "firstName",
      last_name: "lastName",
      display_name: "displayName",
      birth_date: "birthDate",
    };
    for (const section of [
      "identity",
      "contact",
      "preferences",
      "privacy",
      "custom_data",
    ] as const) {
      if (!patch[section]) continue;
      const target = section === "custom_data" ? "customData" : section;
      for (const [key, value] of Object.entries(patch[section]))
        set[`${target}.${section === "identity" ? (identityKeys[key] ?? key) : key}`] = value;
    }
    await this.models.UserProfile.updateOne(
      { userId: objectIdFrom(userId) },
      { $set: set },
      { upsert: true },
    );
    return this.getProfile(userId);
  }
  async listAccessContext(userId: string) {
    const assignments = (await this.models.RoleAssignment.find({
      userId: objectIdFrom(userId),
      status: "active",
    }).lean()) as any[];
    const roles = (await this.models.Role.find({
      _id: { $in: assignments.map((item) => item.roleId) },
      status: "active",
    }).lean()) as any[];
    return assignments.map((assignment) => {
      const role = roles.find((item) => String(item._id) === String(assignment.roleId));
      return {
        assignment_id: String(assignment._id),
        role_id: String(role?._id),
        role_code: role?.code,
        role_name: role?.name,
        scope_type: assignment.scope.type,
        scope_id: assignment.scope.id ? String(assignment.scope.id) : undefined,
        permissions: (role?.permissions ?? [])
          .filter((item: any) => item.effect === "allow")
          .map((item: any) => item.code),
      };
    });
  }
  async activateContext(
    userId: string,
    sessionId: string,
    input: { role_id: string; scope_type: string; scope_id?: string | undefined },
  ) {
    const assignment = await this.models.RoleAssignment.findOne({
      userId: objectIdFrom(userId),
      roleId: objectIdFrom(input.role_id),
      "scope.type": input.scope_type,
      ...(input.scope_id ? { "scope.id": objectIdFrom(input.scope_id) } : { "scope.id": null }),
      status: "active",
    });
    if (!assignment)
      throw new ApiError("ACCESS_CONTEXT_INVALID", "نقش یا محدوده انتخاب‌شده معتبر نیست.", 403);
    const role = await this.models.Role.findById(input.role_id);
    const roleCode = String(role?.get("code") ?? "");
    const context: AccessContext = {
      persona:
        roleCode === "athlete"
          ? "athlete"
          : roleCode === "coach"
            ? "coach"
            : roleCode.includes("admin")
              ? "admin"
              : "club_staff",
      role_id: input.role_id,
      scope: {
        type: input.scope_type as AccessContext["scope"]["type"],
        ...(input.scope_id ? { id: input.scope_id } : {}),
      },
    };
    const claims: AccessTokenClaims = {
      sub: userId,
      session_id: sessionId,
      token_type: "access",
      context,
    };
    return {
      access_token: await this.jwt.signAsync(claims),
      token_type: "Bearer",
      expires_in: this.config.ACCESS_TOKEN_TTL_SECONDS,
      context,
    };
  }
}

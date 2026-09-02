import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Ip,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import type { FastifyRequest } from "fastify";
import { z } from "zod";
import { success } from "../../common/response.js";
import { AuthGuard } from "../../security/auth.guard.js";
import type { AuthenticatedRequest } from "../../security/auth.types.js";
import { AccountService, type ClientInfo } from "./account.service.js";
import { OTP_PURPOSES } from "./enums/index.js";
import { SCOPE_TYPES } from "../../common/enums/index.js";

const mobile = z.string().min(10).max(20);
const password = z.string().min(8).max(128);
const purpose = z.enum(OTP_PURPOSES);

@ApiTags("Account")
@Controller("account")
export class AccountController {
  constructor(private readonly service: AccountService) {}
  private client(ip: string, agent?: string, deviceId?: string): ClientInfo {
    return {
      ipAddress: ip,
      ...(agent ? { userAgent: agent } : {}),
      ...(deviceId ? { deviceId } : {}),
    };
  }

  @Post("auth/otp/request")
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async requestOtp(
    @Req() req: FastifyRequest,
    @Body() raw: unknown,
    @Ip() ip: string,
    @Headers("user-agent") agent?: string,
    @Headers("x-device-id") deviceId?: string,
  ) {
    return success(
      req,
      await this.service.requestOtp(
        z.object({ mobile, purpose }).parse(raw),
        this.client(ip, agent, deviceId),
      ),
    );
  }
  @Post("auth/otp/verify")
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async verifyOtp(
    @Req() req: FastifyRequest,
    @Body() raw: unknown,
    @Ip() ip: string,
    @Headers("user-agent") agent?: string,
    @Headers("x-device-id") deviceId?: string,
  ) {
    return success(
      req,
      await this.service.verifyOtp(
        z.object({ mobile, purpose, code: z.string().length(6) }).parse(raw),
        this.client(ip, agent, deviceId),
      ),
    );
  }
  @Post("auth/password/login")
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async login(
    @Req() req: FastifyRequest,
    @Body() raw: unknown,
    @Ip() ip: string,
    @Headers("user-agent") agent?: string,
    @Headers("x-device-id") deviceId?: string,
  ) {
    return success(
      req,
      await this.service.passwordLogin(
        z.object({ mobile, password }).parse(raw),
        this.client(ip, agent, deviceId),
      ),
    );
  }
  @Post("auth/token/refresh")
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  async refresh(
    @Req() req: FastifyRequest,
    @Body() raw: unknown,
    @Ip() ip: string,
    @Headers("user-agent") agent?: string,
    @Headers("x-device-id") deviceId?: string,
  ) {
    const body = z.object({ refresh_token: z.string().min(32) }).parse(raw);
    return success(
      req,
      await this.service.refresh(body.refresh_token, this.client(ip, agent, deviceId)),
    );
  }
  @Post("auth/password/recovery/request")
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async recoveryRequest(@Req() req: FastifyRequest, @Body() raw: unknown, @Ip() ip: string) {
    const body = z.object({ mobile }).parse(raw);
    return success(req, await this.service.beginPasswordRecovery(body.mobile, this.client(ip)));
  }
  @Post("auth/password/recovery/verify")
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async recoveryVerify(@Req() req: FastifyRequest, @Body() raw: unknown) {
    return success(
      req,
      await this.service.verifyPasswordRecovery(
        z.object({ mobile, code: z.string().length(6) }).parse(raw),
      ),
    );
  }
  @Post("auth/password/recovery/reset")
  async recoveryReset(@Req() req: FastifyRequest, @Body() raw: unknown) {
    const body = z.object({ reset_token: z.string().min(32), new_password: password }).parse(raw);
    await this.service.resetPassword(body.reset_token, body.new_password);
    return success(req, { reset: true });
  }

  @Post("auth/logout")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async logout(@Req() req: AuthenticatedRequest) {
    await this.service.logout(req.auth.session_id);
    return success(req, { logged_out: true });
  }
  @Post("auth/logout-all")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async logoutAll(@Req() req: AuthenticatedRequest) {
    await this.service.logoutAll(req.auth.sub);
    return success(req, { logged_out: true });
  }
  @Get("security/sessions")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async sessions(@Req() req: AuthenticatedRequest) {
    return success(req, await this.service.listSessions(req.auth.sub, req.auth.session_id));
  }
  @Delete("security/sessions/:sessionId")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async revokeSession(@Req() req: AuthenticatedRequest, @Param("sessionId") sessionId: string) {
    return success(
      req,
      await this.service.revokeSession(req.auth.sub, sessionId, req.auth.session_id),
    );
  }
  @Post("security/password/set")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async setPassword(@Req() req: AuthenticatedRequest, @Body() raw: unknown) {
    const body = z.object({ new_password: password }).parse(raw);
    await this.service.setPassword(req.auth.sub, body.new_password);
    return success(req, { password_set: true });
  }
  @Post("security/password/change")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async changePassword(@Req() req: AuthenticatedRequest, @Body() raw: unknown) {
    const body = z.object({ current_password: z.string(), new_password: password }).parse(raw);
    await this.service.changePassword(req.auth.sub, body.current_password, body.new_password);
    return success(req, { password_changed: true });
  }
  @Get("profile/me")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async profile(@Req() req: AuthenticatedRequest) {
    return success(req, await this.service.getProfile(req.auth.sub));
  }
  @Patch("profile/me")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async updateProfile(@Req() req: AuthenticatedRequest, @Body() raw: unknown) {
    const section = z.record(z.string(), z.unknown()).optional();
    return success(
      req,
      await this.service.updateProfile(
        req.auth.sub,
        z
          .object({
            identity: section,
            contact: section,
            preferences: section,
            privacy: section,
            custom_data: section,
          })
          .parse(raw),
      ),
    );
  }
  @Get("access-context")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async contexts(@Req() req: AuthenticatedRequest) {
    return success(req, {
      assignments: await this.service.listAccessContext(req.auth.sub),
      active_context: req.auth.context ?? null,
    });
  }
  @Post("access-context/activate")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async activate(@Req() req: AuthenticatedRequest, @Body() raw: unknown) {
    const body = z
      .object({
        role_id: z.string().length(24),
        scope_type: z.enum(SCOPE_TYPES),
        scope_id: z.string().length(24).optional(),
      })
      .parse(raw);
    return success(
      req,
      await this.service.activateContext(req.auth.sub, req.auth.session_id, body),
    );
  }
}

import { CanActivate, ExecutionContext, Inject, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { AccessTokenClaims } from "../common/contracts.js";
import type { DatabaseModels } from "../database/index.js";
import type { FastifyRequest } from "fastify";
import { ApiError } from "../common/api-error.js";
import { DATABASE_MODELS } from "../database/database.constants.js";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(JwtService) private readonly jwt: JwtService,
    @Inject(DATABASE_MODELS) private readonly models: DatabaseModels,
  ) {}
  async canActivate(context: ExecutionContext) {
    const request = context
      .switchToHttp()
      .getRequest<FastifyRequest & { auth?: AccessTokenClaims }>();
    const header = request.headers.authorization;
    if (!header?.startsWith("Bearer "))
      throw new ApiError("UNAUTHENTICATED", "برای ادامه وارد حساب شوید.", 401);
    try {
      const claims = await this.jwt.verifyAsync<AccessTokenClaims>(header.slice(7));
      const session = await this.models.AuthSession.exists({
        _id: claims.session_id,
        userId: claims.sub,
        status: "active",
        revokedAt: null,
      });
      if (!session) throw new ApiError("SESSION_REVOKED", "نشست معتبر نیست.", 401);
      request.auth = claims;
      return true;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError("UNAUTHENTICATED", "برای ادامه وارد حساب شوید.", 401);
    }
  }
}

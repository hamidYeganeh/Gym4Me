import type { AccessTokenClaims } from "../common/contracts.js";
import type { FastifyRequest } from "fastify";
export type AuthenticatedRequest = FastifyRequest & { auth: AccessTokenClaims };

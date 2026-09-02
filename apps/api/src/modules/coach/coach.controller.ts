import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import type { FastifyRequest } from "fastify";
import { PERMISSIONS } from "../../security/rbac.js";
import { paginated, success } from "../../common/response.js";
import { AuthGuard } from "../../security/auth.guard.js";
import type { AuthenticatedRequest } from "../../security/auth.types.js";
import { PermissionGuard } from "../../security/permission.guard.js";
import { RequirePermission } from "../../security/permission.decorator.js";
import { CoachService } from "./coach.service.js";
import { CoachingService } from "./coaching.service.js";
import {
  coachingMessageSchema,
  coachingPatchSchema,
  coachingRequestSchema,
  coachingStatusSchema,
  coachPatchSchema,
  coachOfferingSchema,
  coachSearchSchema,
  coachVerificationSchema,
  objectId,
} from "./schemas/coach.schemas.js";

@ApiTags("Coaching Relationships")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("coaching")
export class CoachingController {
  constructor(private readonly service: CoachingService) {}
  @Get("me") async mine(@Req() req: AuthenticatedRequest) {
    return success(req, await this.service.mine(req.auth.sub));
  }
  @Post("relationships") async request(@Req() req: AuthenticatedRequest, @Body() raw: unknown) {
    return success(
      req,
      await this.service.request(req.auth.sub, coachingRequestSchema.parse(raw), req.id),
    );
  }
  @Patch("relationships/:relationshipId/status") async status(
    @Req() req: AuthenticatedRequest,
    @Param("relationshipId") id: string,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.service.status(
        req.auth.sub,
        objectId.parse(id),
        coachingStatusSchema.parse(raw),
        req.id,
      ),
    );
  }
  @Patch("relationships/:relationshipId") async patch(
    @Req() req: AuthenticatedRequest,
    @Param("relationshipId") id: string,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.service.patch(req.auth.sub, objectId.parse(id), coachingPatchSchema.parse(raw)),
    );
  }
  @Get("relationships/:relationshipId/messages") async messages(
    @Req() req: AuthenticatedRequest,
    @Param("relationshipId") id: string,
  ) {
    return success(req, await this.service.messages(req.auth.sub, objectId.parse(id)));
  }
  @Post("relationships/:relationshipId/messages") async send(
    @Req() req: AuthenticatedRequest,
    @Param("relationshipId") id: string,
    @Body() raw: unknown,
  ) {
    const body = coachingMessageSchema.parse(raw);
    return success(req, await this.service.send(req.auth.sub, objectId.parse(id), body.text));
  }
}

@ApiTags("Coach Directory")
@Controller("catalog/coaches")
export class CoachCatalogController {
  constructor(private readonly service: CoachService) {}
  @Get() async list(@Req() req: FastifyRequest, @Query() raw: unknown) {
    const q = coachSearchSchema.parse(raw);
    const r = await this.service.list(q);
    return paginated(req, r.items, { page: q.page, limit: q.limit, total: r.total });
  }
  @Get(":coachId") async detail(@Req() req: FastifyRequest, @Param("coachId") id: string) {
    return success(req, await this.service.publicDetail(objectId.parse(id)));
  }
}
@ApiTags("Coach")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("coaches")
export class CoachSelfController {
  constructor(private readonly service: CoachService) {}
  @Get("me") async me(@Req() req: AuthenticatedRequest) {
    return success(req, await this.service.me(req.auth.sub));
  }
  @Patch("me") async update(@Req() req: AuthenticatedRequest, @Body() raw: unknown) {
    return success(
      req,
      await this.service.update(req.auth.sub, coachPatchSchema.parse(raw), req.id),
    );
  }
  @Post("me/submit") async submit(@Req() req: AuthenticatedRequest) {
    return success(req, await this.service.submit(req.auth.sub, req.id));
  }
  @Get("me/offerings") async offerings(@Req() req: AuthenticatedRequest) {
    return success(req, await this.service.myOfferings(req.auth.sub));
  }
  @Get("me/settlements") async settlements(@Req() req: AuthenticatedRequest) {
    return success(req, await this.service.mySettlements(req.auth.sub));
  }
  @Post("me/offerings") async createOffering(
    @Req() req: AuthenticatedRequest,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.service.createOffering(req.auth.sub, coachOfferingSchema.parse(raw), req.id),
    );
  }
}
@ApiTags("Admin / Coaches")
@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionGuard)
@Controller("admin/coaches")
export class AdminCoachController {
  constructor(private readonly service: CoachService) {}
  @Get() @RequirePermission(PERMISSIONS.ADMIN_USERS_MANAGE) async list(
    @Req() req: AuthenticatedRequest,
    @Query() raw: unknown,
  ) {
    const q = coachSearchSchema.parse(raw);
    const r = await this.service.list(q, true);
    return paginated(req, r.items, { page: q.page, limit: q.limit, total: r.total });
  }
  @Patch(":coachId/verification")
  @RequirePermission(PERMISSIONS.ADMIN_VERIFICATIONS_MANAGE)
  async verify(
    @Req() req: AuthenticatedRequest,
    @Param("coachId") id: string,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.service.verify(
        req.auth.sub,
        objectId.parse(id),
        coachVerificationSchema.parse(raw),
        req.id,
      ),
    );
  }
}

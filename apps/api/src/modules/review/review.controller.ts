import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "../../security/rbac.js";
import type { FastifyRequest } from "fastify";
import { paginated, success } from "../../common/response.js";
import { AuthGuard } from "../../security/auth.guard.js";
import type { AuthenticatedRequest } from "../../security/auth.types.js";
import { PermissionGuard } from "../../security/permission.guard.js";
import { RequirePermission } from "../../security/permission.decorator.js";
import { ReviewService } from "./review.service.js";
import {
  objectId,
  reviewCreateSchema,
  reviewModerationSchema,
  reviewPatchSchema,
  reviewQuerySchema,
  reviewReplySchema,
  reviewReportSchema,
} from "./schemas/review.schemas.js";

@ApiTags("Review Catalog")
@Controller("catalog/reviews")
export class ReviewCatalogController {
  constructor(private readonly service: ReviewService) {}
  @Get() async list(@Req() req: FastifyRequest, @Query() raw: unknown) {
    const query = reviewQuerySchema.parse(raw);
    if (!query.subject_id || !query.subject_type)
      return paginated(req, [], { page: query.page, limit: query.limit, total: 0 });
    const result = await this.service.publicList(query);
    return {
      ...paginated(req, result.items, {
        page: query.page,
        limit: query.limit,
        total: result.total,
      }),
      summary: result.summary,
    };
  }
}

@ApiTags("Reviews")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("reviews")
export class ReviewController {
  constructor(private readonly service: ReviewService) {}
  @Get("me") async mine(@Req() req: AuthenticatedRequest) {
    return success(req, await this.service.mine(req.auth.sub));
  }
  @Post() async create(@Req() req: AuthenticatedRequest, @Body() raw: unknown) {
    return success(
      req,
      await this.service.create(req.auth.sub, reviewCreateSchema.parse(raw), req.id),
    );
  }
  @Patch(":reviewId") async update(
    @Req() req: AuthenticatedRequest,
    @Param("reviewId") id: string,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.service.update(
        req.auth.sub,
        objectId.parse(id),
        reviewPatchSchema.parse(raw),
        req.id,
      ),
    );
  }
  @Post(":reviewId/reports") async report(
    @Req() req: AuthenticatedRequest,
    @Param("reviewId") id: string,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.service.report(req.auth.sub, objectId.parse(id), reviewReportSchema.parse(raw)),
    );
  }
}

@ApiTags("Organization Reviews")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("organizations/:organizationId/reviews")
export class OrganizationReviewController {
  constructor(private readonly service: ReviewService) {}
  @Get() async list(
    @Req() req: AuthenticatedRequest,
    @Param("organizationId") id: string,
    @Query() raw: unknown,
  ) {
    const query = reviewQuerySchema.parse(raw),
      result = await this.service.organizationList(req.auth.sub, objectId.parse(id), query);
    return paginated(req, result.items, {
      page: query.page,
      limit: query.limit,
      total: result.total,
    });
  }
  @Post(":reviewId/reply") async reply(
    @Req() req: AuthenticatedRequest,
    @Param("organizationId") organizationId: string,
    @Param("reviewId") reviewId: string,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.service.reply(
        req.auth.sub,
        objectId.parse(organizationId),
        objectId.parse(reviewId),
        reviewReplySchema.parse(raw),
        req.id,
      ),
    );
  }
}

@ApiTags("Admin / Reviews")
@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionGuard)
@Controller("admin/reviews")
export class AdminReviewController {
  constructor(private readonly service: ReviewService) {}
  @Get() @RequirePermission(PERMISSIONS.ADMIN_REVIEWS_MODERATE) async list(
    @Req() req: AuthenticatedRequest,
    @Query() raw: unknown,
  ) {
    const query = reviewQuerySchema.parse(raw),
      result = await this.service.adminList(query);
    return paginated(req, result.items, {
      page: query.page,
      limit: query.limit,
      total: result.total,
    });
  }
  @Post(":reviewId/moderation")
  @RequirePermission(PERMISSIONS.ADMIN_REVIEWS_MODERATE)
  async moderate(
    @Req() req: AuthenticatedRequest,
    @Param("reviewId") id: string,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.service.moderate(
        req.auth.sub,
        objectId.parse(id),
        reviewModerationSchema.parse(raw),
        req.id,
      ),
    );
  }
}

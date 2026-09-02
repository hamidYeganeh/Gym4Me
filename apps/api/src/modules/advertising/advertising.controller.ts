import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "../../security/rbac.js";
import type { FastifyRequest } from "fastify";
import { paginated, success } from "../../common/response.js";
import { AuthGuard } from "../../security/auth.guard.js";
import type { AuthenticatedRequest } from "../../security/auth.types.js";
import { PermissionGuard } from "../../security/permission.guard.js";
import { RequirePermission } from "../../security/permission.decorator.js";
import { AdvertisingService } from "./advertising.service.js";
import {
  campaignActionSchema,
  campaignCreateSchema,
  campaignPatchSchema,
  campaignReviewSchema,
  catalogAdQuerySchema,
  metricEventSchema,
  objectId,
  pageSchema,
  placementSchema,
} from "./schemas/advertising.schemas.js";

@ApiTags("Advertising Catalog")
@Controller("catalog/advertising")
export class AdvertisingCatalogController {
  constructor(private readonly service: AdvertisingService) {}

  @Get("placements")
  async placements(@Req() req: FastifyRequest) {
    return success(req, await this.service.placements());
  }

  @Get("placements/:code/render")
  async render(@Req() req: FastifyRequest, @Param("code") code: string, @Query() raw: unknown) {
    return success(req, await this.service.serve(code, catalogAdQuerySchema.parse(raw)));
  }

  @Post("campaigns/:campaignId/events")
  async event(@Req() req: FastifyRequest, @Param("campaignId") id: string, @Body() raw: unknown) {
    return success(
      req,
      await this.service.metric(objectId.parse(id), metricEventSchema.parse(raw)),
    );
  }
}

@ApiTags("Organization Advertising")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("organizations/:organizationId/advertising")
export class OrganizationAdvertisingController {
  constructor(private readonly service: AdvertisingService) {}

  @Get("placements")
  async placements(@Req() req: AuthenticatedRequest) {
    return success(req, await this.service.placements());
  }

  @Get("campaigns")
  async list(
    @Req() req: AuthenticatedRequest,
    @Param("organizationId") organizationId: string,
    @Query() raw: unknown,
  ) {
    const query = pageSchema.parse(raw);
    const result = await this.service.campaigns(
      req.auth.sub,
      objectId.parse(organizationId),
      query,
    );
    return paginated(req, result.items, { ...query, total: result.total });
  }

  @Post("campaigns")
  async create(
    @Req() req: AuthenticatedRequest,
    @Param("organizationId") organizationId: string,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.service.createCampaign(
        req.auth.sub,
        objectId.parse(organizationId),
        campaignCreateSchema.parse(raw),
        req.id,
      ),
    );
  }

  @Patch("campaigns/:campaignId")
  async update(
    @Req() req: AuthenticatedRequest,
    @Param("organizationId") organizationId: string,
    @Param("campaignId") campaignId: string,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.service.updateCampaign(
        req.auth.sub,
        objectId.parse(organizationId),
        objectId.parse(campaignId),
        campaignPatchSchema.parse(raw),
        req.id,
      ),
    );
  }

  @Post("campaigns/:campaignId/actions")
  async action(
    @Req() req: AuthenticatedRequest,
    @Param("organizationId") organizationId: string,
    @Param("campaignId") campaignId: string,
    @Body() raw: unknown,
  ) {
    const input = campaignActionSchema.parse(raw);
    return success(
      req,
      await this.service.action(
        req.auth.sub,
        objectId.parse(organizationId),
        objectId.parse(campaignId),
        input.action,
        req.id,
      ),
    );
  }
}

@ApiTags("Admin / Advertising")
@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionGuard)
@Controller("admin/advertising")
export class AdminAdvertisingController {
  constructor(private readonly service: AdvertisingService) {}

  @Get("placements")
  @RequirePermission(PERMISSIONS.ADMIN_ADVERTISING_MANAGE)
  async placements(@Req() req: AuthenticatedRequest) {
    return success(req, await this.service.placements(true));
  }

  @Put("placements/:code")
  @RequirePermission(PERMISSIONS.ADMIN_ADVERTISING_MANAGE)
  async upsertPlacement(
    @Req() req: AuthenticatedRequest,
    @Param("code") code: string,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.service.upsertPlacement(
        req.auth.sub,
        placementSchema.parse({ ...(raw as object), code }),
        req.id,
      ),
    );
  }

  @Get("campaigns")
  @RequirePermission(PERMISSIONS.ADMIN_ADVERTISING_MANAGE)
  async campaigns(@Req() req: AuthenticatedRequest, @Query() raw: unknown) {
    const query = pageSchema.parse(raw);
    const result = await this.service.adminCampaigns(query);
    return paginated(req, result.items, { ...query, total: result.total });
  }

  @Post("campaigns/:campaignId/review")
  @RequirePermission(PERMISSIONS.ADMIN_ADVERTISING_MANAGE)
  async review(
    @Req() req: AuthenticatedRequest,
    @Param("campaignId") id: string,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.service.review(
        req.auth.sub,
        objectId.parse(id),
        campaignReviewSchema.parse(raw),
        req.id,
      ),
    );
  }
}

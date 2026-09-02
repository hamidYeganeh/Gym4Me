import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "../../security/rbac.js";
import type { FastifyRequest } from "fastify";
import { z } from "zod";
import { paginated, success } from "../../common/response.js";
import { AuthGuard } from "../../security/auth.guard.js";
import type { AuthenticatedRequest } from "../../security/auth.types.js";
import { RequirePermission } from "../../security/permission.decorator.js";
import { PermissionGuard } from "../../security/permission.guard.js";
import { MetaService, type ConfigurationResource } from "./meta.service.js";
import {
  configurationBodySchema,
  configurationQuerySchema,
  configurationResourceSchema,
  json,
  labels,
  sportTermCreateSchema,
  sportTermPatchSchema,
} from "./schemas/meta.schemas.js";
@ApiTags("Meta")
@Controller()
export class MetaController {
  constructor(private readonly service: MetaService) {}
  @Get("meta/entities/:entityType/schema") async schema(
    @Req() req: FastifyRequest,
    @Param("entityType") code: string,
  ) {
    return success(req, await this.service.entitySchema(code));
  }
  @Get("meta/forms/:formCode") async form(
    @Req() req: FastifyRequest,
    @Param("formCode") code: string,
  ) {
    return success(req, await this.service.form(code));
  }
  @Get("meta/taxonomies/:taxonomyCode/terms") async terms(
    @Req() req: FastifyRequest,
    @Param("taxonomyCode") code: string,
  ) {
    return success(req, await this.service.taxonomy(code));
  }
  @Get("sports/catalog") async sports(@Req() req: FastifyRequest) {
    return success(req, await this.service.sportCatalog());
  }

  @Get("admin/configuration/sports")
  @UseGuards(AuthGuard, PermissionGuard)
  @RequirePermission(PERMISSIONS.ADMIN_CONFIGURATION_MANAGE)
  @ApiBearerAuth()
  async adminSports(@Req() req: AuthenticatedRequest) {
    return success(req, await this.service.sportCatalog(true));
  }

  @Post("admin/configuration/sports")
  @UseGuards(AuthGuard, PermissionGuard)
  @RequirePermission(PERMISSIONS.ADMIN_CONFIGURATION_MANAGE)
  @ApiBearerAuth()
  async createSportTerm(@Req() req: AuthenticatedRequest, @Body() raw: unknown) {
    return success(
      req,
      await this.service.createSportTerm(sportTermCreateSchema.parse(raw), req.auth.sub),
    );
  }

  @Patch("admin/configuration/sports/:termId")
  @UseGuards(AuthGuard, PermissionGuard)
  @RequirePermission(PERMISSIONS.ADMIN_CONFIGURATION_MANAGE)
  @ApiBearerAuth()
  async updateSportTerm(
    @Req() req: AuthenticatedRequest,
    @Param("termId") termId: string,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.service.updateSportTerm(
        z.string().length(24).parse(termId),
        sportTermPatchSchema.parse(raw),
        req.auth.sub,
      ),
    );
  }

  @Delete("admin/configuration/sports/:termId")
  @UseGuards(AuthGuard, PermissionGuard)
  @RequirePermission(PERMISSIONS.ADMIN_CONFIGURATION_MANAGE)
  @ApiBearerAuth()
  async archiveSportTerm(@Req() req: AuthenticatedRequest, @Param("termId") termId: string) {
    return success(
      req,
      await this.service.archiveSportTerm(z.string().length(24).parse(termId), req.auth.sub),
    );
  }

  @Post("admin/configuration/entity-types")
  @UseGuards(AuthGuard, PermissionGuard)
  @RequirePermission(PERMISSIONS.ADMIN_CONFIGURATION_MANAGE)
  @ApiBearerAuth()
  async createEntity(@Req() req: AuthenticatedRequest, @Body() raw: unknown) {
    const body = z
      .object({
        code: z.string().min(2).max(100),
        module: z.string().min(2),
        storage_collection: z.string().min(2),
        labels,
        capabilities: json.optional(),
        settings: json.optional(),
      })
      .parse(raw);
    return success(
      req,
      await this.service.createConfiguration("entity-types", body, req.auth.sub, req.id),
    );
  }
  @Post("admin/configuration/field-groups")
  @UseGuards(AuthGuard, PermissionGuard)
  @RequirePermission(PERMISSIONS.ADMIN_CONFIGURATION_MANAGE)
  @ApiBearerAuth()
  async createGroup(@Req() req: AuthenticatedRequest, @Body() raw: unknown) {
    const body = z
      .object({
        entity_type_id: z.string().length(24),
        code: z.string().min(1),
        labels,
        descriptions: labels.optional(),
        layout_config: json.optional(),
        display_order: z.number().int().optional(),
      })
      .parse(raw);
    return success(
      req,
      await this.service.createConfiguration("field-groups", body, req.auth.sub, req.id),
    );
  }
  @Post("admin/configuration/field-definitions")
  @UseGuards(AuthGuard, PermissionGuard)
  @RequirePermission(PERMISSIONS.ADMIN_CONFIGURATION_MANAGE)
  @ApiBearerAuth()
  async createField(@Req() req: AuthenticatedRequest, @Body() raw: unknown) {
    const body = z
      .object({
        entity_type_id: z.string().length(24),
        field_group_id: z.string().length(24).optional(),
        key: z.string().regex(/^[a-z][a-z0-9_]*$/),
        labels,
        data_type: z.string(),
        required: z.boolean().optional(),
        default_value: z.unknown().optional(),
        validation_rules: json.optional(),
        visibility_rules: json.optional(),
        permission_rules: json.optional(),
        display_config: json.optional(),
        search_config: json.optional(),
        display_order: z.number().int().optional(),
      })
      .parse(raw);
    const normalized = {
      ...body,
      rules: {
        validation: body.validation_rules ?? {},
        visibility: body.visibility_rules ?? {},
        permission: body.permission_rules ?? {},
      },
      display: { config: body.display_config ?? {}, order: body.display_order ?? 0 },
      search: body.search_config ?? {},
    };
    for (const key of [
      "validation_rules",
      "visibility_rules",
      "permission_rules",
      "display_config",
      "display_order",
      "search_config",
    ])
      delete (normalized as Record<string, unknown>)[key];
    return success(
      req,
      await this.service.createConfiguration("field-definitions", normalized, req.auth.sub, req.id),
    );
  }

  @Get("admin/configuration/:resource")
  @UseGuards(AuthGuard, PermissionGuard)
  @RequirePermission(PERMISSIONS.ADMIN_CONFIGURATION_MANAGE)
  @ApiBearerAuth()
  async configurationList(
    @Req() req: AuthenticatedRequest,
    @Param("resource") rawResource: string,
    @Query() raw: unknown,
  ) {
    const resource = configurationResourceSchema.parse(rawResource) as ConfigurationResource;
    const query = configurationQuerySchema.parse(raw);
    const result = await this.service.configurationList(resource, query);
    return paginated(req, result.items, {
      page: query.page,
      limit: query.limit,
      total: result.total,
    });
  }

  @Post("admin/configuration/:resource")
  @UseGuards(AuthGuard, PermissionGuard)
  @RequirePermission(PERMISSIONS.ADMIN_CONFIGURATION_MANAGE)
  @ApiBearerAuth()
  async configurationCreate(
    @Req() req: AuthenticatedRequest,
    @Param("resource") rawResource: string,
    @Body() raw: unknown,
  ) {
    const resource = configurationResourceSchema.parse(rawResource) as ConfigurationResource;
    return success(
      req,
      await this.service.createConfiguration(
        resource,
        configurationBodySchema.parse(raw),
        req.auth.sub,
        req.id,
      ),
    );
  }

  @Patch("admin/configuration/:resource/:itemId")
  @UseGuards(AuthGuard, PermissionGuard)
  @RequirePermission(PERMISSIONS.ADMIN_CONFIGURATION_MANAGE)
  @ApiBearerAuth()
  async configurationUpdate(
    @Req() req: AuthenticatedRequest,
    @Param("resource") rawResource: string,
    @Param("itemId") rawId: string,
    @Body() raw: unknown,
  ) {
    const resource = configurationResourceSchema.parse(rawResource) as ConfigurationResource;
    return success(
      req,
      await this.service.updateConfiguration(
        resource,
        z.string().length(24).parse(rawId),
        configurationBodySchema.parse(raw),
        req.auth.sub,
        req.id,
      ),
    );
  }

  @Delete("admin/configuration/:resource/:itemId")
  @UseGuards(AuthGuard, PermissionGuard)
  @RequirePermission(PERMISSIONS.ADMIN_CONFIGURATION_MANAGE)
  @ApiBearerAuth()
  async configurationArchive(
    @Req() req: AuthenticatedRequest,
    @Param("resource") rawResource: string,
    @Param("itemId") rawId: string,
  ) {
    const resource = configurationResourceSchema.parse(rawResource) as ConfigurationResource;
    return success(
      req,
      await this.service.archiveConfiguration(
        resource,
        z.string().length(24).parse(rawId),
        req.auth.sub,
        req.id,
      ),
    );
  }
}

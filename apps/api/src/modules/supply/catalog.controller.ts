import { Controller, Get, Param, Query, Req } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { FastifyRequest } from "fastify";
import { paginated, success } from "../../common/response.js";
import { AvailabilityService } from "./availability.service.js";
import { CatalogService } from "./catalog.service.js";
import {
  catalogBranchSearchSchema,
  catalogListSchema,
  objectId,
  slotQuerySchema,
} from "./schemas/supply.schemas.js";

@ApiTags("Public Catalog")
@Controller("catalog")
export class CatalogController {
  constructor(
    private readonly catalog: CatalogService,
    private readonly availability: AvailabilityService,
  ) {}
  @Get("branches") async branches(@Req() req: FastifyRequest, @Query() raw: unknown) {
    const query = catalogBranchSearchSchema.parse(raw);
    const result = await this.catalog.branches(query);
    return paginated(req, result.items, {
      page: query.page,
      limit: query.limit,
      total: result.total,
    });
  }
  @Get("branches/:branchId") async branch(
    @Req() req: FastifyRequest,
    @Param("branchId") id: string,
  ) {
    return success(req, await this.catalog.branch(objectId.parse(id)));
  }
  @Get("branches/:branchId/resources") async resources(
    @Req() req: FastifyRequest,
    @Param("branchId") id: string,
    @Query() raw: unknown,
  ) {
    const query = catalogListSchema.parse(raw);
    const result = await this.catalog.resources(objectId.parse(id), query);
    return paginated(req, result.items, {
      page: query.page,
      limit: query.limit,
      total: result.total,
    });
  }
  @Get("branches/:branchId/offerings") async offerings(
    @Req() req: FastifyRequest,
    @Param("branchId") id: string,
    @Query() raw: unknown,
  ) {
    const query = catalogListSchema.parse(raw);
    const result = await this.catalog.offerings(objectId.parse(id), query);
    return paginated(req, result.items, {
      page: query.page,
      limit: query.limit,
      total: result.total,
    });
  }
  @Get("resources/:resourceId/availability/slots") async slots(
    @Req() req: FastifyRequest,
    @Param("resourceId") id: string,
    @Query() raw: unknown,
  ) {
    return success(
      req,
      await this.availability.slots(objectId.parse(id), slotQuerySchema.parse(raw)),
    );
  }
}

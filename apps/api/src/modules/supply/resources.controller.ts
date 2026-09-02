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
import { paginationSchema } from "../../common/query.js";
import { paginated, success } from "../../common/response.js";
import { AuthGuard } from "../../security/auth.guard.js";
import type { AuthenticatedRequest } from "../../security/auth.types.js";
import { objectId, resourceCreateSchema, resourcePatchSchema } from "./schemas/supply.schemas.js";
import { ResourceService } from "./resource.service.js";

@ApiTags("Resources")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller()
export class ResourcesController {
  constructor(private readonly service: ResourceService) {}
  @Post("branches/:branchId/resources") async create(
    @Req() req: AuthenticatedRequest,
    @Param("branchId") id: string,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.service.create(
        req.auth.sub,
        objectId.parse(id),
        resourceCreateSchema.parse(raw),
        req.id,
      ),
    );
  }
  @Get("branches/:branchId/resources") async list(
    @Req() req: AuthenticatedRequest,
    @Param("branchId") id: string,
    @Query() raw: unknown,
  ) {
    const query = paginationSchema.parse(raw);
    const result = await this.service.list(req.auth.sub, objectId.parse(id), query);
    return paginated(req, result.items, { ...query, total: result.total });
  }
  @Get("resources/:resourceId") async get(
    @Req() req: AuthenticatedRequest,
    @Param("resourceId") id: string,
  ) {
    return success(req, await this.service.get(req.auth.sub, objectId.parse(id)));
  }
  @Patch("resources/:resourceId") async update(
    @Req() req: AuthenticatedRequest,
    @Param("resourceId") id: string,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.service.update(
        req.auth.sub,
        objectId.parse(id),
        resourcePatchSchema.parse(raw),
        req.id,
      ),
    );
  }
  @Delete("resources/:resourceId") async archive(
    @Req() req: AuthenticatedRequest,
    @Param("resourceId") id: string,
  ) {
    return success(req, await this.service.archive(req.auth.sub, objectId.parse(id), req.id));
  }
}

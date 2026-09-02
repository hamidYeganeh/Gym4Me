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
import { paginated, success } from "../../common/response.js";
import { paginationSchema } from "../../common/query.js";
import { AuthGuard } from "../../security/auth.guard.js";
import type { AuthenticatedRequest } from "../../security/auth.types.js";
import {
  organizationCreateSchema,
  organizationPatchSchema,
  objectId,
} from "./schemas/organization.schemas.js";
import { OrganizationsService } from "./organizations.service.js";

@ApiTags("Organizations")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("organizations")
export class OrganizationsController {
  constructor(private readonly service: OrganizationsService) {}
  @Post() async create(@Req() req: AuthenticatedRequest, @Body() raw: unknown) {
    return success(
      req,
      await this.service.create(req.auth.sub, organizationCreateSchema.parse(raw), req.id),
    );
  }
  @Get() async list(@Req() req: AuthenticatedRequest, @Query() raw: unknown) {
    const query = paginationSchema.parse(raw);
    const result = await this.service.list(req.auth.sub, query);
    return paginated(req, result.items, { ...query, total: result.total });
  }
  @Get(":organizationId") async get(
    @Req() req: AuthenticatedRequest,
    @Param("organizationId") rawId: string,
  ) {
    return success(req, await this.service.get(req.auth.sub, objectId.parse(rawId)));
  }
  @Patch(":organizationId") async update(
    @Req() req: AuthenticatedRequest,
    @Param("organizationId") rawId: string,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.service.update(
        req.auth.sub,
        objectId.parse(rawId),
        organizationPatchSchema.parse(raw),
        req.id,
      ),
    );
  }
  @Post(":organizationId/submit") async submit(
    @Req() req: AuthenticatedRequest,
    @Param("organizationId") rawId: string,
  ) {
    return success(req, await this.service.submit(req.auth.sub, objectId.parse(rawId), req.id));
  }
  @Delete(":organizationId") async archive(
    @Req() req: AuthenticatedRequest,
    @Param("organizationId") rawId: string,
  ) {
    return success(req, await this.service.archive(req.auth.sub, objectId.parse(rawId), req.id));
  }
}

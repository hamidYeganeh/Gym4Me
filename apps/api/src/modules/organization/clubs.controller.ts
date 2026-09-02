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
import { clubCreateSchema, clubPatchSchema, objectId } from "./schemas/organization.schemas.js";
import { ClubsService } from "./clubs.service.js";

@ApiTags("Clubs")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller()
export class ClubsController {
  constructor(private readonly service: ClubsService) {}
  @Post("clubs") async create(@Req() req: AuthenticatedRequest, @Body() raw: unknown) {
    return success(
      req,
      await this.service.create(req.auth.sub, clubCreateSchema.parse(raw), req.id),
    );
  }
  @Get("organizations/:organizationId/clubs") async list(
    @Req() req: AuthenticatedRequest,
    @Param("organizationId") rawId: string,
    @Query() raw: unknown,
  ) {
    const id = objectId.parse(rawId);
    const query = paginationSchema.parse(raw);
    const result = await this.service.list(req.auth.sub, id, query);
    return paginated(req, result.items, { ...query, total: result.total });
  }
  @Get("clubs/:clubId") async get(
    @Req() req: AuthenticatedRequest,
    @Param("clubId") rawId: string,
  ) {
    return success(req, await this.service.getManaged(req.auth.sub, objectId.parse(rawId)));
  }
  @Patch("clubs/:clubId") async update(
    @Req() req: AuthenticatedRequest,
    @Param("clubId") rawId: string,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.service.update(
        req.auth.sub,
        objectId.parse(rawId),
        clubPatchSchema.parse(raw),
        req.id,
      ),
    );
  }
  @Post("clubs/:clubId/submit") async submit(
    @Req() req: AuthenticatedRequest,
    @Param("clubId") rawId: string,
  ) {
    return success(req, await this.service.submit(req.auth.sub, objectId.parse(rawId), req.id));
  }
  @Delete("clubs/:clubId") async archive(
    @Req() req: AuthenticatedRequest,
    @Param("clubId") rawId: string,
  ) {
    return success(req, await this.service.archive(req.auth.sub, objectId.parse(rawId), req.id));
  }
}

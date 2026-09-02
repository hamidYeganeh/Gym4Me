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
import { OfferingService } from "./offering.service.js";
import { objectId, offeringCreateSchema, offeringPatchSchema } from "./schemas/supply.schemas.js";

@ApiTags("Offerings")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller()
export class OfferingsController {
  constructor(private readonly service: OfferingService) {}
  @Post("organizations/:organizationId/offerings") async create(
    @Req() req: AuthenticatedRequest,
    @Param("organizationId") id: string,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.service.create(
        req.auth.sub,
        objectId.parse(id),
        offeringCreateSchema.parse(raw),
        req.id,
      ),
    );
  }
  @Get("branches/:branchId/offerings") async list(
    @Req() req: AuthenticatedRequest,
    @Param("branchId") id: string,
    @Query() raw: unknown,
  ) {
    const query = paginationSchema.parse(raw);
    const result = await this.service.listByBranch(req.auth.sub, objectId.parse(id), query);
    return paginated(req, result.items, { ...query, total: result.total });
  }
  @Get("offerings/:offeringId") async get(
    @Req() req: AuthenticatedRequest,
    @Param("offeringId") id: string,
  ) {
    return success(req, await this.service.get(req.auth.sub, objectId.parse(id)));
  }
  @Patch("offerings/:offeringId") async update(
    @Req() req: AuthenticatedRequest,
    @Param("offeringId") id: string,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.service.update(
        req.auth.sub,
        objectId.parse(id),
        offeringPatchSchema.parse(raw),
        req.id,
      ),
    );
  }
  @Delete("offerings/:offeringId") async archive(
    @Req() req: AuthenticatedRequest,
    @Param("offeringId") id: string,
  ) {
    return success(req, await this.service.archive(req.auth.sub, objectId.parse(id), req.id));
  }
}

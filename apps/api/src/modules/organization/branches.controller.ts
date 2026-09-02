import {
  Body,
  Controller,
  Delete,
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
import { paginationSchema } from "../../common/query.js";
import { paginated, success } from "../../common/response.js";
import { AuthGuard } from "../../security/auth.guard.js";
import type { AuthenticatedRequest } from "../../security/auth.types.js";
import {
  branchCreateSchema,
  branchPatchSchema,
  holidaySchema,
  objectId,
  workingHoursSchema,
} from "./schemas/organization.schemas.js";
import { BranchesService } from "./branches.service.js";

@ApiTags("Branches")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller()
export class BranchesController {
  constructor(private readonly service: BranchesService) {}
  @Post("clubs/:clubId/branches") async create(
    @Req() req: AuthenticatedRequest,
    @Param("clubId") rawId: string,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.service.create(
        req.auth.sub,
        objectId.parse(rawId),
        branchCreateSchema.parse(raw),
        req.id,
      ),
    );
  }
  @Get("clubs/:clubId/branches") async list(
    @Req() req: AuthenticatedRequest,
    @Param("clubId") rawId: string,
    @Query() raw: unknown,
  ) {
    const query = paginationSchema.parse(raw);
    const result = await this.service.list(req.auth.sub, objectId.parse(rawId), query);
    return paginated(req, result.items, { ...query, total: result.total });
  }
  @Get("branches/:branchId") async get(
    @Req() req: AuthenticatedRequest,
    @Param("branchId") rawId: string,
  ) {
    return success(req, await this.service.get(req.auth.sub, objectId.parse(rawId)));
  }
  @Patch("branches/:branchId") async update(
    @Req() req: AuthenticatedRequest,
    @Param("branchId") rawId: string,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.service.update(
        req.auth.sub,
        objectId.parse(rawId),
        branchPatchSchema.parse(raw),
        req.id,
      ),
    );
  }
  @Put("branches/:branchId/working-hours") async hours(
    @Req() req: AuthenticatedRequest,
    @Param("branchId") rawId: string,
    @Body() raw: unknown,
  ) {
    const body = workingHoursSchema.parse(raw);
    return success(
      req,
      await this.service.setWorkingHours(req.auth.sub, objectId.parse(rawId), body.days, req.id),
    );
  }
  @Post("branches/:branchId/holidays") async holiday(
    @Req() req: AuthenticatedRequest,
    @Param("branchId") rawId: string,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.service.addHoliday(
        req.auth.sub,
        objectId.parse(rawId),
        holidaySchema.parse(raw),
        req.id,
      ),
    );
  }
  @Delete("branches/:branchId/holidays/:holidayId") async removeHoliday(
    @Req() req: AuthenticatedRequest,
    @Param("branchId") rawId: string,
    @Param("holidayId") holidayId: string,
  ) {
    return success(
      req,
      await this.service.removeHoliday(req.auth.sub, objectId.parse(rawId), holidayId, req.id),
    );
  }
  @Delete("branches/:branchId") async archive(
    @Req() req: AuthenticatedRequest,
    @Param("branchId") rawId: string,
  ) {
    return success(req, await this.service.archive(req.auth.sub, objectId.parse(rawId), req.id));
  }
}

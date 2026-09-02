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
import { success } from "../../common/response.js";
import { AuthGuard } from "../../security/auth.guard.js";
import type { AuthenticatedRequest } from "../../security/auth.types.js";
import { AvailabilityService } from "./availability.service.js";
import {
  availabilityExceptionPatchSchema,
  availabilityExceptionSchema,
  availabilityRulePatchSchema,
  availabilityRuleSchema,
  objectId,
  slotQuerySchema,
} from "./schemas/supply.schemas.js";

@ApiTags("Availability")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller()
export class AvailabilityController {
  constructor(private readonly service: AvailabilityService) {}
  @Get("resources/:resourceId/availability/rules") async rules(
    @Req() req: AuthenticatedRequest,
    @Param("resourceId") id: string,
  ) {
    return success(req, await this.service.rules(req.auth.sub, objectId.parse(id)));
  }
  @Post("resources/:resourceId/availability/rules") async createRule(
    @Req() req: AuthenticatedRequest,
    @Param("resourceId") id: string,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.service.createRule(
        req.auth.sub,
        objectId.parse(id),
        availabilityRuleSchema.parse(raw),
        req.id,
      ),
    );
  }
  @Patch("availability/rules/:ruleId") async updateRule(
    @Req() req: AuthenticatedRequest,
    @Param("ruleId") id: string,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.service.updateRule(
        req.auth.sub,
        objectId.parse(id),
        availabilityRulePatchSchema.parse(raw),
        req.id,
      ),
    );
  }
  @Delete("availability/rules/:ruleId") async archiveRule(
    @Req() req: AuthenticatedRequest,
    @Param("ruleId") id: string,
  ) {
    return success(req, await this.service.archiveRule(req.auth.sub, objectId.parse(id), req.id));
  }
  @Get("resources/:resourceId/availability/exceptions") async exceptions(
    @Req() req: AuthenticatedRequest,
    @Param("resourceId") id: string,
  ) {
    return success(req, await this.service.exceptions(req.auth.sub, objectId.parse(id)));
  }
  @Post("resources/:resourceId/availability/exceptions") async createException(
    @Req() req: AuthenticatedRequest,
    @Param("resourceId") id: string,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.service.createException(
        req.auth.sub,
        objectId.parse(id),
        availabilityExceptionSchema.parse(raw),
        req.id,
      ),
    );
  }
  @Patch("availability/exceptions/:exceptionId") async updateException(
    @Req() req: AuthenticatedRequest,
    @Param("exceptionId") id: string,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.service.updateException(
        req.auth.sub,
        objectId.parse(id),
        availabilityExceptionPatchSchema.parse(raw),
        req.id,
      ),
    );
  }
  @Delete("availability/exceptions/:exceptionId") async archiveException(
    @Req() req: AuthenticatedRequest,
    @Param("exceptionId") id: string,
  ) {
    return success(
      req,
      await this.service.archiveException(req.auth.sub, objectId.parse(id), req.id),
    );
  }
  @Get("resources/:resourceId/availability/slots") async slots(
    @Req() req: AuthenticatedRequest,
    @Param("resourceId") id: string,
    @Query() raw: unknown,
  ) {
    return success(
      req,
      await this.service.slots(objectId.parse(id), slotQuerySchema.parse(raw), req.auth.sub),
    );
  }
}

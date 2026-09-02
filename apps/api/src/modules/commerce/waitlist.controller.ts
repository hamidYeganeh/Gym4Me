import { Body, Controller, Delete, Get, Headers, Param, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "../../security/rbac.js";
import { success } from "../../common/response.js";
import { AuthGuard } from "../../security/auth.guard.js";
import type { AuthenticatedRequest } from "../../security/auth.types.js";
import { RequirePermission } from "../../security/permission.decorator.js";
import { PermissionGuard } from "../../security/permission.guard.js";
import { objectId, waitlistEntrySchema } from "./schemas/commerce.schemas.js";
import { WaitlistService } from "./waitlist.service.js";
import { IdempotencyService } from "./idempotency.service.js";

@ApiTags("Waitlist")
@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionGuard)
@Controller("bookings/waitlist")
export class WaitlistController {
  constructor(
    private readonly service: WaitlistService,
    private readonly idempotency: IdempotencyService,
  ) {}
  @Post() @RequirePermission(PERMISSIONS.BOOKING_MANAGE_SELF) async join(
    @Req() req: AuthenticatedRequest,
    @Body() raw: unknown,
  ) {
    return success(req, await this.service.join(req.auth.sub, waitlistEntrySchema.parse(raw)));
  }
  @Get("me") @RequirePermission(PERMISSIONS.BOOKING_MANAGE_SELF) async mine(
    @Req() req: AuthenticatedRequest,
  ) {
    return success(req, await this.service.mine(req.auth.sub));
  }
  @Delete(":entryId") @RequirePermission(PERMISSIONS.BOOKING_MANAGE_SELF) async leave(
    @Req() req: AuthenticatedRequest,
    @Param("entryId") id: string,
  ) {
    return success(req, await this.service.leave(req.auth.sub, objectId.parse(id)));
  }
  @Post(":entryId/claim") @RequirePermission(PERMISSIONS.BOOKING_MANAGE_SELF) async claim(
    @Req() req: AuthenticatedRequest,
    @Param("entryId") id: string,
    @Headers("idempotency-key") rawKey: string | undefined,
  ) {
    return success(
      req,
      await this.service.claim(
        req.auth.sub,
        objectId.parse(id),
        this.idempotency.key(rawKey),
      ),
    );
  }
}

import { Body, Controller, Headers, Param, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "../../security/rbac.js";
import { success } from "../../common/response.js";
import { AuthGuard } from "../../security/auth.guard.js";
import type { AuthenticatedRequest } from "../../security/auth.types.js";
import { RequirePermission } from "../../security/permission.decorator.js";
import { PermissionGuard } from "../../security/permission.guard.js";
import { BookingOperationsService } from "./booking-operations.service.js";
import {
  objectId,
  rescheduleBookingSchema,
  staffBookingSchema,
  staffCancelBookingSchema,
} from "./schemas/commerce.schemas.js";
import { IdempotencyService } from "./idempotency.service.js";

@ApiTags("Booking Operations")
@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionGuard)
@Controller("branches/:branchId/bookings")
export class BookingOperationsController {
  constructor(
    private readonly service: BookingOperationsService,
    private readonly idempotency: IdempotencyService,
  ) {}
  @Post() @RequirePermission(PERMISSIONS.BRANCH_BOOKING_CREATE) async create(
    @Req() req: AuthenticatedRequest,
    @Param("branchId") branchId: string,
    @Headers("idempotency-key") rawKey: string | undefined,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.service.create(
        req.auth.sub,
        objectId.parse(branchId),
        staffBookingSchema.parse(raw),
        this.idempotency.key(rawKey),
        req.id,
      ),
    );
  }
  @Post(":bookingId/reschedule")
  @RequirePermission(PERMISSIONS.BRANCH_BOOKING_RESCHEDULE)
  async reschedule(
    @Req() req: AuthenticatedRequest,
    @Param("branchId") branchId: string,
    @Param("bookingId") bookingId: string,
    @Headers("idempotency-key") rawKey: string | undefined,
    @Body() raw: unknown,
  ) {
    const body = rescheduleBookingSchema.parse(raw);
    return success(
      req,
      await this.service.reschedule(
        req.auth.sub,
        objectId.parse(branchId),
        objectId.parse(bookingId),
        body.starts_at,
        body.reason,
        this.idempotency.key(rawKey),
        req.id,
      ),
    );
  }
  @Post(":bookingId/cancel") @RequirePermission(PERMISSIONS.BRANCH_BOOKING_CANCEL) async cancel(
    @Req() req: AuthenticatedRequest,
    @Param("branchId") branchId: string,
    @Param("bookingId") bookingId: string,
    @Headers("idempotency-key") rawKey: string | undefined,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.service.cancel(
        req.auth.sub,
        objectId.parse(branchId),
        objectId.parse(bookingId),
        staffCancelBookingSchema.parse(raw),
        this.idempotency.key(rawKey),
        req.id,
      ),
    );
  }
}

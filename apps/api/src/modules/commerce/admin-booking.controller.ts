import { Body, Controller, Get, Headers, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "../../security/rbac.js";
import { paginated, success } from "../../common/response.js";
import { AuthGuard } from "../../security/auth.guard.js";
import type { AuthenticatedRequest } from "../../security/auth.types.js";
import { RequirePermission } from "../../security/permission.decorator.js";
import { PermissionGuard } from "../../security/permission.guard.js";
import { BookingService } from "./booking.service.js";
import { bookingListSchema, cancelBookingSchema, objectId } from "./schemas/commerce.schemas.js";
import { IdempotencyService } from "./idempotency.service.js";

@ApiTags("Booking Operations")
@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionGuard)
@Controller()
export class AdminBookingController {
  constructor(
    private readonly service: BookingService,
    private readonly idempotency: IdempotencyService,
  ) {}
  @Get("branches/:branchId/bookings")
  @RequirePermission(PERMISSIONS.BRANCH_BOOKING_READ)
  async branch(
    @Req() req: AuthenticatedRequest,
    @Param("branchId") id: string,
    @Query() raw: unknown,
  ) {
    const query = bookingListSchema.parse(raw);
    const result = await this.service.branch(req.auth.sub, objectId.parse(id), query);
    return paginated(req, result.items, {
      page: query.page,
      limit: query.limit,
      total: result.total,
    });
  }
  @Get("admin/bookings") @RequirePermission(PERMISSIONS.ADMIN_BOOKINGS_MANAGE) async admin(
    @Req() req: AuthenticatedRequest,
    @Query() raw: unknown,
  ) {
    const query = bookingListSchema.parse(raw);
    const result = await this.service.admin(query);
    return paginated(req, result.items, {
      page: query.page,
      limit: query.limit,
      total: result.total,
    });
  }
  @Post("admin/bookings/:bookingId/cancel")
  @RequirePermission(PERMISSIONS.ADMIN_BOOKINGS_MANAGE)
  async cancel(
    @Req() req: AuthenticatedRequest,
    @Param("bookingId") id: string,
    @Headers("idempotency-key") rawKey: string | undefined,
    @Body() raw: unknown,
  ) {
    const body = cancelBookingSchema.parse(raw);
    return success(
      req,
      await this.service.adminCancel(
        req.auth.sub,
        objectId.parse(id),
        body.reason,
        this.idempotency.key(rawKey),
        req.id,
      ),
    );
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "../../security/rbac.js";
import { paginated, success } from "../../common/response.js";
import { AuthGuard } from "../../security/auth.guard.js";
import type { AuthenticatedRequest } from "../../security/auth.types.js";
import { RequirePermission } from "../../security/permission.decorator.js";
import { PermissionGuard } from "../../security/permission.guard.js";
import { BookingService } from "./booking.service.js";
import {
  bookingListSchema,
  cancelBookingSchema,
  checkoutSchema,
  holdSchema,
  objectId,
  quoteSchema,
  selfRescheduleBookingSchema,
} from "./schemas/commerce.schemas.js";
import { IdempotencyService } from "./idempotency.service.js";
import { QuoteService } from "./quote.service.js";

@ApiTags("Booking")
@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionGuard)
@Controller("bookings")
export class BookingController {
  constructor(
    private readonly quotes: QuoteService,
    private readonly bookings: BookingService,
    private readonly idempotency: IdempotencyService,
  ) {}
  @Post("quotes") @RequirePermission(PERMISSIONS.BOOKING_QUOTE_CREATE_SELF) async quote(
    @Req() req: AuthenticatedRequest,
    @Headers("idempotency-key") rawKey: string | undefined,
    @Body() raw: unknown,
  ) {
    const body = quoteSchema.parse(raw);
    return success(req, await this.quotes.create(req.auth.sub, body, this.idempotency.key(rawKey)));
  }
  @Get("quotes/:quoteId") @RequirePermission(PERMISSIONS.BOOKING_QUOTE_CREATE_SELF) async getQuote(
    @Req() req: AuthenticatedRequest,
    @Param("quoteId") id: string,
  ) {
    return success(req, await this.quotes.get(req.auth.sub, objectId.parse(id)));
  }
  @Post("holds") @RequirePermission(PERMISSIONS.BOOKING_HOLD_CREATE_SELF) async hold(
    @Req() req: AuthenticatedRequest,
    @Headers("idempotency-key") rawKey: string | undefined,
    @Body() raw: unknown,
  ) {
    const body = holdSchema.parse(raw);
    return success(
      req,
      await this.bookings.createHold(req.auth.sub, body.quote_id, this.idempotency.key(rawKey)),
    );
  }
  @Post("checkout") @RequirePermission(PERMISSIONS.BOOKING_MANAGE_SELF) async checkout(
    @Req() req: AuthenticatedRequest,
    @Headers("idempotency-key") rawKey: string | undefined,
    @Body() raw: unknown,
  ) {
    const body = checkoutSchema.parse(raw);
    return success(
      req,
      await this.bookings.checkout(req.auth.sub, body, this.idempotency.key(rawKey)),
    );
  }
  @Get("me") @RequirePermission(PERMISSIONS.BOOKING_MANAGE_SELF) async mine(
    @Req() req: AuthenticatedRequest,
    @Query() raw: unknown,
  ) {
    const query = bookingListSchema.parse(raw);
    const result = await this.bookings.mine(req.auth.sub, query);
    return paginated(req, result.items, {
      page: query.page,
      limit: query.limit,
      total: result.total,
    });
  }
  @Get(":bookingId") @RequirePermission(PERMISSIONS.BOOKING_MANAGE_SELF) async get(
    @Req() req: AuthenticatedRequest,
    @Param("bookingId") id: string,
  ) {
    return success(req, await this.bookings.get(req.auth.sub, objectId.parse(id)));
  }
  @Get(":bookingId/cancellation-preview")
  @RequirePermission(PERMISSIONS.BOOKING_MANAGE_SELF)
  async cancellationPreview(@Req() req: AuthenticatedRequest, @Param("bookingId") id: string) {
    return success(req, await this.bookings.cancellationPreview(req.auth.sub, objectId.parse(id)));
  }
  @Post(":bookingId/cancel") @RequirePermission(PERMISSIONS.BOOKING_MANAGE_SELF) async cancel(
    @Req() req: AuthenticatedRequest,
    @Param("bookingId") id: string,
    @Headers("idempotency-key") rawKey: string | undefined,
    @Body() raw: unknown,
  ) {
    const body = cancelBookingSchema.parse(raw);
    return success(
      req,
      await this.bookings.cancel(
        req.auth.sub,
        objectId.parse(id),
        body.reason,
        this.idempotency.key(rawKey),
      ),
    );
  }
  @Post(":bookingId/reschedule")
  @RequirePermission(PERMISSIONS.BOOKING_MANAGE_SELF)
  async reschedule(
    @Req() req: AuthenticatedRequest,
    @Param("bookingId") id: string,
    @Headers("idempotency-key") rawKey: string | undefined,
    @Body() raw: unknown,
  ) {
    const body = selfRescheduleBookingSchema.parse(raw);
    return success(
      req,
      await this.bookings.reschedule(
        req.auth.sub,
        objectId.parse(id),
        body.starts_at,
        body.reason,
        this.idempotency.key(rawKey),
      ),
    );
  }
}

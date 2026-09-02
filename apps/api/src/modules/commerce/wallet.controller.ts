import { Body, Controller, Get, Headers, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "../../security/rbac.js";
import { success } from "../../common/response.js";
import { AuthGuard } from "../../security/auth.guard.js";
import type { AuthenticatedRequest } from "../../security/auth.types.js";
import { RequirePermission } from "../../security/permission.decorator.js";
import { PermissionGuard } from "../../security/permission.guard.js";
import { IdempotencyService } from "./idempotency.service.js";
import { topUpSchema } from "./schemas/commerce.schemas.js";
import { WalletService } from "./wallet.service.js";

@ApiTags("Wallet & Payments")
@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionGuard)
@Controller("finance")
export class WalletController {
  constructor(
    private readonly service: WalletService,
    private readonly idempotency: IdempotencyService,
  ) {}
  @Get("wallet/me") @RequirePermission(PERMISSIONS.WALLET_READ_SELF) async wallet(
    @Req() req: AuthenticatedRequest,
  ) {
    return success(req, await this.service.summary(req.auth.sub));
  }
  @Get("payments/me") @RequirePermission(PERMISSIONS.WALLET_READ_SELF) async payments(
    @Req() req: AuthenticatedRequest,
  ) {
    return success(req, await this.service.payments(req.auth.sub));
  }
  @Get("invoices/me") @RequirePermission(PERMISSIONS.WALLET_READ_SELF) async invoices(
    @Req() req: AuthenticatedRequest,
  ) {
    return success(req, await this.service.invoices(req.auth.sub));
  }
  @Get("refunds/me") @RequirePermission(PERMISSIONS.WALLET_READ_SELF) async refunds(
    @Req() req: AuthenticatedRequest,
  ) {
    return success(req, await this.service.refunds(req.auth.sub));
  }
  @Post("wallet/me/top-ups") @RequirePermission(PERMISSIONS.WALLET_TOP_UP_SELF) async topUp(
    @Req() req: AuthenticatedRequest,
    @Headers("idempotency-key") rawKey: string | undefined,
    @Body() raw: unknown,
  ) {
    const body = topUpSchema.parse(raw);
    return success(
      req,
      await this.service.createTopUp(req.auth.sub, body, this.idempotency.key(rawKey)),
    );
  }
}

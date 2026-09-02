import { Body, Controller, Get, Headers, Param, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "../../security/rbac.js";
import { success } from "../../common/response.js";
import { AuthGuard } from "../../security/auth.guard.js";
import type { AuthenticatedRequest } from "../../security/auth.types.js";
import { RequirePermission } from "../../security/permission.decorator.js";
import { PermissionGuard } from "../../security/permission.guard.js";
import { mockPaymentDecisionSchema, objectId } from "./schemas/commerce.schemas.js";
import { IdempotencyService } from "./idempotency.service.js";
import { MockGatewayService } from "./mock-gateway.service.js";

@ApiTags("Mock Payment Gateway")
@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionGuard)
@RequirePermission(PERMISSIONS.PAYMENT_CREATE_SELF)
@Controller("finance/mock-gateway/payments")
export class MockGatewayController {
  constructor(
    private readonly service: MockGatewayService,
    private readonly idempotency: IdempotencyService,
  ) {}
  @Get(":paymentId") async payment(
    @Req() req: AuthenticatedRequest,
    @Param("paymentId") id: string,
  ) {
    return success(req, await this.service.payment(req.auth.sub, objectId.parse(id)));
  }
  @Post(":paymentId/decision") async decision(
    @Req() req: AuthenticatedRequest,
    @Param("paymentId") id: string,
    @Headers("idempotency-key") rawKey: string | undefined,
    @Body() raw: unknown,
  ) {
    const body = mockPaymentDecisionSchema.parse(raw);
    return success(
      req,
      await this.service.decide(
        req.auth.sub,
        objectId.parse(id),
        body.decision,
        this.idempotency.key(rawKey),
      ),
    );
  }
}

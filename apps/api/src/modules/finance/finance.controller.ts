import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "../../security/rbac.js";
import { paginated, success } from "../../common/response.js";
import { AuthGuard } from "../../security/auth.guard.js";
import type { AuthenticatedRequest } from "../../security/auth.types.js";
import { PermissionGuard } from "../../security/permission.guard.js";
import { RequirePermission } from "../../security/permission.decorator.js";
import { FinanceService } from "./finance.service.js";
import {
  listSchema,
  ledgerReversalSchema,
  manualRefundSchema,
  objectId,
  payoutSchema,
  reportSchema,
  ruleSchema,
  rulePatchSchema,
  settlementCreateSchema,
  taxRulePatchSchema,
  taxRuleSchema,
} from "./schemas/finance.schemas.js";
@ApiTags("Organization Finance")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("organizations/:organizationId/finance")
export class OrganizationFinanceController {
  constructor(private readonly s: FinanceService) {}
  @Get("commission-rules") async rules(
    @Req() req: AuthenticatedRequest,
    @Param("organizationId") id: string,
  ) {
    return success(req, await this.s.rules(req.auth.sub, objectId.parse(id)));
  }
  @Get("summary") async summary(
    @Req() req: AuthenticatedRequest,
    @Param("organizationId") id: string,
    @Query() raw: unknown,
  ) {
    return success(
      req,
      await this.s.report(req.auth.sub, objectId.parse(id), reportSchema.parse(raw)),
    );
  }
  @Post("commission-rules") async createRule(
    @Req() req: AuthenticatedRequest,
    @Param("organizationId") id: string,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.s.createRule(req.auth.sub, objectId.parse(id), ruleSchema.parse(raw), req.id),
    );
  }
  @Patch("commission-rules/:ruleId") async updateRule(
    @Req() req: AuthenticatedRequest,
    @Param("organizationId") id: string,
    @Param("ruleId") ruleId: string,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.s.updateRule(
        req.auth.sub,
        objectId.parse(id),
        objectId.parse(ruleId),
        rulePatchSchema.parse(raw),
        req.id,
      ),
    );
  }
  @Get("tax-rules") async taxRules(
    @Req() req: AuthenticatedRequest,
    @Param("organizationId") id: string,
  ) {
    return success(req, await this.s.taxRules(req.auth.sub, objectId.parse(id)));
  }
  @Post("tax-rules") async createTaxRule(
    @Req() req: AuthenticatedRequest,
    @Param("organizationId") id: string,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.s.createTaxRule(
        req.auth.sub,
        objectId.parse(id),
        taxRuleSchema.parse(raw),
        req.id,
      ),
    );
  }
  @Patch("tax-rules/:ruleId") async updateTaxRule(
    @Req() req: AuthenticatedRequest,
    @Param("organizationId") id: string,
    @Param("ruleId") ruleId: string,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.s.updateTaxRule(
        req.auth.sub,
        objectId.parse(id),
        objectId.parse(ruleId),
        taxRulePatchSchema.parse(raw),
        req.id,
      ),
    );
  }
  @Get("settlements") async settlements(
    @Req() req: AuthenticatedRequest,
    @Param("organizationId") id: string,
    @Query() raw: unknown,
  ) {
    const q = listSchema.parse(raw),
      r = await this.s.settlements(req.auth.sub, objectId.parse(id), q);
    return paginated(req, r.items, { ...q, total: r.total });
  }
  @Post("settlements") async create(
    @Req() req: AuthenticatedRequest,
    @Param("organizationId") id: string,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.s.createSettlement(
        req.auth.sub,
        objectId.parse(id),
        settlementCreateSchema.parse(raw),
        req.id,
      ),
    );
  }
  @Get("invoices") async invoices(
    @Req() req: AuthenticatedRequest,
    @Param("organizationId") id: string,
    @Query() raw: unknown,
  ) {
    const q = listSchema.parse(raw),
      r = await this.s.invoices(req.auth.sub, objectId.parse(id), q);
    return paginated(req, r.items, { ...q, total: r.total });
  }
  @Get("refunds") async refunds(
    @Req() req: AuthenticatedRequest,
    @Param("organizationId") id: string,
    @Query() raw: unknown,
  ) {
    const q = listSchema.parse(raw),
      r = await this.s.refunds(req.auth.sub, objectId.parse(id), q);
    return paginated(req, r.items, { ...q, total: r.total });
  }
  @Get("reconciliation") async reconciliation(
    @Req() req: AuthenticatedRequest,
    @Param("organizationId") id: string,
  ) {
    return success(req, await this.s.reconciliation(req.auth.sub, objectId.parse(id)));
  }
}
@ApiTags("Admin / Finance")
@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionGuard)
@Controller("admin/finance")
export class AdminFinanceController {
  constructor(private readonly s: FinanceService) {}
  @Get("settlements")
  @RequirePermission(PERMISSIONS.ADMIN_FINANCE_READ)
  async settlements(@Req() req: AuthenticatedRequest, @Query() raw: unknown) {
    const q = listSchema.parse(raw),
      r = await this.s.adminSettlements(q);
    return paginated(req, r.items, { ...q, total: r.total });
  }
  @Get("summary") @RequirePermission(PERMISSIONS.ADMIN_FINANCE_READ) async summary(
    @Req() req: AuthenticatedRequest,
    @Query() raw: unknown,
  ) {
    return success(req, await this.s.report(undefined, undefined, reportSchema.parse(raw)));
  }
  @Get("ledger") @RequirePermission(PERMISSIONS.ADMIN_FINANCE_READ) async ledger(
    @Req() req: AuthenticatedRequest,
    @Query() raw: unknown,
  ) {
    const q = listSchema.parse(raw),
      r = await this.s.ledgerTransactions(q);
    return paginated(req, r.items, { ...q, total: r.total });
  }
  @Post("settlements/:settlementId/pay")
  @RequirePermission(PERMISSIONS.ADMIN_FINANCE_ADJUST)
  async pay(
    @Req() req: AuthenticatedRequest,
    @Param("settlementId") id: string,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.s.pay(req.auth.sub, objectId.parse(id), payoutSchema.parse(raw), req.id),
    );
  }
  @Get("invoices") @RequirePermission(PERMISSIONS.ADMIN_FINANCE_READ) async invoices(
    @Req() req: AuthenticatedRequest,
    @Query() raw: unknown,
  ) {
    const q = listSchema.parse(raw),
      r = await this.s.invoices(undefined, undefined, q);
    return paginated(req, r.items, { ...q, total: r.total });
  }
  @Get("refunds") @RequirePermission(PERMISSIONS.ADMIN_FINANCE_READ) async refunds(
    @Req() req: AuthenticatedRequest,
    @Query() raw: unknown,
  ) {
    const q = listSchema.parse(raw),
      r = await this.s.refunds(undefined, undefined, q);
    return paginated(req, r.items, { ...q, total: r.total });
  }
  @Get("reconciliation") @RequirePermission(PERMISSIONS.ADMIN_FINANCE_READ) async reconciliation(
    @Req() req: AuthenticatedRequest,
  ) {
    return success(req, await this.s.reconciliation(undefined, undefined));
  }
  @Post("refunds")
  @RequirePermission(PERMISSIONS.ADMIN_FINANCE_ADJUST)
  async manualRefund(@Req() req: AuthenticatedRequest, @Body() raw: unknown) {
    return success(
      req,
      await this.s.manualRefund(req.auth.sub, manualRefundSchema.parse(raw), req.id),
    );
  }
  @Post("ledger/:transactionId/reverse")
  @RequirePermission(PERMISSIONS.ADMIN_FINANCE_ADJUST)
  async reverseLedger(
    @Req() req: AuthenticatedRequest,
    @Param("transactionId") id: string,
    @Body() raw: unknown,
  ) {
    return success(
      req,
      await this.s.reverseLedger(
        req.auth.sub,
        objectId.parse(id),
        ledgerReversalSchema.parse(raw),
        req.id,
      ),
    );
  }
}

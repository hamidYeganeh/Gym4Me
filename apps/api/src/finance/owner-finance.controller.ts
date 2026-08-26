import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums';
import {
  CloseCashShiftDto,
  CreateDebtDto,
  CreatePayoutDto,
  DraftPeriodPayoutDto,
  AnalyticsPeriodQueryDto,
  ListCompensationRulesQueryDto,
  ListDebtsQueryDto,
  ListPaymentsQueryDto,
  ListInvoicesQueryDto,
  ListPayoutsQueryDto,
  OpenPayoutDisputeDto,
  PaginationQueryDto,
  RecordDebtPaymentDto,
  RecordManualPaymentDto,
  ResolvePayoutDisputeDto,
  UpsertCompensationRuleDto,
} from './dto/finance.dto';
import { FinanceService } from './finance.service';

@ApiTags('club-owner-finance')
@ApiBearerAuth('access-token')
@Roles(Role.CLUB_OWNER)
@Controller('account/clubs/:clubId/finance')
export class OwnerFinanceController {
  constructor(private readonly finance: FinanceService) {}

  // ── Analytics ───────────────────────────────────────────────────────────

  @Get('analytics/overview')
  @ApiOperation({
    summary: 'Owner finance KPI overview (period=week|month|quarter)',
  })
  async analyticsOverview(
    @CurrentUser('sub') userId: string,
    @Param('clubId') clubId: string,
    @Query() query: AnalyticsPeriodQueryDto,
  ) {
    await this.finance.requireOwnedClub(userId, clubId);
    return this.finance.getOwnerFinanceAnalytics(clubId, query);
  }

  // ── Manual payments ─────────────────────────────────────────────────────

  @Post('payments/manual')
  @ApiOperation({
    summary: 'Record a desk payment (cash/pos/card_to_card/mixed)',
  })
  async recordManual(
    @CurrentUser('sub') userId: string,
    @Param('clubId') clubId: string,
    @Body() dto: RecordManualPaymentDto,
    @Req() request: Request,
  ) {
    await this.finance.requireOwnedClub(userId, clubId);
    return this.finance.recordManualPayment(clubId, userId, dto, request);
  }

  @Get('payments')
  @ApiOperation({ summary: 'List club payments' })
  async listPayments(
    @CurrentUser('sub') userId: string,
    @Param('clubId') clubId: string,
    @Query() query: ListPaymentsQueryDto,
  ) {
    await this.finance.requireOwnedClub(userId, clubId);
    return this.finance.listPayments({ ...query, clubId });
  }

  @Get('payments/:paymentId')
  @ApiOperation({ summary: 'Get a club payment' })
  async getPayment(
    @CurrentUser('sub') userId: string,
    @Param('clubId') clubId: string,
    @Param('paymentId') paymentId: string,
  ) {
    await this.finance.requireOwnedClub(userId, clubId);
    const result = await this.finance.getPayment(paymentId);
    if (result.payment.related?.clubId?.toString() !== clubId) {
      throw new ForbiddenException('Payment does not belong to this club');
    }
    return result;
  }

  @Get('invoices')
  @ApiOperation({ summary: 'List invoices issued for club payments' })
  async listInvoices(
    @CurrentUser('sub') userId: string,
    @Param('clubId') clubId: string,
    @Query() query: ListInvoicesQueryDto,
  ) {
    await this.finance.requireOwnedClub(userId, clubId);
    return this.finance.listClubInvoices(clubId, query);
  }

  // ── Cash shifts ─────────────────────────────────────────────────────────

  @Get('shifts')
  @ApiOperation({ summary: 'List cash shifts' })
  async listShifts(
    @CurrentUser('sub') userId: string,
    @Param('clubId') clubId: string,
    @Query() query: PaginationQueryDto,
  ) {
    await this.finance.requireOwnedClub(userId, clubId);
    return this.finance.listCashShifts(clubId, query);
  }

  @Get('shifts/open')
  @ApiOperation({ summary: 'Get the currently open cash shift (if any)' })
  async getOpenShift(
    @CurrentUser('sub') userId: string,
    @Param('clubId') clubId: string,
  ) {
    await this.finance.requireOwnedClub(userId, clubId);
    return this.finance.getOpenCashShift(clubId);
  }

  @Post('shifts')
  @ApiOperation({ summary: 'Open a cash shift' })
  async openShift(
    @CurrentUser('sub') userId: string,
    @Param('clubId') clubId: string,
  ) {
    await this.finance.requireOwnedClub(userId, clubId);
    return this.finance.openCashShift(clubId, userId);
  }

  @Post('shifts/:shiftId/close')
  @ApiOperation({ summary: 'Close a cash shift with counted totals' })
  async closeShift(
    @CurrentUser('sub') userId: string,
    @Param('clubId') clubId: string,
    @Param('shiftId') shiftId: string,
    @Body() dto: CloseCashShiftDto,
    @Req() request: Request,
  ) {
    await this.finance.requireOwnedClub(userId, clubId);
    return this.finance.closeCashShift(clubId, shiftId, userId, dto, request);
  }

  // ── Payouts ─────────────────────────────────────────────────────────────

  @Get('payouts')
  @ApiOperation({ summary: 'List club payouts' })
  async listPayouts(
    @CurrentUser('sub') userId: string,
    @Param('clubId') clubId: string,
    @Query() query: ListPayoutsQueryDto,
  ) {
    await this.finance.requireOwnedClub(userId, clubId);
    return this.finance.listPayouts({ ...query, clubId });
  }

  @Post('payouts')
  @ApiOperation({ summary: 'Create a payout for club or coach' })
  async createPayout(
    @CurrentUser('sub') userId: string,
    @Param('clubId') clubId: string,
    @Body() dto: CreatePayoutDto,
    @Req() request: Request,
  ) {
    await this.finance.requireOwnedClub(userId, clubId);
    return this.finance.createPayout(clubId, dto, userId, request);
  }

  @Post('payouts/draft-period')
  @ApiOperation({
    summary: 'Draft payout from ledger provider_payable for a period',
  })
  async draftPeriodPayout(
    @CurrentUser('sub') userId: string,
    @Param('clubId') clubId: string,
    @Body() dto: DraftPeriodPayoutDto,
    @Req() request: Request,
  ) {
    await this.finance.requireOwnedClub(userId, clubId);
    return this.finance.draftPeriodPayout(clubId, dto, userId, request);
  }

  @Post('payouts/:id/dispute')
  @ApiOperation({ summary: 'Open a payout dispute' })
  async openDispute(
    @CurrentUser('sub') userId: string,
    @Param('clubId') clubId: string,
    @Param('id') id: string,
    @Body() dto: OpenPayoutDisputeDto,
    @Req() request: Request,
  ) {
    await this.finance.requireOwnedClub(userId, clubId);
    return this.finance.openPayoutDispute(id, dto.reason, userId, request);
  }

  @Post('payouts/:id/dispute/resolve')
  @ApiOperation({ summary: 'Resolve dispute with reverse ledger entries' })
  async resolveDispute(
    @CurrentUser('sub') userId: string,
    @Param('clubId') clubId: string,
    @Param('id') id: string,
    @Body() dto: ResolvePayoutDisputeDto,
    @Req() request: Request,
  ) {
    await this.finance.requireOwnedClub(userId, clubId);
    return this.finance.resolvePayoutDispute(
      id,
      {
        resolution: dto.resolution,
        note: dto.note,
        reverseSettledAmount: dto.reverseSettledAmount,
      },
      userId,
      request,
    );
  }

  // ── Debts ───────────────────────────────────────────────────────────────

  @Get('debts')
  @ApiOperation({ summary: 'List club debts' })
  async listDebts(
    @CurrentUser('sub') userId: string,
    @Param('clubId') clubId: string,
    @Query() query: ListDebtsQueryDto,
  ) {
    await this.finance.requireOwnedClub(userId, clubId);
    return this.finance.listDebts(clubId, query);
  }

  @Post('debts')
  @ApiOperation({ summary: 'Create a debt (optionally with installments)' })
  async createDebt(
    @CurrentUser('sub') userId: string,
    @Param('clubId') clubId: string,
    @Body() dto: CreateDebtDto,
  ) {
    await this.finance.requireOwnedClub(userId, clubId);
    return this.finance.createDebt(clubId, dto);
  }

  @Get('debts/:debtId')
  @ApiOperation({ summary: 'Get a debt with installments' })
  async getDebt(
    @CurrentUser('sub') userId: string,
    @Param('clubId') clubId: string,
    @Param('debtId') debtId: string,
  ) {
    await this.finance.requireOwnedClub(userId, clubId);
    return this.finance.getDebt(clubId, debtId);
  }

  @Post('debts/:debtId/payments')
  @ApiOperation({ summary: 'Record a (partial) debt payment' })
  async recordDebtPayment(
    @CurrentUser('sub') userId: string,
    @Param('clubId') clubId: string,
    @Param('debtId') debtId: string,
    @Body() dto: RecordDebtPaymentDto,
    @Req() request: Request,
  ) {
    await this.finance.requireOwnedClub(userId, clubId);
    return this.finance.recordDebtPayment(clubId, debtId, userId, dto, request);
  }

  // ── Compensation ────────────────────────────────────────────────────────

  @Get('compensation-rules')
  @ApiOperation({ summary: 'List compensation rules' })
  async listCompensation(
    @CurrentUser('sub') userId: string,
    @Param('clubId') clubId: string,
    @Query() query: ListCompensationRulesQueryDto,
  ) {
    await this.finance.requireOwnedClub(userId, clubId);
    return this.finance.listCompensationRules(clubId, query);
  }

  @Put('compensation-rules')
  @ApiOperation({ summary: 'Create or update a compensation rule' })
  async upsertCompensation(
    @CurrentUser('sub') userId: string,
    @Param('clubId') clubId: string,
    @Body() dto: UpsertCompensationRuleDto,
  ) {
    await this.finance.requireOwnedClub(userId, clubId);
    return this.finance.upsertCompensationRule(clubId, dto);
  }
}

import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums';
import {
  CreatePayoutDto,
  DraftPeriodPayoutDto,
  ListLedgerQueryDto,
  ListPaymentsQueryDto,
  ListPayoutsQueryDto,
  OpenPayoutDisputeDto,
  ResolvePayoutDisputeDto,
  SettlePayoutDto,
} from './dto/finance.dto';
import { FinanceService } from './finance.service';

@ApiTags('admin')
@ApiBearerAuth('access-token')
@Roles(Role.ADMIN)
@Controller('admin/finance')
export class AdminFinanceController {
  constructor(private readonly finance: FinanceService) {}

  @Get('ledger')
  @ApiOperation({ summary: 'List immutable ledger entries' })
  listLedger(@Query() query: ListLedgerQueryDto) {
    return this.finance.listLedger(query);
  }

  @Get('payments')
  @ApiOperation({ summary: 'List all payments' })
  listPayments(@Query() query: ListPaymentsQueryDto) {
    return this.finance.listPayments(query);
  }

  @Get('payments/:id')
  @ApiOperation({ summary: 'Get a payment with its ledger entry' })
  getPayment(@Param('id') id: string) {
    return this.finance.getPayment(id);
  }

  @Get('payouts')
  @ApiOperation({ summary: 'List payouts' })
  listPayouts(@Query() query: ListPayoutsQueryDto) {
    return this.finance.listPayouts(query);
  }

  @Post('payouts')
  @ApiOperation({ summary: 'Create a payout (admin)' })
  createPayout(
    @CurrentUser('sub') adminId: string,
    @Body() dto: CreatePayoutDto,
    @Req() request: Request,
  ) {
    return this.finance.createPayout(undefined, dto, adminId, request);
  }

  @Post('payouts/draft-period')
  @ApiOperation({
    summary: 'Draft payout amount from ledger provider_payable for a period',
  })
  draftPeriodPayout(
    @CurrentUser('sub') adminId: string,
    @Body() dto: DraftPeriodPayoutDto,
    @Req() request: Request,
  ) {
    return this.finance.draftPeriodPayout(undefined, dto, adminId, request);
  }

  @Post('payouts/:id/settle')
  @ApiOperation({ summary: 'Settle a payout and post ledger entry' })
  settlePayout(
    @CurrentUser('sub') adminId: string,
    @Param('id') id: string,
    @Body() dto: SettlePayoutDto,
    @Req() request: Request,
  ) {
    return this.finance.settlePayout(id, adminId, dto.note, request);
  }

  @Post('payouts/:id/dispute')
  @ApiOperation({ summary: 'Open a payout dispute' })
  openDispute(
    @CurrentUser('sub') adminId: string,
    @Param('id') id: string,
    @Body() dto: OpenPayoutDisputeDto,
    @Req() request: Request,
  ) {
    return this.finance.openPayoutDispute(id, dto.reason, adminId, request);
  }

  @Post('payouts/:id/dispute/resolve')
  @ApiOperation({
    summary: 'Resolve dispute via reverse ledger entries (never mutate past)',
  })
  resolveDispute(
    @CurrentUser('sub') adminId: string,
    @Param('id') id: string,
    @Body() dto: ResolvePayoutDisputeDto,
    @Req() request: Request,
  ) {
    return this.finance.resolvePayoutDispute(
      id,
      {
        resolution: dto.resolution,
        note: dto.note,
        reverseSettledAmount: dto.reverseSettledAmount,
      },
      adminId,
      request,
    );
  }
}

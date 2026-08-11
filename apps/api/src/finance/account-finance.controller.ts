import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { WalletOwnerType } from '../common/enums';
import {
  IssueInvoiceFromPaymentDto,
  ListInvoicesQueryDto,
  ListPaymentsQueryDto,
  TopUpWalletDto,
} from './dto/finance.dto';
import { FinanceService } from './finance.service';

@ApiTags('account')
@ApiBearerAuth('access-token')
@Controller('account/finance')
export class AccountFinanceController {
  constructor(private readonly finance: FinanceService) {}

  @Get('wallet')
  @ApiOperation({ summary: 'Get my wallet balance' })
  getWallet(@CurrentUser('sub') userId: string) {
    return this.finance.getWalletBalance({
      type: WalletOwnerType.USER,
      id: userId,
    });
  }

  @Get('wallet/overview')
  @ApiOperation({
    summary: 'Wallet balance + monthly balancePoints / income / spend series',
  })
  getWalletOverview(@CurrentUser('sub') userId: string) {
    return this.finance.getWalletOverview(userId);
  }

  @Post('wallet/topup')
  @ApiOperation({ summary: 'Top up my wallet (records Payment + Ledger)' })
  topUp(
    @CurrentUser('sub') userId: string,
    @Body() dto: TopUpWalletDto,
    @Req() request: Request,
  ) {
    return this.finance.topUpWallet(userId, dto, request);
  }

  @Get('payments')
  @ApiOperation({ summary: 'List my payments' })
  listPayments(
    @CurrentUser('sub') userId: string,
    @Query() query: ListPaymentsQueryDto,
  ) {
    return this.finance.listMyPayments(userId, query);
  }

  @Get('invoices')
  @ApiOperation({ summary: 'List my invoices' })
  listInvoices(
    @CurrentUser('sub') userId: string,
    @Query() query: ListInvoicesQueryDto,
  ) {
    return this.finance.listMyInvoices(userId, query);
  }

  @Get('invoices/:id')
  @ApiOperation({ summary: 'Get one of my invoices' })
  getInvoice(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    return this.finance.getMyInvoice(userId, id);
  }

  @Post('invoices/from-payment')
  @ApiOperation({ summary: 'Issue an invoice from a captured payment' })
  issueFromPayment(
    @CurrentUser('sub') userId: string,
    @Body() dto: IssueInvoiceFromPaymentDto,
    @Req() request: Request,
  ) {
    return this.finance.issueInvoiceFromPayment(userId, dto, request);
  }
}

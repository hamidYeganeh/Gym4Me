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
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums';
import {
  CreatePayoutDto,
  ListLedgerQueryDto,
  ListPaymentsQueryDto,
  ListPayoutsQueryDto,
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
}

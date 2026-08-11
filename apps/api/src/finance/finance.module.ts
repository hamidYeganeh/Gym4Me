import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditModule } from '../audit/audit.module';
import {
  CashShift,
  CashShiftSchema,
} from '../schemas/cash-shift.schema';
import { Club, ClubSchema } from '../schemas/club.schema';
import {
  ClubMembership,
  ClubMembershipSchema,
} from '../schemas/club-membership.schema';
import {
  CompensationRule,
  CompensationRuleSchema,
} from '../schemas/compensation-rule.schema';
import {
  Debt,
  DebtSchema,
  Installment,
  InstallmentSchema,
} from '../schemas/debt.schema';
import { Invoice, InvoiceSchema } from '../schemas/invoice.schema';
import {
  LedgerEntry,
  LedgerEntrySchema,
} from '../schemas/ledger-entry.schema';
import { Payment, PaymentSchema } from '../schemas/payment.schema';
import { Payout, PayoutSchema } from '../schemas/payout.schema';
import { Wallet, WalletSchema } from '../schemas/wallet.schema';
import { AccountFinanceController } from './account-finance.controller';
import { AdminFinanceController } from './admin-finance.controller';
import { FinanceService } from './finance.service';
import { OwnerFinanceController } from './owner-finance.controller';

@Module({
  imports: [
    AuditModule,
    MongooseModule.forFeature([
      { name: Wallet.name, schema: WalletSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: LedgerEntry.name, schema: LedgerEntrySchema },
      { name: Debt.name, schema: DebtSchema },
      { name: Installment.name, schema: InstallmentSchema },
      { name: CashShift.name, schema: CashShiftSchema },
      { name: Payout.name, schema: PayoutSchema },
      { name: CompensationRule.name, schema: CompensationRuleSchema },
      { name: Club.name, schema: ClubSchema },
      { name: Invoice.name, schema: InvoiceSchema },
      { name: ClubMembership.name, schema: ClubMembershipSchema },
    ]),
  ],
  controllers: [
    AccountFinanceController,
    OwnerFinanceController,
    AdminFinanceController,
  ],
  providers: [FinanceService],
  exports: [FinanceService],
})
export class FinanceModule {}

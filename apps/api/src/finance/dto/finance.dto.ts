import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { PaginationQueryDto as CommonPaginationQueryDto } from '../../basics/dto/common.dto';
import {
  CompensationBasis,
  DebtStatus,
  EntityStatus,
  InvoiceStatus,
  LedgerEntryKind,
  PaymentChannel,
  PaymentPurpose,
  PaymentStatus,
  PayoutDisputeStatus,
  PayoutRecipientType,
  PayoutStatus,
  WalletOwnerType,
  AnalyticsPeriod,
} from '../../common/enums';
import { toStringArray } from '../../common/utils/list-query.util';

export class PaginationQueryDto extends CommonPaginationQueryDto {}

// ── Shared nested DTOs ────────────────────────────────────────────────────

export class PaymentAmountSplitDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  gross!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  discount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  tax?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  providerShare?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  platformFee?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  gatewayFee?: number;

  /** If omitted, computed as gross − discount − tax − providerShare − platformFee − gatewayFee. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  net?: number;
}

export class PaymentGuestDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @IsString()
  @MinLength(5)
  @MaxLength(20)
  phone!: string;
}

export class PaymentPayerDto {
  @IsOptional()
  @IsMongoId()
  userId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PaymentGuestDto)
  guest?: PaymentGuestDto;
}

export class PaymentRelatedDto {
  @IsOptional()
  @IsMongoId()
  bookingId?: string;

  @IsOptional()
  @IsMongoId()
  membershipId?: string;

  @IsOptional()
  @IsMongoId()
  membershipPlanId?: string;

  @IsOptional()
  @IsMongoId()
  platformPlanId?: string;

  @IsOptional()
  @IsMongoId()
  platformSubscriptionId?: string;

  @IsOptional()
  @IsMongoId()
  packageId?: string;

  @IsOptional()
  @IsMongoId()
  clubId?: string;

  @IsOptional()
  @IsMongoId()
  coachUserId?: string;
}

export class PaymentReferenceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  orderId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  authority?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  gatewayRefId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  externalRef?: string;
}

export class PaymentTenderDto {
  @IsEnum(PaymentChannel)
  channel!: PaymentChannel;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  amount!: number;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  externalRef?: string;
}

// ── Payments ──────────────────────────────────────────────────────────────

export class RecordPaymentDto {
  @IsEnum(PaymentPurpose)
  purpose!: PaymentPurpose;

  @IsEnum(PaymentChannel)
  channel!: PaymentChannel;

  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @ValidateNested()
  @Type(() => PaymentAmountSplitDto)
  amount!: PaymentAmountSplitDto;

  @ValidateNested()
  @Type(() => PaymentReferenceDto)
  reference!: PaymentReferenceDto;

  @ValidateNested()
  @Type(() => PaymentPayerDto)
  payer!: PaymentPayerDto;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => PaymentTenderDto)
  tenders?: PaymentTenderDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => PaymentRelatedDto)
  related?: PaymentRelatedDto;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  idempotencyKey!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  /** Operator note for desk flows (operator userId set by service). */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  operatorNote?: string;
}

export class RecordManualPaymentDto {
  @IsEnum(PaymentPurpose)
  purpose!: PaymentPurpose;

  @IsEnum(PaymentChannel)
  channel!: PaymentChannel;

  @ValidateNested()
  @Type(() => PaymentAmountSplitDto)
  amount!: PaymentAmountSplitDto;

  @ValidateNested()
  @Type(() => PaymentReferenceDto)
  reference!: PaymentReferenceDto;

  @ValidateNested()
  @Type(() => PaymentPayerDto)
  payer!: PaymentPayerDto;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => PaymentTenderDto)
  tenders?: PaymentTenderDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => PaymentRelatedDto)
  related?: PaymentRelatedDto;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  idempotencyKey!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  operatorNote?: string;
}

export class ListPaymentsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Transform(toStringArray)
  @IsArray()
  @IsEnum(PaymentStatus, { each: true })
  status?: PaymentStatus[];

  @IsOptional()
  @Transform(toStringArray)
  @IsArray()
  @IsEnum(PaymentChannel, { each: true })
  channel?: PaymentChannel[];

  @IsOptional()
  @Transform(toStringArray)
  @IsArray()
  @IsEnum(PaymentPurpose, { each: true })
  purpose?: PaymentPurpose[];

  @IsOptional()
  @IsMongoId()
  clubId?: string;

  @IsOptional()
  @IsMongoId()
  payerUserId?: string;
}

// ── Wallet ────────────────────────────────────────────────────────────────

export class TopUpWalletDto {
  @Type(() => Number)
  @IsInt()
  @Min(1000)
  amount!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  idempotencyKey!: string;

  /** Exact first-party page/deep link that receives Authority and Status. */
  @IsUrl({ require_tld: false })
  @MaxLength(500)
  callbackUrl!: string;
}

export class VerifyWalletTopUpDto {
  @IsString()
  @MaxLength(120)
  authority!: string;

  @IsIn(['OK', 'NOK'])
  status!: 'OK' | 'NOK';
}

export class WalletOwnerDto {
  @IsEnum(WalletOwnerType)
  type!: WalletOwnerType;

  @IsMongoId()
  id!: string;
}

// ── Ledger ────────────────────────────────────────────────────────────────

export class ListLedgerQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Transform(toStringArray)
  @IsArray()
  @IsEnum(LedgerEntryKind, { each: true })
  kind?: LedgerEntryKind[];

  @IsOptional()
  @IsMongoId()
  clubId?: string;

  @IsOptional()
  @IsMongoId()
  paymentId?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}

// ── Cash shifts ───────────────────────────────────────────────────────────

export class CashShiftTotalsDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  cash!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  pos!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  cardToCard!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  other!: number;
}

export class CloseCashShiftDto {
  @ValidateNested()
  @Type(() => CashShiftTotalsDto)
  counted!: CashShiftTotalsDto;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  varianceNote?: string;
}

// ── Payouts ───────────────────────────────────────────────────────────────

export class CreatePayoutDto {
  @IsEnum(PayoutRecipientType)
  recipientType!: PayoutRecipientType;

  @IsMongoId()
  recipientId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  amount!: number;

  @IsDateString()
  periodFrom!: string;

  @IsDateString()
  periodTo!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class ListPayoutsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Transform(toStringArray)
  @IsArray()
  @IsEnum(PayoutStatus, { each: true })
  status?: PayoutStatus[];

  @IsOptional()
  @Transform(toStringArray)
  @IsArray()
  @IsEnum(PayoutRecipientType, { each: true })
  recipientType?: PayoutRecipientType[];

  @IsOptional()
  @IsMongoId()
  recipientId?: string;

  @IsOptional()
  @IsMongoId()
  clubId?: string;
}

export class SettlePayoutDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class DraftPeriodPayoutDto {
  @IsEnum(PayoutRecipientType)
  recipientType!: PayoutRecipientType;

  @IsMongoId()
  recipientId!: string;

  @IsDateString()
  periodFrom!: string;

  @IsDateString()
  periodTo!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class OpenPayoutDisputeDto {
  @IsString()
  @MinLength(3)
  @MaxLength(1000)
  reason!: string;
}

export class ResolvePayoutDisputeDto {
  @IsEnum(PayoutDisputeStatus)
  resolution!: PayoutDisputeStatus.RESOLVED | PayoutDisputeStatus.REJECTED;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @IsOptional()
  @IsBoolean()
  reverseSettledAmount?: boolean;
}

// ── Compensation ──────────────────────────────────────────────────────────

export class UpsertCompensationRuleDto {
  @IsOptional()
  @IsMongoId()
  id?: string;

  @IsOptional()
  @IsMongoId()
  coachUserId?: string;

  @IsEnum(CompensationBasis)
  basis!: CompensationBasis;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  rate!: number;

  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;

  @IsDateString()
  effectiveFrom!: string;

  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class ListCompensationRulesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsMongoId()
  coachUserId?: string;

  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;
}

// ── Debts ─────────────────────────────────────────────────────────────────

export class CreateDebtDto {
  @ValidateNested()
  @Type(() => PaymentPayerDto)
  holder!: PaymentPayerDto;

  @IsOptional()
  @IsMongoId()
  membershipId?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  principal!: number;

  @IsDateString()
  dueAt!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  /** Optional installment schedule: equal splits by count. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(60)
  installmentCount?: number;
}

export class RecordDebtPaymentDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  amount!: number;

  @IsEnum(PaymentChannel)
  channel!: PaymentChannel;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  idempotencyKey!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  orderId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  operatorNote?: string;
}

export class ListDebtsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(DebtStatus)
  status?: DebtStatus;
}

// ── Invoices ──────────────────────────────────────────────────────────────

export class IssueInvoiceFromPaymentDto {
  @IsMongoId()
  paymentId!: string;
}

export class ListInvoicesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;
}

export class AnalyticsPeriodQueryDto {
  @IsOptional()
  @IsEnum(AnalyticsPeriod)
  period?: AnalyticsPeriod;
}

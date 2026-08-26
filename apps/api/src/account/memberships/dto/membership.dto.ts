import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  Equals,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { PaginationQueryDto as CommonPaginationQueryDto } from '../../../basics/dto/common.dto';
import {
  EntityStatus,
  MembershipPlanKind,
  MembershipStatus,
  MembershipTransferPolicy,
  PaymentChannel,
  PlatformSubscriptionStatus,
  PublishStatus,
  SubscriptionRenewalMode,
} from '../../../common/enums';
import { toStringArray } from '../../../common/utils/list-query.util';
import { PLATFORM_ENTITLEMENT_KEYS } from '../../../schemas/platform-plan.schema';

export class PaginationQueryDto extends CommonPaginationQueryDto {}

export class PublicMembershipPlanSummariesQueryDto {
  @Transform(toStringArray)
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @IsMongoId({ each: true })
  clubIds!: string[];
}

// ── Nested DTOs ───────────────────────────────────────────────────────────

export class MembershipPlanPricingDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  tax?: number;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  currency?: string;
}

export class MembershipPlanRulesDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  freezeMaxDays?: number;

  @IsOptional()
  @IsEnum(MembershipTransferPolicy)
  transferPolicy?: MembershipTransferPolicy;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  guestPassCount?: number;
}

export class MembershipGuestHolderDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @IsString()
  @MinLength(5)
  @MaxLength(32)
  phone!: string;
}

export class MembershipHolderDto {
  @IsOptional()
  @IsMongoId()
  userId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => MembershipGuestHolderDto)
  guest?: MembershipGuestHolderDto;
}

export class MembershipPaymentTenderDto {
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

export class MembershipDebtDto {
  @IsDateString()
  dueAt!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(60)
  installmentCount?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class PlatformPlanPricingDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  tax?: number;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  currency?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  periodDays?: number;
}

export class SubscriptionRenewalDto {
  @IsEnum(SubscriptionRenewalMode)
  mode!: SubscriptionRenewalMode;
}

export class PlatformEntitlementLimitDto {
  @IsIn(PLATFORM_ENTITLEMENT_KEYS)
  key!: (typeof PLATFORM_ENTITLEMENT_KEYS)[number];

  @ValidateIf((_object, value) => value !== null)
  @Type(() => Number)
  @IsInt()
  @Min(0)
  value!: number | null;

  @IsIn(['hard', 'soft'])
  mode!: 'hard' | 'soft';
}

export class PlatformEntitlementContractDto {
  @Type(() => Number)
  @Equals(1)
  schemaVersion!: 1;

  @IsIn(['club_owner', 'coach'])
  audience!: 'club_owner' | 'coach';

  @IsArray()
  @ArrayMaxSize(100)
  @IsString({ each: true })
  capabilities!: string[];

  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => PlatformEntitlementLimitDto)
  limits!: PlatformEntitlementLimitDto[];

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(30)
  graceDays!: number;
}

// ── Club membership plans ─────────────────────────────────────────────────

export class CreateMembershipPlanDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsEnum(MembershipPlanKind)
  kind!: MembershipPlanKind;

  @ValidateNested()
  @Type(() => MembershipPlanPricingDto)
  pricing!: MembershipPlanPricingDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => MembershipPlanRulesDto)
  rules?: MembershipPlanRulesDto;

  @ValidateIf(
    (o: CreateMembershipPlanDto) => o.kind === MembershipPlanKind.DURATION,
  )
  @Type(() => Number)
  @IsInt()
  @Min(1)
  durationDays?: number;

  @ValidateIf(
    (o: CreateMembershipPlanDto) => o.kind === MembershipPlanKind.SESSIONS,
  )
  @Type(() => Number)
  @IsInt()
  @Min(1)
  sessionsTotal?: number;

  @ValidateIf(
    (o: CreateMembershipPlanDto) => o.kind === MembershipPlanKind.ENTRIES,
  )
  @Type(() => Number)
  @IsInt()
  @Min(1)
  entriesTotal?: number;

  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;

  @IsOptional()
  @IsEnum(PublishStatus)
  publishStatus?: PublishStatus;
}

export class UpdateMembershipPlanDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => MembershipPlanPricingDto)
  pricing?: MembershipPlanPricingDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => MembershipPlanRulesDto)
  rules?: MembershipPlanRulesDto;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  durationDays?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  sessionsTotal?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  entriesTotal?: number;

  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;

  @IsOptional()
  @IsEnum(PublishStatus)
  publishStatus?: PublishStatus;
}

export class ListMembershipPlansQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;

  @IsOptional()
  @IsEnum(PublishStatus)
  publishStatus?: PublishStatus;

  @IsOptional()
  @IsEnum(MembershipPlanKind)
  kind?: MembershipPlanKind;
}

// ── Club memberships ──────────────────────────────────────────────────────

export class SellMembershipDto {
  @IsMongoId()
  planId!: string;

  @ValidateNested()
  @Type(() => MembershipHolderDto)
  holder!: MembershipHolderDto;

  @IsOptional()
  @IsMongoId()
  paymentId?: string;

  /** Desk payment channel when creating Ledger on sell (default cash). */
  @IsOptional()
  @IsEnum(PaymentChannel)
  channel?: PaymentChannel;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  idempotencyKey?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  couponCode?: string;

  /** Amount collected now. Omit for a fully-paid sale. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  paidAmount?: number;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  externalRef?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => MembershipPaymentTenderDto)
  tenders?: MembershipPaymentTenderDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => MembershipDebtDto)
  debt?: MembershipDebtDto;
}

/** Server-authoritative price/effect preview for renewing the current plan. */
export class PreviewMembershipRenewalDto {
  @IsOptional()
  @IsString()
  @MaxLength(40)
  couponCode?: string;
}

/** Confirm a renewal against an unchanged preview and explicit consent copy. */
export class RenewMembershipDto extends PreviewMembershipRenewalDto {
  @IsString()
  @MinLength(8)
  @MaxLength(200)
  idempotencyKey!: string;

  @IsString()
  @Length(64, 64)
  previewFingerprint!: string;

  @IsString()
  @Equals('membership-renewal-v1')
  consentVersion!: 'membership-renewal-v1';

  @IsBoolean()
  @Equals(true)
  consentAccepted!: true;

  @IsOptional()
  @IsEnum(PaymentChannel)
  channel?: PaymentChannel;

  /** Amount collected now. Omit for a fully-paid renewal. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  paidAmount?: number;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  externalRef?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => MembershipPaymentTenderDto)
  tenders?: MembershipPaymentTenderDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => MembershipDebtDto)
  debt?: MembershipDebtDto;
}

export class PreviewMembershipCheckoutDto {
  @IsMongoId()
  clubId!: string;

  @IsMongoId()
  planId!: string;

  @IsOptional()
  @IsMongoId()
  membershipId?: string;
}

/** Initiate a persisted athlete checkout; membershipId selects renewal mode. */
export class InitiateMembershipCheckoutDto extends PreviewMembershipCheckoutDto {
  @IsString()
  @MinLength(8)
  @MaxLength(200)
  idempotencyKey!: string;

  @IsString()
  @Length(64, 64)
  previewFingerprint!: string;

  @IsString()
  @MaxLength(64)
  consentVersion!: string;

  @IsBoolean()
  @Equals(true)
  consentAccepted!: true;

  @IsString()
  @MaxLength(1000)
  callbackUrl!: string;
}

export class VerifyMembershipCheckoutDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  authority!: string;

  @IsIn(['OK', 'NOK'])
  status!: 'OK' | 'NOK';
}

export class ImportMembershipRowDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  rowKey!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @IsString()
  @MinLength(5)
  @MaxLength(32)
  phone!: string;

  @IsOptional()
  @IsMongoId()
  planId?: string;
}

export class ImportMembershipsDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  batchKey!: string;

  @IsOptional()
  @IsMongoId()
  defaultPlanId?: string;

  @IsOptional()
  @IsBoolean()
  dryRun?: boolean;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => ImportMembershipRowDto)
  rows!: ImportMembershipRowDto[];
}

export class FreezeMembershipDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;

  @IsOptional()
  @IsDateString()
  unfreezeAt?: string;
}

export class UnfreezeMembershipDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class TransferMembershipDto {
  @ValidateNested()
  @Type(() => MembershipHolderDto)
  toHolder!: MembershipHolderDto;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class CancelMembershipDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class ConsumeMembershipCreditDto {
  /** Defaults to sessions for sessions plans, entries for entries plans. */
  @IsOptional()
  @IsEnum(MembershipPlanKind)
  creditKind?: MembershipPlanKind.SESSIONS | MembershipPlanKind.ENTRIES;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  amount?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class ListClubMembershipsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(MembershipStatus)
  status?: MembershipStatus;

  @IsOptional()
  @IsMongoId()
  planId?: string;

  @IsOptional()
  @IsMongoId()
  holderUserId?: string;
}

export class ListMyMembershipsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(MembershipStatus)
  status?: MembershipStatus;

  @IsOptional()
  @IsMongoId()
  clubId?: string;
}

// ── Platform plans / subscriptions ────────────────────────────────────────

export class CreatePlatformPlanDto {
  @IsString()
  @MinLength(2)
  @MaxLength(64)
  code!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ValidateNested()
  @Type(() => PlatformPlanPricingDto)
  pricing!: PlatformPlanPricingDto;

  @IsOptional()
  @IsString({ each: true })
  features?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => PlatformEntitlementContractDto)
  entitlementContract?: PlatformEntitlementContractDto;

  @IsOptional()
  @IsBoolean()
  contractReady?: boolean;

  @IsOptional()
  @IsIn(['free_plan', 'read_only'])
  postExpirationMode?: 'free_plan' | 'read_only';

  @IsOptional()
  @IsMongoId()
  fallbackPlanId?: string;

  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;
}

export class UpdatePlatformPlanDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PlatformPlanPricingDto)
  pricing?: PlatformPlanPricingDto;

  @IsOptional()
  @IsString({ each: true })
  features?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => PlatformEntitlementContractDto)
  entitlementContract?: PlatformEntitlementContractDto;

  @IsOptional()
  @IsBoolean()
  contractReady?: boolean;

  @IsOptional()
  @IsIn(['free_plan', 'read_only'])
  postExpirationMode?: 'free_plan' | 'read_only';

  @IsOptional()
  @IsMongoId()
  fallbackPlanId?: string;

  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;
}

export class ListPlatformPlansQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Transform(toStringArray)
  @IsArray()
  @IsEnum(EntityStatus, { each: true })
  status?: EntityStatus[];
}

export class ListPlatformSubscriptionsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Transform(toStringArray)
  @IsArray()
  @IsEnum(PlatformSubscriptionStatus, { each: true })
  status?: PlatformSubscriptionStatus[];

  @IsOptional()
  @IsMongoId()
  userId?: string;

  @IsOptional()
  @IsMongoId()
  planId?: string;
}

export class SubscribePlatformDto {
  @IsMongoId()
  planId!: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => SubscriptionRenewalDto)
  renewal?: SubscriptionRenewalDto;
}

export class PreviewPlatformSubscriptionCheckoutDto {
  @IsMongoId()
  planId!: string;

  @IsOptional()
  @IsEnum(SubscriptionRenewalMode)
  renewalMode?: SubscriptionRenewalMode;

  @IsOptional()
  @IsDateString()
  priceReferenceAt?: string;
}

export class InitiatePlatformSubscriptionCheckoutDto extends PreviewPlatformSubscriptionCheckoutDto {
  @IsString()
  @MinLength(8)
  @MaxLength(200)
  idempotencyKey!: string;

  @IsString()
  @Length(64, 64)
  previewFingerprint!: string;

  @IsString()
  @MaxLength(64)
  consentVersion!: string;

  @IsBoolean()
  @Equals(true)
  consentAccepted!: true;

  @IsString()
  @MaxLength(1000)
  callbackUrl!: string;
}

export class VerifyPlatformSubscriptionCheckoutDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  authority!: string;

  @IsIn(['OK', 'NOK'])
  status!: 'OK' | 'NOK';
}

export class CancelPlatformSubscriptionDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class SchedulePlatformPlanChangeDto {
  @IsMongoId()
  planId!: string;
}

/** Self-purchase: athlete buys an active published plan for themselves. */
export class SelfPurchaseMembershipDto {
  @IsMongoId()
  planId!: string;

  @IsMongoId()
  clubId!: string;

  @IsOptional()
  @IsMongoId()
  paymentId?: string;

  @IsOptional()
  @IsEnum(PaymentChannel)
  channel?: PaymentChannel;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  idempotencyKey?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  couponCode?: string;
}

export class MembershipReasonDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason?: string;
}

import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import {
  EntityStatus,
  MembershipPlanKind,
  MembershipStatus,
  MembershipTransferPolicy,
  PlatformSubscriptionStatus,
  PublishStatus,
  SubscriptionRenewalMode,
} from '../../../common/enums';

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  page_size?: number;
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

  @ValidateIf((o: CreateMembershipPlanDto) => o.kind === MembershipPlanKind.DURATION)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  durationDays?: number;

  @ValidateIf((o: CreateMembershipPlanDto) => o.kind === MembershipPlanKind.SESSIONS)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  sessionsTotal?: number;

  @ValidateIf((o: CreateMembershipPlanDto) => o.kind === MembershipPlanKind.ENTRIES)
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
  @IsEnum(EntityStatus)
  status?: EntityStatus;
}

export class ListPlatformPlansQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;
}

export class ListPlatformSubscriptionsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(PlatformSubscriptionStatus)
  status?: PlatformSubscriptionStatus;

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

export class CancelPlatformSubscriptionDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
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
}

export class MembershipReasonDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason?: string;
}

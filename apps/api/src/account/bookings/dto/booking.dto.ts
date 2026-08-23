import { Transform, Type } from 'class-transformer';
import { OmitType } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  MaxLength,
  MinLength,
  Min,
  ValidateNested,
  ValidateIf,
} from 'class-validator';
import {
  BookingResourceType,
  BookingStatus,
  ConsultationKind,
  PaymentRefundMethod,
} from '../../../common/enums';
import { PaginationQueryDto } from '../../../basics/dto/common.dto';
import { toStringArray } from '../../../common/utils/list-query.util';
import { IR_PHONE, normalizeIranPhone } from '../../../common/utils/phone.util';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export class BookingIntakeDto {
  @IsOptional()
  @IsString()
  @MaxLength(300)
  note?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  medicalConditionKeys?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  supplementKeys?: string[];
}

export class CreateBookingDto {
  @IsMongoId()
  coachUserId!: string;

  @IsMongoId()
  slotId!: string;

  @IsEnum(ConsultationKind)
  consultationKind!: ConsultationKind;

  @IsOptional()
  @ValidateNested()
  @Type(() => BookingIntakeDto)
  intake?: BookingIntakeDto;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  couponCode?: string;

  @IsString()
  @MinLength(8)
  @MaxLength(200)
  idempotencyKey!: string;
}

export class CreateClubBookingDto {
  @IsMongoId()
  clubId!: string;

  /** ClubSlot (session / class / space) to reserve occurrences of. */
  @IsMongoId()
  slotId!: string;

  /**
   * Occurrence dates (YYYY-MM-DD). More than one date books a recurring
   * series sharing one `recurringGroupId`.
   */
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(13)
  @IsString({ each: true })
  @Matches(DATE_RE, { each: true })
  dates!: string[];

  /** Seats reserved against occurrence capacity (multi-person booking). */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  attendeeCount?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => BookingIntakeDto)
  intake?: BookingIntakeDto;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  couponCode?: string;

  @IsString()
  @MinLength(8)
  @MaxLength(200)
  idempotencyKey!: string;
}

export class DeskBookingGuestDto {
  @IsString()
  @MaxLength(120)
  name!: string;

  @Transform(({ value }) => normalizeIranPhone(value))
  @IsString()
  @Matches(IR_PHONE)
  phone!: string;
}

export class DeskBookingHolderDto {
  @ValidateIf(
    (holder: DeskBookingHolderDto) => !holder.guest && !holder.memberPhone,
  )
  @IsMongoId()
  userId?: string;

  @ValidateIf(
    (holder: DeskBookingHolderDto) => !holder.userId && !holder.memberPhone,
  )
  @ValidateNested()
  @Type(() => DeskBookingGuestDto)
  guest?: DeskBookingGuestDto;

  @ValidateIf((holder: DeskBookingHolderDto) => !holder.userId && !holder.guest)
  @Transform(({ value }) => normalizeIranPhone(value))
  @IsString()
  @Matches(IR_PHONE)
  memberPhone?: string;
}

export class CreateDeskClubBookingDto extends OmitType(CreateClubBookingDto, [
  'clubId',
] as const) {
  @ValidateNested()
  @Type(() => DeskBookingHolderDto)
  holder!: DeskBookingHolderDto;

  @IsString()
  @MinLength(8)
  @MaxLength(200)
  idempotencyKey!: string;
}

export class CancelBookingSeriesDto {
  /** Cancel occurrences on/after this date (YYYY-MM-DD); default = today. */
  @IsOptional()
  @IsString()
  @Matches(DATE_RE)
  fromDate?: string;

  /** RefItem slug from `cancellation_reason`. */
  @IsOptional()
  @IsString()
  @MaxLength(80)
  reasonKey?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  note?: string;
}

export class PayBookingDto {
  /** Where the gateway should send the payer back (mobile deep link / page URL). */
  @IsUrl({ require_tld: false })
  callbackUrl!: string;
}

export class VerifyBookingPaymentDto {
  @IsString()
  @MaxLength(120)
  authority!: string;

  /** Gateway callback status — `OK` or `NOK` (Zarinpal convention). */
  @IsIn(['OK', 'NOK'])
  status!: 'OK' | 'NOK';
}

export class RescheduleBookingDto {
  /** Coach bookings: target open CoachSlot. Club bookings: optional other ClubSlot. */
  @IsOptional()
  @IsMongoId()
  slotId?: string;

  /** Club bookings: target occurrence date (YYYY-MM-DD). */
  @IsOptional()
  @IsString()
  @Matches(DATE_RE)
  date?: string;
}

export class CancelBookingDto {
  /** RefItem slug from `cancellation_reason`. */
  @IsOptional()
  @IsString()
  @MaxLength(80)
  reasonKey?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  note?: string;
}

export class SettleBookingRefundDto {
  /** Omitted = gateway reverse for eligible full PSP payments, wallet otherwise. */
  @IsOptional()
  @IsEnum(PaymentRefundMethod)
  method?: PaymentRefundMethod;
}

export class ListBookingsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page_size?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  /** UI bucket filter — upcoming | past | cancelled. */
  @IsOptional()
  @IsIn(['upcoming', 'past', 'cancelled'])
  bucket?: 'upcoming' | 'past' | 'cancelled';

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsEnum(BookingResourceType)
  resource_type?: BookingResourceType;
}

export class AdminListBookingsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Transform(toStringArray)
  @IsEnum(BookingStatus, { each: true })
  status?: BookingStatus[];

  /** UI bucket filter — upcoming | past | cancelled. */
  @IsOptional()
  @IsIn(['upcoming', 'past', 'cancelled'])
  bucket?: 'upcoming' | 'past' | 'cancelled';

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsEnum(BookingResourceType)
  resource_type?: BookingResourceType;

  @IsOptional()
  @IsMongoId()
  athleteId?: string;

  @IsOptional()
  @IsMongoId()
  coachUserId?: string;

  @IsOptional()
  @IsMongoId()
  clubId?: string;
}

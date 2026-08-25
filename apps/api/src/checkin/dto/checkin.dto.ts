import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { CheckInMethod } from '../../common/enums';
import { CheckinOfflineResolutionAction } from '../../schemas/checkin-offline-reconciliation.schema';
import { PaginationQueryDto } from '../../basics/dto/common.dto';

export class CheckInByBookingCodeDto {
  @IsString()
  @MaxLength(40)
  code!: string;

  @IsOptional()
  @IsEnum(CheckInMethod)
  method?: CheckInMethod;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  clientIdempotencyKey?: string;

  @IsOptional()
  @IsDateString()
  occurredAt?: string;
}

export class CheckInByMembershipDto {
  @IsMongoId()
  membershipId!: string;

  @IsMongoId()
  userId!: string;

  @IsOptional()
  @IsEnum(CheckInMethod)
  method?: CheckInMethod;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  clientIdempotencyKey?: string;

  @IsOptional()
  @IsDateString()
  occurredAt?: string;
}

export class OfflineCheckInItemDto {
  @IsString()
  @MaxLength(120)
  clientIdempotencyKey!: string;

  @IsEnum(CheckInMethod)
  method!: CheckInMethod;

  @IsDateString()
  occurredAt!: string;

  @IsInt()
  @Min(1)
  sequence!: number;

  @IsString()
  @MinLength(16)
  @MaxLength(120)
  nonce!: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  bookingCode?: string;

  @IsOptional()
  @IsMongoId()
  membershipId?: string;

  @IsOptional()
  @IsMongoId()
  userId?: string;
}

export class SyncOfflineBatchDto {
  @IsString()
  @MinLength(32)
  @MaxLength(4096)
  snapshotToken!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => OfflineCheckInItemDto)
  items!: OfflineCheckInItemDto[];
}

export class IssueOfflineSnapshotDto {
  @IsMongoId()
  deviceId!: string;
}

export class ListOfflineReconciliationsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(['processing', 'accepted', 'review', 'rejected', 'dismissed'])
  status?: 'processing' | 'accepted' | 'review' | 'rejected' | 'dismissed';
}

export class ResolveOfflineReconciliationDto {
  @IsEnum(CheckinOfflineResolutionAction)
  action!: CheckinOfflineResolutionAction;

  @IsString()
  @MinLength(3)
  @MaxLength(500)
  reason!: string;

  @IsString()
  @MinLength(16)
  @MaxLength(120)
  clientMutationId!: string;
}

export class ListCheckInsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsMongoId()
  userId?: string;

  @IsOptional()
  @IsMongoId()
  bookingId?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}

export class ProvisionCheckinDeviceDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  provider?: string;
}

export class HardwareCheckinEventDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  externalEventId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  bookingCode?: string;

  @IsOptional()
  @IsMongoId()
  membershipId?: string;

  @IsOptional()
  @IsMongoId()
  userId?: string;

  @IsOptional()
  @IsEnum(CheckInMethod)
  method?: CheckInMethod;

  @IsOptional()
  @IsDateString()
  occurredAt?: string;
}

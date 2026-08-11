import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { CalendarResourceType } from '../../common/enums';
import { PaginationQueryDto } from '../../basics/dto/common.dto';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export class WaitlistResourceDto {
  @IsEnum(CalendarResourceType)
  type!: CalendarResourceType;

  @IsMongoId()
  id!: string;
}

export class JoinWaitlistDto {
  @ValidateNested()
  @Type(() => WaitlistResourceDto)
  resource!: WaitlistResourceDto;

  @IsOptional()
  @IsMongoId()
  clubId?: string;

  @IsOptional()
  @IsString()
  @Matches(DATE_RE)
  occurrenceDate?: string;
}

export class OfferWaitlistDto {
  /** Seconds until the offer expires. Default 900 (15m). */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(60)
  @Max(86_400)
  offerTtlSeconds?: number;

  /** How many waiting entries to offer (FIFO by priority). Default 1. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  count?: number;
}

export class ClaimWaitlistDto {
  @IsMongoId()
  entryId!: string;
}

export class ListWaitlistQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(CalendarResourceType)
  resourceType?: CalendarResourceType;

  @IsOptional()
  @IsMongoId()
  resourceId?: string;

  @IsOptional()
  @IsString()
  @Matches(DATE_RE)
  occurrenceDate?: string;
}

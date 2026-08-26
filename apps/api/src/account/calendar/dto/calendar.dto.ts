import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import {
  CalendarBlockReason,
  CalendarResourceType,
  EntityStatus,
} from '../../../common/enums';
import { PaginationQueryDto } from '../../../basics/dto/common.dto';

export class CalendarResourceDto {
  @IsEnum(CalendarResourceType)
  type!: CalendarResourceType;

  @IsMongoId()
  id!: string;
}

export class CalendarBlockWindowDto {
  @IsDateString()
  from!: string;

  @IsDateString()
  to!: string;
}

export class UpsertCalendarBlockDto {
  @IsOptional()
  @IsMongoId()
  id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  clientMutationId?: string;

  @ValidateNested()
  @Type(() => CalendarResourceDto)
  resource!: CalendarResourceDto;

  @IsEnum(CalendarBlockReason)
  reason!: CalendarBlockReason;

  @ValidateNested()
  @Type(() => CalendarBlockWindowDto)
  window!: CalendarBlockWindowDto;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;
}

export class ListCalendarBlocksQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(CalendarResourceType)
  resourceType?: CalendarResourceType;

  @IsOptional()
  @IsMongoId()
  resourceId?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;
}

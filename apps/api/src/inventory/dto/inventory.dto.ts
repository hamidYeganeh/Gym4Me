import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import {
  ClubInventoryCondition,
  ClubInventoryStatus,
} from '../../schemas/club-inventory-item.schema';

export class ListInventoryQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  page_size?: number;

  @IsOptional()
  @IsEnum(ClubInventoryCondition)
  condition?: ClubInventoryCondition;

  @IsOptional()
  @IsEnum(ClubInventoryStatus)
  status?: ClubInventoryStatus;
}

export class CreateInventoryItemDto {
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  name!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100_000)
  quantity!: number;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  locationLabel?: string;

  @IsOptional()
  @IsEnum(ClubInventoryCondition)
  condition?: ClubInventoryCondition;

  @IsOptional()
  @IsDateString()
  nextServiceAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  maintenanceNote?: string;

  @IsString()
  @MinLength(8)
  @MaxLength(120)
  idempotencyKey!: string;
}

export class UpdateInventoryItemDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  expectedVersion!: number;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  name?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100_000)
  quantity?: number;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  locationLabel?: string;

  @IsOptional()
  @IsEnum(ClubInventoryCondition)
  condition?: ClubInventoryCondition;

  @IsOptional()
  @ValidateIf((_object, value: unknown) => value !== null)
  @IsDateString()
  nextServiceAt?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  maintenanceNote?: string;
}

export class ArchiveInventoryItemQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  expectedVersion!: number;
}

import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { PaginationQueryDto as CommonPaginationQueryDto } from '../../basics/dto/common.dto';
import {
  FoodItemStatus,
  MealAdherenceStatus,
  MealPlanStatus,
  Privacy,
} from '../../common/enums';
import { toStringArray } from '../../common/utils/list-query.util';

export class PaginationQueryDto extends CommonPaginationQueryDto {}

export class MealPlanItemDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  calories?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  proteinG?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  carbsG?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  fatG?: number;

  @IsOptional()
  @IsMongoId()
  foodItemId?: string;
}

export class MealPlanMealDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MealPlanItemDto)
  items!: MealPlanItemDto[];
}

export class MealPlanDayDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  dayIndex!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MealPlanMealDto)
  meals!: MealPlanMealDto[];
}

export class CreateMealPlanDto {
  /** Required when coach creates a plan for an athlete. */
  @IsOptional()
  @IsMongoId()
  athleteUserId?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsEnum(MealPlanStatus)
  status?: MealPlanStatus;

  @IsOptional()
  @IsEnum(Privacy)
  privacy?: Privacy;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MealPlanDayDto)
  days?: MealPlanDayDto[];
}

export class UpdateMealPlanDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsEnum(MealPlanStatus)
  status?: MealPlanStatus;

  @IsOptional()
  @IsEnum(Privacy)
  privacy?: Privacy;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MealPlanDayDto)
  days?: MealPlanDayDto[];
}

export class ListMealPlansQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(MealPlanStatus)
  status?: MealPlanStatus;

  @IsOptional()
  @IsMongoId()
  athleteUserId?: string;
}

// ── Food bank ─────────────────────────────────────────────────────────────

export class FoodItemMacrosDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  calories?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  proteinG?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  carbsG?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  fatG?: number;
}

export class CreateFoodItemDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  categoryKey?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => FoodItemMacrosDto)
  macros?: FoodItemMacrosDto;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  servingLabel?: string;

  @IsOptional()
  @IsEnum(FoodItemStatus)
  status?: FoodItemStatus;
}

export class UpdateFoodItemDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  categoryKey?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => FoodItemMacrosDto)
  macros?: FoodItemMacrosDto;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  servingLabel?: string;

  @IsOptional()
  @IsEnum(FoodItemStatus)
  status?: FoodItemStatus;
}

export class ListFoodItemsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(FoodItemStatus)
  status?: FoodItemStatus;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}

export class AdminListFoodItemsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Transform(toStringArray)
  @IsArray()
  @IsEnum(FoodItemStatus, { each: true })
  status?: FoodItemStatus[];
}

// ── Meal adherence ────────────────────────────────────────────────────────

export class MealAdherenceSlotDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  dayIndex!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  mealIndex!: number;
}

export class CreateMealAdherenceDto {
  @IsMongoId()
  mealPlanId!: string;

  @ValidateNested()
  @Type(() => MealAdherenceSlotDto)
  slot!: MealAdherenceSlotDto;

  @IsEnum(MealAdherenceStatus)
  status!: MealAdherenceStatus;

  @IsOptional()
  @IsDateString()
  loggedAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class ListMealAdherenceQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsMongoId()
  mealPlanId?: string;
}

import { Type } from 'class-transformer';
import {
  IsArray,
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
import { MealPlanStatus, Privacy } from '../../common/enums';

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

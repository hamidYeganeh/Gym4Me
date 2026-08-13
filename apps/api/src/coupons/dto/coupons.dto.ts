import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { EntityStatus } from '../../common/enums';
import { toStringArray } from '../../common/utils/list-query.util';
import { CouponDiscountType } from '../../schemas/coupon.schema';

export class CouponDiscountDto {
  @IsEnum(CouponDiscountType)
  type!: CouponDiscountType;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  value!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxAmount?: number;
}

export class CouponConstraintsDto {
  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxRedemptions?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  maxPerUser?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minAmount?: number;
}

export class CreateCouponDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  @Matches(/^[A-Za-z0-9_-]+$/)
  code!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsMongoId()
  clubId?: string;

  @ValidateNested()
  @Type(() => CouponDiscountDto)
  discount!: CouponDiscountDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CouponConstraintsDto)
  constraints?: CouponConstraintsDto;

  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;
}

export class UpdateCouponDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CouponDiscountDto)
  discount?: CouponDiscountDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CouponConstraintsDto)
  constraints?: CouponConstraintsDto;

  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;
}

export class ListCouponsQueryDto {
  @IsOptional()
  @Transform(toStringArray)
  @IsArray()
  @IsEnum(EntityStatus, { each: true })
  status?: EntityStatus[];

  @IsOptional()
  @IsMongoId()
  clubId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  search?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  sortBy?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}

export class PreviewCouponDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  code!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount!: number;

  @IsOptional()
  @IsMongoId()
  clubId?: string;
}

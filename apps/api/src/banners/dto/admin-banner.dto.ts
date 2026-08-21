import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
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
import { PaginationQueryDto } from '../../admin/dto/admin.dto';
import {
  BannerAspectRatio,
  BannerLinkKind,
  BannerOverlayPlacement,
  BannerPlacement,
  BannerRadius,
  PublishStatus,
} from '../../common/enums';
import { toStringArray } from '../../common/utils/list-query.util';

export class BannerSlideTitleDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  text!: string;

  @IsOptional()
  @IsEnum(BannerOverlayPlacement)
  placement?: BannerOverlayPlacement;
}

export class BannerSlideActionDto {
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  label!: string;

  @IsOptional()
  @IsEnum(BannerOverlayPlacement)
  placement?: BannerOverlayPlacement;
}

export class BannerSlideDto {
  @IsMongoId()
  mediaId!: string;

  @IsOptional()
  @IsEnum(BannerLinkKind)
  linkKind?: BannerLinkKind;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  linkUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  alt?: string;

  @IsOptional()
  @IsEnum(BannerAspectRatio)
  ratio?: BannerAspectRatio;

  @IsOptional()
  @IsEnum(BannerRadius)
  radius?: BannerRadius;

  @IsOptional()
  @IsBoolean()
  gradient?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => BannerSlideTitleDto)
  title?: BannerSlideTitleDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => BannerSlideActionDto)
  action?: BannerSlideActionDto;
}

export class BannerScheduleDto {
  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @IsOptional()
  @IsDateString()
  endsAt?: string;
}

export class CreateBannerDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title!: string;

  @IsEnum(BannerPlacement)
  placement!: BannerPlacement;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => BannerSlideDto)
  slides!: BannerSlideDto[];

  @IsOptional()
  @IsEnum(PublishStatus)
  publishStatus?: PublishStatus;

  @IsOptional()
  @ValidateNested()
  @Type(() => BannerScheduleDto)
  schedule?: BannerScheduleDto;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}

export class UpdateBannerDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsEnum(BannerPlacement)
  placement?: BannerPlacement;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => BannerSlideDto)
  slides?: BannerSlideDto[];

  @IsOptional()
  @IsEnum(PublishStatus)
  publishStatus?: PublishStatus;

  @IsOptional()
  @ValidateNested()
  @Type(() => BannerScheduleDto)
  schedule?: BannerScheduleDto;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}

export class AdminListBannersQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Transform(toStringArray)
  @IsArray()
  @IsEnum(BannerPlacement, { each: true })
  placement?: BannerPlacement[];

  @IsOptional()
  @Transform(toStringArray)
  @IsArray()
  @IsEnum(PublishStatus, { each: true })
  publishStatus?: PublishStatus[];
}

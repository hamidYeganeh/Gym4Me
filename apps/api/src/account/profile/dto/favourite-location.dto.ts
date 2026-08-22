import { Type } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { FavouriteLocationKind } from '../../../common/enums';
import { UpdateAddressDto } from './update-me.dto';

export class CreateFavouriteLocationDto {
  @IsEnum(FavouriteLocationKind)
  kind!: FavouriteLocationKind;

  @ValidateIf(
    (dto: CreateFavouriteLocationDto) =>
      dto.kind === FavouriteLocationKind.OTHER || dto.label !== undefined,
  )
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  label?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateAddressDto)
  address?: UpdateAddressDto;
}

export class UpdateFavouriteLocationDto {
  @IsOptional()
  @IsEnum(FavouriteLocationKind)
  kind?: FavouriteLocationKind;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  label?: string | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateAddressDto)
  address?: UpdateAddressDto;
}

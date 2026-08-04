import { Type } from 'class-transformer';
import {
  IsArray,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class ClubIdentityCreateDto {
  @IsString()
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  description?: string;

  @IsOptional()
  @IsMongoId()
  coverMediaId?: string | null;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  galleryMediaIds?: string[];
}

export class ClubIdentityUpdateDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  description?: string;

  @IsOptional()
  @IsMongoId()
  coverMediaId?: string | null;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  galleryMediaIds?: string[];
}

export class ClubContactDto {
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  website?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  instagram?: string;
}

export class ClubAddressDto {
  @IsOptional()
  @IsMongoId()
  cityId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  line?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;
}

export class CreateClubDto {
  @ValidateNested()
  @Type(() => ClubIdentityCreateDto)
  identity!: ClubIdentityCreateDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ClubContactDto)
  contact?: ClubContactDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ClubAddressDto)
  address?: ClubAddressDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenityKeys?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sportIds?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  rules?: string;
}

export class UpdateClubDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => ClubIdentityUpdateDto)
  identity?: ClubIdentityUpdateDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ClubContactDto)
  contact?: ClubContactDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ClubAddressDto)
  address?: ClubAddressDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenityKeys?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sportIds?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  rules?: string;
}

export class SubmitClubReviewDto {
  @IsArray()
  @IsMongoId({ each: true })
  documentMediaIds!: string[];

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

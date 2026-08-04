import {
  IsOptional,
  IsString,
  IsISO8601,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TouchPointDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  source?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  medium?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  campaign?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  content?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  term?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  referrer?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  landingPage?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  referralCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  deepLink?: string;

  @IsOptional()
  @IsISO8601()
  capturedAt?: string;
}

export class CaptureAttributionDto {
  @ValidateNested()
  @Type(() => TouchPointDto)
  touch!: TouchPointDto;
}

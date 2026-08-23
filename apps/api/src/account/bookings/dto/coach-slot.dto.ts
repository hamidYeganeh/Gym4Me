import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsMongoId,
  IsInt,
  Max,
  Min,
  IsOptional,
  ValidateNested,
} from 'class-validator';

export class CoachSlotInputDto {
  @IsDateString()
  startsAt!: string;

  @IsDateString()
  endsAt!: string;

  /** In-person venue — must be a club the coach is affiliated with. */
  @IsOptional()
  @IsMongoId()
  clubId?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(240)
  bufferBeforeMinutes?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(240)
  bufferAfterMinutes?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(240)
  travelBufferMinutes?: number;
}

export class CreateCoachSlotsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => CoachSlotInputDto)
  slots!: CoachSlotInputDto[];
}

export class CoachSlotsRangeQueryDto {
  @IsDateString()
  from!: string;

  @IsDateString()
  to!: string;
}

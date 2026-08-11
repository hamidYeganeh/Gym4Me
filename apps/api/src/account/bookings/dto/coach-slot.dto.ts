import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsMongoId,
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

import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import {
  EntityStatus,
  SlotExceptionStatus,
  SlotKind,
  SlotRecurrenceType,
} from '../../../common/enums';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export class ClubClassMediaDto {
  @IsOptional()
  @IsMongoId()
  coverMediaId?: string | null;
}

export class CreateClubClassDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  description?: string;

  @IsOptional()
  @IsMongoId()
  sportId?: string | null;

  @IsOptional()
  @IsMongoId()
  coachId?: string | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => ClubClassMediaDto)
  media?: ClubClassMediaDto;

  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;
}

export class UpdateClubClassDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  description?: string | null;

  @IsOptional()
  @IsMongoId()
  sportId?: string | null;

  @IsOptional()
  @IsMongoId()
  coachId?: string | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => ClubClassMediaDto)
  media?: ClubClassMediaDto;

  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;
}

export class SlotRecurrenceDto {
  @IsEnum(SlotRecurrenceType)
  type!: SlotRecurrenceType;

  @ValidateIf((o: SlotRecurrenceDto) => o.type === SlotRecurrenceType.WEEKLY)
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(6)
  weekday?: number;

  @ValidateIf((o: SlotRecurrenceDto) => o.type === SlotRecurrenceType.ONCE)
  @IsString()
  @Matches(DATE_RE)
  date?: string;

  @IsString()
  @Matches(TIME_RE)
  startTime!: string;

  @IsString()
  @Matches(TIME_RE)
  endTime!: string;

  @ValidateIf((o: SlotRecurrenceDto) => o.type === SlotRecurrenceType.WEEKLY)
  @IsString()
  @Matches(DATE_RE)
  startsOn?: string;

  @IsOptional()
  @IsString()
  @Matches(DATE_RE)
  endsOn?: string;
}

export class SlotExceptionDto {
  @IsString()
  @Matches(DATE_RE)
  date!: string;

  @IsOptional()
  @IsEnum(SlotExceptionStatus)
  status?: SlotExceptionStatus;
}

export class SlotScheduleDto {
  @ValidateNested()
  @Type(() => SlotRecurrenceDto)
  recurrence!: SlotRecurrenceDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SlotExceptionDto)
  exceptions?: SlotExceptionDto[];
}

export class CreateClubSlotDto {
  @IsEnum(SlotKind)
  kind!: SlotKind;

  @ValidateIf((o: CreateClubSlotDto) => o.kind === SlotKind.CLASS)
  @IsMongoId()
  classId?: string;

  @IsOptional()
  @IsMongoId()
  coachId?: string | null;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10_000)
  capacity!: number;

  @ValidateNested()
  @Type(() => SlotScheduleDto)
  schedule!: SlotScheduleDto;

  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;
}

export class UpdateClubSlotDto {
  @IsOptional()
  @IsEnum(SlotKind)
  kind?: SlotKind;

  @IsOptional()
  @IsMongoId()
  classId?: string | null;

  @IsOptional()
  @IsMongoId()
  coachId?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10_000)
  capacity?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => SlotScheduleDto)
  schedule?: SlotScheduleDto;

  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;
}

export class CancelSlotOccurrenceDto {
  @IsString()
  @Matches(DATE_RE)
  date!: string;
}

export class ClubCalendarQueryDto {
  @IsString()
  @Matches(DATE_RE)
  from!: string;

  @IsString()
  @Matches(DATE_RE)
  to!: string;
}

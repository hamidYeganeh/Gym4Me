import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { OwnerTaskPriority, OwnerTaskStatus } from '../../common/enums';
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

export class OwnerTaskRelatedDto {
  @IsOptional()
  @IsMongoId()
  membershipId?: string;

  @IsOptional()
  @IsMongoId()
  debtId?: string;

  @IsOptional()
  @IsMongoId()
  bookingId?: string;

  @IsOptional()
  @IsMongoId()
  staffId?: string;
}

export class CreateOwnerTaskDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  body?: string;

  @IsOptional()
  @IsEnum(OwnerTaskPriority)
  priority?: OwnerTaskPriority;

  @IsOptional()
  @IsMongoId()
  assigneeUserId?: string;

  @IsOptional()
  @IsDateString()
  dueAt?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => OwnerTaskRelatedDto)
  related?: OwnerTaskRelatedDto;
}

export class UpdateOwnerTaskStatusDto {
  @IsEnum(OwnerTaskStatus)
  status!: OwnerTaskStatus;
}

export class ListOwnerTasksQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(OwnerTaskStatus)
  status?: OwnerTaskStatus;

  @IsOptional()
  @IsEnum(OwnerTaskPriority)
  priority?: OwnerTaskPriority;
}

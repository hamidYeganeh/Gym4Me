import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import {
  FaqAudience,
  PublishStatus,
  SupportTicketCategory,
  SupportTicketPriority,
  SupportTicketStatus,
} from '../../common/enums';
import { toStringArray } from '../../common/utils/list-query.util';
import { PaginationQueryDto } from '../../admin/dto/admin.dto';

export class AdminListTicketsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Transform(toStringArray)
  @IsArray()
  @IsEnum(SupportTicketStatus, { each: true })
  status?: SupportTicketStatus[];

  @IsOptional()
  @Transform(toStringArray)
  @IsArray()
  @IsEnum(SupportTicketCategory, { each: true })
  category?: SupportTicketCategory[];

  @IsOptional()
  @Transform(toStringArray)
  @IsArray()
  @IsEnum(SupportTicketPriority, { each: true })
  priority?: SupportTicketPriority[];
}

export class AdminUpdateTicketDto {
  @IsOptional()
  @IsEnum(SupportTicketPriority)
  priority?: SupportTicketPriority;

  @IsOptional()
  @IsEnum(SupportTicketStatus)
  status?: SupportTicketStatus;

  /** Required when status becomes `resolved`. */
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  resolutionNote?: string;
}

export class CreateFaqDto {
  @IsString()
  @MinLength(3)
  @MaxLength(300)
  question!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(5000)
  answer!: string;

  @IsOptional()
  @IsEnum(FaqAudience)
  audience?: FaqAudience;

  @IsOptional()
  @IsEnum(PublishStatus)
  publishStatus?: PublishStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  order?: number;
}

export class UpdateFaqDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(300)
  question?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(5000)
  answer?: string;

  @IsOptional()
  @IsEnum(FaqAudience)
  audience?: FaqAudience;

  @IsOptional()
  @IsEnum(PublishStatus)
  publishStatus?: PublishStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  order?: number;
}

export class AdminListFaqQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Transform(toStringArray)
  @IsArray()
  @IsEnum(PublishStatus, { each: true })
  publishStatus?: PublishStatus[];

  @IsOptional()
  @Transform(toStringArray)
  @IsArray()
  @IsEnum(FaqAudience, { each: true })
  audience?: FaqAudience[];
}

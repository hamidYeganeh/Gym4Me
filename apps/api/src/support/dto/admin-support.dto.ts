import { Type } from 'class-transformer';
import {
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
import { PaginationQueryDto } from '../../admin/dto/admin.dto';

export class AdminListTicketsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(SupportTicketStatus)
  status?: SupportTicketStatus;

  @IsOptional()
  @IsEnum(SupportTicketCategory)
  category?: SupportTicketCategory;

  @IsOptional()
  @IsEnum(SupportTicketPriority)
  priority?: SupportTicketPriority;

  /** Matches ticketNumber or subject. */
  @IsOptional()
  @IsString()
  @MaxLength(60)
  search?: string;
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
  @IsEnum(PublishStatus)
  publishStatus?: PublishStatus;

  @IsOptional()
  @IsEnum(FaqAudience)
  audience?: FaqAudience;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  search?: string;
}

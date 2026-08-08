import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import {
  FaqAudience,
  SupportRelatedEntityKind,
  SupportTicketCategory,
  SupportTicketStatus,
} from '../../common/enums';
import { PaginationQueryDto } from '../../admin/dto/admin.dto';

export class RelatedEntityDto {
  @IsEnum(SupportRelatedEntityKind)
  kind!: SupportRelatedEntityKind;

  @IsMongoId()
  id!: string;
}

export class CreateTicketDto {
  @IsEnum(SupportTicketCategory)
  category!: SupportTicketCategory;

  @IsString()
  @MinLength(3)
  @MaxLength(200)
  subject!: string;

  /** First message body of the ticket thread. */
  @IsString()
  @MinLength(3)
  @MaxLength(4000)
  body!: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsMongoId({ each: true })
  attachments?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => RelatedEntityDto)
  relatedEntity?: RelatedEntityDto;
}

export class ReplyTicketDto {
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  body!: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsMongoId({ each: true })
  attachments?: string[];
}

export class ListMyTicketsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(SupportTicketStatus)
  status?: SupportTicketStatus;

  @IsOptional()
  @IsEnum(SupportTicketCategory)
  category?: SupportTicketCategory;
}

export class ListFaqQueryDto {
  @IsOptional()
  @IsEnum(FaqAudience)
  audience?: FaqAudience;
}

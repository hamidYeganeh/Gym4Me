import { IsMongoId, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../../basics/dto/common.dto';

export class DiscoveryClassesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  q?: string;

  @IsOptional()
  @IsMongoId()
  clubId?: string;

  @IsOptional()
  @IsMongoId()
  sportId?: string;

  @IsOptional()
  @IsMongoId()
  coachId?: string;
}

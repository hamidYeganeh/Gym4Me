import { IsMongoId, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../../basics/dto/common.dto';

export class DiscoveryCoachesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  q?: string;

  @IsOptional()
  @IsMongoId()
  sportId?: string;

  @IsOptional()
  @IsMongoId()
  cityId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  specialtyKey?: string;

  /** Choice-group gender key, e.g. male | female. */
  @IsOptional()
  @IsString()
  @MaxLength(40)
  gender?: string;
}

import {
  IsEnum,
  IsIn,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { PaginationQueryDto } from '../../../basics/dto/common.dto';
import { CoachType } from '../../../common/enums';

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
  @IsEnum(CoachType)
  coachType?: CoachType;

  /** Choice-group gender key, e.g. male | female. */
  @IsOptional()
  @IsString()
  @MaxLength(40)
  gender?: string;

  @IsOptional()
  @IsIn(['remote', 'in-person'])
  availability?: 'remote' | 'in-person';

  /** Public list already contains approved profiles only; accepted for URL parity. */
  @IsOptional()
  @IsIn(['1', 'true'])
  verified?: '1' | 'true';

  /** Profiles created during the rolling 30-day discovery window. */
  @IsOptional()
  @IsIn(['1', 'true'])
  fresh?: '1' | 'true';
}

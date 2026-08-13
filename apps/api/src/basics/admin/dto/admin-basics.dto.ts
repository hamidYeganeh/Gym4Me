import { Transform } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { RefStatus } from '../../../common/enums';
import { toStringArray } from '../../../common/utils/list-query.util';

type BooleanQueryValue = 'true' | 'false';

export class AdminBasicsListQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  sortBy?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @Transform(toStringArray)
  @IsArray()
  @IsIn(['true', 'false'], { each: true })
  isActive?: BooleanQueryValue[];
}

export class AdminListChoicesQueryDto extends AdminBasicsListQueryDto {
  @IsOptional()
  @Transform(toStringArray)
  @IsArray()
  @IsIn(['true', 'false'], { each: true })
  isSystem?: BooleanQueryValue[];
}

export class AdminListLocationsQueryDto extends AdminBasicsListQueryDto {
  @IsString()
  kind!: string;

  @IsOptional()
  @IsMongoId()
  parentId?: string;
}

export class AdminListSportsQueryDto extends AdminBasicsListQueryDto {
  @IsOptional()
  @IsString()
  kind?: string;

  @IsOptional()
  @IsMongoId()
  parentId?: string;
}

export class AdminListRefsQueryDto extends AdminBasicsListQueryDto {
  @IsOptional()
  @Transform(toStringArray)
  @IsArray()
  @IsIn(Object.values(RefStatus), { each: true })
  status?: RefStatus[];
}

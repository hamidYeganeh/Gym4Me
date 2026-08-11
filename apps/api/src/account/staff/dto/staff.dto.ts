import {
  ArrayUnique,
  IsArray,
  IsEnum,
  IsMongoId,
  IsOptional,
} from 'class-validator';
import {
  ClubStaffStatus,
  StaffPermissionKey,
  StaffRolePreset,
} from '../../../common/enums';
import { PaginationQueryDto } from '../../../basics/dto/common.dto';

export class UpsertStaffDto {
  @IsMongoId()
  userId!: string;

  @IsEnum(StaffRolePreset)
  preset!: StaffRolePreset;

  /**
   * Explicit grants. When omitted and preset ≠ custom, server fills from
   * the preset template; custom requires an explicit list.
   */
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsEnum(StaffPermissionKey, { each: true })
  permissions?: StaffPermissionKey[];

  @IsOptional()
  @IsEnum(ClubStaffStatus)
  status?: ClubStaffStatus;
}

export class UpdateStaffPermissionsDto {
  @IsOptional()
  @IsEnum(StaffRolePreset)
  preset?: StaffRolePreset;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsEnum(StaffPermissionKey, { each: true })
  permissions?: StaffPermissionKey[];

  @IsOptional()
  @IsEnum(ClubStaffStatus)
  status?: ClubStaffStatus;
}

export class ListStaffQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(ClubStaffStatus)
  status?: ClubStaffStatus;
}

export class StaffIdParamDto {
  @IsMongoId()
  clubId!: string;

  @IsMongoId()
  staffId!: string;
}

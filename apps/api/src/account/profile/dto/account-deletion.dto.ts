import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class RequestAccountDeletionDto {
  @IsIn(['DELETE_ACCOUNT'])
  confirmation!: 'DELETE_ACCOUNT';

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class CancelAccountDeletionDto {
  @IsIn(['KEEP_ACCOUNT'])
  confirmation!: 'KEEP_ACCOUNT';
}

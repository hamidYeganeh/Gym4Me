import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class UpdateMeDto {
  @IsOptional()
  @IsString()
  @MaxLength(60)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  lastName?: string;

  /** Custom public handle, e.g. "mahdi-fit" */
  @IsOptional()
  @Matches(/^[a-z0-9](?:[a-z0-9-]{1,38})[a-z0-9]$/, {
    message: 'code must be 3-40 chars: lowercase letters, digits, dashes',
  })
  code?: string;
}

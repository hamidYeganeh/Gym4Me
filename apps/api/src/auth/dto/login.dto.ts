import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  /** phone number or email */
  @IsString()
  identifier!: string;

  @IsString()
  @MinLength(1)
  password!: string;
}

import { IsString, Length } from 'class-validator';
import { PhoneDto } from '../../../account/auth/dto/auth.dto';

export class AdminConfirmOtpDto extends PhoneDto {
  @IsString()
  @Length(5, 5)
  code!: string;
}

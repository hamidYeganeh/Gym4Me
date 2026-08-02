import { Transform } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, Matches } from 'class-validator';
import { IR_PHONE, normalizeIranPhone } from '../../../common/utils/phone.util';

export class InviteDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @Transform(({ value }) =>
    Array.isArray(value) ? value.map(normalizeIranPhone) : value,
  )
  @Matches(IR_PHONE, { each: true })
  phones!: string[];
}

import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { OutboxMessageStatus } from '../../common/enums';

export class ListOperationalOutboxQueryDto {
  @IsOptional()
  @IsEnum(OutboxMessageStatus)
  status?: OutboxMessageStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;
}

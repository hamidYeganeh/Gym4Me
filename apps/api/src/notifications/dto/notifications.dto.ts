import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  DevicePlatform,
  NotificationReadStatus,
  NotificationTemplateKey,
} from '../../common/enums';

export class ListNotificationsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 20;

  @IsOptional()
  @IsEnum(NotificationReadStatus)
  readStatus?: NotificationReadStatus;
}

export class RegisterDeviceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(4096)
  token!: string;

  @IsEnum(DevicePlatform)
  platform!: DevicePlatform;
}

/** Dev-only endpoint body for exercising the notification pipeline. */
export class TestDispatchDto {
  @IsEnum(NotificationTemplateKey)
  templateKey!: NotificationTemplateKey;

  @IsOptional()
  @IsObject()
  params?: Record<string, string | number>;

  @IsOptional()
  critical?: boolean;
}

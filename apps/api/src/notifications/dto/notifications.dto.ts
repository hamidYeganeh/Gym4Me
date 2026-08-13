import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  DevicePlatform,
  EntityStatus,
  NotificationChannelSetting,
  NotificationReadStatus,
  NotificationSmsSetting,
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

export class ChannelConsentDto {
  @IsOptional()
  @IsBoolean()
  push?: boolean;

  @IsOptional()
  @IsBoolean()
  sms?: boolean;

  @IsOptional()
  @IsBoolean()
  inApp?: boolean;

  @IsOptional()
  @IsBoolean()
  email?: boolean;

  @IsOptional()
  @IsBoolean()
  marketing?: boolean;
}

export class QuietHoursDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  start?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  end?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  timezone?: string;
}

export class UpdateNotificationPreferenceDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => ChannelConsentDto)
  channels?: ChannelConsentDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => QuietHoursDto)
  quietHours?: QuietHoursDto;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(50)
  marketingDailyCap?: number;
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

// ── Admin template CRUD ─────────────────────────────────────────────────

export class TemplateChannelsDto {
  @IsOptional()
  @IsEnum(NotificationChannelSetting)
  push?: NotificationChannelSetting;

  @IsOptional()
  @IsEnum(NotificationSmsSetting)
  sms?: NotificationSmsSetting;

  @IsOptional()
  @IsEnum(NotificationChannelSetting)
  inbox?: NotificationChannelSetting;
}

export class CreateNotificationTemplateDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  @Matches(/^[a-z0-9_.-]+$/)
  key!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  body!: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => TemplateChannelsDto)
  channels?: TemplateChannelsDto;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  smsTemplateKey?: string;
}

export class UpdateNotificationTemplateDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  body?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => TemplateChannelsDto)
  channels?: TemplateChannelsDto;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  smsTemplateKey?: string;

  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;
}

export class ListTemplatesQueryDto {
  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;
}

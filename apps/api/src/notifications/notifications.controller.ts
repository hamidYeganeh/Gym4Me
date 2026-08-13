import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import {
  ListNotificationsQueryDto,
  RegisterDeviceDto,
  TestDispatchDto,
  UpdateNotificationPreferenceDto,
} from './dto/notifications.dto';
import { NotificationPreferencesService } from './notification-preferences.service';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@ApiBearerAuth('access-token')
@Controller('account/notifications')
export class NotificationsController {
  constructor(
    private readonly notifications: NotificationsService,
    private readonly preferences: NotificationPreferencesService,
    private readonly config: ConfigService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'In-app notification inbox (paginated)' })
  list(
    @CurrentUser('sub') userId: string,
    @Query() query: ListNotificationsQueryDto,
  ) {
    return this.notifications.list(userId, query);
  }

  @Get('preferences')
  @ApiOperation({ summary: 'Channel consent + quiet hours (R4)' })
  getPreferences(@CurrentUser('sub') userId: string) {
    return this.preferences.getOrCreate(userId);
  }

  @Patch('preferences')
  @ApiOperation({ summary: 'Update channel consent + quiet hours' })
  updatePreferences(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateNotificationPreferenceDto,
  ) {
    return this.preferences.update(userId, dto);
  }

  @Post('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  markAllRead(@CurrentUser('sub') userId: string) {
    return this.notifications.markAllRead(userId);
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Mark one notification as read' })
  async markRead(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    await this.notifications.markRead(userId, id);
    return { ok: true };
  }

  @Post('test')
  @ApiOperation({
    summary: 'Dispatch a test notification to yourself (DEBUG_MODE only)',
  })
  testDispatch(
    @CurrentUser('sub') userId: string,
    @Body() dto: TestDispatchDto,
  ) {
    const debug = String(
      this.config.get<string | boolean>('DEBUG_MODE', 'false'),
    )
      .trim()
      .toLowerCase();
    if (debug !== 'true') throw new NotFoundException();
    return this.notifications.dispatch({
      userId,
      templateKey: dto.templateKey,
      params: dto.params,
      critical: dto.critical,
    });
  }
}

@ApiTags('notifications')
@ApiBearerAuth('access-token')
@Controller('account/devices')
export class DevicesController {
  constructor(private readonly notifications: NotificationsService) {}

  @Post()
  @ApiOperation({ summary: 'Register a push device token for this user' })
  register(
    @CurrentUser('sub') userId: string,
    @Body() dto: RegisterDeviceDto,
  ) {
    return this.notifications.registerDevice(userId, dto.token, dto.platform);
  }

  @Delete(':token')
  @ApiOperation({ summary: 'Revoke a push device token (logout)' })
  async revoke(
    @CurrentUser('sub') userId: string,
    @Param('token') token: string,
  ) {
    await this.notifications.revokeDevice(userId, token);
    return { ok: true };
  }
}

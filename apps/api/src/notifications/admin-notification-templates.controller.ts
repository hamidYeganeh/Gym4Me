import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums';
import {
  CreateNotificationTemplateDto,
  ListTemplatesQueryDto,
  UpdateNotificationTemplateDto,
} from './dto/notifications.dto';
import { NotificationsService } from './notifications.service';

/** Admin-editable transactional templates (N1) — no redeploy for copy edits. */
@ApiTags('admin')
@ApiBearerAuth('access-token')
@Roles(Role.ADMIN)
@Controller('admin/notifications/templates')
export class AdminNotificationTemplatesController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List notification templates' })
  list(@Query() query: ListTemplatesQueryDto) {
    return this.notifications.listTemplates(query);
  }

  @Get(':key')
  @ApiOperation({ summary: 'Get one template by key' })
  get(@Param('key') key: string) {
    return this.notifications.getTemplate(key);
  }

  @Post()
  @ApiOperation({ summary: 'Create a custom template' })
  create(@Body() dto: CreateNotificationTemplateDto) {
    return this.notifications.createTemplate(dto);
  }

  @Patch(':key')
  @ApiOperation({ summary: 'Update copy / channels / status of a template' })
  update(
    @Param('key') key: string,
    @Body() dto: UpdateNotificationTemplateDto,
  ) {
    return this.notifications.updateTemplate(key, dto);
  }
}

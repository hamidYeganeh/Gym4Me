import { Body, Controller, Get, Param, Post, Put, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums';
import { DiscoveryService } from './discovery.service';
import {
  PreviewDiscoveryDraftDto,
  RollbackDiscoveryPageDto,
  UpdateDiscoveryDraftDto,
} from './dto/discovery.dto';

@ApiTags('admin-discovery')
@ApiBearerAuth('access-token')
@Roles(Role.ADMIN)
@Controller('admin/discovery/pages')
export class AdminDiscoveryController {
  constructor(private readonly discovery: DiscoveryService) {}

  @Get()
  @ApiOperation({ summary: 'List discovery page configurations' })
  list() {
    return this.discovery.adminList();
  }

  @Get(':pageKey')
  @ApiOperation({ summary: 'Get discovery page draft and published revision' })
  get(@Param('pageKey') pageKey: string) {
    return this.discovery.adminGet(pageKey);
  }

  @Put(':pageKey/draft')
  @ApiOperation({ summary: 'Save a discovery page draft' })
  updateDraft(
    @Param('pageKey') pageKey: string,
    @Body() dto: UpdateDiscoveryDraftDto,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.discovery.updateDraft(pageKey, dto, adminId, request);
  }

  @Post(':pageKey/preview')
  @ApiOperation({ summary: 'Resolve the current draft with synthetic context' })
  preview(
    @Param('pageKey') pageKey: string,
    @Body() dto: PreviewDiscoveryDraftDto,
  ) {
    return this.discovery.previewDraft(pageKey, dto);
  }

  @Post(':pageKey/publish')
  @ApiOperation({ summary: 'Publish an immutable discovery page revision' })
  publish(
    @Param('pageKey') pageKey: string,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.discovery.publish(pageKey, adminId, request);
  }

  @Post(':pageKey/rollback')
  @ApiOperation({ summary: 'Publish a previous revision as a new revision' })
  rollback(
    @Param('pageKey') pageKey: string,
    @Body() dto: RollbackDiscoveryPageDto,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.discovery.rollback(pageKey, dto.revision, adminId, request);
  }
}

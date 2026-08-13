import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums';
import {
  ListSocialReportsQueryDto,
  ResolveSocialReportDto,
} from './dto/social.dto';
import { SocialService } from './social.service';

@ApiTags('admin')
@ApiBearerAuth('access-token')
@Roles(Role.ADMIN)
@Controller('admin/social/reports')
export class AdminSocialController {
  constructor(private readonly social: SocialService) {}

  @Get()
  @ApiOperation({ summary: 'List social reports' })
  list(@Query() query: ListSocialReportsQueryDto) {
    return this.social.adminListReports(query);
  }

  @Post(':id/resolve')
  @ApiOperation({ summary: 'Resolve or reject a social report' })
  resolve(
    @Param('id') id: string,
    @Body() dto: ResolveSocialReportDto,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.social.adminResolveReport(id, adminId, dto, request);
  }
}

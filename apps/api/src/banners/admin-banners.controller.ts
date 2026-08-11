import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums';
import { BannersService } from './banners.service';
import {
  AdminListBannersQueryDto,
  CreateBannerDto,
  UpdateBannerDto,
} from './dto/admin-banner.dto';

@ApiTags('admin')
@ApiBearerAuth('access-token')
@Roles(Role.ADMIN)
@Controller('admin/banners')
export class AdminBannersController {
  constructor(private readonly banners: BannersService) {}

  @Get()
  @ApiOperation({ summary: 'List banners (all statuses)' })
  list(@Query() query: AdminListBannersQueryDto) {
    return this.banners.adminList(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a banner by id' })
  get(@Param('id') id: string) {
    return this.banners.adminGet(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a banner' })
  create(
    @Body() dto: CreateBannerDto,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.banners.create(dto, adminId, request);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a banner' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBannerDto,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.banners.update(id, dto, adminId, request);
  }

  @Delete(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete a banner' })
  remove(
    @Param('id') id: string,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.banners.remove(id, adminId, request);
  }
}

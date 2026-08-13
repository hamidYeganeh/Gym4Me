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
import {
  CreateFoodItemDto,
  ListFoodItemsQueryDto,
  UpdateFoodItemDto,
} from './dto/nutrition.dto';
import { NutritionService } from './nutrition.service';

@ApiTags('admin')
@ApiBearerAuth('access-token')
@Roles(Role.ADMIN)
@Controller('admin/nutrition/food-items')
export class AdminNutritionController {
  constructor(private readonly nutrition: NutritionService) {}

  @Get()
  @ApiOperation({ summary: 'List food bank items' })
  list(@Query() query: ListFoodItemsQueryDto) {
    return this.nutrition.listFoodItems(query);
  }

  @Post()
  @ApiOperation({ summary: 'Create a food bank item' })
  create(
    @Body() dto: CreateFoodItemDto,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.nutrition.adminCreateFoodItem(dto, adminId, request);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a food bank item' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateFoodItemDto,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.nutrition.adminUpdateFoodItem(id, dto, adminId, request);
  }

  @Delete(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Archive a food bank item' })
  archive(
    @Param('id') id: string,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.nutrition.adminArchiveFoodItem(id, adminId, request);
  }
}

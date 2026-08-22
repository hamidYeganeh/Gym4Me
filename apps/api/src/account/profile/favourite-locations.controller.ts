import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  CreateFavouriteLocationDto,
  UpdateFavouriteLocationDto,
} from './dto/favourite-location.dto';
import { FavouriteLocationsService } from './favourite-locations.service';

@ApiTags('profile')
@ApiBearerAuth('access-token')
@Controller('account/profile/locations')
export class FavouriteLocationsController {
  constructor(private readonly locations: FavouriteLocationsService) {}

  @Get()
  @ApiOperation({ summary: 'List my favourite locations' })
  list(@CurrentUser('sub') userId: string) {
    return this.locations.list(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one of my favourite locations' })
  get(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.locations.get(userId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a favourite location' })
  create(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateFavouriteLocationDto,
    @Req() request: Request,
  ) {
    return this.locations.create(userId, dto, request);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a favourite location' })
  update(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateFavouriteLocationDto,
    @Req() request: Request,
  ) {
    return this.locations.update(userId, id, dto, request);
  }

  @Delete(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete a favourite location' })
  remove(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Req() request: Request,
  ) {
    return this.locations.remove(userId, id, request);
  }
}

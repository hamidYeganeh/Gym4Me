import {
  BadRequestException,
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
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { LocationKind, Role, SportKind } from '../../common/enums';
import { ChoicesService } from '../choices/choices.service';
import {
  CreateChoiceGroupDto,
  UpdateChoiceGroupDto,
} from '../choices/dto/choices.dto';
import {
  CreateLocationDto,
  UpdateLocationDto,
} from '../location/dto/location.dto';
import { LocationService } from '../location/location.service';
import { CreateRefItemDto, UpdateRefItemDto } from '../ref/dto/ref.dto';
import { RefService } from '../ref/ref.service';
import { CreateSportDto, UpdateSportDto } from '../sport/dto/sport.dto';
import { SportService } from '../sport/sport.service';

function parseAdminSportKind(kind?: string): SportKind {
  const value = kind || SportKind.CATEGORY;
  if (Object.values(SportKind).includes(value as SportKind)) {
    return value as SportKind;
  }
  const aliases: Record<string, SportKind> = {
    'sport-category': SportKind.CATEGORY,
    sport: SportKind.SPORT,
    'sport-branch': SportKind.BRANCH,
  };
  if (aliases[value]) return aliases[value];
  throw new BadRequestException(
    `kind must be one of: ${Object.values(SportKind).join(', ')}`,
  );
}

function parseAdminLocationKind(kind?: string): LocationKind {
  if (!kind || !Object.values(LocationKind).includes(kind as LocationKind)) {
    throw new BadRequestException(
      `kind must be one of: ${Object.values(LocationKind).join(', ')}`,
    );
  }
  return kind as LocationKind;
}

@ApiTags('admin-basics')
@ApiBearerAuth('access-token')
@Roles(Role.ADMIN)
@Controller('admin/basics')
export class AdminBasicsController {
  constructor(
    private readonly choices: ChoicesService,
    private readonly locations: LocationService,
    private readonly sports: SportService,
    private readonly refs: RefService,
  ) {}

  // ── Choices ────────────────────────────────────

  @Get('choices')
  @ApiOperation({ summary: 'List all choice groups (admin)' })
  listChoices() {
    return this.choices.listAdmin();
  }

  @Post('choices')
  @ApiOperation({ summary: 'Create a choice group' })
  createChoice(
    @Body() dto: CreateChoiceGroupDto,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.choices.create(dto, adminId, request);
  }

  @Patch('choices/:key')
  @ApiOperation({ summary: 'Update a choice group' })
  updateChoice(
    @Param('key') key: string,
    @Body() dto: UpdateChoiceGroupDto,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.choices.update(key, dto, adminId, request);
  }

  @Delete('choices/:key')
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete a non-system choice group' })
  deleteChoice(
    @Param('key') key: string,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.choices.remove(key, adminId, request);
  }

  // ── Locations ──────────────────────────────────

  @Get('location')
  @ApiQuery({ name: 'kind', enum: LocationKind, required: true })
  @ApiOperation({ summary: 'List locations by kind (admin)' })
  listLocations(
    @Query('kind') kind: string,
    @Query('parentId') parentId?: string,
  ) {
    return this.locations.listByKind(
      parseAdminLocationKind(kind),
      parentId,
      true,
    );
  }

  @Get('location/:id')
  @ApiOperation({ summary: 'Get a location (admin)' })
  getLocation(@Param('id') id: string) {
    return this.locations.getById(id, true);
  }

  @Post('location')
  @ApiOperation({ summary: 'Create a location node' })
  createLocation(
    @Body() dto: CreateLocationDto,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.locations.create(dto, adminId, request);
  }

  @Patch('location/:id')
  @ApiOperation({ summary: 'Update a location node' })
  updateLocation(
    @Param('id') id: string,
    @Body() dto: UpdateLocationDto,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.locations.update(id, dto, adminId, request);
  }

  @Delete('location/:id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete a leaf location node' })
  deleteLocation(
    @Param('id') id: string,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.locations.remove(id, adminId, request);
  }

  // ── Sports ─────────────────────────────────────

  @Get('sport')
  @ApiQuery({ name: 'kind', enum: SportKind, required: false })
  @ApiOperation({ summary: 'List sports by kind (admin)' })
  listSports(
    @Query('kind') kind?: string,
    @Query('parentId') parentId?: string,
  ) {
    return this.sports.listByKind(parseAdminSportKind(kind), parentId, true);
  }

  @Get('sport/:id')
  @ApiOperation({ summary: 'Get a sport node (admin)' })
  getSport(@Param('id') id: string) {
    return this.sports.getById(id, true);
  }

  @Post('sport')
  @ApiOperation({ summary: 'Create a sport category / sport / branch' })
  createSport(
    @Body() dto: CreateSportDto,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.sports.create(dto, adminId, request);
  }

  @Patch('sport/:id')
  @ApiOperation({ summary: 'Update a sport node' })
  updateSport(
    @Param('id') id: string,
    @Body() dto: UpdateSportDto,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.sports.update(id, dto, adminId, request);
  }

  @Delete('sport/:id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete a leaf sport node' })
  deleteSport(
    @Param('id') id: string,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.sports.remove(id, adminId, request);
  }

  // ── Generic refs ───────────────────────────────

  @Get('ref/:type')
  @ApiOperation({ summary: 'List ref items by type (admin)' })
  listRefs(@Param('type') type: string) {
    return this.refs.list(this.refs.parseType(type), true);
  }

  @Get('ref/:type/:id')
  @ApiOperation({ summary: 'Get a ref item (admin)' })
  getRef(@Param('type') type: string, @Param('id') id: string) {
    return this.refs.getById(this.refs.parseType(type), id, true);
  }

  @Post('ref/:type')
  @ApiOperation({ summary: 'Create a ref item' })
  createRef(
    @Param('type') type: string,
    @Body() dto: CreateRefItemDto,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.refs.create(this.refs.parseType(type), dto, adminId, request);
  }

  @Patch('ref/:type/:id')
  @ApiOperation({ summary: 'Update a ref item' })
  updateRef(
    @Param('type') type: string,
    @Param('id') id: string,
    @Body() dto: UpdateRefItemDto,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.refs.update(
      this.refs.parseType(type),
      id,
      dto,
      adminId,
      request,
    );
  }

  @Delete('ref/:type/:id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete a ref item' })
  deleteRef(
    @Param('type') type: string,
    @Param('id') id: string,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.refs.remove(this.refs.parseType(type), id, adminId, request);
  }
}

import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums';
import type { JwtUser } from '../../common/types';
import { ClubsService } from './clubs.service';
import {
  CreateClubDto,
  SubmitClubReviewDto,
  UpdateClubDto,
} from './dto/club.dto';

@ApiTags('clubs')
@ApiBearerAuth('access-token')
@Roles(Role.CLUB_OWNER)
@Controller('account/clubs')
export class ClubsController {
  constructor(private readonly clubs: ClubsService) {}

  @Get()
  @ApiOperation({ summary: 'List clubs owned by the current owner' })
  list(@CurrentUser() user: JwtUser) {
    return this.clubs.listMine(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one owned club' })
  get(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.clubs.getMine(user, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a club draft' })
  create(
    @CurrentUser() user: JwtUser,
    @Body() dto: CreateClubDto,
    @Req() request: Request,
  ) {
    return this.clubs.create(user, dto, request);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a draft/rejected club' })
  update(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() dto: UpdateClubDto,
    @Req() request: Request,
  ) {
    return this.clubs.update(user, id, dto, request);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit club documents for admin verification' })
  submit(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() dto: SubmitClubReviewDto,
    @Req() request: Request,
  ) {
    return this.clubs.submitForReview(user, id, dto, request);
  }
}

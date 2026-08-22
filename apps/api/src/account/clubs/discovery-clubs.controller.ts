import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import type { JwtUser } from '../../common/types';
import { ClubsService } from './clubs.service';
import {
  CreateUserReviewDto,
  DiscoveryClubsQueryDto,
  ListUserReviewsQueryDto,
} from './dto/club.dto';

@ApiTags('discovery')
@Controller('discovery/clubs')
export class DiscoveryClubsController {
  constructor(private readonly clubs: ClubsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Public approved & active clubs list' })
  list(@Query() query: DiscoveryClubsQueryDto) {
    return this.clubs.discoveryList(query);
  }

  @Public()
  @Get('facets')
  @ApiOperation({
    summary: 'Public club counts grouped by category',
  })
  facets() {
    return this.clubs.discoveryCategoryFacets();
  }

  @Public()
  @Get(':clubId')
  @ApiOperation({ summary: 'Public club detail' })
  get(@Param('clubId') clubId: string) {
    return this.clubs.discoveryGet(clubId);
  }

  @Public()
  @Get(':clubId/reviews')
  @ApiOperation({ summary: 'Public approved user reviews' })
  reviews(
    @Param('clubId') clubId: string,
    @Query() query: ListUserReviewsQueryDto,
  ) {
    return this.clubs.listUserReviews(clubId, query, { publicOnly: true });
  }

  @ApiBearerAuth('access-token')
  @Post(':clubId/reviews')
  @ApiOperation({ summary: 'Submit a user review (authenticated)' })
  createReview(
    @CurrentUser() user: JwtUser,
    @Param('clubId') clubId: string,
    @Body() dto: CreateUserReviewDto,
    @Req() request: Request,
  ) {
    return this.clubs.createUserReview(clubId, user, dto, request);
  }

  @Public()
  @Get(':clubId/branches')
  @ApiOperation({ summary: 'Public list of club branches' })
  branches(@Param('clubId') clubId: string) {
    return this.clubs.listBranches(clubId);
  }

  @Public()
  @Get(':clubId/coaches')
  @ApiOperation({ summary: 'Public coach refs' })
  coaches(@Param('clubId') clubId: string) {
    return this.clubs.listCoaches(clubId, { discovery: true });
  }
}

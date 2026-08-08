import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequireKyc } from '../../common/decorators/require-kyc.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums';
import type { JwtUser } from '../../common/types';
import { ClubsService } from './clubs.service';
import {
  AssignCoachDto,
  CreateBranchDto,
  CreateClubDto,
  ListClubsQueryDto,
  ListUserReviewsQueryDto,
  ReplyUserReviewDto,
  SubmitClubReviewDto,
  UpdateClubDto,
} from './dto/club.dto';

@ApiTags('club-owner')
@ApiBearerAuth('access-token')
@Roles(Role.CLUB_OWNER)
@Controller('club_owner/clubs')
export class OwnerClubsController {
  constructor(private readonly clubs: ClubsService) {}

  @Get()
  @ApiOperation({ summary: 'List clubs owned by the current owner' })
  list(@CurrentUser() user: JwtUser, @Query() query: ListClubsQueryDto) {
    return this.clubs.listMine(user, query);
  }

  @Post()
  @RequireKyc()
  @ApiOperation({ summary: 'Create a club draft (requires approved KYC)' })
  create(
    @CurrentUser() user: JwtUser,
    @Body() dto: CreateClubDto,
    @Req() request: Request,
  ) {
    return this.clubs.create(user, dto, request);
  }

  @Get(':clubId')
  @ApiOperation({ summary: 'Get one owned club' })
  get(@CurrentUser() user: JwtUser, @Param('clubId') clubId: string) {
    return this.clubs.getMine(user, clubId);
  }

  @Patch(':clubId')
  @ApiOperation({ summary: 'Update a draft/rejected club' })
  update(
    @CurrentUser() user: JwtUser,
    @Param('clubId') clubId: string,
    @Body() dto: UpdateClubDto,
    @Req() request: Request,
  ) {
    return this.clubs.update(user, clubId, dto, request);
  }

  @Delete(':clubId')
  @ApiOperation({ summary: 'Delete a draft/rejected club' })
  remove(
    @CurrentUser() user: JwtUser,
    @Param('clubId') clubId: string,
    @Req() request: Request,
  ) {
    return this.clubs.remove(user, clubId, request);
  }

  @Post(':clubId/activate')
  @ApiOperation({ summary: 'Activate club (operational)' })
  activate(
    @CurrentUser() user: JwtUser,
    @Param('clubId') clubId: string,
    @Req() request: Request,
  ) {
    return this.clubs.activate(user, clubId, request);
  }

  @Post(':clubId/deactivate')
  @ApiOperation({ summary: 'Deactivate club (operational)' })
  deactivate(
    @CurrentUser() user: JwtUser,
    @Param('clubId') clubId: string,
    @Req() request: Request,
  ) {
    return this.clubs.deactivate(user, clubId, request);
  }

  @Post(':clubId/submit')
  @RequireKyc()
  @ApiOperation({
    summary: 'Submit club documents for admin verification (requires approved KYC)',
  })
  submit(
    @CurrentUser() user: JwtUser,
    @Param('clubId') clubId: string,
    @Body() dto: SubmitClubReviewDto,
    @Req() request: Request,
  ) {
    return this.clubs.submitForReview(user, clubId, dto, request);
  }

  @Get(':clubId/reviews')
  @ApiOperation({ summary: 'List user reviews for an owned club' })
  reviews(
    @CurrentUser() user: JwtUser,
    @Param('clubId') clubId: string,
    @Query() query: ListUserReviewsQueryDto,
  ) {
    return this.clubs.requireOwned(user, clubId).then(() =>
      this.clubs.listUserReviews(clubId, query),
    );
  }

  @Post(':clubId/reviews/:reviewId/reply')
  @ApiOperation({ summary: 'Reply to a user review' })
  replyReview(
    @CurrentUser() user: JwtUser,
    @Param('clubId') clubId: string,
    @Param('reviewId') reviewId: string,
    @Body() dto: ReplyUserReviewDto,
    @Req() request: Request,
  ) {
    return this.clubs.replyUserReview(clubId, reviewId, user, dto, request);
  }

  @Get(':clubId/branches')
  @ApiOperation({ summary: 'List branches of a club' })
  branches(
    @CurrentUser() user: JwtUser,
    @Param('clubId') clubId: string,
  ) {
    return this.clubs.requireOwned(user, clubId).then(() =>
      this.clubs.listBranches(clubId),
    );
  }

  @Post(':clubId/branches')
  @ApiOperation({ summary: 'Create a branch under this club' })
  createBranch(
    @CurrentUser() user: JwtUser,
    @Param('clubId') clubId: string,
    @Body() dto: CreateBranchDto,
    @Req() request: Request,
  ) {
    return this.clubs.createBranch(
      clubId,
      dto,
      user.sub,
      user.sub,
      request,
      true,
    );
  }

  @Get(':clubId/coaches')
  @ApiOperation({ summary: 'List coaches on a club' })
  coaches(
    @CurrentUser() user: JwtUser,
    @Param('clubId') clubId: string,
  ) {
    return this.clubs.requireOwned(user, clubId).then(() =>
      this.clubs.listCoaches(clubId),
    );
  }

  @Post(':clubId/coaches')
  @ApiOperation({ summary: 'Assign a coach to a club' })
  assignCoach(
    @CurrentUser() user: JwtUser,
    @Param('clubId') clubId: string,
    @Body() dto: AssignCoachDto,
    @Req() request: Request,
  ) {
    return this.clubs.requireOwned(user, clubId).then(() =>
      this.clubs.assignCoach(clubId, dto, user.sub, request),
    );
  }

  @Delete(':clubId/coaches/:coachId')
  @ApiOperation({ summary: 'Unassign a coach from a club' })
  unassignCoach(
    @CurrentUser() user: JwtUser,
    @Param('clubId') clubId: string,
    @Param('coachId') coachId: string,
    @Req() request: Request,
  ) {
    return this.clubs.requireOwned(user, clubId).then(() =>
      this.clubs.unassignCoach(clubId, coachId, user.sub, request),
    );
  }
}

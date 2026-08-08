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
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums';
import {
  ListClubReviewsQueryDto,
  ReviewVerificationDto,
} from '../../admin/dto/admin-review.dto';
import { ClubsService } from './clubs.service';
import {
  AdminCreateClubDto,
  AssignCoachDto,
  CreateBranchDto,
  GrantAchievementDto,
  ListClubsQueryDto,
  ListUserReviewsQueryDto,
  ModerateUserReviewDto,
  UpdateClubDto,
} from './dto/club.dto';

@ApiTags('admin-clubs')
@ApiBearerAuth('access-token')
@Roles(Role.ADMIN)
@Controller('admin/clubs')
export class AdminClubsController {
  constructor(private readonly clubs: ClubsService) {}

  @Get()
  @ApiOperation({ summary: 'List all clubs' })
  list(@Query() query: ListClubsQueryDto) {
    return this.clubs.adminList(query);
  }

  @Post()
  @ApiOperation({ summary: 'Create a club and assign an owner' })
  create(
    @Body() dto: AdminCreateClubDto,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.clubs.adminCreate(dto, adminId, request);
  }

  @Get('verification')
  @ApiOperation({ summary: 'List club lifecycle verification queue' })
  listVerification(@Query() query: ListClubReviewsQueryDto) {
    return this.clubs.listLifecycleQueue(query);
  }

  @Get(':clubId')
  @ApiOperation({ summary: 'Get one club' })
  get(@Param('clubId') clubId: string) {
    return this.clubs.adminGet(clubId);
  }

  @Patch(':clubId')
  @ApiOperation({ summary: 'Update a club' })
  update(
    @Param('clubId') clubId: string,
    @Body() dto: UpdateClubDto,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.clubs.adminUpdate(clubId, dto, adminId, request);
  }

  @Delete(':clubId')
  @ApiOperation({ summary: 'Delete a club' })
  remove(
    @Param('clubId') clubId: string,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.clubs.adminRemove(clubId, adminId, request);
  }

  @Post(':clubId/activate')
  @ApiOperation({ summary: 'Activate club (operational)' })
  activate(
    @Param('clubId') clubId: string,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.clubs.adminActivate(clubId, adminId, request);
  }

  @Post(':clubId/deactivate')
  @ApiOperation({ summary: 'Deactivate club (operational)' })
  deactivate(
    @Param('clubId') clubId: string,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.clubs.adminDeactivate(clubId, adminId, request);
  }

  @Patch(':clubId/verification')
  @ApiOperation({ summary: 'Approve or reject club lifecycle submission' })
  verify(
    @Param('clubId') clubId: string,
    @Body() dto: ReviewVerificationDto,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.clubs.reviewLifecycle(
      clubId,
      dto.action,
      dto.reviewNote,
      adminId,
      request,
    );
  }

  @Get(':clubId/reviews')
  @ApiOperation({ summary: 'List user reviews for a club' })
  reviews(
    @Param('clubId') clubId: string,
    @Query() query: ListUserReviewsQueryDto,
  ) {
    return this.clubs.listUserReviews(clubId, query);
  }

  @Patch(':clubId/reviews/:reviewId')
  @ApiOperation({ summary: 'Moderate a user review' })
  moderateReview(
    @Param('clubId') clubId: string,
    @Param('reviewId') reviewId: string,
    @Body() dto: ModerateUserReviewDto,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.clubs.moderateUserReview(
      clubId,
      reviewId,
      dto,
      adminId,
      request,
    );
  }

  @Post(':clubId/achievements')
  @ApiOperation({ summary: 'Manually grant an achievement to a club' })
  grantAchievement(
    @Param('clubId') clubId: string,
    @Body() dto: GrantAchievementDto,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.clubs.grantAchievement(clubId, dto, adminId, request);
  }

  @Get(':clubId/branches')
  @ApiOperation({ summary: 'List branches' })
  branches(@Param('clubId') clubId: string) {
    return this.clubs.listBranches(clubId);
  }

  @Post(':clubId/branches')
  @ApiOperation({ summary: 'Create a branch (inherits parent owner unless ownerId set)' })
  async createBranch(
    @Param('clubId') clubId: string,
    @Body() dto: CreateBranchDto & { ownerId?: string },
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    const parent = await this.clubs.findClubOrFail(clubId);
    const ownerId = dto.ownerId ?? parent.ownerId.toString();
    return this.clubs.createBranch(
      clubId,
      dto,
      ownerId,
      adminId,
      request,
      false,
    );
  }

  @Get(':clubId/coaches')
  @ApiOperation({ summary: 'List coaches' })
  coaches(@Param('clubId') clubId: string) {
    return this.clubs.listCoaches(clubId);
  }

  @Post(':clubId/coaches')
  @ApiOperation({ summary: 'Assign a coach' })
  assignCoach(
    @Param('clubId') clubId: string,
    @Body() dto: AssignCoachDto,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.clubs.assignCoach(clubId, dto, adminId, request);
  }

  @Delete(':clubId/coaches/:coachId')
  @ApiOperation({ summary: 'Unassign a coach' })
  unassignCoach(
    @Param('clubId') clubId: string,
    @Param('coachId') coachId: string,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.clubs.unassignCoach(clubId, coachId, adminId, request);
  }
}

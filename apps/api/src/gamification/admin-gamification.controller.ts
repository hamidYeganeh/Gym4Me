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
  AdjustPointsDto,
  CreateAchievementDto,
  CreatePointRuleDto,
  GrantAchievementSubjectDto,
  ListAchievementsQueryDto,
  ListGrantsQueryDto,
  ListPointRulesQueryDto,
  ListTransactionsQueryDto,
  UpdateAchievementDto,
  UpdatePointRuleDto,
} from './dto/gamification.dto';
import { GamificationService } from './gamification.service';

@ApiTags('admin')
@ApiBearerAuth('access-token')
@Roles(Role.ADMIN)
@Controller('admin/gamification')
export class AdminGamificationController {
  constructor(private readonly gamification: GamificationService) {}

  // ── Achievements ────────────────────────────────────────────────────────

  @Get('achievements')
  @ApiOperation({ summary: 'List achievements' })
  listAchievements(@Query() query: ListAchievementsQueryDto) {
    return this.gamification.adminListAchievements(query);
  }

  @Post('achievements/seed-defaults')
  @HttpCode(200)
  @ApiOperation({
    summary:
      'Create missing default achievements without overwriting existing ones',
  })
  seedAchievementDefaults(
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.gamification.adminSeedAchievementDefaults(adminId, request);
  }

  @Get('achievements/:id')
  @ApiOperation({ summary: 'Get an achievement' })
  getAchievement(@Param('id') id: string) {
    return this.gamification.adminGetAchievement(id);
  }

  @Post('achievements')
  @ApiOperation({ summary: 'Create an achievement' })
  createAchievement(
    @Body() dto: CreateAchievementDto,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.gamification.adminCreateAchievement(dto, adminId, request);
  }

  @Patch('achievements/:id')
  @ApiOperation({ summary: 'Update an achievement' })
  updateAchievement(
    @Param('id') id: string,
    @Body() dto: UpdateAchievementDto,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.gamification.adminUpdateAchievement(id, dto, adminId, request);
  }

  @Delete('achievements/:id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Archive an achievement (soft delete)' })
  archiveAchievement(
    @Param('id') id: string,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.gamification.adminArchiveAchievement(id, adminId, request);
  }

  @Post('achievements/:id/grants')
  @ApiOperation({ summary: 'Manually grant an achievement to a subject' })
  grantAchievement(
    @Param('id') id: string,
    @Body() dto: GrantAchievementSubjectDto,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.gamification.adminGrantAchievement(id, dto, adminId, request);
  }

  @Delete('achievements/:id/grants')
  @HttpCode(200)
  @ApiOperation({ summary: 'Revoke a granted achievement from a subject' })
  revokeAchievement(
    @Param('id') id: string,
    @Body() dto: GrantAchievementSubjectDto,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.gamification.adminRevokeAchievement(id, dto, adminId, request);
  }

  @Get('grants')
  @ApiOperation({ summary: 'List achievement grants' })
  listGrants(@Query() query: ListGrantsQueryDto) {
    return this.gamification.adminListGrants(query);
  }

  // ── Point rules ─────────────────────────────────────────────────────────

  @Get('point-rules')
  @ApiOperation({ summary: 'List point rules' })
  listPointRules(@Query() query: ListPointRulesQueryDto) {
    return this.gamification.adminListPointRules(query);
  }

  @Get('point-rules/:id')
  @ApiOperation({ summary: 'Get a point rule' })
  getPointRule(@Param('id') id: string) {
    return this.gamification.adminGetPointRule(id);
  }

  @Post('point-rules')
  @ApiOperation({ summary: 'Create a point rule' })
  createPointRule(
    @Body() dto: CreatePointRuleDto,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.gamification.adminCreatePointRule(dto, adminId, request);
  }

  @Patch('point-rules/:id')
  @ApiOperation({ summary: 'Update a point rule' })
  updatePointRule(
    @Param('id') id: string,
    @Body() dto: UpdatePointRuleDto,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.gamification.adminUpdatePointRule(id, dto, adminId, request);
  }

  @Delete('point-rules/:id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Archive a point rule (soft delete)' })
  archivePointRule(
    @Param('id') id: string,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.gamification.adminArchivePointRule(id, adminId, request);
  }

  // ── Ledger, adjustments, analytics ──────────────────────────────────────

  @Get('transactions')
  @ApiOperation({ summary: 'List point transactions (ledger)' })
  listTransactions(@Query() query: ListTransactionsQueryDto) {
    return this.gamification.adminListTransactions(query);
  }

  @Post('adjustments')
  @ApiOperation({ summary: 'Manually credit or debit points for a subject' })
  adjustPoints(
    @Body() dto: AdjustPointsDto,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.gamification.adminAdjustPoints(dto, adminId, request);
  }

  @Get('overview')
  @ApiOperation({ summary: 'Aggregated gamification analytics' })
  overview() {
    return this.gamification.adminOverview();
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums';
import { CoachingService } from './coaching.service';
import {
  CreateAffiliationDto,
  CreateCoachServiceDto,
  CreateLeadDto,
  CreateSessionPackageDto,
  FreezePackageDto,
  LinkStudentDto,
  ListCoachServicesQueryDto,
  ListLeadsQueryDto,
  ListPackagesQueryDto,
  ListStudentsQueryDto,
  ReviewHealthAssessmentDto,
  UpdateAffiliationDto,
  UpdateCoachServiceDto,
  UpdateLeadDto,
  UpdateLeadStageDto,
  UpdateStudentDto,
  UpsertCoachAvailabilityDto,
  CoachingAnalyticsQueryDto,
} from './dto/coaching.dto';

@ApiTags('coaching')
@ApiBearerAuth('access-token')
@Roles(Role.COACH)
@Controller('account/coaching')
export class CoachCoachingController {
  constructor(private readonly coaching: CoachingService) {}

  // ── Analytics ───────────────────────────────────────────────────────────

  @Get('analytics/overview')
  @ApiOperation({
    summary: 'Coach KPI overview (engagement-derived, period=week|month|quarter)',
  })
  analyticsOverview(
    @CurrentUser('sub') userId: string,
    @Query() query: CoachingAnalyticsQueryDto,
  ) {
    return this.coaching.getAnalyticsOverview(userId, query);
  }

  // ── Services ────────────────────────────────────────────────────────────

  @Get('services')
  @ApiOperation({ summary: 'List my sellable coaching services' })
  listServices(
    @CurrentUser('sub') userId: string,
    @Query() query: ListCoachServicesQueryDto,
  ) {
    return this.coaching.listServices(userId, query);
  }

  @Get('services/:id')
  @ApiOperation({ summary: 'Get one of my coaching services' })
  getService(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    return this.coaching.getService(userId, id);
  }

  @Post('services')
  @ApiOperation({ summary: 'Create a coaching service' })
  createService(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateCoachServiceDto,
    @Req() request: Request,
  ) {
    return this.coaching.createService(userId, dto, request);
  }

  @Patch('services/:id')
  @ApiOperation({ summary: 'Update a coaching service' })
  updateService(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCoachServiceDto,
    @Req() request: Request,
  ) {
    return this.coaching.updateService(userId, id, dto, request);
  }

  @Delete('services/:id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Archive a coaching service' })
  archiveService(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Req() request: Request,
  ) {
    return this.coaching.archiveService(userId, id, request);
  }

  // ── Availability ────────────────────────────────────────────────────────

  @Get('availability')
  @ApiOperation({ summary: 'Get my operational availability prefs' })
  getAvailability(@CurrentUser('sub') userId: string) {
    return this.coaching.getAvailability(userId);
  }

  @Put('availability')
  @ApiOperation({ summary: 'Upsert my operational availability prefs' })
  upsertAvailability(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpsertCoachAvailabilityDto,
    @Req() request: Request,
  ) {
    return this.coaching.upsertAvailability(userId, dto, request);
  }

  // ── Affiliations ────────────────────────────────────────────────────────

  @Get('affiliations')
  @ApiOperation({ summary: 'List my club affiliations' })
  listAffiliations(@CurrentUser('sub') userId: string) {
    return this.coaching.listAffiliations(userId);
  }

  @Post('affiliations')
  @ApiOperation({ summary: 'Create a club affiliation' })
  createAffiliation(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateAffiliationDto,
  ) {
    return this.coaching.createAffiliation(userId, dto);
  }

  @Patch('affiliations/:id')
  @ApiOperation({ summary: 'Update a club affiliation' })
  updateAffiliation(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAffiliationDto,
  ) {
    return this.coaching.updateAffiliation(userId, id, dto);
  }

  @Delete('affiliations/:id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Archive a club affiliation' })
  archiveAffiliation(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    return this.coaching.archiveAffiliation(userId, id);
  }

  // ── Packages ────────────────────────────────────────────────────────────

  @Get('packages')
  @ApiOperation({ summary: 'List session packages I sold' })
  listPackages(
    @CurrentUser('sub') userId: string,
    @Query() query: ListPackagesQueryDto,
  ) {
    return this.coaching.listPackagesForCoach(userId, query);
  }

  @Post('packages')
  @ApiOperation({ summary: 'Sell / create a session package' })
  createPackage(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateSessionPackageDto,
    @Req() request: Request,
  ) {
    return this.coaching.createPackage(userId, dto, request);
  }

  @Post('packages/:id/consume')
  @ApiOperation({ summary: 'Consume one session from a package' })
  consumePackage(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Req() request: Request,
  ) {
    return this.coaching.consumePackage(userId, id, request);
  }

  @Post('packages/:id/freeze')
  @ApiOperation({ summary: 'Freeze a session package' })
  freezePackage(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: FreezePackageDto,
  ) {
    return this.coaching.freezePackage(userId, id, dto);
  }

  @Post('packages/:id/unfreeze')
  @ApiOperation({ summary: 'Unfreeze a session package' })
  unfreezePackage(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    return this.coaching.unfreezePackage(userId, id);
  }

  // ── Students ────────────────────────────────────────────────────────────

  @Get('students')
  @ApiOperation({ summary: 'List my linked students' })
  listStudents(
    @CurrentUser('sub') userId: string,
    @Query() query: ListStudentsQueryDto,
  ) {
    return this.coaching.listStudents(userId, query);
  }

  @Post('students')
  @ApiOperation({ summary: 'Link an athlete as my student' })
  linkStudent(
    @CurrentUser('sub') userId: string,
    @Body() dto: LinkStudentDto,
    @Req() request: Request,
  ) {
    return this.coaching.linkStudent(userId, dto, request);
  }

  @Patch('students/:id')
  @ApiOperation({ summary: 'Update a student link' })
  updateStudent(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateStudentDto,
  ) {
    return this.coaching.updateStudent(userId, id, dto);
  }

  // ── Leads ───────────────────────────────────────────────────────────────

  @Get('leads')
  @ApiOperation({ summary: 'List my CRM leads' })
  listLeads(
    @CurrentUser('sub') userId: string,
    @Query() query: ListLeadsQueryDto,
  ) {
    return this.coaching.listLeads(userId, query);
  }

  @Post('leads')
  @ApiOperation({ summary: 'Create a CRM lead' })
  createLead(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateLeadDto,
    @Req() request: Request,
  ) {
    return this.coaching.createLead(userId, dto, request);
  }

  @Patch('leads/:id')
  @ApiOperation({ summary: 'Update a CRM lead' })
  updateLead(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateLeadDto,
    @Req() request: Request,
  ) {
    return this.coaching.updateLead(userId, id, dto, request);
  }

  @Patch('leads/:id/stage')
  @ApiOperation({ summary: 'Update lead stage (optionally convert)' })
  updateLeadStage(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateLeadStageDto,
    @Req() request: Request,
  ) {
    return this.coaching.updateLeadStage(userId, id, dto, request);
  }

  // ── Health (linked student) ─────────────────────────────────────────────

  @Get('students/:athleteUserId/health-assessment')
  @ApiOperation({
    summary: 'View a linked athlete health assessment (privacy-gated)',
  })
  getStudentHealth(
    @CurrentUser('sub') userId: string,
    @Param('athleteUserId') athleteUserId: string,
  ) {
    return this.coaching.getHealthAssessmentForViewer({
      athleteUserId,
      viewerUserId: userId,
      viewerRole: 'coach',
    });
  }

  @Post('students/:athleteUserId/health-assessment/review')
  @ApiOperation({ summary: 'Mark a linked athlete health assessment reviewed' })
  reviewStudentHealth(
    @CurrentUser('sub') userId: string,
    @Param('athleteUserId') athleteUserId: string,
    @Body() dto: ReviewHealthAssessmentDto,
    @Req() request: Request,
  ) {
    return this.coaching.reviewHealthAssessment(
      userId,
      athleteUserId,
      dto,
      request,
    );
  }
}

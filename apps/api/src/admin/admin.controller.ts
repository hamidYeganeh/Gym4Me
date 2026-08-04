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
import { AuditService } from '../audit/audit.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums';
import { AdminKycService } from './admin-kyc.service';
import { AdminUsersService } from './admin-users.service';
import { AdminVerificationService } from './admin-verification.service';
import {
  AdminCreateUserDto,
  AdminUpdateUserDto,
  ListAuditLogsQueryDto,
  ListKycRequestsQueryDto,
  ListUsersQueryDto,
  ReviewKycDto,
  UpdateUserRolesDto,
  UpdateUserStatusDto,
} from './dto/admin.dto';
import {
  ListClubReviewsQueryDto,
  ListCoachVerificationsQueryDto,
  ReviewVerificationDto,
} from './dto/admin-review.dto';

@ApiTags('admin')
@ApiBearerAuth('access-token')
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminUsers: AdminUsersService,
    private readonly adminKyc: AdminKycService,
    private readonly adminVerification: AdminVerificationService,
    private readonly audit: AuditService,
  ) {}

  // ── Users ──────────────────────────────────────

  @Get('users')
  @ApiOperation({ summary: 'List users' })
  listUsers(@Query() query: ListUsersQueryDto) {
    return this.adminUsers.list(query);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user by id' })
  getUser(@Param('id') id: string) {
    return this.adminUsers.get(id);
  }

  @Post('users')
  @ApiOperation({ summary: 'Create a user' })
  createUser(
    @Body() dto: AdminCreateUserDto,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.adminUsers.create(dto, adminId, request);
  }

  @Patch('users/:id')
  @ApiOperation({ summary: 'Update a user' })
  updateUser(
    @Param('id') id: string,
    @Body() dto: AdminUpdateUserDto,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.adminUsers.update(id, dto, adminId, request);
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: 'Update user status' })
  updateUserStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.adminUsers.updateStatus(id, dto, adminId, request);
  }

  @Patch('users/:id/roles')
  @ApiOperation({ summary: 'Update user roles' })
  updateUserRoles(
    @Param('id') id: string,
    @Body() dto: UpdateUserRolesDto,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.adminUsers.updateRoles(id, dto, adminId, request);
  }

  @Delete('users/:id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Soft-delete a user' })
  deleteUser(
    @Param('id') id: string,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.adminUsers.remove(id, adminId, request);
  }

  // ── KYC review ─────────────────────────────────

  @Get('kyc/requests')
  @ApiOperation({ summary: 'List KYC review requests' })
  listKycRequests(@Query() query: ListKycRequestsQueryDto) {
    return this.adminKyc.list(query);
  }

  @Patch('kyc/requests/:id')
  @ApiOperation({ summary: 'Approve or reject a KYC request' })
  reviewKycRequest(
    @Param('id') id: string,
    @Body() dto: ReviewKycDto,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.adminKyc.review(id, dto, adminId, request);
  }

  // ── Coach verification ─────────────────────────

  @Get('coaches/verifications')
  @ApiOperation({ summary: 'List coach verification submissions' })
  listCoachVerifications(@Query() query: ListCoachVerificationsQueryDto) {
    return this.adminVerification.listCoachVerifications(query);
  }

  @Patch('coaches/:userId/verification')
  @ApiOperation({ summary: 'Approve or reject coach verification' })
  reviewCoachVerification(
    @Param('userId') userId: string,
    @Body() dto: ReviewVerificationDto,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.adminVerification.reviewCoach(userId, dto, adminId, request);
  }

  // ── Club review ────────────────────────────────

  @Get('clubs/reviews')
  @ApiOperation({ summary: 'List club review submissions' })
  listClubReviews(@Query() query: ListClubReviewsQueryDto) {
    return this.adminVerification.listClubReviews(query);
  }

  @Patch('clubs/:id/review')
  @ApiOperation({ summary: 'Approve or reject a club' })
  reviewClub(
    @Param('id') id: string,
    @Body() dto: ReviewVerificationDto,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.adminVerification.reviewClub(id, dto, adminId, request);
  }

  // ── Audit logs ─────────────────────────────────

  @Get('audit-logs')
  @ApiOperation({ summary: 'List audit logs' })
  listAuditLogs(@Query() query: ListAuditLogsQueryDto) {
    return this.audit.find(query);
  }
}

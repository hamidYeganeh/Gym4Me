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
  Res,
  StreamableFile,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuditService } from '../audit/audit.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role, UserStatus } from '../common/enums';
import { AdminImpersonationService } from './admin-impersonation.service';
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
  StartImpersonationDto,
  UpdateUserRolesDto,
  UpdateUserStatusDto,
  UserActivationDto,
} from './dto/admin.dto';
import {
  ListCoachVerificationsQueryDto,
  ReviewVerificationDto,
} from './dto/admin-review.dto';
import {
  ListRoleRequestsQueryDto,
  ReviewRoleRequestDto,
} from '../account/roles/dto/roles.dto';
import { RoleMembershipService } from '../account/roles/role-membership.service';

@ApiTags('admin')
@ApiBearerAuth('access-token')
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminUsers: AdminUsersService,
    private readonly adminKyc: AdminKycService,
    private readonly adminVerification: AdminVerificationService,
    private readonly roleMembership: RoleMembershipService,
    private readonly impersonation: AdminImpersonationService,
    private readonly audit: AuditService,
  ) {}

  // ── Users ──────────────────────────────────────

  @Get('users')
  @ApiOperation({ summary: 'List users' })
  listUsers(@Query() query: ListUsersQueryDto) {
    return this.adminUsers.list(query);
  }

  @Get('users/:userId')
  @ApiOperation({ summary: 'Get user by id' })
  getUser(@Param('userId') userId: string) {
    return this.adminUsers.get(userId);
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

  @Patch('users/:userId')
  @ApiOperation({ summary: 'Update a user' })
  updateUser(
    @Param('userId') userId: string,
    @Body() dto: AdminUpdateUserDto,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.adminUsers.update(userId, dto, adminId, request);
  }

  @Patch('users/:userId/status')
  @ApiOperation({ summary: 'Update user status' })
  updateUserStatus(
    @Param('userId') userId: string,
    @Body() dto: UpdateUserStatusDto,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.adminUsers.updateStatus(userId, dto, adminId, request);
  }

  @Patch('users/:userId/activate')
  @ApiOperation({ summary: 'Activate a user' })
  activateUser(
    @Param('userId') userId: string,
    @Body() dto: UserActivationDto = {},
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.adminUsers.updateStatus(
      userId,
      { status: UserStatus.ACTIVE, reason: dto.reason },
      adminId,
      request,
    );
  }

  @Patch('users/:userId/deactivate')
  @ApiOperation({ summary: 'Deactivate (block) a user' })
  deactivateUser(
    @Param('userId') userId: string,
    @Body() dto: UserActivationDto = {},
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.adminUsers.updateStatus(
      userId,
      { status: UserStatus.BLOCKED, reason: dto.reason },
      adminId,
      request,
    );
  }

  @Patch('users/:userId/roles')
  @ApiOperation({ summary: 'Update user roles' })
  updateUserRoles(
    @Param('userId') userId: string,
    @Body() dto: UpdateUserRolesDto,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.adminUsers.updateRoles(userId, dto, adminId, request);
  }

  @Delete('users/:userId')
  @HttpCode(200)
  @ApiOperation({ summary: 'Soft-delete a user' })
  deleteUser(
    @Param('userId') userId: string,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.adminUsers.remove(userId, adminId, request);
  }

  // ── KYC review ─────────────────────────────────

  @Get('kyc/requests')
  @ApiOperation({ summary: 'List KYC review requests' })
  listKycRequests(@Query() query: ListKycRequestsQueryDto) {
    return this.adminKyc.list(query);
  }

  @Get('kyc/requests/:id/document')
  @ApiOperation({ summary: 'Stream KYC document for admin review' })
  async getKycDocument(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const file = await this.adminKyc.openDocument(id);
    res.set({
      'Content-Type': file.mimeType,
      'Content-Length': String(file.size),
      'Content-Disposition': `inline; filename="${file.filename}"`,
    });
    return new StreamableFile(file.stream);
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

  // ── Role requests (coach / club_owner) ─────────

  @Get('role-requests')
  @ApiOperation({ summary: 'List pending role applications' })
  listRoleRequests(@Query() query: ListRoleRequestsQueryDto) {
    return this.roleMembership.listForAdmin(query);
  }

  @Patch('role-requests/:id')
  @ApiOperation({
    summary: 'Approve or reject a role request (grants role + notifies on approve)',
  })
  reviewRoleRequest(
    @Param('id') id: string,
    @Body() dto: ReviewRoleRequestDto,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.roleMembership.review(id, dto, adminId, request);
  }

  // ── Audit logs ─────────────────────────────────

  @Get('audit-logs')
  @ApiOperation({ summary: 'List audit logs' })
  listAuditLogs(@Query() query: ListAuditLogsQueryDto) {
    return this.audit.find(query);
  }

  // ── Impersonation ──────────────────────────────

  @Post('impersonation')
  @ApiOperation({
    summary:
      'Start impersonation session (reason required). Returns session id; JWT claim wiring deferred to AuthService.',
  })
  startImpersonation(
    @CurrentUser('sub') adminId: string,
    @Body() dto: StartImpersonationDto,
    @Req() request: Request,
  ) {
    return this.impersonation.start(
      adminId,
      dto.targetUserId,
      dto.reason,
      request,
    );
  }

  @Post('impersonation/:sessionId/end')
  @ApiOperation({ summary: 'End an impersonation session' })
  endImpersonation(
    @CurrentUser('sub') adminId: string,
    @Param('sessionId') sessionId: string,
    @Req() request: Request,
  ) {
    return this.impersonation.end(adminId, sessionId, request);
  }
}

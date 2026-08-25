import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequireStaffPermission } from '../../common/decorators/require-staff-permission.decorator';
import { StaffPermissionGuard } from '../../common/guards/staff-permission.guard';
import {
  MembershipActorKind,
  Role,
  StaffPermissionKey,
} from '../../common/enums';
import {
  CancelMembershipDto,
  ConsumeMembershipCreditDto,
  CreateMembershipPlanDto,
  FreezeMembershipDto,
  ImportMembershipsDto,
  ListClubMembershipsQueryDto,
  ListMembershipPlansQueryDto,
  PreviewMembershipRenewalDto,
  RenewMembershipDto,
  SellMembershipDto,
  TransferMembershipDto,
  UnfreezeMembershipDto,
  UpdateMembershipPlanDto,
} from './dto/membership.dto';
import { MembershipsService } from './memberships.service';

function membershipActor(userId: string, activeRole: Role) {
  return {
    userId,
    kind:
      activeRole === Role.CLUB_STAFF
        ? MembershipActorKind.STAFF
        : MembershipActorKind.OWNER,
  };
}

@ApiTags('club-owner-membership-plans')
@ApiBearerAuth('access-token')
@Roles(Role.CLUB_OWNER, Role.CLUB_STAFF)
@UseGuards(StaffPermissionGuard)
@RequireStaffPermission(StaffPermissionKey.MEMBERS_MANAGE)
@Controller('account/clubs/:clubId/membership-plans')
export class OwnerMembershipPlansController {
  constructor(private readonly memberships: MembershipsService) {}

  @Get()
  @ApiOperation({ summary: 'List membership plans for my club' })
  async list(
    @CurrentUser('sub') userId: string,
    @Param('clubId') clubId: string,
    @Query() query: ListMembershipPlansQueryDto,
  ) {
    return this.memberships.listPlans(clubId, query);
  }

  @Get(':planId')
  @ApiOperation({ summary: 'Get one membership plan' })
  async get(
    @CurrentUser('sub') userId: string,
    @Param('clubId') clubId: string,
    @Param('planId') planId: string,
  ) {
    return this.memberships.getPlan(clubId, planId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a club membership plan' })
  async create(
    @CurrentUser('sub') userId: string,
    @Param('clubId') clubId: string,
    @Body() dto: CreateMembershipPlanDto,
    @Req() request: Request,
  ) {
    return this.memberships.createPlan(clubId, dto, userId, request);
  }

  @Patch(':planId')
  @ApiOperation({ summary: 'Update a club membership plan' })
  async update(
    @CurrentUser('sub') userId: string,
    @Param('clubId') clubId: string,
    @Param('planId') planId: string,
    @Body() dto: UpdateMembershipPlanDto,
    @Req() request: Request,
  ) {
    return this.memberships.updatePlan(clubId, planId, dto, userId, request);
  }
}

@ApiTags('club-owner-memberships')
@ApiBearerAuth('access-token')
@Roles(Role.CLUB_OWNER, Role.CLUB_STAFF)
@UseGuards(StaffPermissionGuard)
@RequireStaffPermission(StaffPermissionKey.MEMBERS_MANAGE)
@Controller('account/clubs/:clubId/memberships')
export class OwnerMembershipsController {
  constructor(private readonly memberships: MembershipsService) {}

  @Get()
  @ApiOperation({ summary: 'List memberships sold at my club' })
  async list(
    @CurrentUser('sub') userId: string,
    @Param('clubId') clubId: string,
    @Query() query: ListClubMembershipsQueryDto,
  ) {
    return this.memberships.listClubMemberships(clubId, query);
  }

  @Get(':membershipId')
  @ApiOperation({ summary: 'Get one club membership' })
  async get(
    @CurrentUser('sub') userId: string,
    @Param('clubId') clubId: string,
    @Param('membershipId') membershipId: string,
  ) {
    return this.memberships.getClubMembership(clubId, membershipId);
  }

  @Post('import')
  @ApiOperation({ summary: 'Validate or import members parsed from CSV' })
  import(
    @CurrentUser('sub') userId: string,
    @CurrentUser('activeRole') activeRole: Role,
    @Param('clubId') clubId: string,
    @Body() dto: ImportMembershipsDto,
    @Req() request: Request,
  ) {
    return this.memberships.importMemberships(
      clubId,
      dto,
      membershipActor(userId, activeRole),
      request,
    );
  }

  @Post()
  @ApiOperation({
    summary: 'Desk-sell a membership (app user or guest holder)',
  })
  async sell(
    @CurrentUser('sub') userId: string,
    @CurrentUser('activeRole') activeRole: Role,
    @Param('clubId') clubId: string,
    @Body() dto: SellMembershipDto,
    @Req() request: Request,
  ) {
    return this.memberships.sellMembership(
      clubId,
      dto,
      membershipActor(userId, activeRole),
      request,
    );
  }

  @Post(':membershipId/freeze')
  @ApiOperation({ summary: 'Freeze an active membership' })
  async freeze(
    @CurrentUser('sub') userId: string,
    @CurrentUser('activeRole') activeRole: Role,
    @Param('clubId') clubId: string,
    @Param('membershipId') membershipId: string,
    @Body() dto: FreezeMembershipDto,
    @Req() request: Request,
  ) {
    return this.memberships.freeze(
      membershipId,
      dto,
      membershipActor(userId, activeRole),
      clubId,
      request,
    );
  }

  @Post(':membershipId/renewal-preview')
  @ApiOperation({ summary: 'Preview same-plan membership renewal' })
  previewRenewal(
    @Param('clubId') clubId: string,
    @Param('membershipId') membershipId: string,
    @Body() dto: PreviewMembershipRenewalDto,
  ) {
    return this.memberships.previewRenewal(clubId, membershipId, dto);
  }

  @Post(':membershipId/renew')
  @ApiOperation({ summary: 'Renew membership after price/effect consent' })
  renew(
    @CurrentUser('sub') userId: string,
    @CurrentUser('activeRole') activeRole: Role,
    @Param('clubId') clubId: string,
    @Param('membershipId') membershipId: string,
    @Body() dto: RenewMembershipDto,
    @Req() request: Request,
  ) {
    return this.memberships.renew(
      clubId,
      membershipId,
      dto,
      membershipActor(userId, activeRole),
      request,
    );
  }

  @Post(':membershipId/unfreeze')
  @ApiOperation({ summary: 'Unfreeze a membership (extends expiry)' })
  async unfreeze(
    @CurrentUser('sub') userId: string,
    @CurrentUser('activeRole') activeRole: Role,
    @Param('clubId') clubId: string,
    @Param('membershipId') membershipId: string,
    @Body() dto: UnfreezeMembershipDto,
    @Req() request: Request,
  ) {
    return this.memberships.unfreeze(
      membershipId,
      dto,
      membershipActor(userId, activeRole),
      clubId,
      request,
    );
  }

  @Post(':membershipId/transfer')
  @ApiOperation({ summary: 'Transfer membership to another holder' })
  async transfer(
    @CurrentUser('sub') userId: string,
    @CurrentUser('activeRole') activeRole: Role,
    @Param('clubId') clubId: string,
    @Param('membershipId') membershipId: string,
    @Body() dto: TransferMembershipDto,
    @Req() request: Request,
  ) {
    return this.memberships.transfer(
      membershipId,
      dto,
      membershipActor(userId, activeRole),
      clubId,
      request,
    );
  }

  @Post(':membershipId/cancel')
  @ApiOperation({ summary: 'Cancel a club membership' })
  async cancel(
    @CurrentUser('sub') userId: string,
    @CurrentUser('activeRole') activeRole: Role,
    @Param('clubId') clubId: string,
    @Param('membershipId') membershipId: string,
    @Body() dto: CancelMembershipDto,
    @Req() request: Request,
  ) {
    return this.memberships.cancel(
      membershipId,
      dto,
      membershipActor(userId, activeRole),
      clubId,
      request,
    );
  }

  @Post(':membershipId/consume')
  @RequireStaffPermission(StaffPermissionKey.MEMBERS_CHECKIN)
  @ApiOperation({ summary: 'Consume session/entry credit (desk check-in)' })
  async consume(
    @CurrentUser('sub') userId: string,
    @CurrentUser('activeRole') activeRole: Role,
    @Param('clubId') clubId: string,
    @Param('membershipId') membershipId: string,
    @Body() dto: ConsumeMembershipCreditDto,
  ) {
    return this.memberships.consumeCredit(
      membershipId,
      dto,
      membershipActor(userId, activeRole),
      clubId,
    );
  }
}

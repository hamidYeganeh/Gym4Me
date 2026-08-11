import {
  Body,
  Controller,
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
import { MembershipActorKind, Role } from '../../common/enums';
import {
  CancelMembershipDto,
  ConsumeMembershipCreditDto,
  CreateMembershipPlanDto,
  FreezeMembershipDto,
  ListClubMembershipsQueryDto,
  ListMembershipPlansQueryDto,
  SellMembershipDto,
  TransferMembershipDto,
  UnfreezeMembershipDto,
  UpdateMembershipPlanDto,
} from './dto/membership.dto';
import { MembershipsService } from './memberships.service';

@ApiTags('club-owner-membership-plans')
@ApiBearerAuth('access-token')
@Roles(Role.CLUB_OWNER)
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
    await this.memberships.requireOwnedClub(userId, clubId);
    return this.memberships.listPlans(clubId, query);
  }

  @Get(':planId')
  @ApiOperation({ summary: 'Get one membership plan' })
  async get(
    @CurrentUser('sub') userId: string,
    @Param('clubId') clubId: string,
    @Param('planId') planId: string,
  ) {
    await this.memberships.requireOwnedClub(userId, clubId);
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
    await this.memberships.requireOwnedClub(userId, clubId);
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
    await this.memberships.requireOwnedClub(userId, clubId);
    return this.memberships.updatePlan(clubId, planId, dto, userId, request);
  }
}

@ApiTags('club-owner-memberships')
@ApiBearerAuth('access-token')
@Roles(Role.CLUB_OWNER)
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
    await this.memberships.requireOwnedClub(userId, clubId);
    return this.memberships.listClubMemberships(clubId, query);
  }

  @Get(':membershipId')
  @ApiOperation({ summary: 'Get one club membership' })
  async get(
    @CurrentUser('sub') userId: string,
    @Param('clubId') clubId: string,
    @Param('membershipId') membershipId: string,
  ) {
    await this.memberships.requireOwnedClub(userId, clubId);
    return this.memberships.getClubMembership(clubId, membershipId);
  }

  @Get(':membershipId/events')
  @ApiOperation({ summary: 'Append-only membership event history' })
  async events(
    @CurrentUser('sub') userId: string,
    @Param('clubId') clubId: string,
    @Param('membershipId') membershipId: string,
  ) {
    await this.memberships.requireOwnedClub(userId, clubId);
    return this.memberships.listMembershipEvents(membershipId, clubId);
  }

  @Post()
  @ApiOperation({
    summary: 'Desk-sell a membership (app user or guest holder)',
  })
  async sell(
    @CurrentUser('sub') userId: string,
    @Param('clubId') clubId: string,
    @Body() dto: SellMembershipDto,
    @Req() request: Request,
  ) {
    await this.memberships.requireOwnedClub(userId, clubId);
    return this.memberships.sellMembership(
      clubId,
      dto,
      { userId, kind: MembershipActorKind.OWNER },
      request,
    );
  }

  @Post(':membershipId/freeze')
  @ApiOperation({ summary: 'Freeze an active membership' })
  async freeze(
    @CurrentUser('sub') userId: string,
    @Param('clubId') clubId: string,
    @Param('membershipId') membershipId: string,
    @Body() dto: FreezeMembershipDto,
    @Req() request: Request,
  ) {
    await this.memberships.requireOwnedClub(userId, clubId);
    return this.memberships.freeze(
      membershipId,
      dto,
      { userId, kind: MembershipActorKind.OWNER },
      clubId,
      request,
    );
  }

  @Post(':membershipId/unfreeze')
  @ApiOperation({ summary: 'Unfreeze a membership (extends expiry)' })
  async unfreeze(
    @CurrentUser('sub') userId: string,
    @Param('clubId') clubId: string,
    @Param('membershipId') membershipId: string,
    @Body() dto: UnfreezeMembershipDto,
    @Req() request: Request,
  ) {
    await this.memberships.requireOwnedClub(userId, clubId);
    return this.memberships.unfreeze(
      membershipId,
      dto,
      { userId, kind: MembershipActorKind.OWNER },
      clubId,
      request,
    );
  }

  @Post(':membershipId/transfer')
  @ApiOperation({ summary: 'Transfer membership to another holder' })
  async transfer(
    @CurrentUser('sub') userId: string,
    @Param('clubId') clubId: string,
    @Param('membershipId') membershipId: string,
    @Body() dto: TransferMembershipDto,
    @Req() request: Request,
  ) {
    await this.memberships.requireOwnedClub(userId, clubId);
    return this.memberships.transfer(
      membershipId,
      dto,
      { userId, kind: MembershipActorKind.OWNER },
      clubId,
      request,
    );
  }

  @Post(':membershipId/cancel')
  @ApiOperation({ summary: 'Cancel a club membership' })
  async cancel(
    @CurrentUser('sub') userId: string,
    @Param('clubId') clubId: string,
    @Param('membershipId') membershipId: string,
    @Body() dto: CancelMembershipDto,
    @Req() request: Request,
  ) {
    await this.memberships.requireOwnedClub(userId, clubId);
    return this.memberships.cancel(
      membershipId,
      dto,
      { userId, kind: MembershipActorKind.OWNER },
      clubId,
      request,
    );
  }

  @Post(':membershipId/consume')
  @ApiOperation({ summary: 'Consume session/entry credit (desk check-in)' })
  async consume(
    @CurrentUser('sub') userId: string,
    @Param('clubId') clubId: string,
    @Param('membershipId') membershipId: string,
    @Body() dto: ConsumeMembershipCreditDto,
  ) {
    await this.memberships.requireOwnedClub(userId, clubId);
    return this.memberships.consumeCredit(
      membershipId,
      dto,
      { userId, kind: MembershipActorKind.OWNER },
      clubId,
    );
  }
}

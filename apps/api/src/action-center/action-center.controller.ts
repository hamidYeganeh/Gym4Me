import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums';
import { ActionCenterService } from './action-center.service';
import { ActionCenterClickDto } from './action-center.dto';

@ApiTags('account')
@ApiBearerAuth('access-token')
@Controller('account/action-center')
export class ActionCenterController {
  constructor(private readonly actionCenter: ActionCenterService) {}

  @Get()
  @Roles(Role.ATHLETE, Role.COACH, Role.CLUB_OWNER)
  @ApiOperation({ summary: 'Get up to three role-specific priority actions' })
  get(
    @CurrentUser('sub') userId: string,
    @CurrentUser('activeRole') activeRole: Role,
  ) {
    return this.actionCenter.get(userId, activeRole);
  }

  @Post('click')
  @Roles(Role.ATHLETE, Role.COACH, Role.CLUB_OWNER)
  @ApiOperation({ summary: 'Record an action-center CTA click' })
  click(
    @Body() dto: ActionCenterClickDto,
    @CurrentUser('sub') userId: string,
    @CurrentUser('activeRole') activeRole: Role,
  ) {
    return this.actionCenter.click(userId, activeRole, dto);
  }
}

import { Body, Controller, HttpCode, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import type { Request } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums';
import type { JwtUser } from '../../common/types';
import { RoleMembershipService } from './role-membership.service';

class ApplyRoleDto {
  @IsEnum(Role)
  role!: Role;
}

@ApiTags('roles')
@ApiBearerAuth('access-token')
@Controller('account/roles')
export class RolesController {
  constructor(private readonly membership: RoleMembershipService) {}

  @Post('apply')
  @HttpCode(200)
  @ApiOperation({
    summary:
      'Apply a self-service role (coach | club_owner). Creates profile shell.',
  })
  apply(
    @CurrentUser() user: JwtUser,
    @Body() dto: ApplyRoleDto,
    @Req() request: Request,
  ) {
    return this.membership.applyRole(user, dto.role, request);
  }
}

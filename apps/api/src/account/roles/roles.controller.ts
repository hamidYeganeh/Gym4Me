import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseEnumPipe,
  Post,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums';
import type { JwtUser } from '../../common/types';
import { ApplyRoleDto, SubmitRoleRequestDto } from './dto/roles.dto';
import { RoleMembershipService } from './role-membership.service';

@ApiTags('roles')
@ApiBearerAuth('access-token')
@Controller('account/roles')
export class RolesController {
  constructor(private readonly membership: RoleMembershipService) {}

  @Get()
  @ApiOperation({
    summary:
      'List role availabilities (switchable) and self-service role request actions',
  })
  listMine(@CurrentUser() user: JwtUser) {
    return this.membership.listMine(user);
  }

  @Post('apply')
  @HttpCode(200)
  @ApiOperation({
    summary:
      'Start a coach/club_owner role application (pending until admin review). Does not grant the role.',
  })
  apply(
    @CurrentUser() user: JwtUser,
    @Body() dto: ApplyRoleDto,
    @Req() request: Request,
  ) {
    return this.membership.applyRole(user, dto.role, request);
  }

  @Post(':role/submit')
  @HttpCode(200)
  @ApiOperation({
    summary:
      'Submit role application documents/fields for admin review. Does not grant or switch role.',
  })
  submit(
    @CurrentUser() user: JwtUser,
    @Param('role', new ParseEnumPipe(Role)) role: Role,
    @Body() dto: SubmitRoleRequestDto,
    @Req() request: Request,
  ) {
    return this.membership.submit(user, role, dto, request);
  }
}

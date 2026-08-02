import {
  Body,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  Patch,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums';
import type { JwtUser } from '../../common/types';
import { UpdateMeDto } from './dto/update-me.dto';
import { ProfileService } from './profile.service';

@ApiTags('profile')
@ApiBearerAuth('access-token')
@Controller('account/profile')
export class ProfileController {
  constructor(private readonly profile: ProfileService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  me(@CurrentUser('sub') userId: string) {
    return this.profile.getMe(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  updateMe(@CurrentUser('sub') userId: string, @Body() dto: UpdateMeDto) {
    return this.profile.updateMe(userId, dto);
  }

  @Get('me/:role')
  @ApiOperation({ summary: 'Get role-specific profile for the current user' })
  meByRole(
    @CurrentUser() user: JwtUser,
    @Param('role', new ParseEnumPipe(Role)) role: Role,
  ) {
    return this.profile.getRoleProfile(user.sub, user.roles, role);
  }
}

import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums';
import { CheckinService } from './checkin.service';
import { ListCheckInsQueryDto } from './dto/checkin.dto';

@ApiTags('athlete-checkin')
@ApiBearerAuth('access-token')
@Roles(Role.ATHLETE)
@Controller('account/checkin')
export class AthleteCheckinController {
  constructor(private readonly checkin: CheckinService) {}

  @Get()
  @ApiOperation({ summary: 'My check-in history' })
  listMine(
    @CurrentUser('sub') userId: string,
    @Query() query: ListCheckInsQueryDto,
  ) {
    return this.checkin.listMine(userId, query);
  }
}

import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums';
import { ListTransactionsQueryDto } from './dto/gamification.dto';
import { GamificationService } from './gamification.service';

@ApiTags('account')
@ApiBearerAuth('access-token')
@Controller('account/gamification')
export class AccountGamificationController {
  constructor(private readonly gamification: GamificationService) {}

  @Get('summary')
  @ApiOperation({
    summary: 'Points balance + achievement counts for the active role',
  })
  summary(
    @CurrentUser('sub') userId: string,
    @CurrentUser('activeRole') activeRole: Role,
  ) {
    return this.gamification.getSummary(userId, activeRole);
  }

  @Get('achievements')
  @ApiOperation({
    summary: 'All achievements for the active role with locked/unlocked state',
  })
  achievements(
    @CurrentUser('sub') userId: string,
    @CurrentUser('activeRole') activeRole: Role,
  ) {
    return this.gamification.listMyAchievements(userId, activeRole);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Points history for the active role' })
  transactions(
    @CurrentUser('sub') userId: string,
    @CurrentUser('activeRole') activeRole: Role,
    @Query() query: ListTransactionsQueryDto,
  ) {
    return this.gamification.listMyTransactions(userId, activeRole, query);
  }
}

import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { CoachSlotsService } from './coach-slots.service';
import { CoachSlotsRangeQueryDto } from './dto/coach-slot.dto';

@ApiTags('discovery')
@Controller('discovery/coaches')
export class DiscoveryCoachSlotsController {
  constructor(private readonly slots: CoachSlotsService) {}

  @Public()
  @Get(':userId/slots')
  @ApiOperation({ summary: 'Public coach availability + consultation pricing' })
  list(
    @Param('userId') userId: string,
    @Query() query: CoachSlotsRangeQueryDto,
  ) {
    return this.slots.listPublic(userId, query.from, query.to);
  }
}

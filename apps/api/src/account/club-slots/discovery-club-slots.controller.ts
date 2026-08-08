import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { ClubSlotsService } from './club-slots.service';
import { ClubCalendarQueryDto } from './dto/club-slot.dto';

@ApiTags('discovery')
@Controller('discovery/clubs')
export class DiscoveryClubSlotsController {
  constructor(private readonly slots: ClubSlotsService) {}

  @Public()
  @Get(':clubId/calendar')
  @ApiOperation({
    summary: 'Public club calendar occurrences (expanded slots)',
  })
  calendar(
    @Param('clubId') clubId: string,
    @Query() query: ClubCalendarQueryDto,
  ) {
    return this.slots.getCalendar(clubId, query);
  }

  @Public()
  @Get(':clubId/classes')
  @ApiOperation({ summary: 'Public club classes' })
  classes(@Param('clubId') clubId: string) {
    return this.slots.listClasses(clubId);
  }

  @Public()
  @Get(':clubId/classes/:classId')
  @ApiOperation({ summary: 'Public club class detail' })
  getClass(
    @Param('clubId') clubId: string,
    @Param('classId') classId: string,
  ) {
    return this.slots.getClass(clubId, classId);
  }
}

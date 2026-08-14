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
  getClass(@Param('clubId') clubId: string, @Param('classId') classId: string) {
    return this.slots.getClass(clubId, classId);
  }

  @Public()
  @Get(':clubId/spaces')
  @ApiOperation({ summary: 'Public club spaces' })
  spaces(@Param('clubId') clubId: string) {
    return this.slots.listSpaces(clubId);
  }

  @Public()
  @Get(':clubId/spaces/:spaceId')
  @ApiOperation({ summary: 'Public club space detail' })
  getSpace(@Param('clubId') clubId: string, @Param('spaceId') spaceId: string) {
    return this.slots.getSpace(clubId, spaceId);
  }

  @Public()
  @Get(':clubId/slots')
  @ApiOperation({ summary: 'Public club slots' })
  listSlots(@Param('clubId') clubId: string) {
    return this.slots.listSlots(clubId);
  }

  @Public()
  @Get(':clubId/slots/:slotId')
  @ApiOperation({ summary: 'Public club slot detail' })
  getSlot(@Param('clubId') clubId: string, @Param('slotId') slotId: string) {
    return this.slots.getSlot(clubId, slotId);
  }
}

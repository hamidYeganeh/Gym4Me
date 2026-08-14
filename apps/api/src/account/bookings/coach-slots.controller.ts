import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums';
import { CoachSlotsService } from './coach-slots.service';
import {
  CoachSlotsRangeQueryDto,
  CreateCoachSlotsDto,
} from './dto/coach-slot.dto';

@ApiTags('coach-slots')
@ApiBearerAuth('access-token')
@Roles(Role.COACH)
@Controller('coach/slots')
export class CoachSlotsController {
  constructor(private readonly slots: CoachSlotsService) {}

  @Get()
  @ApiOperation({ summary: 'My availability slots in a date range' })
  list(
    @CurrentUser('sub') userId: string,
    @Query() query: CoachSlotsRangeQueryDto,
  ) {
    return this.slots.listMine(userId, query.from, query.to);
  }

  @Get('clubs')
  @ApiOperation({ summary: 'Clubs I can attach in-person slots to' })
  clubs(@CurrentUser('sub') userId: string) {
    return this.slots.listAffiliatedClubs(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Open availability slots' })
  create(@CurrentUser('sub') userId: string, @Body() dto: CreateCoachSlotsDto) {
    return this.slots.createMine(userId, dto.slots);
  }

  @Delete(':slotId')
  @ApiOperation({ summary: 'Remove an open (unbooked) slot' })
  remove(@CurrentUser('sub') userId: string, @Param('slotId') slotId: string) {
    return this.slots.deleteMine(userId, slotId);
  }
}

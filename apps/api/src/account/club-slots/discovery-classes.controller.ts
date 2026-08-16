import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { DiscoveryClassesService } from './discovery-classes.service';
import { DiscoveryClassesQueryDto } from './dto/discovery-classes.dto';

@ApiTags('discovery')
@Controller('discovery/classes')
export class DiscoveryClassesController {
  constructor(private readonly classes: DiscoveryClassesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Public discoverable classes list' })
  list(@Query() query: DiscoveryClassesQueryDto) {
    return this.classes.list(query);
  }

  @Public()
  @Get(':classId')
  @ApiOperation({ summary: 'Public discoverable class detail' })
  get(@Param('classId') classId: string) {
    return this.classes.get(classId);
  }
}

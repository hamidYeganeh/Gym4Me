import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { DiscoveryCoachesService } from './discovery-coaches.service';
import { DiscoveryCoachesQueryDto } from './dto/discovery-coaches.dto';

@ApiTags('discovery')
@Controller('discovery/coaches')
export class DiscoveryCoachesController {
  constructor(private readonly coaches: DiscoveryCoachesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Public approved coaches list' })
  list(@Query() query: DiscoveryCoachesQueryDto) {
    return this.coaches.list(query);
  }

  @Public()
  @Get(':userId')
  @ApiOperation({ summary: 'Public approved coach profile' })
  get(@Param('userId') userId: string) {
    return this.coaches.get(userId);
  }
}

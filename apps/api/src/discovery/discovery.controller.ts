import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { OptionalAuth } from '../common/decorators/optional-auth.decorator';
import { Public } from '../common/decorators/public.decorator';
import type { JwtUser } from '../common/types';
import { DiscoveryService } from './discovery.service';
import { DiscoveryFeedQueryDto } from './dto/discovery.dto';

@ApiTags('discovery')
@Controller('discovery')
export class DiscoveryController {
  constructor(private readonly discovery: DiscoveryService) {}

  @Public()
  @OptionalAuth()
  @Get()
  @ApiOperation({
    summary: 'Composable discovery feed with stable section pagination',
  })
  getFeed(
    @Query() query: DiscoveryFeedQueryDto,
    @CurrentUser() user?: JwtUser | null,
  ) {
    return this.discovery.getFeed(query, user);
  }
}

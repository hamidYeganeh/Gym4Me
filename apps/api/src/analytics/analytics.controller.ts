import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtUser } from '../common/types';
import { AttributionService } from './attribution.service';
import { CaptureAttributionDto } from './dto/attribution.dto';

@ApiTags('analytics')
@ApiBearerAuth('access-token')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly attribution: AttributionService) {}

  @Get('attribution')
  @ApiOperation({ summary: 'Get first/last touch attribution for current user' })
  getAttribution(@CurrentUser('sub') userId: string) {
    return this.attribution.get(userId);
  }

  @Post('attribution')
  @ApiOperation({
    summary:
      'Capture a touch point (firstTouch write-once, lastTouch always updated)',
  })
  capture(
    @CurrentUser() user: JwtUser,
    @Body() dto: CaptureAttributionDto,
  ) {
    return this.attribution.capture(
      user.sub,
      {
        ...dto.touch,
        capturedAt: dto.touch.capturedAt
          ? new Date(dto.touch.capturedAt)
          : undefined,
      },
      user.activeRole,
    );
  }
}

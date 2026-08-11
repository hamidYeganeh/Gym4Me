import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { BannersService } from './banners.service';
import { ListBannersQueryDto } from './dto/banner.dto';

@ApiTags('banners')
@Controller('banners')
export class BannersController {
  constructor(private readonly banners: BannersService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List active banners for a placement' })
  list(@Query() query: ListBannersQueryDto) {
    return this.banners.listActive(query);
  }
}

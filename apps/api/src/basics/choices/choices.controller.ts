import { Controller, Get, Header, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { asSinglePageResult } from '../../common/utils/pagination.util';
import { ChoicesService } from './choices.service';

/** Choice catalogs change rarely; browsers/CDNs and clients may cache for 4h. */
const CHOICES_CACHE_CONTROL = 'public, max-age=14400';

@ApiTags('basics')
@Public()
@Controller('basics/choices')
export class ChoicesController {
  constructor(private readonly choices: ChoicesService) {}

  @Get()
  @Header('Cache-Control', CHOICES_CACHE_CONTROL)
  @ApiOperation({
    summary: 'List all active choice groups (gender, levels, units, …)',
  })
  list() {
    return this.choices.listPublic();
  }

  @Get('units')
  @Header('Cache-Control', CHOICES_CACHE_CONTROL)
  @ApiOperation({ summary: 'List active unit choice groups' })
  async listUnits() {
    return asSinglePageResult(await this.choices.listUnitGroups());
  }

  @Get(':key')
  @Header('Cache-Control', CHOICES_CACHE_CONTROL)
  @ApiOperation({ summary: 'Get one choice group by key' })
  get(@Param('key') key: string) {
    return this.choices.getPublic(key);
  }
}

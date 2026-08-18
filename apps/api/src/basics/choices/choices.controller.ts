import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { asSinglePageResult } from '../../common/utils/pagination.util';
import { ChoicesService } from './choices.service';

@ApiTags('basics')
@Public()
@Controller('basics/choices')
export class ChoicesController {
  constructor(private readonly choices: ChoicesService) {}

  @Get()
  @ApiOperation({
    summary: 'List all active choice groups (gender, levels, units, …)',
  })
  list() {
    return this.choices.listPublic();
  }

  @Get('units')
  @ApiOperation({ summary: 'List active unit choice groups' })
  async listUnits() {
    return asSinglePageResult(await this.choices.listUnitGroups());
  }

  @Get(':key')
  @ApiOperation({ summary: 'Get one choice group by key' })
  get(@Param('key') key: string) {
    return this.choices.getPublic(key);
  }
}

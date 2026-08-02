import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { RefService } from './ref.service';

/**
 * Generic flat refs: equipment, amenity, muscle, goal_type, …
 * Sport hierarchy lives in SportController on the same `/basics/ref` prefix
 * with more-specific paths registered first.
 */
@ApiTags('basics')
@Public()
@Controller('basics/ref')
export class RefController {
  constructor(private readonly refs: RefService) {}

  @Get(':type')
  @ApiOperation({
    summary: 'List ref items by type (equipment, amenity, muscle, …)',
  })
  list(@Param('type') type: string) {
    return this.refs.list(this.refs.parseType(type));
  }

  @Get(':type/:id')
  @ApiOperation({ summary: 'Get one ref item' })
  get(@Param('type') type: string, @Param('id') id: string) {
    return this.refs.getById(this.refs.parseType(type), id);
  }
}

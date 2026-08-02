import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { SportService } from './sport.service';

@ApiTags('basics')
@Public()
@Controller('basics/ref')
export class SportController {
  constructor(private readonly sports: SportService) {}

  @Get('sport-category')
  @ApiOperation({ summary: 'List sport categories (e.g. ball sports)' })
  listCategories() {
    return this.sports.listByKind(this.sports.resolvePathKind('sport-category'));
  }

  @Get('sport-category/:id')
  @ApiOperation({ summary: 'Get a sport category' })
  getCategory(@Param('id') id: string) {
    return this.sports.getById(id);
  }

  @Get('sport-category/:id/sports')
  @ApiOperation({ summary: 'List sports under a category' })
  listSportsOfCategory(@Param('id') id: string) {
    return this.sports.listChildren(id);
  }

  @Get('sport')
  @ApiQuery({ name: 'parentId', required: false })
  @ApiOperation({ summary: 'List sports (optionally filter by category)' })
  listSports(@Query('parentId') parentId?: string) {
    return this.sports.listByKind(
      this.sports.resolvePathKind('sport'),
      parentId,
    );
  }

  @Get('sport/:id')
  @ApiOperation({ summary: 'Get a sport' })
  getSport(@Param('id') id: string) {
    return this.sports.getById(id);
  }

  @Get('sport/:id/branches')
  @ApiOperation({ summary: 'List branches under a sport' })
  listBranchesOfSport(@Param('id') id: string) {
    return this.sports.listChildren(id);
  }

  @Get('sport-branch')
  @ApiQuery({ name: 'parentId', required: false })
  @ApiOperation({ summary: 'List sport branches' })
  listBranches(@Query('parentId') parentId?: string) {
    return this.sports.listByKind(
      this.sports.resolvePathKind('sport-branch'),
      parentId,
    );
  }

  @Get('sport-branch/:id')
  @ApiOperation({ summary: 'Get a sport branch' })
  getBranch(@Param('id') id: string) {
    return this.sports.getById(id);
  }
}

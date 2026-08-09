import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums';
import { ArticlesService } from './articles.service';
import {
  AdminListArticlesQueryDto,
  CreateArticleDto,
  UpdateArticleDto,
} from './dto/admin-article.dto';

@ApiTags('admin')
@ApiBearerAuth('access-token')
@Roles(Role.ADMIN)
@Controller('admin/articles')
export class AdminArticlesController {
  constructor(private readonly articles: ArticlesService) {}

  @Get()
  @ApiOperation({ summary: 'List articles (all statuses)' })
  list(@Query() query: AdminListArticlesQueryDto) {
    return this.articles.adminList(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an article by id' })
  get(@Param('id') id: string) {
    return this.articles.adminGet(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create an article' })
  create(
    @Body() dto: CreateArticleDto,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.articles.create(dto, adminId, request);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an article' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateArticleDto,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.articles.update(id, dto, adminId, request);
  }

  @Delete(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete an article' })
  remove(
    @Param('id') id: string,
    @CurrentUser('sub') adminId: string,
    @Req() request: Request,
  ) {
    return this.articles.remove(id, adminId, request);
  }
}

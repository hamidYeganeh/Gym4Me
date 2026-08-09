import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { ArticlesService } from './articles.service';
import {
  ListArticleCommentsQueryDto,
  ListArticlesQueryDto,
} from './dto/article.dto';

@ApiTags('articles')
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articles: ArticlesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List published articles' })
  list(@Query() query: ListArticlesQueryDto) {
    return this.articles.listPublished(query);
  }

  @Public()
  @Get('facets')
  @ApiOperation({
    summary: 'List published article categories, kinds, and audiences',
  })
  facets() {
    return this.articles.listFacets();
  }

  @Public()
  @Get(':slug/related')
  @ApiOperation({ summary: 'List related published articles' })
  related(@Param('slug') slug: string) {
    return this.articles.listRelated(slug);
  }

  @Public()
  @Get(':slug/comments')
  @ApiOperation({ summary: 'List comments for a published article' })
  async comments(
    @Param('slug') slug: string,
    @Query() query: ListArticleCommentsQueryDto,
  ) {
    const article = await this.articles.findPublishedBySlug(slug);
    return this.articles.listComments(article.id, query);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get a published article by slug' })
  getBySlug(@Param('slug') slug: string) {
    return this.articles.getPublishedBySlug(slug);
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums';
import { ArticlesService } from './articles.service';
import { CreateArticleCommentDto } from './dto/article.dto';

@ApiTags('account')
@ApiBearerAuth('access-token')
@Controller('account/articles')
export class AccountArticlesController {
  constructor(private readonly articles: ArticlesService) {}

  @Get(':articleId/state')
  @ApiOperation({ summary: 'Get viewer like/save state for an article' })
  state(
    @Param('articleId') articleId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.articles.getViewerState(articleId, userId);
  }

  @Post(':articleId/like')
  @HttpCode(200)
  @ApiOperation({ summary: 'Like an article' })
  like(
    @Param('articleId') articleId: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('activeRole') activeRole: Role,
    @Req() request: Request,
  ) {
    return this.articles.like(articleId, userId, request, activeRole);
  }

  @Post(':articleId/read')
  @HttpCode(200)
  @ApiOperation({ summary: 'Mark an article as read by the viewer' })
  read(
    @Param('articleId') articleId: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('activeRole') activeRole: Role,
    @Req() request: Request,
  ) {
    return this.articles.markRead(articleId, userId, request, activeRole);
  }

  @Delete(':articleId/like')
  @HttpCode(200)
  @ApiOperation({ summary: 'Unlike an article' })
  unlike(
    @Param('articleId') articleId: string,
    @CurrentUser('sub') userId: string,
    @Req() request: Request,
  ) {
    return this.articles.unlike(articleId, userId, request);
  }

  @Post(':articleId/save')
  @HttpCode(200)
  @ApiOperation({ summary: 'Save (bookmark) an article' })
  save(
    @Param('articleId') articleId: string,
    @CurrentUser('sub') userId: string,
    @Req() request: Request,
  ) {
    return this.articles.save(articleId, userId, request);
  }

  @Delete(':articleId/save')
  @HttpCode(200)
  @ApiOperation({ summary: 'Remove saved article' })
  unsave(
    @Param('articleId') articleId: string,
    @CurrentUser('sub') userId: string,
    @Req() request: Request,
  ) {
    return this.articles.unsave(articleId, userId, request);
  }

  @Throttle({ default: { limit: 20, ttl: 3_600_000 } })
  @Post(':articleId/comments')
  @ApiOperation({ summary: 'Comment on an article' })
  comment(
    @Param('articleId') articleId: string,
    @Body() dto: CreateArticleCommentDto,
    @CurrentUser('sub') userId: string,
    @Req() request: Request,
  ) {
    return this.articles.createComment(articleId, dto, userId, request);
  }
}

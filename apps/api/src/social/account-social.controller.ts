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
import { Role } from '../common/enums';
import {
  CreateSocialCommentDto,
  CreateSocialPostDto,
  ListSocialCommentsQueryDto,
  ListSocialPostsQueryDto,
  UpdateSocialPostDto,
} from './dto/social.dto';
import { SocialService } from './social.service';

@ApiTags('account')
@ApiBearerAuth('access-token')
@Controller('account/social')
export class AccountSocialController {
  constructor(private readonly social: SocialService) {}

  @Get('feed')
  @ApiOperation({
    summary: 'Authenticated feed (public posts + own posts)',
  })
  feed(
    @CurrentUser('sub') userId: string,
    @CurrentUser('activeRole') activeRole: Role,
    @Query() query: ListSocialPostsQueryDto,
  ) {
    return this.social.listFeed(userId, activeRole, query);
  }

  @Get('posts/:id')
  @ApiOperation({ summary: 'Get a social post' })
  get(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.social.getPost(id, userId);
  }

  @Post('posts')
  @ApiOperation({ summary: 'Create a social post' })
  create(
    @Body() dto: CreateSocialPostDto,
    @CurrentUser('sub') userId: string,
    @Req() request: Request,
  ) {
    return this.social.createPost(dto, userId, request);
  }

  @Patch('posts/:id')
  @ApiOperation({ summary: 'Update own social post' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSocialPostDto,
    @CurrentUser('sub') userId: string,
    @CurrentUser('activeRole') activeRole: Role,
    @Req() request: Request,
  ) {
    return this.social.updatePost(id, dto, userId, activeRole, request);
  }

  @Delete('posts/:id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Soft-delete own social post' })
  remove(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('activeRole') activeRole: Role,
    @Req() request: Request,
  ) {
    return this.social.deletePost(id, userId, activeRole, request);
  }

  @Get('posts/:id/comments')
  @ApiOperation({ summary: 'List comments on a post' })
  listComments(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Query() query: ListSocialCommentsQueryDto,
  ) {
    return this.social.listComments(id, query, userId);
  }

  @Post('posts/:id/comments')
  @ApiOperation({ summary: 'Comment on a post' })
  createComment(
    @Param('id') id: string,
    @Body() dto: CreateSocialCommentDto,
    @CurrentUser('sub') userId: string,
    @Req() request: Request,
  ) {
    return this.social.createComment(id, dto, userId, request);
  }

  @Delete('posts/:postId/comments/:commentId')
  @HttpCode(200)
  @ApiOperation({ summary: 'Soft-delete a comment' })
  deleteComment(
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('activeRole') activeRole: Role,
    @Req() request: Request,
  ) {
    return this.social.deleteComment(
      postId,
      commentId,
      userId,
      activeRole,
      request,
    );
  }

  @Post('posts/:id/like')
  @HttpCode(200)
  @ApiOperation({ summary: 'Toggle like on a post' })
  toggleLike(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Req() request: Request,
  ) {
    return this.social.toggleLike(id, userId, request);
  }
}

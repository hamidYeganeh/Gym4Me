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
  Res,
  StreamableFile,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums';
import {
  CreateSocialCommentDto,
  CreateSocialPostDto,
  CreateSocialReportDto,
  FollowInputDto,
  ListSocialCommentsQueryDto,
  ListSocialFollowsQueryDto,
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

  @Get('posts/:postId/media/:mediaId')
  @ApiOperation({ summary: 'Stream post media with post visibility checks' })
  async getPostMedia(
    @Param('postId') postId: string,
    @Param('mediaId') mediaId: string,
    @CurrentUser('sub') userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const file = await this.social.openPostMedia(postId, mediaId, userId);
    res.set({
      'Content-Type': file.mimeType,
      'Content-Length': String(file.size),
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    return new StreamableFile(file.stream);
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

  @Post('posts/:id/save')
  @HttpCode(200)
  @ApiOperation({ summary: 'Toggle bookmark/save on a post' })
  toggleSave(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Req() request: Request,
  ) {
    return this.social.toggleSave(id, userId, request);
  }

  @Get('saves')
  @ApiOperation({ summary: 'List my saved posts' })
  listSaves(
    @CurrentUser('sub') userId: string,
    @Query() query: ListSocialPostsQueryDto,
  ) {
    return this.social.listSaves(userId, query);
  }

  @Post('follow')
  @ApiOperation({ summary: 'Follow a user or club' })
  follow(
    @CurrentUser('sub') userId: string,
    @Body() dto: FollowInputDto,
    @Req() request: Request,
  ) {
    return this.social.follow(userId, dto, request);
  }

  @Post('unfollow')
  @HttpCode(200)
  @ApiOperation({ summary: 'Unfollow a user or club' })
  unfollow(
    @CurrentUser('sub') userId: string,
    @Body() dto: FollowInputDto,
    @Req() request: Request,
  ) {
    return this.social.unfollow(userId, dto, request);
  }

  @Get('following')
  @ApiOperation({ summary: 'List who I follow' })
  listFollowing(
    @CurrentUser('sub') userId: string,
    @Query() query: ListSocialFollowsQueryDto,
  ) {
    return this.social.listFollowing(userId, query);
  }

  @Get('followers')
  @ApiOperation({ summary: 'List my followers' })
  listFollowers(
    @CurrentUser('sub') userId: string,
    @Query() query: ListSocialFollowsQueryDto,
  ) {
    return this.social.listFollowers(userId, query);
  }

  @Post('reports')
  @ApiOperation({ summary: 'Report a post, comment, or user' })
  report(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateSocialReportDto,
    @Req() request: Request,
  ) {
    return this.social.createReport(userId, dto, request);
  }
}

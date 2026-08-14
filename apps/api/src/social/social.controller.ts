import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import {
  ListSocialCommentsQueryDto,
  ListSocialPostsQueryDto,
} from './dto/social.dto';
import { SocialService } from './social.service';

@ApiTags('social')
@Public()
@Controller('social')
export class SocialController {
  constructor(private readonly social: SocialService) {}

  @Get('feed')
  @ApiOperation({ summary: 'Public social feed (published + public only)' })
  feed(@Query() query: ListSocialPostsQueryDto) {
    return this.social.listPublicFeed(query);
  }

  @Get('posts/:id')
  @ApiOperation({ summary: 'Get a public social post' })
  get(@Param('id') id: string) {
    return this.social.getPost(id);
  }

  @Get('posts/:id/comments')
  @ApiOperation({ summary: 'List comments on a public post' })
  comments(
    @Param('id') id: string,
    @Query() query: ListSocialCommentsQueryDto,
  ) {
    return this.social.listComments(id, query);
  }
}

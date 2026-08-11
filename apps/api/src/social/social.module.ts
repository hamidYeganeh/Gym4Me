import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SocialComment,
  SocialCommentSchema,
} from '../schemas/social-comment.schema';
import { SocialLike, SocialLikeSchema } from '../schemas/social-like.schema';
import { SocialPost, SocialPostSchema } from '../schemas/social-post.schema';
import { AccountSocialController } from './account-social.controller';
import { SocialController } from './social.controller';
import { SocialService } from './social.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SocialPost.name, schema: SocialPostSchema },
      { name: SocialComment.name, schema: SocialCommentSchema },
      { name: SocialLike.name, schema: SocialLikeSchema },
    ]),
  ],
  controllers: [SocialController, AccountSocialController],
  providers: [SocialService],
  exports: [SocialService],
})
export class SocialModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SocialComment,
  SocialCommentSchema,
} from '../schemas/social-comment.schema';
import {
  SocialFollow,
  SocialFollowSchema,
} from '../schemas/social-follow.schema';
import { SocialLike, SocialLikeSchema } from '../schemas/social-like.schema';
import { SocialPost, SocialPostSchema } from '../schemas/social-post.schema';
import {
  SocialReport,
  SocialReportSchema,
} from '../schemas/social-report.schema';
import { SocialSave, SocialSaveSchema } from '../schemas/social-save.schema';
import { AccountSocialController } from './account-social.controller';
import { AdminSocialController } from './admin-social.controller';
import { SocialController } from './social.controller';
import { SocialService } from './social.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SocialPost.name, schema: SocialPostSchema },
      { name: SocialComment.name, schema: SocialCommentSchema },
      { name: SocialLike.name, schema: SocialLikeSchema },
      { name: SocialFollow.name, schema: SocialFollowSchema },
      { name: SocialSave.name, schema: SocialSaveSchema },
      { name: SocialReport.name, schema: SocialReportSchema },
    ]),
  ],
  controllers: [
    SocialController,
    AccountSocialController,
    AdminSocialController,
  ],
  providers: [SocialService],
  exports: [SocialService],
})
export class SocialModule {}

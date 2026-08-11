import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GamificationModule } from '../gamification/gamification.module';
import { MediaModule } from '../media/media.module';
import {
  ArticleComment,
  ArticleCommentSchema,
} from '../schemas/article-comment.schema';
import {
  ArticleUserState,
  ArticleUserStateSchema,
} from '../schemas/article-user-state.schema';
import { Article, ArticleSchema } from '../schemas/article.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { AccountArticlesController } from './account-articles.controller';
import { AdminArticlesController } from './admin-articles.controller';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';

@Module({
  imports: [
    MediaModule,
    GamificationModule,
    MongooseModule.forFeature([
      { name: Article.name, schema: ArticleSchema },
      { name: ArticleComment.name, schema: ArticleCommentSchema },
      { name: ArticleUserState.name, schema: ArticleUserStateSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [
    ArticlesController,
    AdminArticlesController,
    AccountArticlesController,
  ],
  providers: [ArticlesService],
  exports: [ArticlesService],
})
export class ArticlesModule {}

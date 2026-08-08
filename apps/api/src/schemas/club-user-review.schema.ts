import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ClubUserReviewStatus } from '../common/enums';
import { Club } from './club.schema';
import { RefItem } from './ref-item.schema';
import { User } from './user.schema';

export type ClubUserReviewDocument = HydratedDocument<ClubUserReview>;

@Schema({ _id: false })
export class ReviewCriterionRating {
  @Prop({ type: Types.ObjectId, ref: RefItem.name, required: true })
  criterionId!: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  rating!: number;
}

export const ReviewCriterionRatingSchema = SchemaFactory.createForClass(
  ReviewCriterionRating,
);

@Schema({ _id: false })
export class ClubReviewReply {
  @Prop({ required: true, trim: true })
  text!: string;

  @Prop({ required: true })
  repliedAt!: Date;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  repliedBy!: Types.ObjectId;
}

export const ClubReviewReplySchema =
  SchemaFactory.createForClass(ClubReviewReply);

@Schema({ timestamps: true, collection: 'club_user_reviews' })
export class ClubUserReview {
  @Prop({ type: Types.ObjectId, ref: Club.name, required: true, index: true })
  clubId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  authorId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  bookingId?: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  rating!: number;

  @Prop({ type: [ReviewCriterionRatingSchema], default: [] })
  criteria!: ReviewCriterionRating[];

  @Prop({ trim: true })
  comment?: string;

  @Prop({
    type: String,
    enum: ClubUserReviewStatus,
    default: ClubUserReviewStatus.PENDING,
    index: true,
  })
  status!: ClubUserReviewStatus;

  @Prop({ type: ClubReviewReplySchema })
  reply?: ClubReviewReply;

  createdAt!: Date;
  updatedAt!: Date;
}

export const ClubUserReviewSchema =
  SchemaFactory.createForClass(ClubUserReview);

ClubUserReviewSchema.index({ clubId: 1, status: 1, createdAt: -1 });
ClubUserReviewSchema.index(
  { clubId: 1, authorId: 1, bookingId: 1 },
  { unique: true, sparse: true },
);

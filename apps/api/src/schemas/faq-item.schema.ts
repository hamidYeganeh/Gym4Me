import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { FaqAudience, PublishStatus } from '../common/enums';
import { User } from './user.schema';

export type FaqItemDocument = HydratedDocument<FaqItem>;

@Schema({ timestamps: true, collection: 'faq_items' })
export class FaqItem {
  @Prop({ required: true, trim: true, maxlength: 300 })
  question!: string;

  @Prop({ required: true, trim: true, maxlength: 5000 })
  answer!: string;

  @Prop({
    type: String,
    enum: FaqAudience,
    default: FaqAudience.ALL,
    index: true,
  })
  audience!: FaqAudience;

  @Prop({
    type: String,
    enum: PublishStatus,
    default: PublishStatus.DRAFT,
    index: true,
  })
  publishStatus!: PublishStatus;

  /** Manual ordering within the public FAQ list (ascending). */
  @Prop({ default: 0 })
  order!: number;

  @Prop({ type: Types.ObjectId, ref: User.name })
  updatedBy?: Types.ObjectId;

  createdAt!: Date;
  updatedAt!: Date;
}

export const FaqItemSchema = SchemaFactory.createForClass(FaqItem);

FaqItemSchema.index({ publishStatus: 1, audience: 1, order: 1 });

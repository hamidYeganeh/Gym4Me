import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  BannerLinkKind,
  BannerPlacement,
  PublishStatus,
} from '../common/enums';
import { Media } from './media.schema';
import { User } from './user.schema';

export type BannerDocument = HydratedDocument<Banner>;

@Schema({ _id: false })
export class BannerSlide {
  @Prop({ type: Types.ObjectId, ref: Media.name, required: true })
  mediaId!: Types.ObjectId;

  @Prop({
    type: String,
    enum: BannerLinkKind,
    default: BannerLinkKind.NONE,
  })
  linkKind!: BannerLinkKind;

  /** In-app route for `internal`, absolute URL for `external`. */
  @Prop({ trim: true, maxlength: 2000 })
  linkUrl?: string;

  @Prop({ trim: true, maxlength: 200 })
  alt?: string;
}

export const BannerSlideSchema = SchemaFactory.createForClass(BannerSlide);

@Schema({ _id: false })
export class BannerSchedule {
  @Prop({ type: Date })
  startsAt?: Date;

  @Prop({ type: Date })
  endsAt?: Date;
}

export const BannerScheduleSchema =
  SchemaFactory.createForClass(BannerSchedule);

@Schema({ timestamps: true, collection: 'banners' })
export class Banner {
  /** Admin-facing label; never rendered to end users. */
  @Prop({ required: true, trim: true, maxlength: 200 })
  title!: string;

  @Prop({
    type: String,
    enum: BannerPlacement,
    required: true,
    index: true,
  })
  placement!: BannerPlacement;

  @Prop({ type: [BannerSlideSchema], default: [] })
  slides!: BannerSlide[];

  @Prop({
    type: String,
    enum: PublishStatus,
    default: PublishStatus.DRAFT,
    index: true,
  })
  publishStatus!: PublishStatus;

  /** Optional campaign window; open-ended when a bound is missing. */
  @Prop({ type: BannerScheduleSchema, default: () => ({}) })
  schedule!: BannerSchedule;

  /** Manual ordering within a placement (ascending). */
  @Prop({ default: 0 })
  order!: number;

  @Prop({ type: Types.ObjectId, ref: User.name })
  updatedBy?: Types.ObjectId;

  createdAt!: Date;
  updatedAt!: Date;
}

export const BannerSchema = SchemaFactory.createForClass(Banner);

BannerSchema.index({ placement: 1, publishStatus: 1, order: 1 });

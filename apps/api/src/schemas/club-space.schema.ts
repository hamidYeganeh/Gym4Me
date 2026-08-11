import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EntityStatus } from '../common/enums';
import { Media } from './media.schema';
import { Sport } from './sport.schema';

export type ClubSpaceDocument = HydratedDocument<ClubSpace>;

@Schema({ _id: false })
export class ClubSpaceMedia {
  @Prop({ type: Types.ObjectId, ref: Media.name })
  coverMediaId?: Types.ObjectId;
}

export const ClubSpaceMediaSchema =
  SchemaFactory.createForClass(ClubSpaceMedia);

/** Bookable physical space inside a club: court, hall, pool lane, … */
@Schema({ timestamps: true, collection: 'club_spaces' })
export class ClubSpace {
  @Prop({ type: Types.ObjectId, ref: 'Club', required: true, index: true })
  clubId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ type: Types.ObjectId, ref: Sport.name, index: true })
  sportId?: Types.ObjectId;

  @Prop({ type: ClubSpaceMediaSchema, default: () => ({}) })
  media!: ClubSpaceMedia;

  @Prop({
    type: String,
    enum: EntityStatus,
    default: EntityStatus.ACTIVE,
    index: true,
  })
  status!: EntityStatus;

  createdAt!: Date;
  updatedAt!: Date;
}

export const ClubSpaceSchema = SchemaFactory.createForClass(ClubSpace);

ClubSpaceSchema.index({ clubId: 1, status: 1 });
ClubSpaceSchema.index({ clubId: 1, title: 1 });

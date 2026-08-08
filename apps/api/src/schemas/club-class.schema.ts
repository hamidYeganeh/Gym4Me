import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EntityStatus } from '../common/enums';
import { Media } from './media.schema';
import { Sport } from './sport.schema';
import { User } from './user.schema';

export type ClubClassDocument = HydratedDocument<ClubClass>;

@Schema({ _id: false })
export class ClubClassMedia {
  @Prop({ type: Types.ObjectId, ref: Media.name })
  coverMediaId?: Types.ObjectId;
}

export const ClubClassMediaSchema =
  SchemaFactory.createForClass(ClubClassMedia);

@Schema({ timestamps: true, collection: 'club_classes' })
export class ClubClass {
  @Prop({ type: Types.ObjectId, ref: 'Club', required: true, index: true })
  clubId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ type: Types.ObjectId, ref: Sport.name, index: true })
  sportId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, index: true })
  coachId?: Types.ObjectId;

  @Prop({ type: ClubClassMediaSchema, default: () => ({}) })
  media!: ClubClassMedia;

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

export const ClubClassSchema = SchemaFactory.createForClass(ClubClass);

ClubClassSchema.index({ clubId: 1, status: 1 });
ClubClassSchema.index({ clubId: 1, title: 1 });

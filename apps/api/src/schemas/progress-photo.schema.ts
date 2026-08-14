import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Privacy } from '../common/enums';
import { Media } from './media.schema';
import { User } from './user.schema';

export type ProgressPhotoDocument = HydratedDocument<ProgressPhoto>;

@Schema({ timestamps: true, collection: 'progress_photos' })
export class ProgressPhoto {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  athleteUserId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Media.name, required: true })
  mediaId!: Types.ObjectId;

  @Prop({
    type: String,
    enum: Privacy,
    default: Privacy.PRIVATE,
    index: true,
  })
  privacy!: Privacy;

  @Prop({ type: Date, required: true, index: true })
  capturedAt!: Date;

  @Prop({ trim: true, maxlength: 500 })
  note?: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const ProgressPhotoSchema = SchemaFactory.createForClass(ProgressPhoto);

ProgressPhotoSchema.index({ athleteUserId: 1, capturedAt: -1 });

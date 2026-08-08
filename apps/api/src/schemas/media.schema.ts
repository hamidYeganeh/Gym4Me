import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type MediaDocument = HydratedDocument<Media>;

@Schema({ timestamps: true, collection: 'media' })
export class Media {
  @Prop({ required: true })
  path!: string;

  @Prop({ required: true })
  mimeType!: string;

  @Prop({ required: true })
  size!: number;

  /** SHA-256 of file bytes when available. */
  @Prop({ index: true })
  hash?: string;

  @Prop()
  originalName?: string;

  /** String ref avoids circular import with user.schema. */
  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  uploaderId?: Types.ObjectId;

  createdAt!: Date;
  updatedAt!: Date;
}

export const MediaSchema = SchemaFactory.createForClass(Media);

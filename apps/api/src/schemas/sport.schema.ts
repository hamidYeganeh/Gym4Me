import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SportKind } from '../common/enums';
import { Media } from './media.schema';

export type SportDocument = HydratedDocument<Sport>;

@Schema({ timestamps: true, collection: 'sports' })
export class Sport {
  @Prop({ type: String, enum: SportKind, required: true, index: true })
  kind!: SportKind;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, lowercase: true, trim: true })
  slug!: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ trim: true })
  icon?: string;

  @Prop({ type: Types.ObjectId, ref: Media.name })
  coverMediaId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Sport.name, index: true })
  parentId?: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], default: [], index: true })
  ancestors!: Types.ObjectId[];

  @Prop({ default: 0 })
  order!: number;

  @Prop({ default: true, index: true })
  isActive!: boolean;

  createdAt!: Date;
  updatedAt!: Date;
}

export const SportSchema = SchemaFactory.createForClass(Sport);

SportSchema.index({ kind: 1, slug: 1 }, { unique: true });
SportSchema.index({ parentId: 1, order: 1 });

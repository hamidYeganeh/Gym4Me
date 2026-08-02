import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { RefStatus, RefType } from '../common/enums';
import { Media } from './media.schema';

export type RefItemDocument = HydratedDocument<RefItem>;

@Schema({ timestamps: true, collection: 'ref_items' })
export class RefItem {
  @Prop({ type: String, enum: RefType, required: true, index: true })
  type!: RefType;

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

  @Prop({ default: 0 })
  order!: number;

  @Prop({ type: String, enum: RefStatus, default: RefStatus.APPROVED })
  status!: RefStatus;

  @Prop({ default: true, index: true })
  isActive!: boolean;

  createdAt!: Date;
  updatedAt!: Date;
}

export const RefItemSchema = SchemaFactory.createForClass(RefItem);

RefItemSchema.index({ type: 1, slug: 1 }, { unique: true });
RefItemSchema.index({ type: 1, order: 1 });

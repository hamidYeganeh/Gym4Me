import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { LocationKind } from '../common/enums';
import { Media } from './media.schema';

export type LocationDocument = HydratedDocument<Location>;

@Schema({ _id: false })
export class GeoPoint {
  @Prop({ type: String, enum: ['Point'], default: 'Point' })
  type!: 'Point';

  /** [longitude, latitude] — MongoDB GeoJSON order. */
  @Prop({ type: [Number], required: true })
  coordinates!: [number, number];
}

export const GeoPointSchema = SchemaFactory.createForClass(GeoPoint);

@Schema({ timestamps: true, collection: 'locations' })
export class Location {
  @Prop({ type: String, enum: LocationKind, required: true, index: true })
  kind!: LocationKind;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, lowercase: true, trim: true })
  slug!: string;

  @Prop({ trim: true })
  description?: string;

  /** Optional icon key / emoji — mainly used for countries. */
  @Prop({ trim: true })
  icon?: string;

  /** Inline SVG markup for country flags (countries only). */
  @Prop({ trim: true })
  flagSvg?: string;

  @Prop({ type: Types.ObjectId, ref: Location.name, index: true })
  parentId?: Types.ObjectId;

  /** Root → … → parent chain for fast subtree filters. */
  @Prop({
    type: [Types.ObjectId],
    ref: Location.name,
    default: [],
    index: true,
  })
  ancestors!: Types.ObjectId[];

  @Prop({ type: GeoPointSchema })
  center?: GeoPoint;

  @Prop({ type: Types.ObjectId, ref: Media.name })
  coverMediaId?: Types.ObjectId;

  @Prop({ default: 0 })
  order!: number;

  @Prop({ default: true, index: true })
  isActive!: boolean;

  createdAt!: Date;
  updatedAt!: Date;
}

export const LocationSchema = SchemaFactory.createForClass(Location);

LocationSchema.index({ kind: 1, slug: 1 }, { unique: true });
LocationSchema.index({ center: '2dsphere' }, { sparse: true });
LocationSchema.index({ parentId: 1, order: 1 });

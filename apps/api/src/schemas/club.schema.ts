import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ClubLifecycleStatus } from '../common/enums';
import { Media } from './media.schema';
import { User } from './user.schema';

export type ClubDocument = HydratedDocument<Club>;

@Schema({ _id: false })
export class ClubIdentity {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ type: Types.ObjectId, ref: Media.name })
  coverMediaId?: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: Media.name, default: [] })
  galleryMediaIds!: Types.ObjectId[];
}

export const ClubIdentitySchema = SchemaFactory.createForClass(ClubIdentity);

@Schema({ _id: false })
export class ClubContact {
  @Prop({ trim: true })
  phone?: string;

  @Prop({ trim: true })
  website?: string;

  @Prop({ trim: true })
  instagram?: string;
}

export const ClubContactSchema = SchemaFactory.createForClass(ClubContact);

@Schema({ _id: false })
export class ClubAddress {
  @Prop({ type: Types.ObjectId })
  cityId?: Types.ObjectId;

  @Prop({ trim: true })
  line?: string;

  @Prop({ trim: true })
  postalCode?: string;
}

export const ClubAddressSchema = SchemaFactory.createForClass(ClubAddress);

@Schema({ _id: false })
export class ClubReview {
  @Prop({
    type: String,
    enum: ClubLifecycleStatus,
    default: ClubLifecycleStatus.DRAFT,
  })
  status!: ClubLifecycleStatus;

  @Prop()
  submittedAt?: Date;

  @Prop()
  reviewedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: User.name })
  reviewedBy?: Types.ObjectId;

  @Prop({ trim: true })
  reviewNote?: string;

  @Prop({ type: [Types.ObjectId], ref: Media.name, default: [] })
  documentMediaIds!: Types.ObjectId[];
}

export const ClubReviewSchema = SchemaFactory.createForClass(ClubReview);

@Schema({ timestamps: true, collection: 'clubs' })
export class Club {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  ownerId!: Types.ObjectId;

  @Prop({ type: ClubIdentitySchema, required: true })
  identity!: ClubIdentity;

  @Prop({ type: ClubContactSchema, default: () => ({}) })
  contact!: ClubContact;

  @Prop({ type: ClubAddressSchema, default: () => ({}) })
  address!: ClubAddress;

  @Prop({
    type: ClubReviewSchema,
    default: () => ({
      status: ClubLifecycleStatus.DRAFT,
      documentMediaIds: [],
    }),
  })
  review!: ClubReview;

  /** Amenity / equipment ref keys. */
  @Prop({ type: [String], default: [] })
  amenityKeys!: string[];

  @Prop({ type: [String], default: [] })
  sportIds!: string[];

  /** Free-form house rules text for Phase 1. */
  @Prop({ trim: true })
  rules?: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const ClubSchema = SchemaFactory.createForClass(Club);

ClubSchema.index({ ownerId: 1, 'identity.name': 1 });
ClubSchema.index({ 'review.status': 1 });

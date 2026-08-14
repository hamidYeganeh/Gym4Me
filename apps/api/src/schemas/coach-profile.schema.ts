import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { VerificationStatus } from '../common/enums';
import { Media } from './media.schema';
import { PointsSummary, PointsSummarySchema } from './point-transaction.schema';
import { User } from './user.schema';

export type CoachProfileDocument = HydratedDocument<CoachProfile>;

@Schema({ _id: false })
export class CoachExperience {
  @Prop()
  years?: number;

  @Prop({ trim: true })
  headline?: string;
}

export const CoachExperienceSchema =
  SchemaFactory.createForClass(CoachExperience);

@Schema({ _id: false })
export class CoachVerification {
  @Prop({
    type: String,
    enum: VerificationStatus,
    default: VerificationStatus.UNSUBMITTED,
  })
  status!: VerificationStatus;

  @Prop()
  submittedAt?: Date;

  @Prop()
  reviewedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: User.name })
  reviewedBy?: Types.ObjectId;

  @Prop({ trim: true })
  reviewNote?: string;

  /** Media ids for certificates / ID proofs. */
  @Prop({ type: [Types.ObjectId], ref: Media.name, default: [] })
  documentMediaIds!: Types.ObjectId[];
}

export const CoachVerificationSchema =
  SchemaFactory.createForClass(CoachVerification);

/** Consultation prices in Tomans; absence means the kind is not offered. */
@Schema({ _id: false })
export class CoachConsultationPricing {
  @Prop({ min: 0 })
  inPerson?: number;

  @Prop({ min: 0 })
  remote?: number;
}

export const CoachConsultationPricingSchema = SchemaFactory.createForClass(
  CoachConsultationPricing,
);

@Schema({ _id: false })
export class CoachPricing {
  @Prop({ type: CoachConsultationPricingSchema, default: () => ({}) })
  consultation!: CoachConsultationPricing;
}

export const CoachPricingSchema = SchemaFactory.createForClass(CoachPricing);

@Schema({ _id: false })
export class CoachServiceArea {
  @Prop({ type: Types.ObjectId })
  cityId?: Types.ObjectId;
}

export const CoachServiceAreaSchema =
  SchemaFactory.createForClass(CoachServiceArea);

@Schema({ timestamps: true, collection: 'coach_profiles' })
export class CoachProfile {
  @Prop({
    type: Types.ObjectId,
    ref: User.name,
    required: true,
    unique: true,
    index: true,
  })
  userId!: Types.ObjectId;

  @Prop({ trim: true })
  bio?: string;

  @Prop({ type: CoachExperienceSchema, default: () => ({}) })
  experience!: CoachExperience;

  @Prop({
    type: CoachVerificationSchema,
    default: () => ({
      status: VerificationStatus.UNSUBMITTED,
      documentMediaIds: [],
    }),
  })
  verification!: CoachVerification;

  @Prop({ type: CoachServiceAreaSchema, default: () => ({}) })
  serviceArea!: CoachServiceArea;

  @Prop({ type: CoachPricingSchema, default: () => ({ consultation: {} }) })
  pricing!: CoachPricing;

  @Prop({ type: [String], default: [] })
  sportIds!: string[];

  @Prop({ type: [String], default: [] })
  specialtyKeys!: string[];

  /** Derived cache of the points ledger. */
  @Prop({
    type: PointsSummarySchema,
    default: () => ({ balance: 0, lifetime: 0 }),
  })
  points!: PointsSummary;

  createdAt!: Date;
  updatedAt!: Date;
}

export const CoachProfileSchema = SchemaFactory.createForClass(CoachProfile);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { VerificationStatus } from '../common/enums';
import { Media } from './media.schema';
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

  @Prop({ type: [String], default: [] })
  sportIds!: string[];

  @Prop({ type: [String], default: [] })
  specialtyKeys!: string[];

  createdAt!: Date;
  updatedAt!: Date;
}

export const CoachProfileSchema = SchemaFactory.createForClass(CoachProfile);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
import {
  HealthAssessmentStatus,
  Privacy,
} from '../common/enums';
import { User } from './user.schema';

export type HealthAssessmentDocument = HydratedDocument<HealthAssessment>;

/**
 * PAR-Q / intake answers. Nested object kept flexible so form revisions
 * do not require schema migrations; known keys live under `parq`.
 */
@Schema({ _id: false })
export class HealthAssessmentParq {
  @Prop()
  heartCondition?: boolean;

  @Prop()
  chestPainActivity?: boolean;

  @Prop()
  chestPainRest?: boolean;

  @Prop()
  dizziness?: boolean;

  @Prop()
  boneJointProblem?: boolean;

  @Prop()
  bloodPressureMeds?: boolean;

  @Prop()
  otherReason?: boolean;

  @Prop({ trim: true, maxlength: 2000 })
  otherReasonDetail?: string;
}

export const HealthAssessmentParqSchema =
  SchemaFactory.createForClass(HealthAssessmentParq);

@Schema({ _id: false })
export class HealthAssessmentAnswers {
  @Prop({ type: HealthAssessmentParqSchema, default: () => ({}) })
  parq!: HealthAssessmentParq;

  @Prop({ type: [String], default: [] })
  medications!: string[];

  @Prop({ type: [String], default: [] })
  injuries!: string[];

  @Prop()
  consentAt?: Date;

  /** Escape hatch for extra questionnaire fields. */
  @Prop({ type: SchemaTypes.Mixed })
  extra?: Record<string, unknown>;
}

export const HealthAssessmentAnswersSchema = SchemaFactory.createForClass(
  HealthAssessmentAnswers,
);

/** Athlete health / PAR-Q assessment with privacy enforcement (CCH-IR-5). */
@Schema({ timestamps: true, collection: 'health_assessments' })
export class HealthAssessment {
  @Prop({
    type: Types.ObjectId,
    ref: User.name,
    required: true,
    unique: true,
    index: true,
  })
  athleteUserId!: Types.ObjectId;

  @Prop({
    type: String,
    enum: Privacy,
    default: Privacy.PRIVATE,
  })
  privacy!: Privacy;

  @Prop({ type: HealthAssessmentAnswersSchema, default: () => ({}) })
  answers!: HealthAssessmentAnswers;

  @Prop({ type: [String], default: [] })
  limitations?: string[];

  @Prop({
    type: String,
    enum: HealthAssessmentStatus,
    default: HealthAssessmentStatus.DRAFT,
    index: true,
  })
  status!: HealthAssessmentStatus;

  @Prop({ type: Types.ObjectId, ref: User.name })
  reviewedByCoachUserId?: Types.ObjectId;

  @Prop({ type: Date })
  reviewedAt?: Date;

  createdAt!: Date;
  updatedAt!: Date;
}

export const HealthAssessmentSchema =
  SchemaFactory.createForClass(HealthAssessment);

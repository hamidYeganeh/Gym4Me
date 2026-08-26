import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { CoachLeadStage } from '../common/enums';
import { CoachStudent } from './coach-student.schema';
import { User } from './user.schema';

export type CoachLeadDocument = HydratedDocument<CoachLead>;

@Schema({ _id: false })
export class CoachLeadContact {
  @Prop({ required: true, trim: true, maxlength: 120 })
  name!: string;

  @Prop({ trim: true, maxlength: 20 })
  phone?: string;

  /** Known app user when the lead already has an account. */
  @Prop({ type: Types.ObjectId, ref: User.name })
  userId?: Types.ObjectId;
}

export const CoachLeadContactSchema =
  SchemaFactory.createForClass(CoachLeadContact);

/** Coach CRM lead pipeline (CCH-IR-8). */
@Schema({ timestamps: true, collection: 'coach_leads' })
export class CoachLead {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  coachUserId!: Types.ObjectId;

  @Prop({ type: CoachLeadContactSchema, required: true })
  contact!: CoachLeadContact;

  @Prop({
    type: String,
    enum: CoachLeadStage,
    default: CoachLeadStage.NEW,
    index: true,
  })
  stage!: CoachLeadStage;

  @Prop({ trim: true, maxlength: 4000 })
  notes?: string;

  @Prop({ trim: true, maxlength: 120 })
  source?: string;

  @Prop({ type: Types.ObjectId, ref: CoachStudent.name })
  convertedStudentId?: Types.ObjectId;

  @Prop({ trim: true, maxlength: 200 })
  idempotencyKey?: string;

  @Prop({ select: false })
  idempotencyFingerprint?: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const CoachLeadSchema = SchemaFactory.createForClass(CoachLead);

CoachLeadSchema.index({ coachUserId: 1, stage: 1, updatedAt: -1 });
CoachLeadSchema.index(
  { coachUserId: 1, idempotencyKey: 1 },
  {
    unique: true,
    partialFilterExpression: { idempotencyKey: { $type: 'string' } },
  },
);

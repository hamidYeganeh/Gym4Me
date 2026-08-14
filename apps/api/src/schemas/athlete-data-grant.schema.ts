import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  AthleteDataGranteeType,
  AthleteDataGrantScope,
  AthleteDataGrantStatus,
} from '../common/enums';
import { CoachStudent } from './coach-student.schema';
import { User } from './user.schema';

export type AthleteDataGrantDocument = HydratedDocument<AthleteDataGrant>;

@Schema({ _id: false })
export class AthleteDataGrantee {
  @Prop({
    type: String,
    enum: AthleteDataGranteeType,
    required: true,
    default: AthleteDataGranteeType.COACH,
  })
  type!: AthleteDataGranteeType;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  userId!: Types.ObjectId;
}

export const AthleteDataGranteeSchema =
  SchemaFactory.createForClass(AthleteDataGrantee);

@Schema({ _id: false })
export class AthleteDataGrantEffective {
  @Prop({ type: Date, required: true })
  grantedAt!: Date;

  @Prop({ type: Date })
  expiresAt?: Date;
}

export const AthleteDataGrantEffectiveSchema = SchemaFactory.createForClass(
  AthleteDataGrantEffective,
);

/**
 * Per-coach, per-scope access grant. Complements Privacy.COACH_ONLY —
 * relationship alone does not imply which metrics a coach may read.
 */
@Schema({ timestamps: true, collection: 'athlete_data_grants' })
export class AthleteDataGrant {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  athleteUserId!: Types.ObjectId;

  @Prop({ type: AthleteDataGranteeSchema, required: true })
  grantee!: AthleteDataGrantee;

  @Prop({
    type: Types.ObjectId,
    ref: CoachStudent.name,
    required: true,
    index: true,
  })
  relationshipId!: Types.ObjectId;

  @Prop({
    type: [String],
    enum: AthleteDataGrantScope,
    default: [],
  })
  scopes!: AthleteDataGrantScope[];

  @Prop({ type: AthleteDataGrantEffectiveSchema, required: true })
  effective!: AthleteDataGrantEffective;

  @Prop({
    type: String,
    enum: AthleteDataGrantStatus,
    default: AthleteDataGrantStatus.ACTIVE,
    index: true,
  })
  status!: AthleteDataGrantStatus;

  @Prop({ type: Date })
  revokedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: User.name })
  revokedBy?: Types.ObjectId;

  createdAt!: Date;
  updatedAt!: Date;
}

export const AthleteDataGrantSchema =
  SchemaFactory.createForClass(AthleteDataGrant);

AthleteDataGrantSchema.index({
  athleteUserId: 1,
  'grantee.userId': 1,
  status: 1,
});
AthleteDataGrantSchema.index({ relationshipId: 1, status: 1 });

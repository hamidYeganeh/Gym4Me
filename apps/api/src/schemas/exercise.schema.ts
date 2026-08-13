import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  ExerciseOriginKind,
  ExerciseStatus,
  VerificationStatus,
} from '../common/enums';
import { Media } from './media.schema';
import { User } from './user.schema';

export type ExerciseDocument = HydratedDocument<Exercise>;

@Schema({ _id: false })
export class ExerciseOrigin {
  @Prop({
    type: String,
    enum: ExerciseOriginKind,
    required: true,
    default: ExerciseOriginKind.SYSTEM,
  })
  kind!: ExerciseOriginKind;

  @Prop({ type: Types.ObjectId, ref: User.name })
  userId?: Types.ObjectId;
}

export const ExerciseOriginSchema =
  SchemaFactory.createForClass(ExerciseOrigin);

@Schema({ _id: false })
export class ExerciseVerification {
  @Prop({
    type: String,
    enum: VerificationStatus,
    required: true,
    default: VerificationStatus.APPROVED,
    index: true,
  })
  status!: VerificationStatus;

  @Prop({ type: Types.ObjectId, ref: User.name })
  reviewedBy?: Types.ObjectId;

  @Prop()
  reviewedAt?: Date;

  @Prop({ trim: true, maxlength: 500 })
  rejectionReason?: string;
}

export const ExerciseVerificationSchema = SchemaFactory.createForClass(
  ExerciseVerification,
);

@Schema({ timestamps: true, collection: 'exercises' })
export class Exercise {
  @Prop({ required: true, trim: true, maxlength: 200 })
  name!: string;

  @Prop({ trim: true, maxlength: 2000 })
  description?: string;

  @Prop({ type: [String], default: [] })
  muscleKeys?: string[];

  @Prop({ type: [String], default: [] })
  equipmentKeys?: string[];

  @Prop({ type: Types.ObjectId, ref: Media.name })
  mediaId?: Types.ObjectId;

  @Prop({
    type: String,
    enum: ExerciseStatus,
    default: ExerciseStatus.ACTIVE,
    index: true,
  })
  status!: ExerciseStatus;

  @Prop({ type: ExerciseOriginSchema, required: true })
  origin!: ExerciseOrigin;

  /**
   * Coach-submitted exercises start PENDING; system/admin are APPROVED.
   * Public bank lists only ACTIVE + APPROVED.
   */
  @Prop({
    type: ExerciseVerificationSchema,
    default: () => ({ status: VerificationStatus.APPROVED }),
  })
  verification!: ExerciseVerification;

  createdAt!: Date;
  updatedAt!: Date;
}

export const ExerciseSchema = SchemaFactory.createForClass(Exercise);

ExerciseSchema.index({ name: 1, status: 1 });

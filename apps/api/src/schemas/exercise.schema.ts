import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ExerciseOriginKind, ExerciseStatus } from '../common/enums';
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

  createdAt!: Date;
  updatedAt!: Date;
}

export const ExerciseSchema = SchemaFactory.createForClass(Exercise);

ExerciseSchema.index({ name: 1, status: 1 });

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Privacy } from '../common/enums';
import { User } from './user.schema';

export type PersonalRecordDocument = HydratedDocument<PersonalRecord>;

@Schema({ timestamps: true, collection: 'personal_records' })
export class PersonalRecord {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  athleteId!: Types.ObjectId;

  /** MetricType.key or free-form PR key (e.g. squat_1rm). */
  @Prop({ required: true, trim: true, maxlength: 80, index: true })
  metricTypeKey!: string;

  @Prop({ required: true })
  value!: number;

  @Prop({ type: Date, required: true, index: true })
  achievedAt!: Date;

  @Prop({
    type: String,
    enum: Privacy,
    default: Privacy.PRIVATE,
    index: true,
  })
  privacy!: Privacy;

  @Prop({ trim: true, maxlength: 500 })
  note?: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const PersonalRecordSchema =
  SchemaFactory.createForClass(PersonalRecord);

PersonalRecordSchema.index({
  athleteId: 1,
  metricTypeKey: 1,
  achievedAt: -1,
});

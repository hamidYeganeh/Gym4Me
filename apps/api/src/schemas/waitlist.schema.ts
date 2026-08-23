import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { CalendarResourceType, WaitlistEntryStatus } from '../common/enums';
import { Club } from './club.schema';
import { User } from './user.schema';

export type WaitlistDocument = HydratedDocument<Waitlist>;

@Schema({ _id: false })
export class WaitlistResource {
  @Prop({ type: String, enum: CalendarResourceType, required: true })
  type!: CalendarResourceType;

  @Prop({ type: Types.ObjectId, required: true })
  id!: Types.ObjectId;
}

export const WaitlistResourceSchema =
  SchemaFactory.createForClass(WaitlistResource);

@Schema({ _id: true })
export class WaitlistEntry {
  _id!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  userId!: Types.ObjectId;

  /** Lower number = higher priority (1 is first). */
  @Prop({ required: true, min: 1 })
  priority!: number;

  @Prop({
    type: String,
    enum: WaitlistEntryStatus,
    default: WaitlistEntryStatus.WAITING,
  })
  status!: WaitlistEntryStatus;

  @Prop()
  offeredAt?: Date;

  @Prop()
  offerExpiresAt?: Date;

  @Prop({ required: true, default: () => new Date() })
  joinedAt!: Date;
}

export const WaitlistEntrySchema = SchemaFactory.createForClass(WaitlistEntry);

@Schema({
  timestamps: true,
  collection: 'waitlists',
  optimisticConcurrency: true,
})
export class Waitlist {
  @Prop({ type: WaitlistResourceSchema, required: true })
  resource!: WaitlistResource;

  @Prop({ type: Types.ObjectId, ref: Club.name, index: true })
  clubId?: Types.ObjectId;

  /** YYYY-MM-DD occurrence for recurring club resources. */
  @Prop({ trim: true })
  occurrenceDate?: string;

  @Prop({ type: [WaitlistEntrySchema], default: [] })
  entries!: WaitlistEntry[];

  createdAt!: Date;
  updatedAt!: Date;
}

export const WaitlistSchema = SchemaFactory.createForClass(Waitlist);

WaitlistSchema.index(
  {
    'resource.type': 1,
    'resource.id': 1,
    occurrenceDate: 1,
    clubId: 1,
  },
  { unique: true },
);

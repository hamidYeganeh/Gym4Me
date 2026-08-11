import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { OwnerTaskPriority, OwnerTaskStatus } from '../common/enums';
import { Club } from './club.schema';
import { User } from './user.schema';

export type OwnerTaskDocument = HydratedDocument<OwnerTask>;

@Schema({ _id: false })
export class OwnerTaskRelated {
  @Prop({ type: Types.ObjectId })
  membershipId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  debtId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  bookingId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  staffId?: Types.ObjectId;
}

export const OwnerTaskRelatedSchema =
  SchemaFactory.createForClass(OwnerTaskRelated);

@Schema({ timestamps: true, collection: 'owner_tasks' })
export class OwnerTask {
  @Prop({
    type: Types.ObjectId,
    ref: Club.name,
    required: true,
    index: true,
  })
  clubId!: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 200 })
  title!: string;

  @Prop({ trim: true, maxlength: 2000 })
  body?: string;

  @Prop({
    type: String,
    enum: OwnerTaskStatus,
    default: OwnerTaskStatus.OPEN,
    index: true,
  })
  status!: OwnerTaskStatus;

  @Prop({
    type: String,
    enum: OwnerTaskPriority,
    default: OwnerTaskPriority.NORMAL,
  })
  priority!: OwnerTaskPriority;

  @Prop({ type: Types.ObjectId, ref: User.name, index: true })
  assigneeUserId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  createdByUserId!: Types.ObjectId;

  @Prop()
  dueAt?: Date;

  @Prop({ type: OwnerTaskRelatedSchema, default: () => ({}) })
  related!: OwnerTaskRelated;

  createdAt!: Date;
  updatedAt!: Date;
}

export const OwnerTaskSchema = SchemaFactory.createForClass(OwnerTask);

OwnerTaskSchema.index({ clubId: 1, status: 1, priority: -1 });

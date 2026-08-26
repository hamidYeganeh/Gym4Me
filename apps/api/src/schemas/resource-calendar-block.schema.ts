import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  CalendarBlockReason,
  CalendarResourceType,
  EntityStatus,
} from '../common/enums';
import { User } from './user.schema';

export type ResourceCalendarBlockDocument =
  HydratedDocument<ResourceCalendarBlock>;

@Schema({ _id: false })
export class CalendarBlockResource {
  @Prop({ type: String, enum: CalendarResourceType, required: true })
  type!: CalendarResourceType;

  @Prop({ type: Types.ObjectId, required: true })
  id!: Types.ObjectId;
}

export const CalendarBlockResourceSchema = SchemaFactory.createForClass(
  CalendarBlockResource,
);

@Schema({ _id: false })
export class CalendarBlockWindow {
  @Prop({ required: true })
  from!: Date;

  @Prop({ required: true })
  to!: Date;
}

export const CalendarBlockWindowSchema =
  SchemaFactory.createForClass(CalendarBlockWindow);

@Schema({ timestamps: true, collection: 'resource_calendar_blocks' })
export class ResourceCalendarBlock {
  @Prop({ type: CalendarBlockResourceSchema, required: true })
  resource!: CalendarBlockResource;

  @Prop({ type: String, enum: CalendarBlockReason, required: true })
  reason!: CalendarBlockReason;

  @Prop({ type: CalendarBlockWindowSchema, required: true })
  window!: CalendarBlockWindow;

  @Prop({ trim: true, maxlength: 500 })
  note?: string;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  createdBy!: Types.ObjectId;

  @Prop({ trim: true, maxlength: 120 })
  clientMutationId?: string;

  @Prop({ trim: true, length: 64 })
  mutationFingerprint?: string;

  @Prop({
    type: String,
    enum: EntityStatus,
    default: EntityStatus.ACTIVE,
    index: true,
  })
  status!: EntityStatus;

  createdAt!: Date;
  updatedAt!: Date;
}

export const ResourceCalendarBlockSchema = SchemaFactory.createForClass(
  ResourceCalendarBlock,
);

ResourceCalendarBlockSchema.index({
  'resource.type': 1,
  'resource.id': 1,
  'window.from': 1,
  status: 1,
});
ResourceCalendarBlockSchema.index(
  { createdBy: 1, clientMutationId: 1 },
  {
    unique: true,
    partialFilterExpression: { clientMutationId: { $type: 'string' } },
  },
);

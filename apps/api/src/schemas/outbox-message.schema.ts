import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { OutboxMessageStatus } from '../common/enums';

export type OutboxMessageDocument = HydratedDocument<OutboxMessage>;

@Schema({ timestamps: true, collection: 'outbox_messages' })
export class OutboxMessage {
  @Prop({
    type: String,
    enum: OutboxMessageStatus,
    default: OutboxMessageStatus.PENDING,
    index: true,
  })
  status!: OutboxMessageStatus;

  @Prop({ required: true, trim: true, index: true })
  eventName!: string;

  @Prop({ type: Object, required: true, default: () => ({}) })
  payload!: Record<string, unknown>;

  @Prop({ required: true, min: 0, default: 0 })
  attempts!: number;

  @Prop({ type: Date, index: true })
  nextAttemptAt?: Date;

  @Prop({ trim: true })
  idempotencyKey?: string;

  @Prop({ trim: true, maxlength: 1000 })
  lastError?: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const OutboxMessageSchema = SchemaFactory.createForClass(OutboxMessage);

OutboxMessageSchema.index(
  { idempotencyKey: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: {
      idempotencyKey: { $type: 'string' },
    },
  },
);
OutboxMessageSchema.index({ status: 1, nextAttemptAt: 1 });

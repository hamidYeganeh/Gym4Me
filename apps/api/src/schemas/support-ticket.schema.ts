import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  Role,
  SupportRelatedEntityKind,
  SupportTicketCategory,
  SupportTicketPriority,
  SupportTicketStatus,
} from '../common/enums';
import { User } from './user.schema';

export type SupportTicketDocument = HydratedDocument<SupportTicket>;

@Schema({ _id: false })
export class SupportRequester {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  userId!: Types.ObjectId;

  /** activeRole the ticket was submitted with. */
  @Prop({ type: String, enum: Role, required: true })
  role!: Role;
}

export const SupportRequesterSchema =
  SchemaFactory.createForClass(SupportRequester);

/**
 * Soft reference to the disputed/related entity. The target may be deleted
 * later, so consumers must treat it as best-effort context, not a hard FK.
 */
@Schema({ _id: false })
export class SupportRelatedEntity {
  @Prop({ type: String, enum: SupportRelatedEntityKind, required: true })
  kind!: SupportRelatedEntityKind;

  @Prop({ type: Types.ObjectId, required: true })
  id!: Types.ObjectId;
}

export const SupportRelatedEntitySchema = SchemaFactory.createForClass(
  SupportRelatedEntity,
);

@Schema({ _id: false })
export class SupportAssignment {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  adminId!: Types.ObjectId;

  @Prop({ required: true })
  assignedAt!: Date;
}

export const SupportAssignmentSchema =
  SchemaFactory.createForClass(SupportAssignment);

@Schema({ _id: false })
export class SupportResolution {
  @Prop({ trim: true })
  note?: string;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  resolvedBy!: Types.ObjectId;

  @Prop({ required: true })
  resolvedAt!: Date;
}

export const SupportResolutionSchema =
  SchemaFactory.createForClass(SupportResolution);

@Schema({ timestamps: true, collection: 'support_tickets' })
export class SupportTicket {
  /** Human-readable tracking number, e.g. T-7KM2QX9A. */
  @Prop({ required: true, unique: true, index: true })
  ticketNumber!: string;

  @Prop({ type: SupportRequesterSchema, required: true })
  requester!: SupportRequester;

  @Prop({
    type: String,
    enum: SupportTicketCategory,
    required: true,
    index: true,
  })
  category!: SupportTicketCategory;

  @Prop({
    type: String,
    enum: SupportTicketPriority,
    default: SupportTicketPriority.NORMAL,
    index: true,
  })
  priority!: SupportTicketPriority;

  @Prop({
    type: String,
    enum: SupportTicketStatus,
    default: SupportTicketStatus.OPEN,
    index: true,
  })
  status!: SupportTicketStatus;

  @Prop({ required: true, trim: true, maxlength: 200 })
  subject!: string;

  @Prop({ type: SupportRelatedEntitySchema })
  relatedEntity?: SupportRelatedEntity;

  @Prop({ type: SupportAssignmentSchema })
  assignment?: SupportAssignment;

  @Prop({ type: SupportResolutionSchema })
  resolution?: SupportResolution;

  /** Denormalized for inbox sorting without joining messages. */
  @Prop({ index: true })
  lastMessageAt!: Date;

  @Prop({ default: 0 })
  messageCount!: number;

  createdAt!: Date;
  updatedAt!: Date;
}

export const SupportTicketSchema = SchemaFactory.createForClass(SupportTicket);

SupportTicketSchema.index({ 'requester.userId': 1, createdAt: -1 });
SupportTicketSchema.index({ status: 1, lastMessageAt: -1 });

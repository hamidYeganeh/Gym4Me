import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SupportMessageAuthorKind } from '../common/enums';
import { Media } from './media.schema';
import { SupportTicket } from './support-ticket.schema';
import { User } from './user.schema';

export type SupportTicketMessageDocument =
  HydratedDocument<SupportTicketMessage>;

@Schema({ _id: false })
export class SupportMessageAuthor {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  userId!: Types.ObjectId;

  @Prop({ type: String, enum: SupportMessageAuthorKind, required: true })
  kind!: SupportMessageAuthorKind;
}

export const SupportMessageAuthorSchema =
  SchemaFactory.createForClass(SupportMessageAuthor);

@Schema({ timestamps: true, collection: 'support_ticket_messages' })
export class SupportTicketMessage {
  @Prop({
    type: Types.ObjectId,
    ref: SupportTicket.name,
    required: true,
    index: true,
  })
  ticketId!: Types.ObjectId;

  @Prop({ type: SupportMessageAuthorSchema, required: true })
  author!: SupportMessageAuthor;

  @Prop({ required: true, trim: true, maxlength: 4000 })
  body!: string;

  /** Uploaded via the media domain; referenced here. */
  @Prop({ type: [Types.ObjectId], ref: Media.name, default: [] })
  attachments!: Types.ObjectId[];

  createdAt!: Date;
  updatedAt!: Date;
}

export const SupportTicketMessageSchema =
  SchemaFactory.createForClass(SupportTicketMessage);

SupportTicketMessageSchema.index({ ticketId: 1, createdAt: 1 });

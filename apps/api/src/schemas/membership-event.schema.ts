import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
import { MembershipActorKind, MembershipEventType } from '../common/enums';
import { User } from './user.schema';

export type MembershipEventDocument = HydratedDocument<MembershipEvent>;

@Schema({ _id: false })
export class MembershipEventActor {
  @Prop({ type: Types.ObjectId, ref: User.name })
  userId?: Types.ObjectId;

  @Prop({
    type: String,
    enum: MembershipActorKind,
    required: true,
  })
  kind!: MembershipActorKind;
}

export const MembershipEventActorSchema =
  SchemaFactory.createForClass(MembershipEventActor);

/**
 * Append-only membership lifecycle history.
 * Pairs with AuditLog for sensitive mutations.
 */
@Schema({
  timestamps: { createdAt: true, updatedAt: false },
  collection: 'membership_events',
})
export class MembershipEvent {
  @Prop({
    type: Types.ObjectId,
    ref: 'ClubMembership',
    required: true,
    index: true,
  })
  membershipId!: Types.ObjectId;

  @Prop({
    type: String,
    enum: MembershipEventType,
    required: true,
    index: true,
  })
  type!: MembershipEventType;

  @Prop({ type: MembershipEventActorSchema, required: true })
  actor!: MembershipEventActor;

  @Prop({ trim: true, maxlength: 500 })
  reason?: string;

  @Prop({ type: SchemaTypes.Mixed })
  payload?: Record<string, unknown>;

  @Prop({ type: Date, required: true, index: true })
  occurredAt!: Date;

  /** Retry key for a lifecycle mutation, scoped to this membership. */
  @Prop({ trim: true, maxlength: 200 })
  idempotencyKey?: string;

  /** SHA-256 of the accepted preview/consent contract. */
  @Prop({ trim: true, minlength: 64, maxlength: 64 })
  requestFingerprint?: string;

  createdAt!: Date;
}

export const MembershipEventSchema =
  SchemaFactory.createForClass(MembershipEvent);

MembershipEventSchema.index({ membershipId: 1, occurredAt: -1 });
MembershipEventSchema.index({ type: 1, occurredAt: -1 });
MembershipEventSchema.index(
  { membershipId: 1, idempotencyKey: 1 },
  {
    unique: true,
    partialFilterExpression: { idempotencyKey: { $type: 'string' } },
  },
);

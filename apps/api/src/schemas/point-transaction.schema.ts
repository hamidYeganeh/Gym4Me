import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  GamificationSubjectType,
  PointTransactionReason,
} from '../common/enums';

export type PointTransactionDocument = HydratedDocument<PointTransaction>;

@Schema({ _id: false })
export class PointSubject {
  @Prop({ type: String, enum: GamificationSubjectType, required: true })
  type!: GamificationSubjectType;

  /** userId for athlete/coach, clubId for club. */
  @Prop({ type: Types.ObjectId, required: true })
  id!: Types.ObjectId;
}

export const PointSubjectSchema = SchemaFactory.createForClass(PointSubject);

/**
 * Derived cache of the points ledger, embedded on profiles/clubs.
 * `lifetime` (total earned, never decreases) drives ranks/badges;
 * `balance` (earned − spent) drives redemptions.
 */
@Schema({ _id: false })
export class PointsSummary {
  @Prop({ default: 0 })
  balance!: number;

  @Prop({ default: 0 })
  lifetime!: number;
}

export const PointsSummarySchema = SchemaFactory.createForClass(PointsSummary);

@Schema({ _id: false })
export class PointTransactionSource {
  @Prop({ type: Types.ObjectId, ref: 'PointRule' })
  ruleId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Achievement' })
  achievementId?: Types.ObjectId;

  /** Kind of the entity that triggered the award (article, booking, …). */
  @Prop({ trim: true })
  targetType?: string;

  @Prop({ type: Types.ObjectId })
  targetId?: Types.ObjectId;

  /** Admin user id for manual adjustments. */
  @Prop({ type: Types.ObjectId })
  adminId?: Types.ObjectId;
}

export const PointTransactionSourceSchema = SchemaFactory.createForClass(
  PointTransactionSource,
);

/**
 * Immutable, append-only points ledger — source of truth for balances.
 * Cached balances on profiles/clubs are derived from this collection.
 */
@Schema({
  timestamps: { createdAt: true, updatedAt: false },
  collection: 'point_transactions',
})
export class PointTransaction {
  @Prop({ type: PointSubjectSchema, required: true })
  subject!: PointSubject;

  /** Positive = earned, negative = spent/expired. */
  @Prop({ required: true })
  amount!: number;

  @Prop({
    type: String,
    enum: PointTransactionReason,
    required: true,
    index: true,
  })
  reason!: PointTransactionReason;

  @Prop({ type: PointTransactionSourceSchema, default: () => ({}) })
  source!: PointTransactionSource;

  /**
   * Idempotency key (e.g. `${ruleId}:${eventId}` or
   * `achievement:${achievementId}:${subjectId}`) — prevents double awards.
   */
  @Prop({ required: true, unique: true })
  dedupeKey!: string;

  @Prop({ trim: true })
  note?: string;

  @Prop({ required: true, index: true })
  occurredAt!: Date;

  createdAt!: Date;
}

export const PointTransactionSchema =
  SchemaFactory.createForClass(PointTransaction);

PointTransactionSchema.index({
  'subject.type': 1,
  'subject.id': 1,
  occurredAt: -1,
});
PointTransactionSchema.index({ 'source.ruleId': 1, occurredAt: -1 });

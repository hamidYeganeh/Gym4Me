import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Achievement } from './achievement.schema';
import { PointSubject, PointSubjectSchema } from './point-transaction.schema';

export type AchievementGrantDocument = HydratedDocument<AchievementGrant>;

/**
 * One achievement granted to one subject (athlete / coach / club).
 * Revocation keeps the row (`revokedAt`) so history is auditable.
 */
@Schema({ timestamps: true, collection: 'achievement_grants' })
export class AchievementGrant {
  @Prop({
    type: Types.ObjectId,
    ref: Achievement.name,
    required: true,
    index: true,
  })
  achievementId!: Types.ObjectId;

  @Prop({ type: PointSubjectSchema, required: true })
  subject!: PointSubject;

  @Prop({ required: true })
  grantedAt!: Date;

  /** `system` for automatic grants, admin user id for manual ones. */
  @Prop({ required: true, trim: true })
  grantedBy!: string;

  @Prop({ type: Date })
  revokedAt?: Date;

  @Prop({ trim: true })
  revokedBy?: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const AchievementGrantSchema =
  SchemaFactory.createForClass(AchievementGrant);

AchievementGrantSchema.index(
  { achievementId: 1, 'subject.type': 1, 'subject.id': 1 },
  { unique: true },
);
AchievementGrantSchema.index({ 'subject.type': 1, 'subject.id': 1, grantedAt: -1 });

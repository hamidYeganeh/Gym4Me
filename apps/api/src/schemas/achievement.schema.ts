import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  AchievementGrantMode,
  AchievementMetric,
  EntityStatus,
  GamificationSubjectType,
} from '../common/enums';
import { Media } from './media.schema';

export type AchievementDocument = HydratedDocument<Achievement>;

@Schema({ _id: false })
export class AchievementGrantRule {
  @Prop({ type: String, enum: AchievementMetric, required: true })
  metric!: AchievementMetric;

  @Prop({ required: true })
  threshold!: number;
}

export const AchievementGrantRuleSchema = SchemaFactory.createForClass(
  AchievementGrantRule,
);

@Schema({ _id: false })
export class AchievementGrantConfig {
  @Prop({ type: String, enum: AchievementGrantMode, required: true })
  mode!: AchievementGrantMode;

  @Prop({ type: AchievementGrantRuleSchema })
  rule?: AchievementGrantRule;
}

export const AchievementGrantConfigSchema = SchemaFactory.createForClass(
  AchievementGrantConfig,
);

@Schema({ timestamps: true, collection: 'achievements' })
export class Achievement {
  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ trim: true })
  icon?: string;

  @Prop({ type: Types.ObjectId, ref: Media.name })
  badgeMediaId?: Types.ObjectId;

  /** Which subject kinds can earn this achievement. */
  @Prop({
    type: [String],
    enum: GamificationSubjectType,
    required: true,
    default: [],
    index: true,
  })
  audience!: GamificationSubjectType[];

  /** Bonus points credited to the ledger when unlocked (0 = badge only). */
  @Prop({ default: 0, min: 0 })
  bonusPoints!: number;

  @Prop({ type: AchievementGrantConfigSchema, required: true })
  grant!: AchievementGrantConfig;

  @Prop({
    type: String,
    enum: EntityStatus,
    default: EntityStatus.ACTIVE,
    index: true,
  })
  status!: EntityStatus;

  @Prop({ default: 0 })
  order!: number;

  createdAt!: Date;
  updatedAt!: Date;
}

export const AchievementSchema = SchemaFactory.createForClass(Achievement);

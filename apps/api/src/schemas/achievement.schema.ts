import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { AchievementGrantMode } from '../common/enums';
import { Media } from './media.schema';

export type AchievementDocument = HydratedDocument<Achievement>;

@Schema({ _id: false })
export class AchievementGrantRule {
  /** bookings_count | followers_count | branches_count | reviews_average | … */
  @Prop({ required: true, trim: true })
  metric!: string;

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

  @Prop({ type: AchievementGrantConfigSchema, required: true })
  grant!: AchievementGrantConfig;

  @Prop({ default: true, index: true })
  isActive!: boolean;

  @Prop({ default: 0 })
  order!: number;

  createdAt!: Date;
  updatedAt!: Date;
}

export const AchievementSchema = SchemaFactory.createForClass(Achievement);

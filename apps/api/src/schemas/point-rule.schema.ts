import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  EntityStatus,
  GamificationSubjectType,
  PointRuleEvent,
  PointRuleRepeat,
} from '../common/enums';

export type PointRuleDocument = HydratedDocument<PointRule>;

/** One award line: which subject kind earns how many points for the event. */
@Schema({ _id: false })
export class PointRuleAward {
  @Prop({ type: String, enum: GamificationSubjectType, required: true })
  subjectType!: GamificationSubjectType;

  @Prop({ required: true, min: 1 })
  points!: number;
}

export const PointRuleAwardSchema =
  SchemaFactory.createForClass(PointRuleAward);

@Schema({ _id: false })
export class PointRuleLimits {
  @Prop({
    type: String,
    enum: PointRuleRepeat,
    default: PointRuleRepeat.UNLIMITED,
  })
  repeat!: PointRuleRepeat;

  /** Max awards per subject per calendar day; unset = no cap. */
  @Prop({ min: 1 })
  dailyCap?: number;
}

export const PointRuleLimitsSchema =
  SchemaFactory.createForClass(PointRuleLimits);

/** Activation window; unset `to` means open-ended (useful for campaigns). */
@Schema({ _id: false })
export class PointRuleEffective {
  @Prop({ type: Date })
  from?: Date;

  @Prop({ type: Date })
  to?: Date;
}

export const PointRuleEffectiveSchema =
  SchemaFactory.createForClass(PointRuleEffective);

/** Admin-defined rule: "event X gives N points to role Y". */
@Schema({ timestamps: true, collection: 'point_rules' })
export class PointRule {
  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ type: String, enum: PointRuleEvent, required: true, index: true })
  event!: PointRuleEvent;

  @Prop({ type: [PointRuleAwardSchema], required: true, default: [] })
  awards!: PointRuleAward[];

  @Prop({ type: PointRuleLimitsSchema, default: () => ({}) })
  limits!: PointRuleLimits;

  @Prop({ type: PointRuleEffectiveSchema, default: () => ({}) })
  effective!: PointRuleEffective;

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

export const PointRuleSchema = SchemaFactory.createForClass(PointRule);

PointRuleSchema.index({ event: 1, status: 1 });

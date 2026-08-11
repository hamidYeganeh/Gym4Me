import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { CompensationBasis, EntityStatus } from '../common/enums';
import { Club } from './club.schema';
import { User } from './user.schema';

export type CompensationRuleDocument = HydratedDocument<CompensationRule>;

@Schema({ _id: false })
export class CompensationEffective {
  @Prop({ required: true })
  from!: Date;

  @Prop()
  to?: Date;
}

export const CompensationEffectiveSchema = SchemaFactory.createForClass(
  CompensationEffective,
);

/**
 * Coach / staff pay formula for a club.
 * `rate` is a percent (0–100) for REVENUE_PERCENT, otherwise a fixed Toman amount.
 */
@Schema({ timestamps: true, collection: 'compensation_rules' })
export class CompensationRule {
  @Prop({ type: Types.ObjectId, ref: Club.name, required: true, index: true })
  clubId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, index: true })
  coachUserId?: Types.ObjectId;

  @Prop({
    type: String,
    enum: CompensationBasis,
    required: true,
  })
  basis!: CompensationBasis;

  @Prop({ required: true, min: 0 })
  rate!: number;

  @Prop({
    type: String,
    enum: EntityStatus,
    required: true,
    default: EntityStatus.ACTIVE,
    index: true,
  })
  status!: EntityStatus;

  @Prop({ type: CompensationEffectiveSchema, required: true })
  effective!: CompensationEffective;

  @Prop({ trim: true })
  note?: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const CompensationRuleSchema =
  SchemaFactory.createForClass(CompensationRule);

CompensationRuleSchema.index({ clubId: 1, coachUserId: 1, status: 1 });

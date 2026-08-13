import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { MealAdherenceStatus, Privacy } from '../common/enums';
import { MealPlan } from './meal-plan.schema';
import { User } from './user.schema';

export type MealAdherenceDocument = HydratedDocument<MealAdherence>;

@Schema({ _id: false })
export class MealAdherenceSlot {
  @Prop({ required: true, min: 0 })
  dayIndex!: number;

  @Prop({ required: true, min: 0 })
  mealIndex!: number;
}

export const MealAdherenceSlotSchema =
  SchemaFactory.createForClass(MealAdherenceSlot);

@Schema({ timestamps: true, collection: 'meal_adherence_logs' })
export class MealAdherence {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  athleteUserId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: MealPlan.name,
    required: true,
    index: true,
  })
  mealPlanId!: Types.ObjectId;

  @Prop({ type: MealAdherenceSlotSchema, required: true })
  slot!: MealAdherenceSlot;

  @Prop({
    type: String,
    enum: MealAdherenceStatus,
    required: true,
    index: true,
  })
  status!: MealAdherenceStatus;

  @Prop({ type: Date, required: true, index: true })
  loggedAt!: Date;

  @Prop({
    type: String,
    enum: Privacy,
    default: Privacy.PRIVATE,
  })
  privacy!: Privacy;

  @Prop({ trim: true, maxlength: 500 })
  note?: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const MealAdherenceSchema =
  SchemaFactory.createForClass(MealAdherence);

MealAdherenceSchema.index({
  athleteUserId: 1,
  mealPlanId: 1,
  loggedAt: -1,
});

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { MealPlanStatus, Privacy } from '../common/enums';
import { User } from './user.schema';

export type MealPlanDocument = HydratedDocument<MealPlan>;

@Schema({ _id: false })
export class MealPlanItem {
  @Prop({ required: true, trim: true, maxlength: 200 })
  title!: string;

  @Prop({ min: 0 })
  calories?: number;

  @Prop({ min: 0 })
  proteinG?: number;

  @Prop({ min: 0 })
  carbsG?: number;

  @Prop({ min: 0 })
  fatG?: number;
}

export const MealPlanItemSchema = SchemaFactory.createForClass(MealPlanItem);

@Schema({ _id: false })
export class MealPlanMeal {
  @Prop({ required: true, trim: true, maxlength: 120 })
  name!: string;

  @Prop({ type: [MealPlanItemSchema], default: [] })
  items!: MealPlanItem[];
}

export const MealPlanMealSchema = SchemaFactory.createForClass(MealPlanMeal);

@Schema({ _id: false })
export class MealPlanDay {
  @Prop({ required: true, min: 0 })
  dayIndex!: number;

  @Prop({ type: [MealPlanMealSchema], default: [] })
  meals!: MealPlanMeal[];
}

export const MealPlanDaySchema = SchemaFactory.createForClass(MealPlanDay);

@Schema({ timestamps: true, collection: 'meal_plans' })
export class MealPlan {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  athleteUserId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, index: true })
  coachUserId?: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 200 })
  title!: string;

  @Prop({
    type: String,
    enum: MealPlanStatus,
    default: MealPlanStatus.DRAFT,
    index: true,
  })
  status!: MealPlanStatus;

  @Prop({
    type: String,
    enum: Privacy,
    default: Privacy.PRIVATE,
    index: true,
  })
  privacy!: Privacy;

  @Prop({ type: [MealPlanDaySchema], default: [] })
  days!: MealPlanDay[];

  createdAt!: Date;
  updatedAt!: Date;
}

export const MealPlanSchema = SchemaFactory.createForClass(MealPlan);

MealPlanSchema.index({ athleteUserId: 1, status: 1, updatedAt: -1 });

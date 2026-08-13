import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { FoodItemStatus } from '../common/enums';

export type FoodItemDocument = HydratedDocument<FoodItem>;

@Schema({ _id: false })
export class FoodItemMacros {
  @Prop({ min: 0 })
  calories?: number;

  @Prop({ min: 0 })
  proteinG?: number;

  @Prop({ min: 0 })
  carbsG?: number;

  @Prop({ min: 0 })
  fatG?: number;
}

export const FoodItemMacrosSchema =
  SchemaFactory.createForClass(FoodItemMacros);

@Schema({ timestamps: true, collection: 'food_items' })
export class FoodItem {
  @Prop({ required: true, trim: true, maxlength: 200 })
  name!: string;

  @Prop({ trim: true, maxlength: 80, index: true })
  categoryKey?: string;

  @Prop({ type: FoodItemMacrosSchema, default: () => ({}) })
  macros!: FoodItemMacros;

  /** Serving size label, e.g. "100g" or "1 cup". */
  @Prop({ trim: true, maxlength: 80 })
  servingLabel?: string;

  @Prop({
    type: String,
    enum: FoodItemStatus,
    default: FoodItemStatus.ACTIVE,
    index: true,
  })
  status!: FoodItemStatus;

  createdAt!: Date;
  updatedAt!: Date;
}

export const FoodItemSchema = SchemaFactory.createForClass(FoodItem);

FoodItemSchema.index({ name: 1, status: 1 });

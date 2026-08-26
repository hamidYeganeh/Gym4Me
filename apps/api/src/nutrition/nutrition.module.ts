import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaModule } from '../media/media.module';
import { FoodItem, FoodItemSchema } from '../schemas/food-item.schema';
import {
  MealAdherence,
  MealAdherenceSchema,
} from '../schemas/meal-adherence.schema';
import { MealPlan, MealPlanSchema } from '../schemas/meal-plan.schema';
import { AccountNutritionController } from './account-nutrition.controller';
import { AdminNutritionController } from './admin-nutrition.controller';
import { NutritionService } from './nutrition.service';

@Module({
  imports: [
    MediaModule,
    MongooseModule.forFeature([
      { name: MealPlan.name, schema: MealPlanSchema },
      { name: FoodItem.name, schema: FoodItemSchema },
      { name: MealAdherence.name, schema: MealAdherenceSchema },
    ]),
  ],
  controllers: [AccountNutritionController, AdminNutritionController],
  providers: [NutritionService],
  exports: [NutritionService],
})
export class NutritionModule {}

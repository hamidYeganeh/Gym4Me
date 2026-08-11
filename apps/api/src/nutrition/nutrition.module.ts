import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MealPlan, MealPlanSchema } from '../schemas/meal-plan.schema';
import { AccountNutritionController } from './account-nutrition.controller';
import { NutritionService } from './nutrition.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MealPlan.name, schema: MealPlanSchema },
    ]),
  ],
  controllers: [AccountNutritionController],
  providers: [NutritionService],
  exports: [NutritionService],
})
export class NutritionModule {}

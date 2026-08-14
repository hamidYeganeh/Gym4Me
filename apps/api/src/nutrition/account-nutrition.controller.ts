import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums';
import {
  CreateMealAdherenceDto,
  CreateMealPlanDto,
  ListFoodItemsQueryDto,
  ListMealAdherenceQueryDto,
  ListMealPlansQueryDto,
  UpdateMealPlanDto,
} from './dto/nutrition.dto';
import { NutritionService } from './nutrition.service';

@ApiTags('account')
@ApiBearerAuth('access-token')
@Controller('account/nutrition')
export class AccountNutritionController {
  constructor(private readonly nutrition: NutritionService) {}

  @Get('meal-plans')
  @Roles(Role.ATHLETE, Role.COACH, Role.ADMIN)
  @ApiOperation({ summary: 'List meal plans for the active role' })
  list(
    @CurrentUser('sub') userId: string,
    @CurrentUser('activeRole') activeRole: Role,
    @Query() query: ListMealPlansQueryDto,
  ) {
    return this.nutrition.listMealPlans(userId, activeRole, query);
  }

  @Get('meal-plans/:id')
  @Roles(Role.ATHLETE, Role.COACH, Role.ADMIN)
  @ApiOperation({ summary: 'Get a meal plan' })
  get(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('activeRole') activeRole: Role,
  ) {
    return this.nutrition.getMealPlan(id, userId, activeRole);
  }

  @Post('meal-plans')
  @Roles(Role.ATHLETE, Role.COACH, Role.ADMIN)
  @ApiOperation({
    summary: 'Create a meal plan (coach for athlete, or athlete for self)',
  })
  create(
    @Body() dto: CreateMealPlanDto,
    @CurrentUser('sub') userId: string,
    @CurrentUser('activeRole') activeRole: Role,
    @Req() request: Request,
  ) {
    return this.nutrition.createMealPlan(dto, userId, activeRole, request);
  }

  @Patch('meal-plans/:id')
  @Roles(Role.ATHLETE, Role.COACH, Role.ADMIN)
  @ApiOperation({ summary: 'Update a meal plan' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMealPlanDto,
    @CurrentUser('sub') userId: string,
    @CurrentUser('activeRole') activeRole: Role,
    @Req() request: Request,
  ) {
    return this.nutrition.updateMealPlan(id, dto, userId, activeRole, request);
  }

  @Delete('meal-plans/:id')
  @HttpCode(200)
  @Roles(Role.ATHLETE, Role.COACH, Role.ADMIN)
  @ApiOperation({ summary: 'Archive a meal plan' })
  remove(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('activeRole') activeRole: Role,
    @Req() request: Request,
  ) {
    return this.nutrition.deleteMealPlan(id, userId, activeRole, request);
  }

  @Get('food-items')
  @Roles(Role.ATHLETE, Role.COACH, Role.ADMIN)
  @ApiOperation({ summary: 'List active food bank items' })
  listFoodItems(@Query() query: ListFoodItemsQueryDto) {
    return this.nutrition.listFoodItems(query);
  }

  @Get('adherence')
  @Roles(Role.ATHLETE)
  @ApiOperation({ summary: 'List my meal adherence logs' })
  listAdherence(
    @CurrentUser('sub') userId: string,
    @Query() query: ListMealAdherenceQueryDto,
  ) {
    return this.nutrition.listMealAdherence(userId, query);
  }

  @Post('adherence')
  @Roles(Role.ATHLETE)
  @ApiOperation({ summary: 'Log meal plan adherence (privacy PRIVATE)' })
  createAdherence(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateMealAdherenceDto,
    @Req() request: Request,
  ) {
    return this.nutrition.createMealAdherence(userId, dto, request);
  }
}

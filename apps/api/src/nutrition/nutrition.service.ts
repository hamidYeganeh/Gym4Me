import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Request } from 'express';
import { Model, Types } from 'mongoose';
import type { QueryFilter } from 'mongoose';
import { AuditService } from '../audit/audit.service';
import {
  AuditAction,
  MealPlanStatus,
  Privacy,
  Role,
} from '../common/enums';
import {
  paginatedResult,
  resolvePageSize,
} from '../common/utils/pagination.util';
import { MealPlan, MealPlanDocument } from '../schemas/meal-plan.schema';
import {
  CreateMealPlanDto,
  ListMealPlansQueryDto,
  MealPlanDayDto,
  UpdateMealPlanDto,
} from './dto/nutrition.dto';

@Injectable()
export class NutritionService {
  constructor(
    @InjectModel(MealPlan.name)
    private readonly mealPlanModel: Model<MealPlanDocument>,
    private readonly audit: AuditService,
  ) {}

  async listMealPlans(
    userId: string,
    activeRole: Role,
    query: ListMealPlansQueryDto,
  ) {
    const filter = this.accessFilter(userId, activeRole, query);
    const { page, pageSize } = resolvePageSize(query);
    const [items, total] = await Promise.all([
      this.mealPlanModel
        .find(filter)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.mealPlanModel.countDocuments(filter),
    ]);
    return paginatedResult(
      items.map((item) => this.toMealPlan(item)),
      total,
      page,
      pageSize,
    );
  }

  async getMealPlan(id: string, userId: string, activeRole: Role) {
    const item = await this.findMealPlan(id);
    this.assertAccess(item, userId, activeRole);
    return this.toMealPlan(item.toObject());
  }

  async createMealPlan(
    dto: CreateMealPlanDto,
    userId: string,
    activeRole: Role,
    request: Request,
  ) {
    const athleteUserId = this.resolveAthleteUserId(
      dto.athleteUserId,
      userId,
      activeRole,
    );
    const coachUserId =
      activeRole === Role.COACH ? new Types.ObjectId(userId) : undefined;

    const item = await this.mealPlanModel.create({
      athleteUserId: new Types.ObjectId(athleteUserId),
      coachUserId,
      title: dto.title.trim(),
      status: dto.status ?? MealPlanStatus.DRAFT,
      privacy: dto.privacy ?? Privacy.PRIVATE,
      days: this.mapDays(dto.days ?? []),
    });

    this.audit.log({
      action: AuditAction.MEAL_PLAN_UPSERTED,
      actorId: userId,
      targetUserId: athleteUserId,
      metadata: { mealPlanId: item._id.toString() },
      request,
    });
    return this.toMealPlan(item.toObject());
  }

  async updateMealPlan(
    id: string,
    dto: UpdateMealPlanDto,
    userId: string,
    activeRole: Role,
    request: Request,
  ) {
    const item = await this.findMealPlan(id);
    this.assertAccess(item, userId, activeRole);

    if (dto.title !== undefined) item.title = dto.title.trim();
    if (dto.status !== undefined) item.status = dto.status;
    if (dto.privacy !== undefined) item.privacy = dto.privacy;
    if (dto.days !== undefined) item.days = this.mapDays(dto.days);
    await item.save();

    this.audit.log({
      action: AuditAction.MEAL_PLAN_UPSERTED,
      actorId: userId,
      targetUserId: item.athleteUserId,
      metadata: { mealPlanId: id },
      request,
    });
    return this.toMealPlan(item.toObject());
  }

  async deleteMealPlan(
    id: string,
    userId: string,
    activeRole: Role,
    request: Request,
  ) {
    const item = await this.findMealPlan(id);
    this.assertAccess(item, userId, activeRole);
    item.status = MealPlanStatus.ARCHIVED;
    await item.save();
    this.audit.log({
      action: AuditAction.MEAL_PLAN_UPSERTED,
      actorId: userId,
      targetUserId: item.athleteUserId,
      metadata: { kind: 'archive', mealPlanId: id },
      request,
    });
    return this.toMealPlan(item.toObject());
  }

  private resolveAthleteUserId(
    athleteUserId: string | undefined,
    userId: string,
    activeRole: Role,
  ): string {
    if (activeRole === Role.ATHLETE) {
      if (athleteUserId && athleteUserId !== userId) {
        throw new ForbiddenException('Athletes can only manage their own plans');
      }
      return userId;
    }
    if (activeRole === Role.COACH || activeRole === Role.ADMIN) {
      if (!athleteUserId) {
        throw new BadRequestException('athleteUserId is required');
      }
      return athleteUserId;
    }
    throw new ForbiddenException('Role cannot manage meal plans');
  }

  private accessFilter(
    userId: string,
    activeRole: Role,
    query: ListMealPlansQueryDto,
  ): QueryFilter<MealPlanDocument> {
    const filter: QueryFilter<MealPlanDocument> = {};
    if (query.status) filter.status = query.status;

    if (activeRole === Role.ADMIN) {
      if (query.athleteUserId) {
        filter.athleteUserId = new Types.ObjectId(query.athleteUserId);
      }
      return filter;
    }
    if (activeRole === Role.ATHLETE) {
      filter.athleteUserId = new Types.ObjectId(userId);
      return filter;
    }
    if (activeRole === Role.COACH) {
      filter.coachUserId = new Types.ObjectId(userId);
      if (query.athleteUserId) {
        filter.athleteUserId = new Types.ObjectId(query.athleteUserId);
      }
      return filter;
    }
    throw new ForbiddenException('Role cannot list meal plans');
  }

  private assertAccess(
    plan: MealPlanDocument,
    userId: string,
    activeRole: Role,
  ) {
    if (activeRole === Role.ADMIN) return;
    if (plan.athleteUserId.toString() === userId) return;
    if (
      activeRole === Role.COACH &&
      plan.coachUserId?.toString() === userId
    ) {
      return;
    }
    throw new ForbiddenException('Not allowed to access this meal plan');
  }

  private async findMealPlan(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Meal plan not found');
    }
    const item = await this.mealPlanModel.findById(id);
    if (!item) throw new NotFoundException('Meal plan not found');
    return item;
  }

  private mapDays(days: MealPlanDayDto[]) {
    return days.map((day) => ({
      dayIndex: day.dayIndex,
      meals: (day.meals ?? []).map((meal) => ({
        name: meal.name.trim(),
        items: (meal.items ?? []).map((item) => ({
          title: item.title.trim(),
          calories: item.calories,
          proteinG: item.proteinG,
          carbsG: item.carbsG,
          fatG: item.fatG,
        })),
      })),
    }));
  }

  private toMealPlan(doc: {
    _id: Types.ObjectId;
    athleteUserId: Types.ObjectId;
    coachUserId?: Types.ObjectId;
    title: string;
    status: MealPlanStatus;
    privacy: Privacy;
    days: {
      dayIndex: number;
      meals: {
        name: string;
        items: {
          title: string;
          calories?: number;
          proteinG?: number;
          carbsG?: number;
          fatG?: number;
        }[];
      }[];
    }[];
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: doc._id.toString(),
      athleteUserId: doc.athleteUserId.toString(),
      coachUserId: doc.coachUserId?.toString() ?? null,
      title: doc.title,
      status: doc.status,
      privacy: doc.privacy,
      days: (doc.days ?? []).map((day) => ({
        dayIndex: day.dayIndex,
        meals: (day.meals ?? []).map((meal) => ({
          name: meal.name,
          items: (meal.items ?? []).map((item) => ({
            title: item.title,
            calories: item.calories ?? null,
            proteinG: item.proteinG ?? null,
            carbsG: item.carbsG ?? null,
            fatG: item.fatG ?? null,
          })),
        })),
      })),
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}

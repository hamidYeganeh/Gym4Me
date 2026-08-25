import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  BookingStatus,
  CoachStudentEngagementLevel,
  CoachStudentStatus,
  DebtStatus,
  MembershipStatus,
  OwnerTaskStatus,
  Role,
  WorkoutLogStatus,
  AnalyticsEventName,
} from '../common/enums';
import { EventWriterService } from '../analytics/event-writer.service';
import { ActionCenterClickDto } from './action-center.dto';
import { Booking, BookingDocument } from '../schemas/booking.schema';
import {
  ClubMembership,
  ClubMembershipDocument,
} from '../schemas/club-membership.schema';
import { Club, ClubDocument } from '../schemas/club.schema';
import {
  CoachStudent,
  CoachStudentDocument,
} from '../schemas/coach-student.schema';
import { Debt, DebtDocument } from '../schemas/debt.schema';
import { OwnerTask, OwnerTaskDocument } from '../schemas/owner-task.schema';
import { WorkoutLog, WorkoutLogDocument } from '../schemas/workout-log.schema';

export type ActionCenterItem = {
  id: string;
  kind: string;
  priority: number;
  href: string;
  entityId: string | null;
  dueAt: string | null;
  params: Record<string, string | number>;
};

@Injectable()
export class ActionCenterService {
  constructor(
    @InjectModel(Booking.name)
    private readonly bookings: Model<BookingDocument>,
    @InjectModel(ClubMembership.name)
    private readonly memberships: Model<ClubMembershipDocument>,
    @InjectModel(WorkoutLog.name)
    private readonly workoutLogs: Model<WorkoutLogDocument>,
    @InjectModel(CoachStudent.name)
    private readonly coachStudents: Model<CoachStudentDocument>,
    @InjectModel(Club.name)
    private readonly clubs: Model<ClubDocument>,
    @InjectModel(Debt.name)
    private readonly debts: Model<DebtDocument>,
    @InjectModel(OwnerTask.name)
    private readonly ownerTasks: Model<OwnerTaskDocument>,
    private readonly events: EventWriterService,
  ) {}

  async get(userId: string, activeRole: Role) {
    const startedAt = Date.now();
    let items: ActionCenterItem[] = [];
    if (activeRole === Role.ATHLETE) items = await this.athlete(userId);
    if (activeRole === Role.COACH) items = await this.coach(userId);
    if (activeRole === Role.CLUB_OWNER) items = await this.owner(userId);
    const result = {
      generatedAt: new Date().toISOString(),
      elapsedMs: Date.now() - startedAt,
      items: items.sort((a, b) => b.priority - a.priority).slice(0, 3),
    };
    void this.events.track({
      eventName: AnalyticsEventName.ACTION_CENTER_VIEWED,
      actor: { userId, activeRole },
      properties: { kinds: result.items.map((item) => item.kind) },
    });
    return result;
  }

  click(userId: string, activeRole: Role, dto: ActionCenterClickDto) {
    const rolePrefix =
      activeRole === Role.CLUB_OWNER ? 'owner.' : `${activeRole}.`;
    if (!dto.kind.startsWith(rolePrefix)) {
      throw new ForbiddenException('action_center.kind_not_allowed');
    }
    return this.events.track({
      eventName: AnalyticsEventName.ACTION_CENTER_CLICKED,
      actor: { userId, activeRole },
      properties: { itemId: dto.itemId, kind: dto.kind },
    });
  }

  private async athlete(userId: string): Promise<ActionCenterItem[]> {
    const uid = new Types.ObjectId(userId);
    const now = new Date();
    const sevenDays = new Date(now.getTime() + 7 * 86_400_000);
    const [payment, upcoming, workout, membership] = await Promise.all([
      this.bookings
        .findOne({
          athleteId: uid,
          status: BookingStatus.AWAITING_PAYMENT,
          paymentExpiresAt: { $gt: now },
        })
        .sort({ paymentExpiresAt: 1 })
        .select('_id code paymentExpiresAt')
        .lean(),
      this.bookings
        .findOne({
          athleteId: uid,
          status: BookingStatus.CONFIRMED,
          startsAt: { $gte: now },
        })
        .sort({ startsAt: 1 })
        .select('_id startsAt')
        .lean(),
      this.workoutLogs
        .findOne({
          athleteId: uid,
          status: {
            $in: [WorkoutLogStatus.IN_PROGRESS, WorkoutLogStatus.DRAFT],
          },
        })
        .sort({ updatedAt: -1 })
        .select('_id planId status updatedAt')
        .lean(),
      this.memberships
        .findOne({
          'holder.userId': uid,
          status: MembershipStatus.ACTIVE,
          $or: [
            { 'credit.remainingSessions': { $lte: 2 } },
            { 'credit.remainingEntries': { $lte: 2 } },
            { 'credit.expiresAt': { $lte: sevenDays } },
          ],
        })
        .sort({ 'credit.expiresAt': 1 })
        .select('_id clubId credit')
        .lean(),
    ]);
    const items: ActionCenterItem[] = [];
    if (payment) {
      items.push({
        id: `booking-payment:${payment._id.toString()}`,
        kind: 'athlete.booking_payment',
        priority: 100,
        href: `/athlete/bookings/${payment._id.toString()}`,
        entityId: payment._id.toString(),
        dueAt: payment.paymentExpiresAt?.toISOString() ?? null,
        params: { code: payment.code },
      });
    }
    if (workout) {
      items.push({
        id: `workout-resume:${workout._id.toString()}`,
        kind: 'athlete.workout_resume',
        priority: 80,
        href: `/athlete/workouts/${workout.planId.toString()}`,
        entityId: workout._id.toString(),
        dueAt: null,
        params: {},
      });
    }
    if (membership) {
      items.push({
        id: `membership-renew:${membership._id.toString()}`,
        kind: 'athlete.membership_renew',
        priority: 70,
        href: `/athlete/memberships/${membership._id.toString()}`,
        entityId: membership._id.toString(),
        dueAt: membership.credit?.expiresAt?.toISOString() ?? null,
        params: {},
      });
    }
    if (upcoming) {
      items.push({
        id: `booking-upcoming:${upcoming._id.toString()}`,
        kind: 'athlete.booking_upcoming',
        priority: 60,
        href: `/athlete/bookings/${upcoming._id.toString()}`,
        entityId: upcoming._id.toString(),
        dueAt: upcoming.startsAt.toISOString(),
        params: {},
      });
    }
    return items;
  }

  private async coach(userId: string): Promise<ActionCenterItem[]> {
    const uid = new Types.ObjectId(userId);
    const [pendingCount, atRisk, newStudent] = await Promise.all([
      this.bookings.countDocuments({
        coachUserId: uid,
        status: BookingStatus.PENDING,
      }),
      this.coachStudents
        .findOne({
          coachUserId: uid,
          status: CoachStudentStatus.ACTIVE,
          'engagement.level': CoachStudentEngagementLevel.AT_RISK,
        })
        .sort({ 'engagement.scoredAt': 1 })
        .select('_id')
        .lean(),
      this.coachStudents
        .findOne({
          coachUserId: uid,
          status: CoachStudentStatus.ACTIVE,
          'engagement.lastSessionAt': { $exists: false },
        })
        .sort({ createdAt: 1 })
        .select('_id')
        .lean(),
    ]);
    const items: ActionCenterItem[] = [];
    if (pendingCount > 0) {
      items.push({
        id: 'coach-booking-requests',
        kind: 'coach.booking_requests',
        priority: 100,
        href: '/coach/bookings',
        entityId: null,
        dueAt: null,
        params: { count: pendingCount },
      });
    }
    if (atRisk) {
      items.push({
        id: `coach-at-risk:${atRisk._id.toString()}`,
        kind: 'coach.student_at_risk',
        priority: 80,
        href: `/coach/clients/${atRisk._id.toString()}`,
        entityId: atRisk._id.toString(),
        dueAt: null,
        params: {},
      });
    }
    if (newStudent) {
      items.push({
        id: `coach-program:${newStudent._id.toString()}`,
        kind: 'coach.student_program',
        priority: 60,
        href: '/coach/programs',
        entityId: newStudent._id.toString(),
        dueAt: null,
        params: {},
      });
    }
    return items;
  }

  private async owner(userId: string): Promise<ActionCenterItem[]> {
    const clubs = await this.clubs
      .find({ ownerId: new Types.ObjectId(userId) })
      .select('_id')
      .limit(50)
      .lean();
    if (clubs.length === 0) {
      return [
        {
          id: 'owner-create-club',
          kind: 'owner.create_club',
          priority: 100,
          href: '/owner/clubs/create',
          entityId: null,
          dueAt: null,
          params: {},
        },
      ];
    }
    const clubIds = clubs.map((club) => club._id);
    const [debtCount, taskCount] = await Promise.all([
      this.debts.countDocuments({
        clubId: { $in: clubIds },
        status: { $in: [DebtStatus.OPEN, DebtStatus.PARTIAL] },
      }),
      this.ownerTasks.countDocuments({
        clubId: { $in: clubIds },
        status: OwnerTaskStatus.OPEN,
      }),
    ]);
    const items: ActionCenterItem[] = [];
    if (debtCount > 0) {
      items.push({
        id: 'owner-debts',
        kind: 'owner.debts',
        priority: 90,
        href: '/owner/debts',
        entityId: null,
        dueAt: null,
        params: { count: debtCount },
      });
    }
    if (taskCount > 0) {
      items.push({
        id: 'owner-tasks',
        kind: 'owner.tasks',
        priority: 70,
        href: '/owner/lifecycle',
        entityId: null,
        dueAt: null,
        params: { count: taskCount },
      });
    }
    return items;
  }
}

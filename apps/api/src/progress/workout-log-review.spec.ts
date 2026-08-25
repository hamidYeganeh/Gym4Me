import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Types } from 'mongoose';
import {
  AthleteDataGrantScope,
  AuditAction,
  WorkoutLogStatus,
} from '../common/enums';
import { ProgressService } from './progress.service';

describe('ProgressService workout log review', () => {
  const coachId = new Types.ObjectId();
  const athleteId = new Types.ObjectId();
  const logId = new Types.ObjectId();
  const planId = new Types.ObjectId();

  function setup(
    status = WorkoutLogStatus.COMPLETED,
    assignedCoachId = coachId,
  ) {
    const document = {
      _id: logId,
      planId,
      athleteId,
      sessionIndex: 0,
      sets: [],
      status,
      reviews: [] as Array<Record<string, unknown>>,
      loggedAt: new Date('2026-08-25T08:00:00.000Z'),
      createdAt: new Date('2026-08-25T08:00:00.000Z'),
      updatedAt: new Date('2026-08-25T08:00:00.000Z'),
      toObject() {
        return { ...document };
      },
    };
    const workoutLogs = {
      findById: jest.fn().mockResolvedValue(document),
      updateOne: jest
        .fn()
        .mockImplementation(
          (
            _filter: Record<string, unknown>,
            update: { $push: { reviews: Record<string, unknown> } },
          ) => {
            document.reviews.push(update.$push.reviews);
            return { modifiedCount: 1 };
          },
        ),
    };
    const plans = {
      findById: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue({ coachUserId: assignedCoachId }),
      }),
    };
    const students = {
      findOne: jest.fn().mockResolvedValue({ status: 'active' }),
    };
    const grants = {
      updateMany: jest.fn().mockResolvedValue(undefined),
      findOne: jest.fn().mockResolvedValue({
        scopes: [AthleteDataGrantScope.WORKOUTS_LOGS],
      }),
    };
    const audit = { log: jest.fn() };
    const session = {};
    const transactions = {
      run: jest.fn(async (work: (value: object) => Promise<unknown>) =>
        work(session),
      ),
    };
    const outbox = { enqueue: jest.fn().mockResolvedValue(undefined) };
    const service = new ProgressService(
      {} as never,
      plans as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      workoutLogs as never,
      {} as never,
      students as never,
      grants as never,
      {} as never,
      {} as never,
      {} as never,
      audit as never,
      {} as never,
      {} as never,
      transactions as never,
      outbox as never,
    );
    return { audit, document, outbox, service, workoutLogs };
  }

  it('appends an assigned-coach review once and returns it on replay', async () => {
    const { audit, outbox, service, workoutLogs } = setup();
    const input = {
      note: '  دامنه حرکت را کنترل کن  ',
      clientMutationId: 'review-mutation-0001',
    };

    const first = await service.reviewWorkoutLog(
      logId.toString(),
      input,
      coachId.toString(),
      {} as never,
    );
    const replay = await service.reviewWorkoutLog(
      logId.toString(),
      input,
      coachId.toString(),
      {} as never,
    );

    expect(first.reviews).toHaveLength(1);
    expect(first.reviews[0].note).toBe('دامنه حرکت را کنترل کن');
    expect(replay.reviews).toHaveLength(1);
    expect(workoutLogs.updateOne).toHaveBeenCalledTimes(1);
    expect(audit.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: AuditAction.WORKOUT_LOG_REVIEWED }),
    );
    expect(outbox.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: 'workout.log_reviewed',
        idempotencyKey: expect.stringContaining('review-mutation-0001'),
      }),
      expect.any(Object),
    );
  });

  it('rejects unfinished logs and a coach who is not assigned to the plan', async () => {
    const unfinished = setup(WorkoutLogStatus.IN_PROGRESS);
    await expect(
      unfinished.service.reviewWorkoutLog(
        logId.toString(),
        { note: 'بازخورد تست', clientMutationId: 'review-mutation-0002' },
        coachId.toString(),
        {} as never,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    const otherCoach = setup(WorkoutLogStatus.COMPLETED, new Types.ObjectId());
    await expect(
      otherCoach.service.reviewWorkoutLog(
        logId.toString(),
        { note: 'بازخورد تست', clientMutationId: 'review-mutation-0003' },
        coachId.toString(),
        {} as never,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});

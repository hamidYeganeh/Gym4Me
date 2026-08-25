import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { Privacy, Role, WorkoutPlanStatus } from '../common/enums';
import { ProgressService } from './progress.service';

describe('ProgressService workout plan revisions', () => {
  const athleteId = new Types.ObjectId();
  const planId = new Types.ObjectId();
  const exerciseA = new Types.ObjectId();
  const exerciseB = new Types.ObjectId();
  const firstRevisionId = new Types.ObjectId();

  function planDocument() {
    const plan = {
      _id: planId,
      athleteUserId: athleteId,
      title: 'نسخه اول',
      status: WorkoutPlanStatus.ACTIVE,
      privacy: Privacy.PRIVATE,
      weeks: [
        {
          weekIndex: 0,
          days: [
            {
              dayIndex: 0,
              exercises: [{ exerciseId: exerciseA, sets: 3, reps: 10 }],
            },
          ],
        },
      ],
      currentRevisionId: firstRevisionId,
      currentRevision: 1,
      revisions: [
        {
          _id: firstRevisionId,
          revision: 1,
          title: 'نسخه اول',
          weeks: [
            {
              weekIndex: 0,
              days: [
                {
                  dayIndex: 0,
                  exercises: [{ exerciseId: exerciseA, sets: 3, reps: 10 }],
                },
              ],
            },
          ],
          createdByUserId: athleteId,
          createdAt: new Date('2026-08-20T08:00:00.000Z'),
        },
      ],
      createdAt: new Date('2026-08-20T08:00:00.000Z'),
      updatedAt: new Date('2026-08-20T08:00:00.000Z'),
      markModified: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
      toObject() {
        return this;
      },
    };
    return plan;
  }

  function serviceFor(plan: ReturnType<typeof planDocument>) {
    const workoutPlans = { findById: jest.fn().mockResolvedValue(plan) };
    const workoutLogs = {
      findOne: jest.fn(),
      create: jest.fn(),
    };
    const audit = { log: jest.fn() };
    const events = { track: jest.fn().mockResolvedValue(undefined) };
    const service = new ProgressService(
      {} as never,
      workoutPlans as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      workoutLogs as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      audit as never,
      events as never,
      {} as never,
      {} as never,
      {} as never,
    );
    return { audit, events, service, workoutLogs };
  }

  it('appends a prescription snapshot without mutating the prior revision', async () => {
    const plan = planDocument();
    const oldSnapshot = JSON.stringify(plan.revisions[0]);
    const { service } = serviceFor(plan);

    const result = await service.updateWorkoutPlan(
      planId.toString(),
      {
        title: 'نسخه دوم',
        weeks: [
          {
            weekIndex: 0,
            days: [
              {
                dayIndex: 0,
                exercises: [
                  { exerciseId: exerciseB.toString(), sets: 4, reps: 8 },
                ],
              },
            ],
          },
        ],
      },
      athleteId.toString(),
      Role.ATHLETE,
      {} as never,
    );

    expect(JSON.stringify(plan.revisions[0])).toBe(oldSnapshot);
    expect(plan.revisions).toHaveLength(2);
    expect(plan.revisions[1]).toMatchObject({
      revision: 2,
      title: 'نسخه دوم',
    });
    expect(result.currentRevision).toBe(2);
    expect(result.currentRevisionId).toBe(plan.revisions[1]?._id.toString());
  });

  it('binds a new log to the server revision and rejects a forged revision', async () => {
    const plan = planDocument();
    const { service, workoutLogs } = serviceFor(plan);
    workoutLogs.create.mockImplementation(async (input: object) => ({
      _id: new Types.ObjectId(),
      ...input,
      sets: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      toObject() {
        return this;
      },
    }));

    const created = await service.createWorkoutLog(
      {
        planId: planId.toString(),
        sessionIndex: 1,
      },
      athleteId.toString(),
      {} as never,
    );
    expect(created.planRevisionId).toBe(firstRevisionId.toString());

    await expect(
      service.createWorkoutLog(
        {
          planId: planId.toString(),
          planRevisionId: new Types.ObjectId().toString(),
          sessionIndex: 2,
        },
        athleteId.toString(),
        {} as never,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

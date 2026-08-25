import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { AnalyticsEventName, WorkoutLogStatus } from '../common/enums';
import { ProgressService } from './progress.service';

describe('ProgressService workout log lifecycle', () => {
  const athleteId = new Types.ObjectId();
  const logId = new Types.ObjectId();
  const planId = new Types.ObjectId();

  function setup(status: WorkoutLogStatus) {
    const document = {
      _id: logId,
      planId,
      athleteId,
      sessionIndex: 1,
      sets: [],
      status,
      timing: { startedAt: new Date('2026-08-25T08:00:00.000Z') },
      loggedAt: new Date('2026-08-25T08:00:00.000Z'),
      createdAt: new Date('2026-08-25T08:00:00.000Z'),
      updatedAt: new Date('2026-08-25T08:00:00.000Z'),
      markModified: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
      toObject() {
        return this;
      },
    };
    const workoutLogs = { findById: jest.fn().mockResolvedValue(document) };
    const audit = { log: jest.fn() };
    const events = { track: jest.fn().mockResolvedValue(undefined) };
    const service = new ProgressService(
      {} as never,
      {} as never,
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
    return { audit, document, events, service };
  }

  it('skips a draft authoritatively and is idempotent on replay', async () => {
    const { audit, document, events, service } = setup(WorkoutLogStatus.DRAFT);

    const first = await service.skipWorkoutLog(
      logId.toString(),
      athleteId.toString(),
      {} as never,
    );
    const replay = await service.skipWorkoutLog(
      logId.toString(),
      athleteId.toString(),
      {} as never,
    );

    expect(first.status).toBe(WorkoutLogStatus.SKIPPED);
    expect(replay.status).toBe(WorkoutLogStatus.SKIPPED);
    expect(document.save).toHaveBeenCalledTimes(1);
    expect(audit.log).toHaveBeenCalledTimes(1);
    expect(events.track).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: AnalyticsEventName.WORKOUT_SKIPPED,
      }),
    );
  });

  it('does not silently rewrite a different terminal outcome', async () => {
    const completed = setup(WorkoutLogStatus.COMPLETED);
    await expect(
      completed.service.skipWorkoutLog(
        logId.toString(),
        athleteId.toString(),
        {} as never,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    const skipped = setup(WorkoutLogStatus.SKIPPED);
    await expect(
      skipped.service.completeWorkoutLog(
        logId.toString(),
        athleteId.toString(),
        {} as never,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

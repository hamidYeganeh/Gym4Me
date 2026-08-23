import { Types } from 'mongoose';
import { MetricSource, Privacy } from '../../../common/enums';
import { projectProgressMetric } from './progress-metric.projector';

describe('projectProgressMetric', () => {
  const base = {
    _id: new Types.ObjectId(),
    athleteUserId: new Types.ObjectId(),
    privacy: Privacy.PRIVATE,
    metricKey: 'weight_kg',
    value: 82.5,
    recordedAt: new Date('2026-08-23T08:00:00.000Z'),
    createdAt: new Date('2026-08-23T08:01:00.000Z'),
    updatedAt: new Date('2026-08-23T08:02:00.000Z'),
  };

  it('projects defaults and nullables without leaking Mongoose values', () => {
    expect(projectProgressMetric(base)).toEqual({
      id: base._id.toString(),
      athleteUserId: base.athleteUserId.toString(),
      privacy: Privacy.PRIVATE,
      metricKey: 'weight_kg',
      value: 82.5,
      unit: null,
      recordedAt: '2026-08-23T08:00:00.000Z',
      note: null,
      source: MetricSource.MANUAL,
      sourceRecordId: null,
      clientMutationId: null,
      period: null,
      periodStartAt: null,
      periodEndAt: null,
      createdAt: '2026-08-23T08:01:00.000Z',
      updatedAt: '2026-08-23T08:02:00.000Z',
    });
  });

  it('prefers the nested period while preserving legacy flat mirrors', () => {
    const nestedStart = new Date('2026-08-23T07:00:00.000Z');
    const nestedEnd = new Date('2026-08-23T08:00:00.000Z');
    const result = projectProgressMetric({
      ...base,
      source: MetricSource.APPLE_HEALTH,
      period: { start: nestedStart, end: nestedEnd },
      periodStartAt: new Date('2020-01-01T00:00:00.000Z'),
    });

    expect(result.period).toEqual({
      start: nestedStart.toISOString(),
      end: nestedEnd.toISOString(),
    });
    expect(result.periodStartAt).toBe(nestedStart.toISOString());
    expect(result.periodEndAt).toBe(nestedEnd.toISOString());
    expect(result.source).toBe(MetricSource.APPLE_HEALTH);
  });
});

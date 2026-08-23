import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { MetricSource, Privacy } from '../../../common/enums';
import { ListProgressMetricsQuery } from './list-progress-metrics.query';

function boundedQuery<T>(items: T[]) {
  const lean = jest.fn().mockResolvedValue(items);
  const limit = jest.fn().mockReturnValue({ lean });
  const skip = jest.fn().mockReturnValue({ limit });
  const sort = jest.fn().mockReturnValue({ skip });
  return { root: { sort }, spies: { limit, skip, sort } };
}

describe('ListProgressMetricsQuery', () => {
  const athleteUserId = new Types.ObjectId().toString();
  const metric = {
    _id: new Types.ObjectId(),
    athleteUserId: new Types.ObjectId(athleteUserId),
    privacy: Privacy.COACH,
    metricKey: 'steps',
    value: 10_000,
    recordedAt: new Date('2026-08-23T08:00:00.000Z'),
    createdAt: new Date('2026-08-23T08:00:00.000Z'),
    updatedAt: new Date('2026-08-23T08:00:00.000Z'),
  };

  function setup() {
    const mongoQuery = boundedQuery([metric]);
    const model = {
      find: jest.fn().mockReturnValue(mongoQuery.root),
      countDocuments: jest.fn().mockResolvedValue(21),
    };
    return {
      model,
      mongoQuery,
      query: new ListProgressMetricsQuery(model as never),
    };
  }

  it('applies authorized metric keys and a bounded time/source page', async () => {
    const { model, mongoQuery, query } = setup();

    const result = await query.execute(
      athleteUserId,
      {
        page: 2,
        page_size: 10,
        source: MetricSource.HEALTH_CONNECT,
        from: '2026-08-01T00:00:00.000Z',
        to: '2026-08-31T23:59:59.999Z',
      },
      ['steps', 'distance_km'],
    );

    expect(model.find).toHaveBeenCalledWith({
      athleteUserId: new Types.ObjectId(athleteUserId),
      metricKey: { $in: ['steps', 'distance_km'] },
      source: MetricSource.HEALTH_CONNECT,
      recordedAt: {
        $gte: new Date('2026-08-01T00:00:00.000Z'),
        $lte: new Date('2026-08-31T23:59:59.999Z'),
      },
    });
    expect(mongoQuery.spies.sort).toHaveBeenCalledWith({ recordedAt: -1 });
    expect(mongoQuery.spies.skip).toHaveBeenCalledWith(10);
    expect(mongoQuery.spies.limit).toHaveBeenCalledWith(10);
    expect(result.result[0]).toMatchObject({
      athleteUserId,
      metricKey: 'steps',
      source: MetricSource.MANUAL,
    });
    expect(result.pagination).toMatchObject({
      page: 2,
      page_size: 10,
      count: 21,
      next: 3,
      prev: 1,
    });
  });

  it('uses an explicit requested metric instead of the broader allowed list', async () => {
    const { model, query } = setup();

    await query.execute(athleteUserId, { metricKey: 'weight_kg' }, ['steps']);

    expect(model.find).toHaveBeenCalledWith({
      athleteUserId: new Types.ObjectId(athleteUserId),
      metricKey: 'weight_kg',
    });
  });

  it('rejects an inverted date range before querying Mongo', async () => {
    const { model, query } = setup();

    await expect(
      query.execute(athleteUserId, {
        from: '2026-08-31T00:00:00.000Z',
        to: '2026-08-01T00:00:00.000Z',
      }),
    ).rejects.toThrow(BadRequestException);
    expect(model.find).not.toHaveBeenCalled();
  });
});

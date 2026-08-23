import { Types } from 'mongoose';
import {
  CoachStudentEngagementLevel,
  CoachStudentStatus,
} from '../../../../common/enums';
import { CoachingStudentsQuery } from './coaching-students.query';

function boundedQuery<T>(items: T[]) {
  const lean = jest.fn().mockResolvedValue(items);
  const limit = jest.fn().mockReturnValue({ lean });
  const skip = jest.fn().mockReturnValue({ limit });
  const sort = jest.fn().mockReturnValue({ skip });
  return { root: { sort }, spies: { limit, skip, sort } };
}

describe('CoachingStudentsQuery', () => {
  const coachUserId = new Types.ObjectId().toString();
  const athleteUserId = new Types.ObjectId().toString();
  const item = {
    _id: new Types.ObjectId(),
    coachUserId: new Types.ObjectId(coachUserId),
    athleteUserId: new Types.ObjectId(athleteUserId),
    status: CoachStudentStatus.ACTIVE,
    createdAt: new Date('2026-08-01T00:00:00.000Z'),
    updatedAt: new Date('2026-08-23T00:00:00.000Z'),
  };

  function setup() {
    const mongoQuery = boundedQuery([item]);
    const model = {
      find: jest.fn().mockReturnValue(mongoQuery.root),
      countDocuments: jest.fn().mockResolvedValue(1),
    };
    return {
      model,
      mongoQuery,
      query: new CoachingStudentsQuery(model as never),
    };
  }

  it('returns a bounded coach roster with status and engagement filters', async () => {
    const { model, mongoQuery, query } = setup();

    const result = await query.listForCoach(coachUserId, {
      page: 2,
      page_size: 15,
      status: CoachStudentStatus.PAUSED,
      engagementLevel: CoachStudentEngagementLevel.AT_RISK,
    });

    expect(model.find).toHaveBeenCalledWith({
      coachUserId: new Types.ObjectId(coachUserId),
      status: CoachStudentStatus.PAUSED,
      'engagement.level': CoachStudentEngagementLevel.AT_RISK,
    });
    expect(mongoQuery.spies.sort).toHaveBeenCalledWith({ updatedAt: -1 });
    expect(mongoQuery.spies.skip).toHaveBeenCalledWith(15);
    expect(mongoQuery.spies.limit).toHaveBeenCalledWith(15);
    expect(result.result[0]).toMatchObject({
      coachUserId,
      athleteUserId,
    });
  });

  it('defaults the athlete view to active relationships', async () => {
    const { model, query } = setup();

    await query.listForAthlete(athleteUserId, {});

    expect(model.find).toHaveBeenCalledWith({
      athleteUserId: new Types.ObjectId(athleteUserId),
      status: CoachStudentStatus.ACTIVE,
    });
  });
});

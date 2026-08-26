import { Types } from 'mongoose';
import {
  CoachStudentEngagementLevel,
  CoachStudentStatus,
} from '../../../../common/enums';
import { CoachingStudentsQuery } from './coaching-students.query';

function chain<T>(value: T) {
  const query = {
    sort: jest.fn(),
    skip: jest.fn(),
    limit: jest.fn(),
    select: jest.fn(),
    lean: jest.fn().mockResolvedValue(value),
  };
  query.sort.mockReturnValue(query);
  query.skip.mockReturnValue(query);
  query.limit.mockReturnValue(query);
  query.select.mockReturnValue(query);
  return query;
}

describe('CoachingStudentsQuery', () => {
  it('projects only bounded athlete identity needed by the coach list', async () => {
    const coachUserId = new Types.ObjectId();
    const athleteUserId = new Types.ObjectId();
    const avatarMediaId = new Types.ObjectId();
    const createdAt = new Date('2026-08-26T08:00:00.000Z');
    const students = {
      find: jest.fn().mockReturnValue(
        chain([
          {
            _id: new Types.ObjectId(),
            coachUserId,
            athleteUserId,
            status: CoachStudentStatus.ACTIVE,
            coaching: { goalKey: 'strength' },
            engagement: {
              level: CoachStudentEngagementLevel.AT_RISK,
              progressPercent: 35,
            },
            createdAt,
            updatedAt: createdAt,
          },
        ]),
      ),
      countDocuments: jest.fn().mockResolvedValue(1),
    };
    const usersQuery = chain([
      {
        _id: athleteUserId,
        name: { first: 'نگار', last: 'احمدی' },
        avatar: { mediaId: avatarMediaId },
      },
    ]);
    const users = { find: jest.fn().mockReturnValue(usersQuery) };
    const service = new CoachingStudentsQuery(
      students as never,
      users as never,
    );

    const result = await service.listForCoach(coachUserId.toString(), {
      page: 1,
      pageSize: 20,
      engagementLevel: CoachStudentEngagementLevel.AT_RISK,
    });

    expect(students.find).toHaveBeenCalledWith(
      expect.objectContaining({
        coachUserId,
        'engagement.level': CoachStudentEngagementLevel.AT_RISK,
      }),
    );
    expect(usersQuery.select).toHaveBeenCalledWith('_id name avatar.mediaId');
    expect(result.result[0]).toEqual(
      expect.objectContaining({
        athleteUserId: athleteUserId.toString(),
        athlete: {
          displayName: 'نگار احمدی',
          avatarMediaId: avatarMediaId.toString(),
        },
      }),
    );
  });
});

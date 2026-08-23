import { Types } from 'mongoose';
import {
  CoachStudentEngagementLevel,
  CoachStudentStatus,
} from '../../../../common/enums';
import { projectCoachStudent } from './coach-student.projector';

describe('projectCoachStudent', () => {
  it('normalizes optional relationship fields for every audience', () => {
    const item = {
      _id: new Types.ObjectId(),
      coachUserId: new Types.ObjectId(),
      athleteUserId: new Types.ObjectId(),
      status: CoachStudentStatus.ACTIVE,
      createdAt: new Date('2026-08-01T00:00:00.000Z'),
      updatedAt: new Date('2026-08-23T00:00:00.000Z'),
    };

    expect(projectCoachStudent(item)).toEqual({
      id: item._id.toString(),
      coachUserId: item.coachUserId.toString(),
      athleteUserId: item.athleteUserId.toString(),
      status: CoachStudentStatus.ACTIVE,
      coaching: { goalKey: null, levelKey: null },
      engagement: {
        level: CoachStudentEngagementLevel.HEALTHY,
        progressPercent: null,
        scoredAt: null,
        lastSessionAt: null,
      },
      notes: null,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    });
  });
});

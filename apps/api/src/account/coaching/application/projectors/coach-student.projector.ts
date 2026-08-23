import { CoachStudentEngagementLevel } from '../../../../common/enums';
import type { Types } from 'mongoose';

export type CoachStudentProjectionSource = {
  _id: Types.ObjectId;
  coachUserId: Types.ObjectId;
  athleteUserId: Types.ObjectId;
  status: string;
  coaching?: { goalKey?: string; levelKey?: string };
  engagement?: {
    level?: string;
    progressPercent?: number;
    scoredAt?: Date;
    lastSessionAt?: Date;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
};

export function projectCoachStudent(item: CoachStudentProjectionSource) {
  return {
    id: item._id.toString(),
    coachUserId: item.coachUserId.toString(),
    athleteUserId: item.athleteUserId.toString(),
    status: item.status,
    coaching: {
      goalKey: item.coaching?.goalKey ?? null,
      levelKey: item.coaching?.levelKey ?? null,
    },
    engagement: {
      level: item.engagement?.level ?? CoachStudentEngagementLevel.HEALTHY,
      progressPercent: item.engagement?.progressPercent ?? null,
      scoredAt: item.engagement?.scoredAt?.toISOString() ?? null,
      lastSessionAt: item.engagement?.lastSessionAt?.toISOString() ?? null,
    },
    notes: item.notes ?? null,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

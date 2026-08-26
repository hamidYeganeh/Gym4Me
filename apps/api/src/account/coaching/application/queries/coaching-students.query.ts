import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, type QueryFilter } from 'mongoose';
import { CoachStudentStatus } from '../../../../common/enums';
import {
  paginatedResult,
  resolvePageSize,
} from '../../../../common/utils/pagination.util';
import {
  CoachStudent,
  type CoachStudentDocument,
} from '../../../../schemas/coach-student.schema';
import { User, type UserDocument } from '../../../../schemas/user.schema';
import type { ListStudentsQueryDto } from '../../dto/coaching.dto';
import { projectCoachStudent } from '../projectors/coach-student.projector';

/** Bounded relationship reads for coach and athlete audiences. */
@Injectable()
export class CoachingStudentsQuery {
  constructor(
    @InjectModel(CoachStudent.name)
    private readonly studentModel: Model<CoachStudentDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  listForCoach(coachUserId: string, query: ListStudentsQueryDto) {
    const filter: QueryFilter<CoachStudentDocument> = {
      coachUserId: new Types.ObjectId(coachUserId),
    };
    if (query.status) filter.status = query.status;
    if (query.engagementLevel) {
      filter['engagement.level'] = query.engagementLevel;
    }
    return this.execute(filter, query);
  }

  listForAthlete(athleteUserId: string, query: ListStudentsQueryDto) {
    const filter: QueryFilter<CoachStudentDocument> = {
      athleteUserId: new Types.ObjectId(athleteUserId),
      status: query.status ?? CoachStudentStatus.ACTIVE,
    };
    return this.execute(filter, query);
  }

  private async execute(
    filter: QueryFilter<CoachStudentDocument>,
    query: ListStudentsQueryDto,
  ) {
    const { page, pageSize } = resolvePageSize(query);
    const [items, total] = await Promise.all([
      this.studentModel
        .find(filter)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.studentModel.countDocuments(filter),
    ]);
    const athleteIds = items.map((item) => item.athleteUserId);
    const athletes = await this.userModel
      .find({ _id: { $in: athleteIds } })
      .select('_id name avatar.mediaId')
      .lean();
    const athleteById = new Map(
      athletes.map((athlete) => [athlete._id.toString(), athlete]),
    );
    return paginatedResult(
      items.map((item) => {
        const projected = projectCoachStudent(item);
        const athlete = athleteById.get(item.athleteUserId.toString());
        const displayName = [athlete?.name?.first, athlete?.name?.last]
          .filter(Boolean)
          .join(' ')
          .trim();
        return {
          ...projected,
          athlete: {
            displayName: displayName || null,
            avatarMediaId: athlete?.avatar?.mediaId?.toString() ?? null,
          },
        };
      }),
      total,
      page,
      pageSize,
    );
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, type QueryFilter } from 'mongoose';
import {
  paginatedResult,
  resolvePageSize,
} from '../../../common/utils/pagination.util';
import {
  ProgressMetric,
  type ProgressMetricDocument,
} from '../../../schemas/progress-metric.schema';
import type { ListProgressMetricsQueryDto } from '../../dto/progress.dto';
import { projectProgressMetric } from '../projectors/progress-metric.projector';

/** Executes an already-authorized, bounded progress metric query. */
@Injectable()
export class ListProgressMetricsQuery {
  constructor(
    @InjectModel(ProgressMetric.name)
    private readonly metricModel: Model<ProgressMetricDocument>,
  ) {}

  async execute(
    athleteUserId: string,
    query: ListProgressMetricsQueryDto,
    allowedMetricKeys?: string[],
  ) {
    const filter: QueryFilter<ProgressMetricDocument> = {
      athleteUserId: new Types.ObjectId(athleteUserId),
    };
    if (query.metricKey) {
      filter.metricKey = query.metricKey;
    } else if (allowedMetricKeys) {
      filter.metricKey = { $in: allowedMetricKeys };
    }
    if (query.source) filter.source = query.source;
    if (query.from || query.to) {
      const from = query.from ? new Date(query.from) : undefined;
      const to = query.to ? new Date(query.to) : undefined;
      if (from && to && from > to) {
        throw new BadRequestException('from must be before to');
      }
      filter.recordedAt = {
        ...(from ? { $gte: from } : {}),
        ...(to ? { $lte: to } : {}),
      };
    }

    const { page, pageSize } = resolvePageSize(query);
    const [items, total] = await Promise.all([
      this.metricModel
        .find(filter)
        .sort({ recordedAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.metricModel.countDocuments(filter),
    ]);
    return paginatedResult(
      items.map(projectProgressMetric),
      total,
      page,
      pageSize,
    );
  }
}

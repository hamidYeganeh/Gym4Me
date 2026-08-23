import { MetricSource, type Privacy } from '../../../common/enums';
import type { Types } from 'mongoose';

export type ProgressMetricProjectionSource = {
  _id: Types.ObjectId;
  athleteUserId: Types.ObjectId;
  privacy: Privacy;
  metricKey: string;
  value: number;
  unit?: string;
  recordedAt: Date;
  note?: string;
  source?: MetricSource;
  sourceRecordId?: string;
  clientMutationId?: string;
  period?: { start?: Date; end?: Date };
  periodStartAt?: Date;
  periodEndAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

/** Stable API projection for current and legacy progress-metric periods. */
export function projectProgressMetric(doc: ProgressMetricProjectionSource) {
  const periodStart = doc.period?.start ?? doc.periodStartAt ?? undefined;
  const periodEnd = doc.period?.end ?? doc.periodEndAt ?? undefined;
  return {
    id: doc._id.toString(),
    athleteUserId: doc.athleteUserId.toString(),
    privacy: doc.privacy,
    metricKey: doc.metricKey,
    value: doc.value,
    unit: doc.unit ?? null,
    recordedAt: doc.recordedAt.toISOString(),
    note: doc.note ?? null,
    source: doc.source ?? MetricSource.MANUAL,
    sourceRecordId: doc.sourceRecordId ?? null,
    clientMutationId: doc.clientMutationId ?? null,
    period:
      periodStart || periodEnd
        ? {
            start: periodStart?.toISOString() ?? null,
            end: periodEnd?.toISOString() ?? null,
          }
        : null,
    periodStartAt: periodStart?.toISOString() ?? null,
    periodEndAt: periodEnd?.toISOString() ?? null,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

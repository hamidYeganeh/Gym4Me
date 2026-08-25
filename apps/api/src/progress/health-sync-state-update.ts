import { Types } from 'mongoose';
import { HealthSyncProvider, HealthSyncStatus } from '../common/enums';
import { UpsertHealthSyncStateDto } from './dto/progress.dto';

export function buildHealthSyncStateUpdate(options: {
  provider: HealthSyncProvider;
  dto: UpsertHealthSyncStateDto;
  userId: string;
}): Record<string, unknown> {
  const { provider, dto, userId } = options;
  const set: Record<string, unknown> = {
    status: dto.status,
  };
  const unset: Record<string, 1> = {};

  if (dto.authorizedMetricKeys !== undefined) {
    set.authorizedMetricKeys = [...new Set(dto.authorizedMetricKeys)];
  }
  if (dto.cursorByMetric !== undefined) {
    set.cursorByMetric = dto.cursorByMetric;
  }
  if (dto.lastSyncAt !== undefined) {
    set.lastSyncAt = new Date(dto.lastSyncAt);
  }
  if (dto.lastErrorCode === null) {
    unset.lastErrorCode = 1;
  } else if (dto.lastErrorCode !== undefined) {
    set.lastErrorCode = dto.lastErrorCode.trim();
  }

  const setOnInsert: Record<string, unknown> = {
    athleteUserId: new Types.ObjectId(userId),
    provider,
  };
  if (dto.status === HealthSyncStatus.DISCONNECTED) {
    set.authorizedMetricKeys = [];
    set.cursorByMetric = {};
  }
  if (dto.authorizedMetricKeys === undefined) {
    setOnInsert.authorizedMetricKeys = [];
  }
  if (dto.cursorByMetric === undefined) {
    setOnInsert.cursorByMetric = {};
  }

  const update: Record<string, unknown> = {
    $set: set,
    $setOnInsert: setOnInsert,
  };
  if (Object.keys(unset).length > 0) {
    update.$unset = unset;
  }
  return update;
}

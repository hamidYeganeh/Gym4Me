import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { HealthSyncProvider, HealthSyncStatus } from '../common/enums';
import { User } from './user.schema';

export type HealthSyncStateDocument = HydratedDocument<HealthSyncState>;

/**
 * Per-athlete health provider connection state.
 * Provider credentials (if any) live outside this document / encrypted vault.
 */
@Schema({ timestamps: true, collection: 'health_sync_states' })
export class HealthSyncState {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  athleteUserId!: Types.ObjectId;

  @Prop({
    type: String,
    enum: HealthSyncProvider,
    required: true,
    index: true,
  })
  provider!: HealthSyncProvider;

  @Prop({
    type: String,
    enum: HealthSyncStatus,
    default: HealthSyncStatus.DISCONNECTED,
    index: true,
  })
  status!: HealthSyncStatus;

  @Prop({ type: [String], default: [] })
  authorizedMetricKeys!: string[];

  /** Incremental sync cursors keyed by metricKey. */
  @Prop({ type: Object, default: {} })
  cursorByMetric!: Record<string, string>;

  @Prop({ type: Date })
  lastSyncAt?: Date;

  @Prop({ trim: true, maxlength: 80 })
  lastErrorCode?: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const HealthSyncStateSchema =
  SchemaFactory.createForClass(HealthSyncState);

HealthSyncStateSchema.index(
  { athleteUserId: 1, provider: 1 },
  { unique: true },
);

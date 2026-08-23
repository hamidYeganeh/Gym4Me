import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WorkerLeaseDocument = HydratedDocument<WorkerLease>;

/** Mongo-backed mutex for periodic jobs running on multiple API instances. */
@Schema({ timestamps: true, collection: 'worker_leases' })
export class WorkerLease {
  @Prop({ required: true, unique: true, trim: true })
  key!: string;

  @Prop({ trim: true })
  ownerId?: string;

  @Prop({ required: true, index: true })
  leaseUntil!: Date;

  @Prop()
  acquiredAt?: Date;

  @Prop()
  heartbeatAt?: Date;

  @Prop()
  lastCompletedAt?: Date;

  @Prop({ trim: true, maxlength: 1000 })
  lastError?: string;

  @Prop({ min: 0, default: 0 })
  runCount!: number;

  createdAt!: Date;
  updatedAt!: Date;
}

export const WorkerLeaseSchema = SchemaFactory.createForClass(WorkerLease);

WorkerLeaseSchema.index({ leaseUntil: 1 });

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AccountDeletionRequestDocument =
  HydratedDocument<AccountDeletionRequest>;

export enum AccountDeletionRequestStatus {
  COOLING_OFF = 'cooling_off',
  BLOCKED = 'blocked',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Schema({ timestamps: true, collection: 'account_deletion_requests' })
export class AccountDeletionRequest {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({
    type: String,
    enum: AccountDeletionRequestStatus,
    required: true,
    index: true,
  })
  status!: AccountDeletionRequestStatus;

  @Prop({ required: true })
  requestedAt!: Date;

  @Prop({ required: true })
  coolingOffUntil!: Date;

  @Prop({ trim: true, maxlength: 500 })
  reason?: string;

  @Prop({ required: true, trim: true })
  retentionPolicyVersion!: string;

  @Prop()
  cancelledAt?: Date;

  @Prop()
  completedAt?: Date;

  createdAt!: Date;
  updatedAt!: Date;
}

export const AccountDeletionRequestSchema = SchemaFactory.createForClass(
  AccountDeletionRequest,
);

AccountDeletionRequestSchema.index(
  { userId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: {
        $in: [
          AccountDeletionRequestStatus.COOLING_OFF,
          AccountDeletionRequestStatus.BLOCKED,
          AccountDeletionRequestStatus.PROCESSING,
        ],
      },
    },
  },
);

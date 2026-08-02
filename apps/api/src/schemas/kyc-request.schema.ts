import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { KycRequestKind, KycRequestStatus } from '../common/enums';
import { User } from './user.schema';

export type KycRequestDocument = HydratedDocument<KycRequest>;

@Schema({ timestamps: true, collection: 'kyc_requests' })
export class KycRequest {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: String, enum: KycRequestKind, required: true })
  kind!: KycRequestKind;

  @Prop({
    type: String,
    enum: KycRequestStatus,
    default: KycRequestStatus.PENDING,
    index: true,
  })
  status!: KycRequestStatus;

  // identity kind
  @Prop() nationalId?: string;
  @Prop() birthDate?: Date;

  // document kind
  @Prop() documentType?: string; // national_card | selfie | coach_certificate | ...
  @Prop() filePath?: string;
  @Prop() fileMimeType?: string;

  @Prop() rejectionReason?: string;

  /** Raw provider response, kept for audit. */
  @Prop({ type: Object })
  providerResponse?: Record<string, unknown>;

  @Prop({ type: Types.ObjectId, ref: User.name })
  reviewedBy?: Types.ObjectId;

  @Prop() reviewedAt?: Date;

  createdAt!: Date;
  updatedAt!: Date;
}

export const KycRequestSchema = SchemaFactory.createForClass(KycRequest);

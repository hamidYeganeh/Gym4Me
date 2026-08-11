import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SessionPackageStatus } from '../common/enums';
import { CoachService } from './coach-service.schema';
import { User } from './user.schema';

export type SessionPackageDocument = HydratedDocument<SessionPackage>;

@Schema({ _id: false })
export class SessionPackageSessions {
  @Prop({ required: true, min: 1 })
  total!: number;

  @Prop({ required: true, min: 0, default: 0 })
  used!: number;
}

export const SessionPackageSessionsSchema = SchemaFactory.createForClass(
  SessionPackageSessions,
);

@Schema({ _id: false })
export class SessionPackageFreeze {
  @Prop({ type: Date, required: true })
  frozenAt!: Date;

  @Prop({ type: Date })
  unfreezeAt?: Date;
}

export const SessionPackageFreezeSchema =
  SchemaFactory.createForClass(SessionPackageFreeze);

@Schema({ _id: false })
export class SessionPackageValidity {
  @Prop({ type: Date, required: true })
  expiresAt!: Date;

  @Prop({ type: SessionPackageFreezeSchema })
  freeze?: SessionPackageFreeze;
}

export const SessionPackageValiditySchema = SchemaFactory.createForClass(
  SessionPackageValidity,
);

/** Price paid / agreed at package sale time. */
@Schema({ _id: false })
export class SessionPackagePricing {
  @Prop({ required: true, min: 0 })
  amount!: number;

  @Prop({ required: true, trim: true, default: 'IRR' })
  currency!: string;

  @Prop({ min: 0, default: 0 })
  discount?: number;
}

export const SessionPackagePricingSchema = SchemaFactory.createForClass(
  SessionPackagePricing,
);

/** Prepaid private-session bundle between a coach and athlete (CCH-IR-2). */
@Schema({ timestamps: true, collection: 'session_packages' })
export class SessionPackage {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  coachUserId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  athleteUserId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: CoachService.name })
  serviceId?: Types.ObjectId;

  @Prop({ type: SessionPackageSessionsSchema, required: true })
  sessions!: SessionPackageSessions;

  @Prop({ type: SessionPackageValiditySchema, required: true })
  validity!: SessionPackageValidity;

  @Prop({
    type: String,
    enum: SessionPackageStatus,
    default: SessionPackageStatus.ACTIVE,
    index: true,
  })
  status!: SessionPackageStatus;

  @Prop({ type: SessionPackagePricingSchema, required: true })
  pricing!: SessionPackagePricing;

  /** Optional link to a Payment / MockPayment document. */
  @Prop({ type: Types.ObjectId })
  paymentId?: Types.ObjectId;

  createdAt!: Date;
  updatedAt!: Date;
}

export const SessionPackageSchema =
  SchemaFactory.createForClass(SessionPackage);

SessionPackageSchema.index({ coachUserId: 1, status: 1, createdAt: -1 });
SessionPackageSchema.index({ athleteUserId: 1, status: 1, createdAt: -1 });

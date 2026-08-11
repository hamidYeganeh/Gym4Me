import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  CoachServiceDeliveryMode,
  CoachServiceStatus,
} from '../common/enums';
import { User } from './user.schema';

export type CoachServiceDocument = HydratedDocument<CoachService>;

@Schema({ _id: false })
export class CoachServiceTravel {
  @Prop({ required: true, min: 0 })
  radiusKm!: number;

  @Prop({ required: true, min: 0 })
  fee!: number;
}

export const CoachServiceTravelSchema =
  SchemaFactory.createForClass(CoachServiceTravel);

@Schema({ _id: false })
export class CoachServiceDelivery {
  @Prop({
    type: String,
    enum: CoachServiceDeliveryMode,
    required: true,
  })
  mode!: CoachServiceDeliveryMode;

  /** Online meeting provider key when mode is online (CCH-IR-9). */
  @Prop({ trim: true, maxlength: 80 })
  onlineProvider?: string;

  @Prop({ type: CoachServiceTravelSchema })
  travel?: CoachServiceTravel;
}

export const CoachServiceDeliverySchema =
  SchemaFactory.createForClass(CoachServiceDelivery);

/** Price snapshot for a sellable coaching service (Tomans by default). */
@Schema({ _id: false })
export class CoachServicePricing {
  @Prop({ required: true, min: 0 })
  amount!: number;

  @Prop({ required: true, trim: true, default: 'IRR' })
  currency!: string;

  @Prop({ required: true, min: 1 })
  durationMin!: number;
}

export const CoachServicePricingSchema =
  SchemaFactory.createForClass(CoachServicePricing);

/** Sellable private coaching service (in-person / online / home). */
@Schema({ timestamps: true, collection: 'coach_services' })
export class CoachService {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  coachUserId!: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 200 })
  title!: string;

  @Prop({ trim: true, maxlength: 4000 })
  description?: string;

  @Prop({ type: CoachServiceDeliverySchema, required: true })
  delivery!: CoachServiceDelivery;

  @Prop({ type: CoachServicePricingSchema, required: true })
  pricing!: CoachServicePricing;

  @Prop({
    type: String,
    enum: CoachServiceStatus,
    default: CoachServiceStatus.ACTIVE,
    index: true,
  })
  status!: CoachServiceStatus;

  createdAt!: Date;
  updatedAt!: Date;
}

export const CoachServiceSchema = SchemaFactory.createForClass(CoachService);

CoachServiceSchema.index({ coachUserId: 1, status: 1 });

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from './user.schema';

export type UserAttributionDocument = HydratedDocument<UserAttribution>;

@Schema({ _id: false })
export class TouchPoint {
  @Prop({ trim: true })
  source?: string;

  @Prop({ trim: true })
  medium?: string;

  @Prop({ trim: true })
  campaign?: string;

  @Prop({ trim: true })
  content?: string;

  @Prop({ trim: true })
  term?: string;

  @Prop({ trim: true })
  referrer?: string;

  @Prop({ trim: true })
  landingPage?: string;

  @Prop({ trim: true })
  referralCode?: string;

  @Prop({ trim: true })
  deepLink?: string;

  @Prop()
  capturedAt?: Date;
}

export const TouchPointSchema = SchemaFactory.createForClass(TouchPoint);

@Schema({ timestamps: true, collection: 'user_attributions' })
export class UserAttribution {
  @Prop({
    type: Types.ObjectId,
    ref: User.name,
    required: true,
    unique: true,
    index: true,
  })
  userId!: Types.ObjectId;

  /** Write-once first-touch. */
  @Prop({ type: TouchPointSchema })
  firstTouch?: TouchPoint;

  /** Always updated to latest touch. */
  @Prop({ type: TouchPointSchema })
  lastTouch?: TouchPoint;

  createdAt!: Date;
  updatedAt!: Date;
}

export const UserAttributionSchema =
  SchemaFactory.createForClass(UserAttribution);

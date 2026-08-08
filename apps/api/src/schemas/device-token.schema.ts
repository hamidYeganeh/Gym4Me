import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { DevicePlatform, DeviceTokenStatus } from '../common/enums';
import { User } from './user.schema';

export type DeviceTokenDocument = HydratedDocument<DeviceToken>;

/** Push registration (FCM / APNs via Capacitor) per device. */
@Schema({ timestamps: true, collection: 'device_tokens' })
export class DeviceToken {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, trim: true, unique: true })
  token!: string;

  @Prop({ type: String, enum: DevicePlatform, required: true })
  platform!: DevicePlatform;

  @Prop({
    type: String,
    enum: DeviceTokenStatus,
    default: DeviceTokenStatus.ACTIVE,
    index: true,
  })
  status!: DeviceTokenStatus;

  @Prop({ default: () => new Date() })
  lastSeenAt!: Date;

  createdAt!: Date;
  updatedAt!: Date;
}

export const DeviceTokenSchema = SchemaFactory.createForClass(DeviceToken);

DeviceTokenSchema.index({ userId: 1, status: 1 });

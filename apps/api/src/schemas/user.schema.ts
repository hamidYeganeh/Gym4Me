import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { KycStatus, Role, UserStatus } from '../common/enums';
import { IR_PHONE } from '../common/utils/phone.util';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: true, unique: true, match: IR_PHONE })
  phone!: string;

  @Prop({ trim: true })
  firstName?: string;

  @Prop({ trim: true })
  lastName?: string;

  @Prop({ unique: true, sparse: true, match: /^\d{10}$/ })
  nationalId?: string;

  @Prop({ type: [String], enum: Role, default: [Role.ATHLETE] })
  roles!: Role[];

  /** Public unique handle, e.g. "mahdi-ahmadi-x7k2" */
  @Prop({ unique: true, sparse: true, lowercase: true, trim: true })
  code?: string;

  /** This user's shareable referral code, e.g. "MAHDI-4F2A" */
  @Prop({ unique: true, sparse: true, uppercase: true, trim: true })
  referralCode?: string;

  /** Who referred this user — write-once at registration. */
  @Prop({ type: Types.ObjectId, ref: User.name })
  referredBy?: Types.ObjectId;

  @Prop()
  passwordHash?: string;

  @Prop({ type: String, enum: UserStatus, default: UserStatus.ACTIVE })
  status!: UserStatus;

  @Prop()
  phoneVerifiedAt?: Date;

  @Prop({ type: String, enum: KycStatus, default: KycStatus.NONE })
  kycStatus!: KycStatus;

  @Prop()
  kycVerifiedAt?: Date;

  createdAt!: Date;
  updatedAt!: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ firstName: 'text', lastName: 'text' });

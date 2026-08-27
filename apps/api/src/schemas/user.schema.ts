import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  FavouriteLocationKind,
  KycStatus,
  Role,
  UserStatus,
} from '../common/enums';
import { IR_PHONE } from '../common/utils/phone.util';
import { GeoPoint, GeoPointSchema } from './location.schema';

export type UserDocument = HydratedDocument<User>;

@Schema({ _id: false })
export class UserName {
  @Prop({ trim: true })
  first?: string;

  @Prop({ trim: true })
  last?: string;
}

export const UserNameSchema = SchemaFactory.createForClass(UserName);

@Schema({ _id: false })
export class UserAvatar {
  /** String ref avoids circular import with media.schema. */
  @Prop({ type: Types.ObjectId, ref: 'Media' })
  mediaId?: Types.ObjectId;
}

export const UserAvatarSchema = SchemaFactory.createForClass(UserAvatar);

@Schema({ _id: false })
export class UserDemographics {
  /** Choice-group value key, e.g. "male" | "female" | "other". */
  @Prop({ trim: true })
  gender?: string;

  @Prop()
  birthDate?: Date;
}

export const UserDemographicsSchema =
  SchemaFactory.createForClass(UserDemographics);

/** Self-declared home address (onboarding / profile). */
@Schema({ _id: false })
export class UserAddress {
  @Prop({ type: Types.ObjectId, ref: 'Location' })
  provinceId?: Types.ObjectId;

  @Prop({ trim: true })
  city?: string;

  @Prop({ trim: true })
  district?: string;

  @Prop({ trim: true })
  street?: string;

  @Prop({ trim: true })
  apartment?: string;

  @Prop({ trim: true, match: /^\d{10}$/ })
  postalCode?: string;

  /** GeoJSON [lng, lat] */
  @Prop({ type: GeoPointSchema })
  point?: GeoPoint;
}

export const UserAddressSchema = SchemaFactory.createForClass(UserAddress);

/** Display preferences (units keyed by choice-group key). */
@Schema({ _id: false })
export class UserSettings {
  /** e.g. `{ height_unit: "cm", nutrition_unit: "kcal" }` */
  @Prop({ type: Object, default: () => ({}) })
  units!: Record<string, string>;
}

export const UserSettingsSchema = SchemaFactory.createForClass(UserSettings);

/** User-owned saved place (map pin + address). */
@Schema({ _id: true })
export class UserFavouriteLocation {
  _id!: Types.ObjectId;

  @Prop({
    type: String,
    enum: FavouriteLocationKind,
    required: true,
    index: true,
  })
  kind!: FavouriteLocationKind;

  /** Custom title; required when kind is `other`. */
  @Prop({ trim: true, maxlength: 60 })
  label?: string;

  @Prop({ type: UserAddressSchema, default: () => ({}) })
  address!: UserAddress;
}

export const UserFavouriteLocationSchema = SchemaFactory.createForClass(
  UserFavouriteLocation,
);

@Schema({ timestamps: true, collection: 'users' })
export class User {
  /** E.164 Iran mobile — kept top-level for unique index. */
  @Prop({ required: true, unique: true, match: IR_PHONE })
  phone!: string;

  /** Presence of timestamp implies verified (no parallel boolean). */
  @Prop()
  phoneVerifiedAt?: Date;

  @Prop({ type: UserNameSchema, default: () => ({}) })
  name!: UserName;

  @Prop({ type: UserAvatarSchema, default: () => ({}) })
  avatar!: UserAvatar;

  @Prop({ type: UserDemographicsSchema, default: () => ({}) })
  demographics!: UserDemographics;

  @Prop({ type: UserAddressSchema, default: () => ({}) })
  address!: UserAddress;

  @Prop({ type: [UserFavouriteLocationSchema], default: [] })
  favouriteLocations!: UserFavouriteLocation[];

  @Prop({ type: UserSettingsSchema, default: () => ({ units: {} }) })
  settings!: UserSettings;

  @Prop({ unique: true, sparse: true, match: /^\d{10}$/ })
  nationalId?: string;

  @Prop({ type: [String], enum: Role, default: [Role.ATHLETE] })
  roles!: Role[];

  /** Public unique handle, e.g. "mahdi-ahmadi-x7k2" */
  @Prop({ unique: true, sparse: true, lowercase: true, trim: true })
  code?: string;

  /** This user's shareable referral code, e.g. "G4M-4F2A" */
  @Prop({ unique: true, sparse: true, uppercase: true, trim: true })
  referralCode?: string;

  /** Who referred this user — write-once at registration. */
  @Prop({ type: Types.ObjectId, ref: User.name })
  referredBy?: Types.ObjectId;

  @Prop()
  passwordHash?: string;

  @Prop({ type: String, enum: UserStatus, default: UserStatus.ACTIVE })
  status!: UserStatus;

  @Prop({ type: String, enum: KycStatus, default: KycStatus.NONE })
  kycStatus!: KycStatus;

  @Prop()
  kycVerifiedAt?: Date;

  createdAt!: Date;
  updatedAt!: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ 'name.first': 'text', 'name.last': 'text' });

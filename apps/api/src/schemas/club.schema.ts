import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  ClubLifecycleStatus,
  ClubOperationalStatus,
  GeoDirection,
  OperatingHourAudience,
  RulePolicy,
  WeekdayStatus,
} from '../common/enums';
import { GeoPoint, GeoPointSchema } from './location.schema';
import { Location } from './location.schema';
import { Media } from './media.schema';
import { PointsSummary, PointsSummarySchema } from './point-transaction.schema';
import { RefItem } from './ref-item.schema';
import { Sport } from './sport.schema';
import { User } from './user.schema';

export type ClubDocument = HydratedDocument<Club>;

@Schema({ _id: false })
export class ClubIdentity {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ type: Types.ObjectId, ref: Media.name })
  coverMediaId?: Types.ObjectId;
}

export const ClubIdentitySchema = SchemaFactory.createForClass(ClubIdentity);

@Schema({ _id: false })
export class ClubPhone {
  @Prop({ required: true, trim: true })
  number!: string;

  @Prop({ trim: true })
  label?: string;
}

export const ClubPhoneSchema = SchemaFactory.createForClass(ClubPhone);

@Schema({ _id: false })
export class ClubContact {
  @Prop({ type: [ClubPhoneSchema], default: [] })
  phones!: ClubPhone[];

  /**
   * @deprecated Use `socials` with `platform: 'website'`.
   * Kept so existing documents can be migrated on read/write.
   */
  @Prop({ trim: true })
  website?: string;
}

export const ClubContactSchema = SchemaFactory.createForClass(ClubContact);

@Schema({ _id: false })
export class ClubGalleryItem {
  @Prop({ type: Types.ObjectId, ref: Media.name, required: true })
  mediaId!: Types.ObjectId;

  @Prop({ trim: true })
  title?: string;

  @Prop({ trim: true })
  description?: string;

  /** Cumulative view count for this gallery item. */
  @Prop({ type: Number, min: 0, default: 0 })
  views!: number;

  /** When this gallery item was added to the club. */
  @Prop({ type: Date, default: Date.now })
  createdAt!: Date;
}

export const ClubGalleryItemSchema =
  SchemaFactory.createForClass(ClubGalleryItem);

@Schema({ _id: false })
export class CancellationRule {
  @Prop({ required: true, min: 0 })
  hoursBeforeReservation!: number;

  @Prop({ required: true, min: 0, max: 100 })
  feePercent!: number;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ trim: true })
  description?: string;

  /** Theme token: success | warning | danger */
  @Prop({ trim: true })
  color?: string;
}

export const CancellationRuleSchema =
  SchemaFactory.createForClass(CancellationRule);

@Schema({ _id: false })
export class ClubCancellationPolicy {
  @Prop({ type: [CancellationRuleSchema], default: [] })
  rules!: CancellationRule[];

  @Prop({ type: [CancellationRuleSchema], default: [] })
  peakRules!: CancellationRule[];
}

export const ClubCancellationPolicySchema = SchemaFactory.createForClass(
  ClubCancellationPolicy,
);

@Schema({ _id: false })
export class ClubEquipmentRef {
  @Prop({ type: Types.ObjectId, ref: RefItem.name, required: true })
  equipmentId!: Types.ObjectId;
}

export const ClubEquipmentRefSchema =
  SchemaFactory.createForClass(ClubEquipmentRef);

@Schema({ _id: false })
export class ClubAmenityRef {
  @Prop({ type: Types.ObjectId, ref: RefItem.name, required: true })
  amenityId!: Types.ObjectId;
}

export const ClubAmenityRefSchema =
  SchemaFactory.createForClass(ClubAmenityRef);

@Schema({ _id: false })
export class ClubCategoryRef {
  @Prop({ type: Types.ObjectId, ref: RefItem.name, required: true })
  categoryId!: Types.ObjectId;
}

export const ClubCategoryRefSchema =
  SchemaFactory.createForClass(ClubCategoryRef);

@Schema({ _id: false })
export class ClubSportRef {
  @Prop({ type: Types.ObjectId, ref: Sport.name, required: true })
  sportId!: Types.ObjectId;
}

export const ClubSportRefSchema = SchemaFactory.createForClass(ClubSportRef);

@Schema({ _id: false })
export class ClubClassRef {
  @Prop({ type: Types.ObjectId, ref: 'ClubClass', required: true })
  classId!: Types.ObjectId;
}

export const ClubClassRefSchema = SchemaFactory.createForClass(ClubClassRef);

@Schema({ _id: false })
export class ClubCoachRef {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  coachId!: Types.ObjectId;
}

export const ClubCoachRefSchema = SchemaFactory.createForClass(ClubCoachRef);

@Schema({ _id: false })
export class ClubLocation {
  @Prop({ required: true, trim: true })
  address!: string;

  /** GeoJSON [lng, lat] */
  @Prop({ type: GeoPointSchema })
  point?: GeoPoint;

  @Prop({ type: String, enum: GeoDirection })
  direction?: GeoDirection;

  /** Lowest location node (district / city). */
  @Prop({ type: Types.ObjectId, ref: Location.name })
  locationId?: Types.ObjectId;

  /** Ancestor chain for city/province/country filters. */
  @Prop({ type: [Types.ObjectId], default: [] })
  ancestors!: Types.ObjectId[];
}

export const ClubLocationSchema = SchemaFactory.createForClass(ClubLocation);

@Schema({ _id: false })
export class ReviewStarBucket {
  @Prop({ required: true, min: 1, max: 5 })
  star!: number;

  @Prop({ default: 0 })
  count!: number;
}

export const ReviewStarBucketSchema =
  SchemaFactory.createForClass(ReviewStarBucket);

@Schema({ _id: false })
export class ReviewCriterionAverage {
  @Prop({ type: Types.ObjectId, ref: RefItem.name, required: true })
  criterionId!: Types.ObjectId;

  @Prop({ default: 0 })
  average!: number;
}

export const ReviewCriterionAverageSchema = SchemaFactory.createForClass(
  ReviewCriterionAverage,
);

@Schema({ _id: false })
export class ClubReviewsSummary {
  @Prop({ default: 0 })
  count!: number;

  @Prop({ default: 0 })
  average!: number;

  @Prop({ type: [ReviewStarBucketSchema], default: [] })
  distribution!: ReviewStarBucket[];

  @Prop({ type: [ReviewCriterionAverageSchema], default: [] })
  criteria!: ReviewCriterionAverage[];
}

export const ClubReviewsSummarySchema =
  SchemaFactory.createForClass(ClubReviewsSummary);

@Schema({ _id: false })
export class OperatingHour {
  /** 0 = Saturday (project convention for Jalali week). */
  @Prop({ required: true, min: 0, max: 6 })
  weekday!: number;

  @Prop({
    type: String,
    enum: WeekdayStatus,
    default: WeekdayStatus.OPEN,
  })
  status!: WeekdayStatus;

  /**
   * Audience for this row. Missing / `shared` = one schedule for everyone.
   * Use `male` + `female` rows when a mixed club has gender-split hours.
   */
  @Prop({
    type: String,
    enum: OperatingHourAudience,
    default: OperatingHourAudience.SHARED,
  })
  audience!: OperatingHourAudience;

  @Prop({ trim: true })
  open?: string;

  @Prop({ trim: true })
  close?: string;

  @Prop({ trim: true })
  description?: string;
}

export const OperatingHourSchema = SchemaFactory.createForClass(OperatingHour);

@Schema({ _id: false })
export class ClubSocial {
  /** ChoiceGroup key `social_platform` option value. */
  @Prop({ required: true, trim: true })
  platform!: string;

  @Prop({ required: true, trim: true })
  url!: string;
}

export const ClubSocialSchema = SchemaFactory.createForClass(ClubSocial);

@Schema({ _id: false })
export class ClubAchievementRef {
  @Prop({ type: Types.ObjectId, ref: 'Achievement', required: true })
  achievementId!: Types.ObjectId;

  @Prop({ required: true })
  grantedAt!: Date;

  /** `system` or admin user id */
  @Prop({ trim: true })
  grantedBy?: string;
}

export const ClubAchievementRefSchema =
  SchemaFactory.createForClass(ClubAchievementRef);

@Schema({ _id: false })
export class ClubRule {
  @Prop({ type: String, enum: RulePolicy, required: true })
  policy!: RulePolicy;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ trim: true })
  description?: string;
}

export const ClubRuleSchema = SchemaFactory.createForClass(ClubRule);

@Schema({ _id: false })
export class ClubFaqItem {
  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true, trim: true })
  description!: string;
}

export const ClubFaqItemSchema = SchemaFactory.createForClass(ClubFaqItem);

/** Admin lifecycle verification (documents), not user star-reviews. */
@Schema({ _id: false })
export class ClubReview {
  @Prop({
    type: String,
    enum: ClubLifecycleStatus,
    default: ClubLifecycleStatus.DRAFT,
  })
  status!: ClubLifecycleStatus;

  @Prop()
  submittedAt?: Date;

  @Prop()
  reviewedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: User.name })
  reviewedBy?: Types.ObjectId;

  @Prop({ trim: true })
  reviewNote?: string;

  @Prop({ type: [Types.ObjectId], ref: Media.name, default: [] })
  documentMediaIds!: Types.ObjectId[];
}

export const ClubReviewSchema = SchemaFactory.createForClass(ClubReview);

@Schema({ _id: false })
export class ClubAudience {
  /**
   * ChoiceGroup `gender_policy` value:
   * mixed | male_only | female_only
   */
  @Prop({ trim: true, index: true })
  genderPolicy?: string;

  /** ChoiceGroup `age_group` option values. */
  @Prop({ type: [String], default: [] })
  ageGroupKeys!: string[];

  /** ChoiceGroup `club_level` option values. */
  @Prop({ type: [String], default: [] })
  levelKeys!: string[];

  /**
   * Accessibility offering — enum, not boolean.
   * standard | accessible
   */
  @Prop({ trim: true, default: 'standard', index: true })
  accessibility!: string;
}

export const ClubAudienceSchema = SchemaFactory.createForClass(ClubAudience);

@Schema({ timestamps: true, collection: 'clubs' })
export class Club {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  ownerId!: Types.ObjectId;

  @Prop({ type: ClubIdentitySchema, required: true })
  identity!: ClubIdentity;

  @Prop({ type: ClubContactSchema, default: () => ({ phones: [] }) })
  contact!: ClubContact;

  @Prop({ type: [ClubGalleryItemSchema], default: [] })
  gallery!: ClubGalleryItem[];

  @Prop({
    type: ClubCancellationPolicySchema,
    default: () => ({ rules: [], peakRules: [] }),
  })
  cancellation!: ClubCancellationPolicy;

  @Prop({ type: [ClubEquipmentRefSchema], default: [] })
  equipments!: ClubEquipmentRef[];

  @Prop({ type: [ClubAmenityRefSchema], default: [] })
  amenities!: ClubAmenityRef[];

  @Prop({ type: [ClubCategoryRefSchema], default: [], index: true })
  categories!: ClubCategoryRef[];

  @Prop({ type: [ClubSportRefSchema], default: [], index: true })
  sports!: ClubSportRef[];

  @Prop({ type: [ClubClassRefSchema], default: [] })
  classes!: ClubClassRef[];

  @Prop({ type: [ClubCoachRefSchema], default: [] })
  coaches!: ClubCoachRef[];

  @Prop({ type: ClubLocationSchema })
  location?: ClubLocation;

  /** Branch of this club (null = root club). */
  @Prop({ type: Types.ObjectId, ref: Club.name, index: true })
  parentClubId?: Types.ObjectId;

  @Prop({
    type: ClubAudienceSchema,
    default: () => ({
      ageGroupKeys: [],
      levelKeys: [],
      accessibility: 'standard',
    }),
  })
  audience!: ClubAudience;

  @Prop({
    type: ClubReviewsSummarySchema,
    default: () => ({
      count: 0,
      average: 0,
      distribution: [],
      criteria: [],
    }),
  })
  reviewsSummary!: ClubReviewsSummary;

  @Prop({ type: [OperatingHourSchema], default: [] })
  operatingHours!: OperatingHour[];

  @Prop({ type: [ClubSocialSchema], default: [] })
  socials!: ClubSocial[];

  @Prop({ type: [ClubAchievementRefSchema], default: [] })
  achievements!: ClubAchievementRef[];

  /** Derived cache of the points ledger. */
  @Prop({
    type: PointsSummarySchema,
    default: () => ({ balance: 0, lifetime: 0 }),
  })
  points!: PointsSummary;

  @Prop({ type: [ClubRuleSchema], default: [] })
  rules!: ClubRule[];

  @Prop({ type: [ClubFaqItemSchema], default: [] })
  faq!: ClubFaqItem[];

  @Prop({
    type: ClubReviewSchema,
    default: () => ({
      status: ClubLifecycleStatus.DRAFT,
      documentMediaIds: [],
    }),
  })
  review!: ClubReview;

  @Prop({
    type: String,
    enum: ClubOperationalStatus,
    default: ClubOperationalStatus.ACTIVE,
    index: true,
  })
  operationalStatus!: ClubOperationalStatus;

  createdAt!: Date;
  updatedAt!: Date;
}

export const ClubSchema = SchemaFactory.createForClass(Club);

ClubSchema.index({ ownerId: 1, 'identity.name': 1 });
ClubSchema.index({ 'review.status': 1, operationalStatus: 1 });
ClubSchema.index({ 'location.point': '2dsphere' }, { sparse: true });
ClubSchema.index({ 'location.ancestors': 1 });
ClubSchema.index({ 'location.direction': 1 });
ClubSchema.index({ 'categories.categoryId': 1 });
ClubSchema.index({ 'sports.sportId': 1 });

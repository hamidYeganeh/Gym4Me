import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  AthleteBodyType,
  AthleteExperience,
  AthleteMood,
  BloodGroup,
  Privacy,
  RhFactor,
} from '../common/enums';
import { PointsSummary, PointsSummarySchema } from './point-transaction.schema';
import { User } from './user.schema';

export type AthleteProfileDocument = HydratedDocument<AthleteProfile>;

@Schema({ _id: false })
export class AthleteBody {
  @Prop()
  heightCm?: number;

  @Prop()
  weightKg?: number;
}

export const AthleteBodySchema = SchemaFactory.createForClass(AthleteBody);

@Schema({ _id: false })
export class AthletePrivacy {
  @Prop({ type: String, enum: Privacy, default: Privacy.PRIVATE })
  metrics!: Privacy;

  @Prop({ type: String, enum: Privacy, default: Privacy.PRIVATE })
  photos!: Privacy;
}

export const AthletePrivacySchema =
  SchemaFactory.createForClass(AthletePrivacy);

/** Dashboard metric preferences (order of MetricType.key values). */
@Schema({ _id: false })
export class AthleteMetricsPrefs {
  @Prop({ type: [String], default: [] })
  preferredKeys!: string[];
}

export const AthleteMetricsPrefsSchema =
  SchemaFactory.createForClass(AthleteMetricsPrefs);

/** Onboarding lifestyle assessment answers. */
@Schema({ _id: false })
export class AthleteLifestyle {
  @Prop({ type: String, enum: AthleteBodyType })
  bodyType?: AthleteBodyType;

  @Prop({ type: String, enum: AthleteExperience })
  experience?: AthleteExperience;

  /** Self-rated sleep quality, 1 (worst) … 5 (best). */
  @Prop({ type: Number, min: 1, max: 5 })
  sleepLevel?: number;

  @Prop({ type: String, enum: AthleteMood })
  mood?: AthleteMood;

  /** Choice key from `athlete_diet`. */
  @Prop({ trim: true, maxlength: 80 })
  diet?: string;

  /** Daily calorie intake in kcal; absent = user doesn't know. */
  @Prop({ type: Number, min: 0 })
  dailyCalories?: number;

  /** Preferred activity keys, e.g. "jogging" | "yoga" | "other". */
  @Prop({ type: [String], default: [] })
  activityKeys!: string[];
}

export const AthleteLifestyleSchema =
  SchemaFactory.createForClass(AthleteLifestyle);

@Schema({ _id: false })
export class AthleteBloodType {
  @Prop({ type: String, enum: BloodGroup, required: true })
  group!: BloodGroup;

  @Prop({ type: String, enum: RhFactor, required: true })
  rh!: RhFactor;
}

export const AthleteBloodTypeSchema =
  SchemaFactory.createForClass(AthleteBloodType);

/** Self-reported health background (onboarding + profile edits). */
@Schema({ _id: false })
export class AthleteHealth {
  @Prop({ type: AthleteBloodTypeSchema })
  bloodType?: AthleteBloodType;

  @Prop({ type: [String], default: [] })
  allergies!: string[];

  @Prop({ trim: true })
  conditions?: string;

  @Prop({ trim: true })
  medications?: string;

  @Prop({ trim: true })
  note?: string;
}

export const AthleteHealthSchema = SchemaFactory.createForClass(AthleteHealth);

@Schema({ timestamps: true, collection: 'athlete_profiles' })
export class AthleteProfile {
  @Prop({
    type: Types.ObjectId,
    ref: User.name,
    required: true,
    unique: true,
    index: true,
  })
  userId!: Types.ObjectId;

  @Prop({ trim: true })
  bio?: string;

  /** Ref to AthleteLevel choice / taxonomy id when available. */
  @Prop({ trim: true })
  levelKey?: string;

  @Prop({ type: AthleteBodySchema, default: () => ({}) })
  body!: AthleteBody;

  @Prop({
    type: AthletePrivacySchema,
    default: () => ({ metrics: Privacy.PRIVATE, photos: Privacy.PRIVATE }),
  })
  privacy!: AthletePrivacy;

  @Prop({
    type: AthleteMetricsPrefsSchema,
    default: () => ({ preferredKeys: [] }),
  })
  metrics!: AthleteMetricsPrefs;

  /** Sport taxonomy ids / slugs the athlete follows. */
  @Prop({ type: [String], default: [] })
  sportIds!: string[];

  /** Goal type keys. */
  @Prop({ type: [String], default: [] })
  goalKeys!: string[];

  @Prop({ type: AthleteLifestyleSchema, default: () => ({ activityKeys: [] }) })
  lifestyle!: AthleteLifestyle;

  @Prop({ type: AthleteHealthSchema, default: () => ({ allergies: [] }) })
  health!: AthleteHealth;

  /** Derived cache of the points ledger. */
  @Prop({
    type: PointsSummarySchema,
    default: () => ({ balance: 0, lifetime: 0 }),
  })
  points!: PointsSummary;

  createdAt!: Date;
  updatedAt!: Date;
}

export const AthleteProfileSchema =
  SchemaFactory.createForClass(AthleteProfile);

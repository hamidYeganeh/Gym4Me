import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Privacy } from '../common/enums';
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

  /** Sport taxonomy ids / slugs the athlete follows. */
  @Prop({ type: [String], default: [] })
  sportIds!: string[];

  /** Goal type keys. */
  @Prop({ type: [String], default: [] })
  goalKeys!: string[];

  createdAt!: Date;
  updatedAt!: Date;
}

export const AthleteProfileSchema =
  SchemaFactory.createForClass(AthleteProfile);

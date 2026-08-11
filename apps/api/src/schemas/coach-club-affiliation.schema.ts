import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { CoachAffiliationType, EntityStatus } from '../common/enums';
import { Club } from './club.schema';
import { User } from './user.schema';

export type CoachClubAffiliationDocument =
  HydratedDocument<CoachClubAffiliation>;

@Schema({ _id: false })
export class CoachAffiliationContract {
  @Prop({ min: 0, max: 100 })
  sharePercent?: number;

  @Prop({ min: 0 })
  salary?: number;

  @Prop({ type: Date, required: true })
  effectiveFrom!: Date;

  @Prop({ type: Date })
  effectiveTo?: Date;
}

export const CoachAffiliationContractSchema = SchemaFactory.createForClass(
  CoachAffiliationContract,
);

/** Coach ↔ club commercial relationship (CCH-IR-1). */
@Schema({ timestamps: true, collection: 'coach_club_affiliations' })
export class CoachClubAffiliation {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  coachUserId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Club.name, required: true, index: true })
  clubId!: Types.ObjectId;

  @Prop({
    type: String,
    enum: CoachAffiliationType,
    required: true,
  })
  type!: CoachAffiliationType;

  @Prop({ type: CoachAffiliationContractSchema, required: true })
  contract!: CoachAffiliationContract;

  @Prop({
    type: String,
    enum: EntityStatus,
    default: EntityStatus.ACTIVE,
    index: true,
  })
  status!: EntityStatus;

  createdAt!: Date;
  updatedAt!: Date;
}

export const CoachClubAffiliationSchema = SchemaFactory.createForClass(
  CoachClubAffiliation,
);

CoachClubAffiliationSchema.index(
  { coachUserId: 1, clubId: 1 },
  { unique: true },
);
CoachClubAffiliationSchema.index({ clubId: 1, status: 1 });

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  InviteStatus,
  ReferralQualifyTrigger,
  ReferralRewardStatus,
} from '../common/enums';
import { IR_PHONE } from '../common/utils/phone.util';
import { User } from './user.schema';

export type InviteDocument = HydratedDocument<Invite>;

@Schema({ _id: false })
export class InviteReward {
  @Prop({
    type: String,
    enum: ReferralRewardStatus,
    default: ReferralRewardStatus.PENDING,
  })
  status!: ReferralRewardStatus;

  @Prop({ type: String, enum: ReferralQualifyTrigger })
  trigger?: ReferralQualifyTrigger;

  @Prop({ type: Date })
  qualifiedAt?: Date;

  @Prop({ type: Date })
  clawedBackAt?: Date;
}

export const InviteRewardSchema = SchemaFactory.createForClass(InviteReward);

@Schema({ timestamps: true, collection: 'invites' })
export class Invite {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  inviterId!: Types.ObjectId;

  @Prop({ required: true, index: true, match: IR_PHONE })
  phone!: string;

  @Prop({ type: String, enum: InviteStatus, default: InviteStatus.SENT })
  status!: InviteStatus;

  @Prop({ type: Types.ObjectId, ref: User.name })
  joinedUserId?: Types.ObjectId;

  @Prop({ type: InviteRewardSchema, default: () => ({}) })
  reward!: InviteReward;

  createdAt!: Date;
  updatedAt!: Date;
}

export const InviteSchema = SchemaFactory.createForClass(Invite);

InviteSchema.index({ inviterId: 1, phone: 1 }, { unique: true });
InviteSchema.index({ joinedUserId: 1 });

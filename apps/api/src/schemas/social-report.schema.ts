import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  SocialReportStatus,
  SocialReportTargetKind,
} from '../common/enums';
import { User } from './user.schema';

export type SocialReportDocument = HydratedDocument<SocialReport>;

@Schema({ _id: false })
export class SocialReportTarget {
  @Prop({
    type: String,
    enum: SocialReportTargetKind,
    required: true,
  })
  kind!: SocialReportTargetKind;

  @Prop({ type: Types.ObjectId, required: true })
  id!: Types.ObjectId;
}

export const SocialReportTargetSchema =
  SchemaFactory.createForClass(SocialReportTarget);

@Schema({ _id: false })
export class SocialReportResolution {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  resolvedBy!: Types.ObjectId;

  @Prop({ type: Date, required: true })
  resolvedAt!: Date;

  @Prop({ trim: true, maxlength: 1000 })
  note?: string;
}

export const SocialReportResolutionSchema = SchemaFactory.createForClass(
  SocialReportResolution,
);

@Schema({ timestamps: true, collection: 'social_reports' })
export class SocialReport {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  reporterId!: Types.ObjectId;

  @Prop({ type: SocialReportTargetSchema, required: true })
  target!: SocialReportTarget;

  @Prop({ required: true, trim: true, maxlength: 1000 })
  reason!: string;

  @Prop({
    type: String,
    enum: SocialReportStatus,
    default: SocialReportStatus.OPEN,
    index: true,
  })
  status!: SocialReportStatus;

  @Prop({ type: SocialReportResolutionSchema })
  resolution?: SocialReportResolution;

  createdAt!: Date;
  updatedAt!: Date;
}

export const SocialReportSchema = SchemaFactory.createForClass(SocialReport);

SocialReportSchema.index({ status: 1, createdAt: -1 });
SocialReportSchema.index({ 'target.kind': 1, 'target.id': 1 });

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { User } from './user.schema';
import {
  DiscoveryAuthenticationTarget,
  DiscoveryEmptyBehavior,
  DiscoveryInterestMatch,
  DiscoverySectionKind,
  DiscoverySourceStrategy,
} from '../discovery/discovery.constants';

export type DiscoveryPageDocument = HydratedDocument<DiscoveryPage>;
export type DiscoveryPageRevisionDocument =
  HydratedDocument<DiscoveryPageRevision>;

@Schema({ _id: false })
export class DiscoverySectionContent {
  @Prop({ required: true, trim: true, maxlength: 160 })
  title!: string;

  @Prop({ trim: true, maxlength: 300 })
  subtitle?: string;

  @Prop({ trim: true, maxlength: 80 })
  icon?: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  action?: Record<string, unknown>;
}

export const DiscoverySectionContentSchema = SchemaFactory.createForClass(
  DiscoverySectionContent,
);

@Schema({ _id: false })
export class DiscoverySectionSource {
  @Prop({
    type: String,
    enum: DiscoverySourceStrategy,
    required: true,
  })
  strategy!: DiscoverySourceStrategy;

  @Prop({ type: MongooseSchema.Types.Mixed, default: () => ({}) })
  filters!: Record<string, unknown>;

  @Prop({ trim: true, maxlength: 80 })
  sort?: string;

  @Prop({ required: true, min: 1, max: 12 })
  limit!: number;
}

export const DiscoverySectionSourceSchema = SchemaFactory.createForClass(
  DiscoverySectionSource,
);

@Schema({ _id: false })
export class DiscoverySectionPresentation {
  @Prop({ required: true, trim: true, maxlength: 80 })
  component!: string;

  @Prop({ required: true, trim: true, maxlength: 40 })
  layout!: string;

  @Prop({ trim: true, maxlength: 40 })
  cardVariant?: string;

  @Prop({ min: 1, max: 4 })
  rows?: number;

  @Prop({ type: MongooseSchema.Types.Mixed })
  background?: Record<string, unknown>;
}

export const DiscoverySectionPresentationSchema = SchemaFactory.createForClass(
  DiscoverySectionPresentation,
);

@Schema({ _id: false })
export class DiscoverySectionTargeting {
  @Prop({
    type: String,
    enum: DiscoveryAuthenticationTarget,
    default: DiscoveryAuthenticationTarget.ALL,
  })
  authentication!: DiscoveryAuthenticationTarget;

  @Prop({ type: [String], default: [] })
  activeRoles!: string[];

  @Prop({ type: [String], default: [] })
  sportIds!: string[];

  @Prop({ type: [String], default: [] })
  goalKeys!: string[];

  @Prop({
    type: String,
    enum: DiscoveryInterestMatch,
    default: DiscoveryInterestMatch.ANY,
  })
  match!: DiscoveryInterestMatch;
}

export const DiscoverySectionTargetingSchema = SchemaFactory.createForClass(
  DiscoverySectionTargeting,
);

@Schema({ _id: false })
export class DiscoveryPageSection {
  @Prop({ required: true, trim: true, maxlength: 80 })
  id!: string;

  @Prop({ type: String, enum: DiscoverySectionKind, required: true })
  kind!: DiscoverySectionKind;

  @Prop({ type: DiscoverySectionContentSchema, required: true })
  content!: DiscoverySectionContent;

  @Prop({ type: DiscoverySectionSourceSchema, required: true })
  source!: DiscoverySectionSource;

  @Prop({ type: DiscoverySectionPresentationSchema, required: true })
  presentation!: DiscoverySectionPresentation;

  @Prop({ type: DiscoverySectionTargetingSchema })
  targeting?: DiscoverySectionTargeting;

  @Prop({
    type: String,
    enum: DiscoveryEmptyBehavior,
    default: DiscoveryEmptyBehavior.HIDE,
  })
  emptyBehavior!: DiscoveryEmptyBehavior;

  @Prop({ type: MongooseSchema.Types.Mixed })
  fallback?: Record<string, unknown>;
}

export const DiscoveryPageSectionSchema =
  SchemaFactory.createForClass(DiscoveryPageSection);

@Schema({ timestamps: true, collection: 'discovery_pages' })
export class DiscoveryPage {
  @Prop({ required: true, trim: true, lowercase: true, unique: true })
  pageKey!: string;

  @Prop({ required: true, default: 1 })
  schemaVersion!: number;

  @Prop({ type: [DiscoveryPageSectionSchema], default: [] })
  draftSections!: DiscoveryPageSection[];

  @Prop({ type: [DiscoveryPageSectionSchema], default: [] })
  publishedSections!: DiscoveryPageSection[];

  @Prop({ default: 0, min: 0 })
  publishedRevision!: number;

  @Prop({ type: Date })
  publishedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: User.name })
  updatedBy?: Types.ObjectId;

  createdAt!: Date;
  updatedAt!: Date;
}

export const DiscoveryPageSchema = SchemaFactory.createForClass(DiscoveryPage);

@Schema({ timestamps: true, collection: 'discovery_page_revisions' })
export class DiscoveryPageRevision {
  @Prop({ required: true, trim: true, lowercase: true })
  pageKey!: string;

  @Prop({ required: true, min: 1 })
  revision!: number;

  @Prop({ required: true, default: 1 })
  schemaVersion!: number;

  @Prop({ type: [DiscoveryPageSectionSchema], default: [] })
  sections!: DiscoveryPageSection[];

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  publishedBy!: Types.ObjectId;

  @Prop({ type: Date, required: true })
  publishedAt!: Date;
}

export const DiscoveryPageRevisionSchema = SchemaFactory.createForClass(
  DiscoveryPageRevision,
);
DiscoveryPageRevisionSchema.index(
  { pageKey: 1, revision: 1 },
  { unique: true },
);

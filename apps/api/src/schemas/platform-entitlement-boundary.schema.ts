import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PlatformEntitlementBoundaryDocument =
  HydratedDocument<PlatformEntitlementBoundary>;

/**
 * Serialized write boundary for one entitlement scope.
 * Updating this row inside the domain transaction turns concurrent limit
 * checks into write conflicts, so Mongo retries against the winning state.
 */
@Schema({ timestamps: true, collection: 'platform_entitlement_boundaries' })
export class PlatformEntitlementBoundary {
  @Prop({ type: String, required: true })
  _id!: string;

  @Prop({ type: Number, min: 0, default: 0 })
  revision!: number;

  createdAt!: Date;
  updatedAt!: Date;
}

export const PlatformEntitlementBoundarySchema = SchemaFactory.createForClass(
  PlatformEntitlementBoundary,
);

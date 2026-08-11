import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ClubSlot } from './club-slot.schema';

export type ClubSlotOccupancyDocument = HydratedDocument<ClubSlotOccupancy>;

/**
 * Atomic seat counter for one club-slot occurrence (slot × date).
 * Reservations bump `reserved` with a capacity-guarded findOneAndUpdate so
 * concurrent bookings can never oversell an occurrence.
 */
@Schema({ timestamps: true, collection: 'club_slot_occupancy' })
export class ClubSlotOccupancy {
  @Prop({ type: Types.ObjectId, ref: ClubSlot.name, required: true })
  slotId!: Types.ObjectId;

  /** Occurrence date, YYYY-MM-DD. */
  @Prop({ required: true, trim: true })
  date!: string;

  @Prop({ required: true, min: 0, default: 0 })
  reserved!: number;

  createdAt!: Date;
  updatedAt!: Date;
}

export const ClubSlotOccupancySchema =
  SchemaFactory.createForClass(ClubSlotOccupancy);

ClubSlotOccupancySchema.index({ slotId: 1, date: 1 }, { unique: true });

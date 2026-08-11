import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { WalletOwnerType } from '../common/enums';

export type WalletDocument = HydratedDocument<Wallet>;

@Schema({ _id: false })
export class WalletOwner {
  @Prop({ type: String, enum: WalletOwnerType, required: true })
  type!: WalletOwnerType;

  @Prop({ type: Types.ObjectId, required: true })
  id!: Types.ObjectId;
}

export const WalletOwnerSchema = SchemaFactory.createForClass(WalletOwner);

/**
 * Derived cash-balance cache. Ledger entries are the source of truth;
 * `balance` is updated only when posting wallet top-up / spend entries.
 */
@Schema({ timestamps: true, collection: 'wallets' })
export class Wallet {
  @Prop({ type: WalletOwnerSchema, required: true })
  owner!: WalletOwner;

  /** Cached balance in Tomans (IRT). */
  @Prop({ required: true, default: 0, min: 0 })
  balance!: number;

  @Prop({ required: true, default: 'IRT', trim: true })
  currency!: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);

WalletSchema.index(
  { 'owner.type': 1, 'owner.id': 1 },
  { unique: true },
);

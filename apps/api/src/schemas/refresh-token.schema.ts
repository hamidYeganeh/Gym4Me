import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Role } from '../common/enums';
import { User } from './user.schema';

export type RefreshTokenDocument = HydratedDocument<RefreshToken>;

@Schema({ timestamps: true, collection: 'refresh_tokens' })
export class RefreshToken {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, unique: true })
  tokenHash!: string;

  /** Role bound to this session — preserved across access-token refresh. */
  @Prop({ type: String, enum: Role })
  activeRole?: Role;

  /** TTL index — Mongo purges expired sessions automatically. */
  @Prop({ required: true, expires: 0 })
  expiresAt!: Date;

  @Prop()
  revokedAt?: Date;

  /** Rotation chain — presence on a presented token means reuse. */
  @Prop()
  replacedByHash?: string;

  createdAt!: Date;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);

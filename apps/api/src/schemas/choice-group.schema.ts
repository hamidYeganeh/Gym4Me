import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ChoiceGroupDocument = HydratedDocument<ChoiceGroup>;

@Schema({ _id: false })
export class ChoiceOption {
  @Prop({ required: true, trim: true })
  value!: string;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ default: 0 })
  order!: number;

  @Prop({ default: true })
  isActive!: boolean;
}

export const ChoiceOptionSchema = SchemaFactory.createForClass(ChoiceOption);

@Schema({ timestamps: true, collection: 'choice_groups' })
export class ChoiceGroup {
  /** Stable machine key, e.g. "gender". Immutable after create. */
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  key!: string;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ trim: true })
  description?: string;

  /**
   * System groups (gender, …) ship with the app: options.values are locked.
   * Dynamic groups (athlete_level, …) are fully admin-managed.
   */
  @Prop({ default: false })
  isSystem!: boolean;

  @Prop({ type: [ChoiceOptionSchema], default: [] })
  options!: ChoiceOption[];

  @Prop({ default: true })
  isActive!: boolean;

  createdAt!: Date;
  updatedAt!: Date;
}

export const ChoiceGroupSchema = SchemaFactory.createForClass(ChoiceGroup);

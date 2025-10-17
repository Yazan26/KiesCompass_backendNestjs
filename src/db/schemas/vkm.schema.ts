import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * MongoDB VKM Schema
 * Field names match the existing MongoDB collection structure
 */
@Schema({ collection: 'VKM', timestamps: false })
export class VkmDocument extends Document {
  @Prop({ name: 'id' })
  oldId?: number; // Original ID from CSV

  @Prop({ required: true })
  name: string;

  @Prop({ name: 'shortdescription' })
  shortdescription: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  content: string;

  @Prop({ name: 'studycredit', required: true })
  studycredit: number;

  @Prop({ required: true })
  location: string;

  @Prop({ name: 'contact_id', required: true })
  contact_id: string;

  @Prop({ required: true })
  level: string;

  @Prop({ name: 'learningoutcomes', required: true })
  learningoutcomes: string;

  @Prop({ name: 'isActive', default: true })
  isActive?: boolean;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const VkmSchema = SchemaFactory.createForClass(VkmDocument);

// Add indexes for common queries
VkmSchema.index({ location: 1 });
VkmSchema.index({ level: 1 });
VkmSchema.index({ studycredit: 1 });
VkmSchema.index({ isActive: 1 });
VkmSchema.index({
  name: 'text',
  shortdescription: 'text',
  description: 'text',
});

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/**
 * Infrastructure Layer - MongoDB User Schema
 * Maps domain entity to MongoDB document
 */
@Schema({ timestamps: true })
export class UserDocument extends Document {

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true, default: 'student' })
  role: 'student' | 'admin';

  @Prop({ type: [{ type: Types.ObjectId, ref: 'VkmDocument' }], default: [] })
  favoriteVkmIds: Types.ObjectId[];

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(UserDocument);

// Add case-insensitive unique index for email
UserSchema.index({ email: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

// Add case-insensitive unique index for username
UserSchema.index({ username: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

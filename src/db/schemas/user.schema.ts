import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/**
 * MongoDB User Schema
 */
@Schema({ timestamps: true })
export class UserDocument extends Document {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true })
  firstname: string;

  @Prop({ required: true })
  lastname: string;

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

// We keep case-insensitive unique indexes at the schema level (with collation)
// and remove `unique: true` from the @Prop() declarations to avoid duplicate
// index warnings from Mongoose (index created twice: field + schema.index()).
// Add case-insensitive unique index for email
UserSchema.index(
  { email: 1 },
  { unique: true, collation: { locale: 'en', strength: 2 } },
);

// Add case-insensitive unique index for username
UserSchema.index(
  { username: 1 },
  { unique: true, collation: { locale: 'en', strength: 2 } },
);

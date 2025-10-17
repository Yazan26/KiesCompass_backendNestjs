import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserDocument, UserSchema } from './schemas/user.schema';
import { VkmDocument, VkmSchema } from './schemas/vkm.schema';

/**
 * Database Module - Provides MongoDB schemas and models
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserDocument.name, schema: UserSchema },
      { name: VkmDocument.name, schema: VkmSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserDocument, UserSchema } from './schemas/user.schema';
import { MongoUserRepository } from './repositories/mongo-user.repository';
import { USER_REPOSITORY } from '../../../application/auth/ports/user-repository.port';

/**
 * Infrastructure Layer - Database Module
 * Configures MongoDB and provides repository implementations
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserDocument.name, schema: UserSchema },
    ]),
  ],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: MongoUserRepository,
    },
  ],
  exports: [USER_REPOSITORY],
})
export class DatabaseModule {}

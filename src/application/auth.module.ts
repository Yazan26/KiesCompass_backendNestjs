import { Module } from '@nestjs/common';
import { DatabaseModule } from '../infrastructure/database/mongodb/database.module';
import { SecurityModule } from '../infrastructure/security/security.module';
import { AuthController } from '../presentation/controllers/auth.controller';
import { RegisterUseCase } from './use-cases/auth/register.use-case';
import { LoginUseCase } from './use-cases/auth/login.use-case';
import { GetUserProfileUseCase } from './use-cases/auth/get-user-profile.use-case';

/**
 * Application Layer - Auth Module
 * Orchestrates authentication use cases and dependencies
 */
@Module({
  imports: [DatabaseModule, SecurityModule],
  controllers: [AuthController],
  providers: [RegisterUseCase, LoginUseCase, GetUserProfileUseCase],
  exports: [RegisterUseCase, LoginUseCase, GetUserProfileUseCase],
})
export class AuthModule {}

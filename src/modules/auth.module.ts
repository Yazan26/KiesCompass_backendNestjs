import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from '../db/database.module';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';
import { UserDao } from '../infrastructure/dao/user.dao';
import { USER_REPOSITORY } from '../application/ports/user-repository.port';
import { BcryptPasswordService } from '../util/security/bcrypt-password.service';
import { JwtServiceAdapter } from '../util/security/jwt.service';
import { JwtStrategy } from '../middleware/jwt.strategy';
import { PASSWORD_SERVICE } from '../application/ports/password-service.port';
import { JWT_SERVICE } from '../application/ports/jwt-service.port';

/**
 * Auth Module - Handles authentication features
 */
@Module({
  imports: [
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        secret: cfg.get('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserDao,
    { provide: USER_REPOSITORY, useExisting: UserDao },
    BcryptPasswordService,
    { provide: PASSWORD_SERVICE, useExisting: BcryptPasswordService },
    JwtServiceAdapter,
    { provide: JWT_SERVICE, useExisting: JwtServiceAdapter },
    JwtStrategy,
  ],
  exports: [AuthService, UserDao, USER_REPOSITORY],
})
export class AuthModule {}

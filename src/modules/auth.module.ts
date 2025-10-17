import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from '../db/database.module';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';
import { UserDao } from '../dao/user.dao';
import { BcryptPasswordService } from '../util/security/bcrypt-password.service';
import { JwtServiceAdapter } from '../util/security/jwt.service';
import { JwtStrategy } from '../middleware/jwt.strategy';

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
    BcryptPasswordService,
    JwtServiceAdapter,
    JwtStrategy,
  ],
  exports: [AuthService, UserDao],
})
export class AuthModule {}

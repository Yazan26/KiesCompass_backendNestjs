import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { BcryptPasswordService } from './bcrypt-password.service';
import { JwtServiceAdapter } from './jwt.service';
import { JwtStrategy } from './jwt.strategy';
import { PASSWORD_SERVICE } from '../../application/ports/password-service.port';
import { JWT_SERVICE } from '../../application/ports/jwt-service.port';

/**
 * Infrastructure Layer - Security Module
 * Configures authentication and password services
 */
@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        secret: cfg.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: cfg.get<string>('JWT_EXPIRES_IN') || '60m' },
      }),
    }),
  ],
  providers: [
    {
      provide: PASSWORD_SERVICE,
      useClass: BcryptPasswordService,
    },
    {
      provide: JWT_SERVICE,
      useClass: JwtServiceAdapter,
    },
    JwtStrategy,
  ],
  exports: [PASSWORD_SERVICE, JWT_SERVICE],
})
export class SecurityModule {}

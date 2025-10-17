import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../services/auth.service';

/**
 * Middleware - JWT Strategy
 * Passport strategy for JWT authentication
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    cfg: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: cfg.get('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: string; username: string; email: string; role?: string }) {
    if (!payload.sub || !payload.username || !payload.email) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // Optionally verify user still exists
    const user = await this.authService.validateUser(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Attach role from token to the returned user object if available
    if (payload.role) {
      (user as any).role = payload.role;
    }

    return user;
  }
}

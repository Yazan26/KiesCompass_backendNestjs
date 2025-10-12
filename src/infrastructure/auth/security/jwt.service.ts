import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import type { IJwtService } from '../../../application/auth/ports/jwt-service.port';

/**
 * Infrastructure Layer - JWT Service Implementation
 * Implements JWT token operations using @nestjs/jwt
 */
@Injectable()
export class JwtServiceAdapter implements IJwtService {
  constructor(private readonly jwtService: NestJwtService) {}

  async generateToken(payload: {
    sub: string;
    email: string;
  }): Promise<string> {
    return this.jwtService.signAsync(payload);
  }

  async verifyToken(token: string): Promise<{ sub: string; email: string }> {
    return this.jwtService.verifyAsync(token);
  }
}

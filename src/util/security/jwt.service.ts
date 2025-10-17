import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';

/**
 * Utility - JWT Service
 * Handles JWT token operations
 */
@Injectable()
export class JwtServiceAdapter {
  constructor(private readonly jwtService: NestJwtService) {}

  async generateToken<TPayload extends Record<string, unknown>>(
    payload: TPayload,
  ): Promise<string> {
    return this.jwtService.signAsync(payload);
  }

  async verifyToken<TPayload extends Record<string, unknown>>(
    token: string,
  ): Promise<TPayload> {
    return this.jwtService.verifyAsync(token);
  }
}

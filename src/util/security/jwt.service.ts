import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';

/**
 * Utility - JWT Service
 * Handles JWT token operations
 */
@Injectable()
export class JwtServiceAdapter {
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

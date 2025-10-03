// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private users: UsersService, private jwt: JwtService) {}

  async register(email: string, password: string) {
    return this.users.create(email, password);
  }

  async login(email: string, password: string) {
    const user = await this.users.validateCredentials(email, password);
    if (!user) throw new UnauthorizedException('Invalid email or password');
    const payload = { sub: user.id, email: user.email };
    const access_token = await this.jwt.signAsync(payload);
    return { access_token };
  }
}

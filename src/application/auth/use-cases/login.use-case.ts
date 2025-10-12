import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { IUserRepository } from '../ports/user-repository.port';
import { USER_REPOSITORY } from '../ports/user-repository.port';
import type { IPasswordService } from '../ports/password-service.port';
import { PASSWORD_SERVICE } from '../ports/password-service.port';
import type { IJwtService } from '../ports/jwt-service.port';
import { JWT_SERVICE } from '../ports/jwt-service.port';
import { AuthResponseDto } from '../dtos/auth.dto';

/**
 * Application Layer - Login Use Case
 * Handles user login business logic
 */
@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_SERVICE)
    private readonly passwordService: IPasswordService,
    @Inject(JWT_SERVICE)
    private readonly jwtService: IJwtService,
  ) {}

  async execute(username: string, password: string): Promise<AuthResponseDto> {
    // Find user by username
    const user = await this.userRepository.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    // Verify password
    const isPasswordValid = await this.passwordService.compare(
      password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid username or password');
    }

    // Generate JWT token
    const payload = { sub: user.id, username: user.username, email: user.email };
    const access_token = await this.jwtService.generateToken(payload);

    return { access_token };
  }
}

import { Inject, Injectable, ConflictException } from '@nestjs/common';
import type { IUserRepository } from '../ports/user-repository.port';
import { USER_REPOSITORY } from '../ports/user-repository.port';
import type { IPasswordService } from '../ports/password-service.port';
import { PASSWORD_SERVICE } from '../ports/password-service.port';
import { UserResponseDto } from '../dtos/auth.dto';

/**
 * Application Layer - Register Use Case
 * Handles user registration business logic
 */
@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_SERVICE)
    private readonly passwordService: IPasswordService,
  ) {}

  async execute(username: string, email: string, password: string): Promise<UserResponseDto> {
    // Normalize email to lowercase for case-insensitive uniqueness
    email = email.toLowerCase();

    // Check if user already exists by username
    const existingUsername = await this.userRepository.existsByUsername(username);
    if (existingUsername) {
      throw new ConflictException('Username already in use');
    }

    // Check if user already exists by email
    const existingEmail = await this.userRepository.existsByEmail(email);
    if (existingEmail) {
      throw new ConflictException('Email already in use');
    }

    // Hash password
    const passwordHash = await this.passwordService.hash(password);

    // Create user
    const user = await this.userRepository.create(username, email, passwordHash);

    // Return safe user object
    return user.toSafeObject();
  }
}

import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UserDao } from '../infrastructure/dao/user.dao';
import { Inject } from '@nestjs/common';
import { USER_REPOSITORY } from '../application/ports/user-repository.port';
import type { IUserRepository } from '../application/ports/user-repository.port';
import { RegisterDto, LoginDto, AuthResponseDto, UserResponseDto } from '../util/dtos/auth.dto';
import { BcryptPasswordService } from '../util/security/bcrypt-password.service';
import { JwtServiceAdapter } from '../util/security/jwt.service';
import { PASSWORD_SERVICE } from '../application/ports/password-service.port';
import type { IPasswordService } from '../application/ports/password-service.port';
import { JWT_SERVICE } from '../application/ports/jwt-service.port';
import type { IJwtService } from '../application/ports/jwt-service.port';

/**
 * Service Layer - Auth Service
 * Contains business logic for authentication
 * Asks DAO for data operations
 */
@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userDao: IUserRepository,
    @Inject(PASSWORD_SERVICE)
    private readonly passwordService: IPasswordService | BcryptPasswordService,
    @Inject(JWT_SERVICE)
    private readonly jwtService: IJwtService | JwtServiceAdapter,
  ) {}

  /**
   * Register a new user
   */
  async register(dto: RegisterDto): Promise<UserResponseDto> {
    // Check if username already exists
    const usernameExists = await this.userDao.existsByUsername(dto.username);
    if (usernameExists) {
      throw new ConflictException('Username already in use');
    }

    // Check if email already exists
    const emailExists = await this.userDao.existsByEmail(dto.email);
    if (emailExists) {
      throw new ConflictException('Email already in use');
    }

    // Hash password
    const passwordHash = await this.passwordService.hash(dto.password);

    // Create user
    const user = await this.userDao.create(dto.username, dto.email, passwordHash);

    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Login user
   */
  async login(dto: LoginDto): Promise<AuthResponseDto> {
    // Find user by username
    const user = await this.userDao.findByUsername(dto.username);
    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    // Verify password
    const isPasswordValid = await this.passwordService.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid username or password');
    }

    // Generate JWT token
    const payload = { sub: user._id.toString(), username: user.username, email: user.email };
    const access_token = await this.jwtService.generateToken(payload);

    return { access_token };
  }

  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<UserResponseDto> {
    const user = await this.userDao.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Validate user by ID (used by JWT strategy)
   */
  async validateUser(userId: string): Promise<any> {
    const user = await this.userDao.findById(userId);
    if (!user) {
      return null;
    }
    return {
      userId: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
    };
  }
}

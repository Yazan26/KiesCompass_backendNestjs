import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { USER_REPOSITORY } from '../application/ports/user-repository.port';
import type { IUserRepository } from '../application/ports/user-repository.port';
import {
  RegisterDto,
  LoginDto,
  AuthResponseDto,
  UserResponseDto,
} from '../util/dtos/auth.dto';
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
  /**
   * DTO-friendly representation of a lean Mongo document.
   */
  private static toUserResponse(user: LeanUser): UserResponseDto {
    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userDao: IUserRepository,
    @Inject(PASSWORD_SERVICE)
    private readonly passwordService: IPasswordService,
    @Inject(JWT_SERVICE)
    private readonly jwtService: IJwtService,
  ) {}

  /**
   * Register a new user
   */
  async register(dto: RegisterDto): Promise<UserResponseDto> {
    await this.ensureUniqueCredentials(dto.username, dto.email);
    const passwordHash = await this.passwordService.hash(dto.password);

    const user = await this.userDao.create(
      dto.username,
      dto.email,
      passwordHash,
    );
    return AuthService.toUserResponse(user as LeanUser);
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

    const isPasswordValid = await this.passwordService.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const payload = {
      sub: user._id.toString(),
      username: user.username,
      email: user.email,
    };
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

    return AuthService.toUserResponse(user as LeanUser);
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

  /**
   * Ensures username and email are unique before creating a user.
   */
  private async ensureUniqueCredentials(
    username: string,
    email: string,
  ): Promise<void> {
    const [usernameExists, emailExists] = await Promise.all([
      this.userDao.existsByUsername(username),
      this.userDao.existsByEmail(email),
    ]);

    if (usernameExists) {
      throw new ConflictException('Username already in use');
    }

    if (emailExists) {
      throw new ConflictException('Email already in use');
    }
  }
}

type LeanUser = {
  _id: { toString(): string };
  username: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  role: string;
};

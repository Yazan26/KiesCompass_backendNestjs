import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UserDao } from '../dao/user.dao';
import { RegisterDto, LoginDto, AuthResponseDto, UserResponseDto } from '../util/dtos/auth.dto';
import { BcryptPasswordService } from '../util/security/bcrypt-password.service';
import { JwtServiceAdapter } from '../util/security/jwt.service';

/**
 * Service Layer - Auth Service
 * Contains business logic for authentication
 * Asks DAO for data operations
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly userDao: UserDao,
    private readonly passwordService: BcryptPasswordService,
    private readonly jwtService: JwtServiceAdapter,
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

import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { USER_REPOSITORY } from '../application/ports/user-repository.port';
import type { IUserRepository } from '../application/ports/user-repository.port';
import {
  RegisterDto,
  LoginDto,
  AuthResponseDto,
  UserResponseDto,
  AdminUserResponseDto,
  UpdateUserDto,
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
      firstname: user.firstname,
      lastname: user.lastname,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * DTO-friendly representation with admin details
   */
  private static toAdminUserResponse(user: LeanUser): AdminUserResponseDto {
    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      role: user.role,
      favoriteVkmIds: user.favoriteVkmIds?.map((id: any) => id.toString()) || [],
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
    await this.ensureUniqueCredentials(dto.username, dto.email,);
    const passwordHash = await this.passwordService.hash(dto.password);

    const user = await this.userDao.create(
      dto.username,
      dto.email,
      dto.firstname,
      dto.lastname,
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
      role: user.role,
    };
    const access_token = await this.jwtService.generateToken(payload);

    return { access_token };
  }

  async findByFirstandLastname(firstname: string, lastname: string): Promise<any | null> {
    return this.userDao.findByFirstandLastname(firstname, lastname);
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

  /**
   * ADMIN: Get all users with optional filtering
   */
  async getAllUsers(filters?: {
    username?: string;
    email?: string;
    firstname?: string;
    lastname?: string;
    role?: string;
  }): Promise<AdminUserResponseDto[]> {
    const users = await this.userDao.findAll(filters);
    return users.map((user) => AuthService.toAdminUserResponse(user as LeanUser));
  }

  /**
   * ADMIN: Get user by ID with full details
   */
  async getUserById(userId: string): Promise<AdminUserResponseDto> {
    const user = await this.userDao.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return AuthService.toAdminUserResponse(user as LeanUser);
  }

  /**
   * ADMIN: Update user
   */
  async updateUser(userId: string, dto: UpdateUserDto): Promise<AdminUserResponseDto> {
    // Check if user exists
    const existingUser = await this.userDao.findById(userId);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Check for unique constraints if username or email is being updated
    if (dto.username && dto.username !== existingUser.username) {
      const usernameExists = await this.userDao.existsByUsername(dto.username);
      if (usernameExists) {
        throw new ConflictException('Username already in use');
      }
    }

    if (dto.email && dto.email.toLowerCase() !== existingUser.email.toLowerCase()) {
      const emailExists = await this.userDao.existsByEmail(dto.email);
      if (emailExists) {
        throw new ConflictException('Email already in use');
      }
    }

    const updatedUser = await this.userDao.update(userId, dto);
    if (!updatedUser) {
      throw new NotFoundException('User not found after update');
    }

    return AuthService.toAdminUserResponse(updatedUser as LeanUser);
  }

  /**
   * ADMIN: Delete user
   */
  async deleteUser(userId: string): Promise<{ message: string }> {
    const deleted = await this.userDao.delete(userId);
    if (!deleted) {
      throw new NotFoundException('User not found');
    }
    return { message: 'User successfully deleted' };
  }
}

type LeanUser = {
  _id: { toString(): string };
  username: string;
  email: string;
  firstname: string;
  lastname: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  role: 'student' | 'admin';
  favoriteVkmIds?: any[];
};

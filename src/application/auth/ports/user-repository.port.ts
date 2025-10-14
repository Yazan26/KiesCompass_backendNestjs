import { UserEntity } from '../../../core/auth/entities/user.entity';

/**
 * Application Layer - Repository Port (Interface)
 * Defines the contract for user repository operations
 */
export interface IUserRepository {
  /**
   * Find a user by username
   */
  findByUsername(username: string): Promise<UserEntity | null>;

  /**
   * Find a user by email
   */
  findByEmail(email: string): Promise<UserEntity | null>;

  /**
   * Find a user by ID
   */
  findById(id: string): Promise<UserEntity | null>;

  /**
   * Create a new user
   */
  create(username: string, email: string, passwordHash: string): Promise<UserEntity>;

  /**
   * Check if a user exists by username
   */
  existsByUsername(username: string): Promise<boolean>;

  /**
   * Check if a user exists by email
   */
  existsByEmail(email: string): Promise<boolean>;

  /**
   * Toggle a VKM as favorite for a user
   * Returns true if favorited, false if unfavorited
   */
  toggleFavoriteVkm(userId: string, vkmId: string): Promise<boolean>;

  /**
   * Get all favorite VKM IDs for a user
   */
  getFavoriteVkmIds(userId: string): Promise<string[]>;
}

export const USER_REPOSITORY = Symbol('IUserRepository');

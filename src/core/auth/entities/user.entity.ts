/**
 * Domain Layer - User Entity
 * Core business entity representing a user in the system
 */
export class UserEntity {
  constructor(
    
    public readonly id: string,
    public readonly username: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly role: 'student' | 'admin' = 'student',
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  /**
   * Factory method to create a new user entity
   */
  static create(
    id: string,
    username: string,
    email: string,
    passwordHash: string,
    role: 'student' | 'admin' = 'student',
    createdAt?: Date,
    updatedAt?: Date,
  ): UserEntity {
    return new UserEntity(
      id,
      username,
      email,
      passwordHash,
      role,
      createdAt || new Date(),
      updatedAt || new Date(),
    );
  }

  /**
   * Create a safe user object without sensitive data
   */
  toSafeObject(): { id: string; username: string; email: string; createdAt: Date; updatedAt: Date; role: 'student' | 'admin' } {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      role: this.role,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

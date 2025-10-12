/**
 * Application Layer - Password Service Port (Interface)
 * Defines the contract for password hashing and verification
 */
export interface IPasswordService {
  /**
   * Hash a plain text password
   */
  hash(password: string): Promise<string>;

  /**
   * Compare a plain text password with a hash
   */
  compare(password: string, hash: string): Promise<boolean>;
}

export const PASSWORD_SERVICE = Symbol('IPasswordService');

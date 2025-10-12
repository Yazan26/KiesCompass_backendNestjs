/**
 * Application Layer - JWT Service Port (Interface)
 * Defines the contract for JWT token operations
 */
export interface IJwtService {
  /**
   * Generate a JWT token for a user
   */
  generateToken(payload: { sub: string; email: string }): Promise<string>;

  /**
   * Verify and decode a JWT token
   */
  verifyToken(token: string): Promise<{ sub: string; email: string }>;
}

export const JWT_SERVICE = Symbol('IJwtService');

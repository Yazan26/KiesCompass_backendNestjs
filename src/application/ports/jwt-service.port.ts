export const JWT_SERVICE = 'JWT_SERVICE';

export interface IJwtService {
  generateToken(payload: any): Promise<string>;
  verifyToken(token: string): Promise<any>;
}

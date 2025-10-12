import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { IPasswordService } from '../../../application/auth/ports/password-service.port';

/**
 * Infrastructure Layer - Bcrypt Password Service Implementation
 * Implements password hashing and comparison using bcrypt
 */
@Injectable()
export class BcryptPasswordService implements IPasswordService {
  private readonly saltRounds = 12;

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}

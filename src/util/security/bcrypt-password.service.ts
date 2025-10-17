import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

/**
 * Utility - Password Service
 * Handles password hashing and comparison
 */
@Injectable()
export class BcryptPasswordService {
  private readonly saltRounds = 12;

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}

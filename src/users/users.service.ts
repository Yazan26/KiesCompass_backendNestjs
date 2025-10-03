import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from './users.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private model: Model<User>) {}

  async create(email: string, password: string) {
    const exists = await this.model.findOne({ email }).lean();
    if (exists) throw new ConflictException('Email already in use');
    const passwordHash = await bcrypt.hash(password, 12);
    const doc = await this.model.create({ email, passwordHash });
    return { id: doc.id, email: doc.email };
  }

  async findByEmail(email: string) {
    const user = await this.model.findOne({ email });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async validateCredentials(email: string, password: string) {
    const user = await this.model.findOne({ email });
    if (!user) return null;
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return null;
    return user;
  }
}

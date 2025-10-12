import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { IUserRepository } from '../../../../application/auth/ports/user-repository.port';
import { UserEntity } from '../../../../core/auth/entities/user.entity';
import { UserDocument } from '../schemas/user.schema';

/**
 * Infrastructure Layer - MongoDB User Repository Implementation
 * Implements the IUserRepository port using MongoDB
 */
@Injectable()
export class MongoUserRepository implements IUserRepository {
  constructor(
    @InjectModel(UserDocument.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async findByUsername(username: string): Promise<UserEntity | null> {
    const userDoc = await this.userModel.findOne({ username }).lean().exec();
    if (!userDoc) return null;

    return this.mapToEntity(userDoc);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const userDoc = await this.userModel.findOne({ email: email.toLowerCase() }).lean().exec();
    if (!userDoc) return null;

    return this.mapToEntity(userDoc);
  }

  async findById(id: string): Promise<UserEntity | null> {
    const userDoc = await this.userModel.findById(id).lean().exec();
    if (!userDoc) return null;

    return this.mapToEntity(userDoc);
  }

  async create(username: string, email: string, passwordHash: string): Promise<UserEntity> {
    const userDoc = await this.userModel.create({ username, email: email.toLowerCase(), passwordHash });
    return this.mapToEntity(userDoc);
  }

  async existsByUsername(username: string): Promise<boolean> {
    const count = await this.userModel.countDocuments({ username }).exec();
    return count > 0;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.userModel.countDocuments({ email: email.toLowerCase() }).exec();
    return count > 0;
  }

  /**
   * Map MongoDB document to domain entity
   */
  private mapToEntity(doc: any): UserEntity {
    return UserEntity.create(
      doc._id.toString(),
      doc.username,
      doc.email,
      doc.passwordHash,
      doc.role || 'student',
      doc.createdAt,
      doc.updatedAt,
    );
  }
}

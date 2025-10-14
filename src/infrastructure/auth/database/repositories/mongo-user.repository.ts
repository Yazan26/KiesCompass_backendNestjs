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
    const userDoc = await this.userModel
      .findOne({ username })
      .collation({ locale: 'en', strength: 2 })
      .lean()
      .exec();
    if (!userDoc) return null;

    return this.mapToEntity(userDoc);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const userDoc = await this.userModel
      .findOne({ email: email.toLowerCase() })
      .collation({ locale: 'en', strength: 2 })
      .lean()
      .exec();
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
    const count = await this.userModel
      .countDocuments({ username })
      .collation({ locale: 'en', strength: 2 })
      .exec();
    return count > 0;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.userModel
      .countDocuments({ email: email.toLowerCase() })
      .collation({ locale: 'en', strength: 2 })
      .exec();
    return count > 0;
  }

  async toggleFavoriteVkm(userId: string, vkmId: string): Promise<boolean> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new Error('User not found');
    }

    const vkmObjectId = vkmId as any; // MongoDB will handle the conversion
    const favoriteIndex = user.favoriteVkmIds.findIndex(
      (id) => id.toString() === vkmId
    );

    if (favoriteIndex > -1) {
      // Remove from favorites
      user.favoriteVkmIds.splice(favoriteIndex, 1);
      await user.save();
      return false;
    } else {
      // Add to favorites
      user.favoriteVkmIds.push(vkmObjectId);
      await user.save();
      return true;
    }
  }

  async getFavoriteVkmIds(userId: string): Promise<string[]> {
    const user = await this.userModel.findById(userId).lean().exec();
    if (!user) {
      return [];
    }
    return user.favoriteVkmIds?.map((id) => id.toString()) || [];
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

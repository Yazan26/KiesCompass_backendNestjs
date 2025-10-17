import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from '../db/schemas/user.schema';

/**
 * DAO Layer - User Data Access Object
 * Executes all database queries for User entity
 */
@Injectable()
export class UserDao {
  constructor(
    @InjectModel(UserDocument.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  /**
   * Find user by username (case-insensitive)
   */
  async findByUsername(username: string): Promise<any | null> {
    return this.userModel
      .findOne({ username })
      .collation({ locale: 'en', strength: 2 })
      .lean()
      .exec();
  }

  /**
   * Find user by email (case-insensitive)
   */
  async findByEmail(email: string): Promise<any | null> {
    return this.userModel
      .findOne({ email: email.toLowerCase() })
      .collation({ locale: 'en', strength: 2 })
      .lean()
      .exec();
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<any | null> {
    return this.userModel.findById(id).lean().exec();
  }

  /**
   * Create a new user
   */
  async create(username: string, email: string, passwordHash: string): Promise<any> {
    const user = await this.userModel.create({ 
      username, 
      email: email.toLowerCase(), 
      passwordHash 
    });
    return user.toObject();
  }

  /**
   * Check if username exists (case-insensitive)
   */
  async existsByUsername(username: string): Promise<boolean> {
    const count = await this.userModel
      .countDocuments({ username })
      .collation({ locale: 'en', strength: 2 })
      .exec();
    return count > 0;
  }

  /**
   * Check if email exists (case-insensitive)
   */
  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.userModel
      .countDocuments({ email: email.toLowerCase() })
      .collation({ locale: 'en', strength: 2 })
      .exec();
    return count > 0;
  }

  /**
   * Toggle favorite VKM for user
   * @returns true if added to favorites, false if removed
   */
  async toggleFavoriteVkm(userId: string, vkmId: string): Promise<boolean> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new Error('User not found');
    }

    const vkmObjectId = vkmId as any; // MongoDB handles conversion
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

  /**
   * Get all favorite VKM IDs for a user
   */
  async getFavoriteVkmIds(userId: string): Promise<string[]> {
    const user = await this.userModel.findById(userId).lean().exec();
    if (!user) {
      return [];
    }
    return user.favoriteVkmIds?.map((id) => id.toString()) || [];
  }
}

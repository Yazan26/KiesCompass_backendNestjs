import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from '../../db/schemas/user.schema';

/**
 * DAO Layer - User Data Access Object (infrastructure)
 * Executes all database queries for User entity
 */
@Injectable()
export class UserDao {
  constructor(
    @InjectModel(UserDocument.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async findByUsername(username: string): Promise<any | null> {
    return this.userModel
      .findOne({ username })
      .collation({ locale: 'en', strength: 2 })
      .lean()
      .exec();
  }

  async findByEmail(email: string): Promise<any | null> {
    return this.userModel
      .findOne({ email: email.toLowerCase() })
      .collation({ locale: 'en', strength: 2 })
      .lean()
      .exec();
  }

  async findById(id: string): Promise<any | null> {
    return this.userModel.findById(id).lean().exec();
  }

  async findByFirstandLastname(firstname: string, lastname: string): Promise<any | null> {
    return this.userModel
      .findOne({ firstname, lastname })
      .collation({ locale: 'en', strength: 2 })
      .lean()
      .exec();
  }

  async create(
    username: string,
    email: string,
    firstname: string,
    lastname: string,
    passwordHash: string,
  ): Promise<any> {
    const user = await this.userModel.create({
      username,
      email: email.toLowerCase(),
      firstname,
      lastname,
      passwordHash,
    });
    return user.toObject();
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

    const vkmObjectId = vkmId as any; // MongoDB handles conversion
    const favoriteIndex = user.favoriteVkmIds.findIndex(
      (id) => id.toString() === vkmId,
    );

    if (favoriteIndex > -1) {
      user.favoriteVkmIds.splice(favoriteIndex, 1);
      await user.save();
      return false;
    } else {
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
   * Search users by username, email, firstname or lastname.
   * Returns paginated results and total count.
   */
  async search(query?: string, page = 1, limit = 20): Promise<{ results: any[]; total: number }> {
    const filter: any = {};

    if (query && query.trim().length > 0) {
      const q = query.trim();
      // Use case-insensitive regex search across multiple fields
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { username: { $regex: regex } },
        { email: { $regex: regex } },
        { firstname: { $regex: regex } },
        { lastname: { $regex: regex } },
      ];
    }

    const skip = Math.max(0, page - 1) * limit;

    const [results, total] = await Promise.all([
      this.userModel.find(filter).collation({ locale: 'en', strength: 2 }).skip(skip).limit(limit).lean().exec(),
      this.userModel.countDocuments(filter).exec(),
    ]);

    return { results, total };
  }
}

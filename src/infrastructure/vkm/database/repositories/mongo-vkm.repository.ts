import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { IVkmRepository, CreateVkmData } from '../../../../application/vkm/ports/vkm-repository.port';
import { VkmEntity } from '../../../../core/vkm/entities/vkm.entity';
import { VkmDocument } from '../schemas/vkm.schema';

/**
 * Infrastructure Layer - MongoDB VKM Repository Implementation
 */
@Injectable()
export class MongoVkmRepository implements IVkmRepository {
  constructor(
    @InjectModel(VkmDocument.name)
    private readonly vkmModel: Model<VkmDocument>,
  ) {}

  async findAll(filters?: {
    location?: string;
    level?: string;
    studyCredit?: number;
    isActive?: boolean;
  }): Promise<VkmEntity[]> {
    const query: any = {};

    if (filters) {
      if (filters.location) query.location = filters.location;
      if (filters.level) query.level = filters.level;
      if (filters.studyCredit !== undefined) query.studycredit = filters.studyCredit;
      // Only filter by isActive if explicitly provided
      if (filters.isActive !== undefined) {
        query.$or = [
          { isActive: filters.isActive },
          { isActive: { $exists: false } } // Include docs without isActive field
        ];
      }
    }

    const vkms = await this.vkmModel.find(query).exec();
    return vkms.map((doc) => this.toEntity(doc));
  }

  async findById(id: string): Promise<VkmEntity | null> {
    const vkm = await this.vkmModel.findById(id).exec();
    return vkm ? this.toEntity(vkm) : null;
  }

  async create(data: CreateVkmData): Promise<VkmEntity> {
    const dbData = {
      name: data.name,
      shortdescription: data.shortDescription,
      description: data.description,
      content: data.content,
      studycredit: data.studyCredit,
      location: data.location,
      contact_id: data.contactId,
      level: data.level,
      learningoutcomes: data.learningOutcomes,
      isActive: data.isActive,
    };
    const vkm = new this.vkmModel(dbData);
    const savedVkm = await vkm.save();
    return this.toEntity(savedVkm);
  }

  async update(id: string, updates: Partial<VkmEntity>): Promise<VkmEntity | null> {
    // Map entity fields to database fields
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.shortDescription !== undefined) dbUpdates.shortdescription = updates.shortDescription;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.content !== undefined) dbUpdates.content = updates.content;
    if (updates.studyCredit !== undefined) dbUpdates.studycredit = updates.studyCredit;
    if (updates.location !== undefined) dbUpdates.location = updates.location;
    if (updates.contactId !== undefined) dbUpdates.contact_id = updates.contactId;
    if (updates.level !== undefined) dbUpdates.level = updates.level;
    if (updates.learningOutcomes !== undefined) dbUpdates.learningoutcomes = updates.learningOutcomes;
    if (updates.isActive !== undefined) dbUpdates.isActive = updates.isActive;

    const vkm = await this.vkmModel
      .findByIdAndUpdate(id, { $set: dbUpdates }, { new: true })
      .exec();
    return vkm ? this.toEntity(vkm) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.vkmModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async deactivate(id: string): Promise<VkmEntity | null> {
    const vkm = await this.vkmModel
      .findByIdAndUpdate(id, { $set: { isActive: false } }, { new: true })
      .exec();
    return vkm ? this.toEntity(vkm) : null;
  }

  async getRecommendations(userId: string, limit: number = 10): Promise<VkmEntity[]> {
    // Simple recommendation logic: return active VKMs sorted by study credit
    // In a real app, this would use user preferences, past behavior, ML, etc.
    const vkms = await this.vkmModel
      .find({ $or: [{ isActive: true }, { isActive: { $exists: false } }] })
      .sort({ studycredit: 1, _id: -1 })
      .limit(limit)
      .exec();
    
    return vkms.map(this.toEntity);
  }

  async findByIds(ids: string[]): Promise<VkmEntity[]> {
    if (!ids || ids.length === 0) return [];
    const objectIds = ids.map((id) => id);
    const vkms = await this.vkmModel.find({ _id: { $in: objectIds } }).exec();
    return vkms.map(this.toEntity);
  }

  /**
   * Convert MongoDB document to domain entity
   */
  private toEntity = (doc: VkmDocument): VkmEntity => {
    return VkmEntity.create(
      doc._id.toString(),
      doc.name,
      doc.shortdescription || '',
      doc.description,
      doc.content,
      doc.studycredit,
      doc.location,
      doc.contact_id,
      doc.level,
      doc.learningoutcomes || '',
      doc.isActive ?? true,
      doc.createdAt,
      doc.updatedAt,
    );
  }
}

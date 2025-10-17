import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VkmDocument } from '../../db/schemas/vkm.schema';

export interface VkmFilters {
  name?: string;
  location?: string;
  level?: string;
  studyCredit?: number;
  shortDescription?: string;
  description?: string;
  content?: string;
  learningOutcomes?: string;
  contactId?: string;
  isActive?: boolean;
}

export interface CreateVkmData {
  name: string;
  shortDescription: string;
  description: string;
  content: string;
  studyCredit: number;
  location: string;
  contactId: string;
  level: string;
  learningOutcomes: string;
  isActive?: boolean;
}

export interface UpdateVkmData {
  name?: string;
  shortDescription?: string;
  description?: string;
  content?: string;
  studyCredit?: number;
  location?: string;
  contactId?: string;
  level?: string;
  learningOutcomes?: string;
  isActive?: boolean;
}

@Injectable()
export class VkmDao {
  constructor(
    @InjectModel(VkmDocument.name)
    private readonly vkmModel: Model<VkmDocument>,
  ) {}

  async findAll(filters?: VkmFilters): Promise<any[]> {
    const query: any = {};

    if (filters) {
      // Partial text search with case-insensitive regex
      if (filters.name) {
        query.name = new RegExp(filters.name, 'i');
      }
      if (filters.location) {
        query.location = new RegExp(filters.location, 'i');
      }
      if (filters.shortDescription) {
        query.shortdescription = new RegExp(filters.shortDescription, 'i');
      }
      if (filters.description) {
        query.description = new RegExp(filters.description, 'i');
      }
      if (filters.content) {
        query.content = new RegExp(filters.content, 'i');
      }
      if (filters.learningOutcomes) {
        query.learningoutcomes = new RegExp(filters.learningOutcomes, 'i');
      }

      // Exact match filters
      if (filters.level) {
        query.level = filters.level;
      }
      if (filters.studyCredit !== undefined) {
        query.studycredit = filters.studyCredit;
      }
      if (filters.contactId) {
        query.contact_id = filters.contactId;
      }

      // Active status filter
      if (filters.isActive !== undefined) {
        query.$or = [
          { isActive: filters.isActive },
          { isActive: { $exists: false } },
        ];
      }
    }

    return this.vkmModel.find(query).lean().exec();
  }

  async findById(id: string): Promise<any | null> {
    return this.vkmModel.findById(id).lean().exec();
  }

  async findByIds(ids: string[]): Promise<any[]> {
    if (!ids || ids.length === 0) return [];
    return this.vkmModel
      .find({ _id: { $in: ids } })
      .lean()
      .exec();
  }

  async create(data: CreateVkmData): Promise<any> {
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
      isActive: data.isActive ?? true,
    };

    const vkm = await this.vkmModel.create(dbData);
    return vkm.toObject();
  }

  async update(id: string, updates: UpdateVkmData): Promise<any | null> {
    const dbUpdates: any = {};

    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.shortDescription !== undefined)
      dbUpdates.shortdescription = updates.shortDescription;
    if (updates.description !== undefined)
      dbUpdates.description = updates.description;
    if (updates.content !== undefined) dbUpdates.content = updates.content;
    if (updates.studyCredit !== undefined)
      dbUpdates.studycredit = updates.studyCredit;
    if (updates.location !== undefined) dbUpdates.location = updates.location;
    if (updates.contactId !== undefined)
      dbUpdates.contact_id = updates.contactId;
    if (updates.level !== undefined) dbUpdates.level = updates.level;
    if (updates.learningOutcomes !== undefined)
      dbUpdates.learningoutcomes = updates.learningOutcomes;
    if (updates.isActive !== undefined) dbUpdates.isActive = updates.isActive;

    return this.vkmModel
      .findByIdAndUpdate(id, { $set: dbUpdates }, { new: true })
      .lean()
      .exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.vkmModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async deactivate(id: string): Promise<any | null> {
    return this.vkmModel
      .findByIdAndUpdate(id, { $set: { isActive: false } }, { new: true })
      .lean()
      .exec();
  }

  async getRecommendations(userId: string, limit: number = 10): Promise<any[]> {
    void userId; // Interface parity; personalization can be added later.

    return this.vkmModel
      .find({ $or: [{ isActive: true }, { isActive: { $exists: false } }] })
      .sort({ studycredit: 1, _id: -1 })
      .limit(limit)
      .lean()
      .exec();
  }
}

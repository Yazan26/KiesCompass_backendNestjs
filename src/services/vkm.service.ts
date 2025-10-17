import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { VkmDao } from '../infrastructure/dao/vkm.dao';
import { UserDao } from '../infrastructure/dao/user.dao';
import { VKM_REPOSITORY } from '../application/ports/vkm-repository.port';
import type { IVkmRepository } from '../application/ports/vkm-repository.port';
import { USER_REPOSITORY } from '../application/ports/user-repository.port';
import type { IUserRepository } from '../application/ports/user-repository.port';
import { 
  CreateVkmDto, 
  UpdateVkmDto, 
  VkmResponseDto,
  GetAllVkmsQueryDto 
} from '../util/dtos/vkm.dto';

/**
 * Service Layer - VKM Service
 * Contains business logic for VKM operations
 * Asks DAO for data operations
 */
@Injectable()
export class VkmService {
  constructor(
    @Inject(VKM_REPOSITORY)
    private readonly vkmDao: IVkmRepository,
    @Inject(USER_REPOSITORY)
    private readonly userDao: IUserRepository,
  ) {}

  /**
   * Get all VKMs with optional filters
   */
  async getAllVkms(query: GetAllVkmsQueryDto, userId?: string): Promise<VkmResponseDto[]> {
    const vkms = await this.vkmDao.findAll({
      location: query.location,
      level: query.level,
      studyCredit: query.studyCredit,
      isActive: query.isActive,
    });

    // Get user favorites if authenticated
    let favoriteIds: string[] = [];
    if (userId) {
      favoriteIds = await this.userDao.getFavoriteVkmIds(userId);
    }

    return vkms.map((vkm) => this.mapToResponseDto(vkm, favoriteIds));
  }

  /**
   * Get VKM by ID
   */
  async getVkmById(id: string, userId?: string): Promise<VkmResponseDto> {
    const vkm = await this.vkmDao.findById(id);
    if (!vkm) {
      throw new NotFoundException('VKM not found');
    }

    let favoriteIds: string[] = [];
    if (userId) {
      favoriteIds = await this.userDao.getFavoriteVkmIds(userId);
    }

    return this.mapToResponseDto(vkm, favoriteIds);
  }

  /**
   * Create a new VKM (Admin only)
   */
  async createVkm(dto: CreateVkmDto): Promise<VkmResponseDto> {
    const vkm = await this.vkmDao.create({
      name: dto.name,
      shortDescription: dto.shortDescription,
      description: dto.description,
      content: dto.content,
      studyCredit: dto.studyCredit,
      location: dto.location,
      contactId: dto.contactId,
      level: dto.level,
      learningOutcomes: dto.learningOutcomes,
      isActive: true,
    });

    return this.mapToResponseDto(vkm, []);
  }

  /**
   * Update an existing VKM (Admin only)
   */
  async updateVkm(id: string, dto: UpdateVkmDto): Promise<VkmResponseDto> {
    const vkm = await this.vkmDao.update(id, dto);
    if (!vkm) {
      throw new NotFoundException('VKM not found');
    }

    return this.mapToResponseDto(vkm, []);
  }

  /**
   * Delete a VKM permanently (Admin only)
   */
  async deleteVkm(id: string): Promise<void> {
    const deleted = await this.vkmDao.delete(id);
    if (!deleted) {
      throw new NotFoundException('VKM not found');
    }
  }

  /**
   * Deactivate a VKM (soft delete, Admin only)
   */
  async deactivateVkm(id: string): Promise<VkmResponseDto> {
    const vkm = await this.vkmDao.deactivate(id);
    if (!vkm) {
      throw new NotFoundException('VKM not found');
    }

    return this.mapToResponseDto(vkm, []);
  }

  /**
   * Toggle favorite status for a VKM
   */
  async toggleFavorite(userId: string, vkmId: string): Promise<{ isFavorited: boolean; message: string }> {
    // Check if VKM exists
    const vkm = await this.vkmDao.findById(vkmId);
    if (!vkm) {
      throw new NotFoundException('VKM not found');
    }

    // Toggle favorite
    const isFavorited = await this.userDao.toggleFavoriteVkm(userId, vkmId);

    return {
      isFavorited,
      message: isFavorited ? 'VKM added to favorites' : 'VKM removed from favorites',
    };
  }

  /**
   * Get user's favorite VKMs
   */
  async getUserFavorites(userId: string): Promise<VkmResponseDto[]> {
    const favoriteIds = await this.userDao.getFavoriteVkmIds(userId);
    if (favoriteIds.length === 0) {
      return [];
    }

    const vkms = await this.vkmDao.findByIds(favoriteIds);
    return vkms.map((vkm) => this.mapToResponseDto(vkm, favoriteIds));
  }

  /**
   * Get VKM recommendations for a user
   */
  async getRecommendations(userId: string, limit: number = 10): Promise<VkmResponseDto[]> {
  const vkms = await this.vkmDao.getRecommendations(userId || '', limit);
  const favoriteIds = await this.userDao.getFavoriteVkmIds(userId);
    
    return vkms.map((vkm) => this.mapToResponseDto(vkm, favoriteIds));
  }

  /**
   * Map database document to response DTO
   */
  private mapToResponseDto(vkm: any, favoriteIds: string[]): VkmResponseDto {
    return {
      id: vkm._id.toString(),
      name: vkm.name,
      shortDescription: vkm.shortdescription || '',
      description: vkm.description,
      content: vkm.content,
      studyCredit: vkm.studycredit,
      location: vkm.location,
      contactId: vkm.contact_id,
      level: vkm.level,
      learningOutcomes: vkm.learningoutcomes || '',
      isActive: vkm.isActive ?? true,
      createdAt: vkm.createdAt,
      updatedAt: vkm.updatedAt,
      isFavorited: favoriteIds.includes(vkm._id.toString()),
    };
  }
}

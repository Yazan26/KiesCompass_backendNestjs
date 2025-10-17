import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { VKM_REPOSITORY } from '../application/ports/vkm-repository.port';
import type { IVkmRepository } from '../application/ports/vkm-repository.port';
import { USER_REPOSITORY } from '../application/ports/user-repository.port';
import type { IUserRepository } from '../application/ports/user-repository.port';
import {
  CreateVkmDto,
  UpdateVkmDto,
  VkmResponseDto,
  GetAllVkmsQueryDto,
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
  async getAllVkms(
    query: GetAllVkmsQueryDto,
    userId?: string,
  ): Promise<VkmResponseDto[]> {
    const vkms = (await this.vkmDao.findAll({
      location: query.location,
      level: query.level,
      studyCredit: query.studyCredit,
      isActive: query.isActive,
    })) as LeanVkm[];

    const favoriteIds = await this.resolveFavoriteIds(userId);

    return this.mapListToResponseDto(vkms, favoriteIds);
  }

  /**
   * Get VKM by ID
   */
  async getVkmById(id: string, userId?: string): Promise<VkmResponseDto> {
    const vkm = (await this.vkmDao.findById(id)) as LeanVkm | null;
    if (!vkm) {
      throw new NotFoundException('VKM not found');
    }

    const favoriteIds = await this.resolveFavoriteIds(userId);

    return this.mapToResponseDto(vkm, favoriteIds);
  }

  /**
   * Create a new VKM (Admin only)
   */
  async createVkm(dto: CreateVkmDto): Promise<VkmResponseDto> {
    const vkm = (await this.vkmDao.create({
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
    })) as LeanVkm;

    return this.mapToResponseDto(vkm, EMPTY_FAVORITES);
  }

  /**
   * Update an existing VKM (Admin only)
   */
  async updateVkm(id: string, dto: UpdateVkmDto): Promise<VkmResponseDto> {
    const vkm = (await this.vkmDao.update(id, dto)) as LeanVkm | null;
    if (!vkm) {
      throw new NotFoundException('VKM not found');
    }

    return this.mapToResponseDto(vkm, EMPTY_FAVORITES);
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
    const vkm = (await this.vkmDao.deactivate(id)) as LeanVkm | null;
    if (!vkm) {
      throw new NotFoundException('VKM not found');
    }

    return this.mapToResponseDto(vkm, EMPTY_FAVORITES);
  }

  /**
   * Toggle favorite status for a VKM
   */
  async toggleFavorite(
    userId: string,
    vkmId: string,
  ): Promise<{ isFavorited: boolean; message: string }> {
    // Check if VKM exists
    const vkm = await this.vkmDao.findById(vkmId);
    if (!vkm) {
      throw new NotFoundException('VKM not found');
    }

    // Toggle favorite
    const isFavorited = await this.userDao.toggleFavoriteVkm(userId, vkmId);

    return {
      isFavorited,
      message: isFavorited
        ? 'VKM added to favorites'
        : 'VKM removed from favorites',
    };
  }

  /**
   * Get user's favorite VKMs
   */
  async getUserFavorites(userId: string): Promise<VkmResponseDto[]> {
    const favoriteIds = await this.userDao.getFavoriteVkmIds(userId);
    if (!favoriteIds.length) {
      return [];
    }

    const favoritesSet = new Set(favoriteIds);
    const vkms = (await this.vkmDao.findByIds(favoriteIds)) as LeanVkm[];

    return this.mapListToResponseDto(vkms, favoritesSet);
  }

  /**
   * Get VKM recommendations for a user
   */
  async getRecommendations(
    userId: string,
    limit: number = 10,
  ): Promise<VkmResponseDto[]> {
    const vkms = (await this.vkmDao.getRecommendations(
      userId,
      limit,
    )) as LeanVkm[];
    const favoriteIds = await this.resolveFavoriteIds(userId);

    return this.mapListToResponseDto(vkms, favoriteIds);
  }

  /**
   * Map database document to response DTO
   */
  private mapToResponseDto(
    vkm: LeanVkm,
    favoriteIds: ReadonlySet<string>,
  ): VkmResponseDto {
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
      isFavorited: favoriteIds.has(vkm._id.toString()),
    };
  }

  /**
   * Maps a list of VKMs while reusing a single favorites set.
   */
  private mapListToResponseDto(
    vkms: LeanVkm[],
    favoriteIds: ReadonlySet<string>,
  ): VkmResponseDto[] {
    return vkms.map((vkm) => this.mapToResponseDto(vkm, favoriteIds));
  }

  /**
   * Returns a set of favorite VKM IDs for the current user.
   */
  private async resolveFavoriteIds(
    userId?: string,
  ): Promise<ReadonlySet<string>> {
    if (!userId) {
      return EMPTY_FAVORITES;
    }

    const favoriteIds = await this.userDao.getFavoriteVkmIds(userId);
    return favoriteIds.length ? new Set(favoriteIds) : EMPTY_FAVORITES;
  }
}

const EMPTY_FAVORITES: ReadonlySet<string> = new Set<string>();

type LeanVkm = {
  _id: { toString(): string };
  name: string;
  shortdescription?: string;
  description: string;
  content: string;
  studycredit: number;
  location: string;
  contact_id: string;
  level: string;
  learningoutcomes?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

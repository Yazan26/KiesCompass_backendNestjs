import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import type { IUserRepository } from '../../auth/ports/user-repository.port';
import { USER_REPOSITORY } from '../../auth/ports/user-repository.port';
import type { IVkmRepository } from '../ports/vkm-repository.port';
import { VKM_REPOSITORY } from '../ports/vkm-repository.port';

/**
 * Use Case: Toggle favorite status for a VKM
 */
@Injectable()
export class ToggleFavoriteVkmUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(VKM_REPOSITORY)
    private readonly vkmRepository: IVkmRepository,
  ) {}

  async execute(userId: string, vkmId: string): Promise<{ isFavorited: boolean }> {
    // Verify VKM exists
    const vkm = await this.vkmRepository.findById(vkmId);
    if (!vkm) {
      throw new NotFoundException(`VKM with ID ${vkmId} not found`);
    }

    // Get user
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Toggle favorite
    const result = await this.userRepository.toggleFavoriteVkm(userId, vkmId);
    
    return { isFavorited: result };
  }
}

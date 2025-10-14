import { Inject, Injectable } from '@nestjs/common';
import type { IVkmRepository } from '../ports/vkm-repository.port';
import type { IUserRepository } from '../../auth/ports/user-repository.port';
import type { VkmEntity } from '../../../core/vkm/entities/vkm.entity';
import { USER_REPOSITORY } from '../../auth/ports/user-repository.port';
import { VKM_REPOSITORY } from '../ports/vkm-repository.port';

@Injectable()
export class GetUserFavoritesUseCase {
  constructor(
    @Inject(VKM_REPOSITORY)
    private readonly vkmRepository: IVkmRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string): Promise<VkmEntity[]> {
    const favoriteIds = await this.userRepository.getFavoriteVkmIds(userId);
    if (!favoriteIds || favoriteIds.length === 0) return [];

    const vkms = await this.vkmRepository.findByIds(favoriteIds);
    return vkms;
  }
}

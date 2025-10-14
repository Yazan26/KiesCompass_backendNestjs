import { Inject, Injectable } from '@nestjs/common';
import type { IVkmRepository } from '../ports/vkm-repository.port';
import { VKM_REPOSITORY } from '../ports/vkm-repository.port';
import { VkmEntity } from '../../../core/vkm/entities/vkm.entity';

/**
 * Use Case: Get VKM recommendations for a user
 */
@Injectable()
export class GetVkmRecommendationsUseCase {
  constructor(
    @Inject(VKM_REPOSITORY)
    private readonly vkmRepository: IVkmRepository,
  ) {}

  async execute(userId: string, limit: number = 10): Promise<VkmEntity[]> {
    return await this.vkmRepository.getRecommendations(userId, limit);
  }
}

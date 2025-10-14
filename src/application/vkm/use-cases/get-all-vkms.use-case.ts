import { Inject, Injectable } from '@nestjs/common';
import type { IVkmRepository } from '../ports/vkm-repository.port';
import { VKM_REPOSITORY } from '../ports/vkm-repository.port';
import { VkmEntity } from '../../../core/vkm/entities/vkm.entity';

/**
 * Use Case: Get all VKMs with optional filters
 */
@Injectable()
export class GetAllVkmsUseCase {
  constructor(
    @Inject(VKM_REPOSITORY)
    private readonly vkmRepository: IVkmRepository,
  ) {}

  async execute(filters?: {
    location?: string;
    level?: string;
    studyCredit?: number;
    isActive?: boolean;
  }): Promise<VkmEntity[]> {
    return await this.vkmRepository.findAll(filters);
  }
}

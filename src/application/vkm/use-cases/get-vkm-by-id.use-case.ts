import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IVkmRepository } from '../ports/vkm-repository.port';
import { VKM_REPOSITORY } from '../ports/vkm-repository.port';
import { VkmEntity } from '../../../core/vkm/entities/vkm.entity';

/**
 * Use Case: Get a single VKM by ID
 */
@Injectable()
export class GetVkmByIdUseCase {
  constructor(
    @Inject(VKM_REPOSITORY)
    private readonly vkmRepository: IVkmRepository,
  ) {}

  async execute(id: string): Promise<VkmEntity> {
    const vkm = await this.vkmRepository.findById(id);
    
    if (!vkm) {
      throw new NotFoundException(`VKM with ID ${id} not found`);
    }
    
    return vkm;
  }
}

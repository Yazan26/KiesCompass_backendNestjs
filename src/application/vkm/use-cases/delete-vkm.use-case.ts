import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IVkmRepository } from '../ports/vkm-repository.port';
import { VKM_REPOSITORY } from '../ports/vkm-repository.port';

/**
 * Use Case: Delete a VKM (Admin only)
 */
@Injectable()
export class DeleteVkmUseCase {
  constructor(
    @Inject(VKM_REPOSITORY)
    private readonly vkmRepository: IVkmRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const vkm = await this.vkmRepository.findById(id);
    
    if (!vkm) {
      throw new NotFoundException(`VKM with ID ${id} not found`);
    }

    const deleted = await this.vkmRepository.delete(id);
    
    if (!deleted) {
      throw new NotFoundException(`Failed to delete VKM with ID ${id}`);
    }
  }
}

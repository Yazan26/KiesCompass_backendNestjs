import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IVkmRepository } from '../ports/vkm-repository.port';
import { VKM_REPOSITORY } from '../ports/vkm-repository.port';
import { VkmEntity } from '../../../core/vkm/entities/vkm.entity';
import { UpdateVkmDto } from '../dtos/vkm.dto';

/**
 * Use Case: Update an existing VKM (Admin only)
 */
@Injectable()
export class UpdateVkmUseCase {
  constructor(
    @Inject(VKM_REPOSITORY)
    private readonly vkmRepository: IVkmRepository,
  ) {}

  async execute(id: string, dto: UpdateVkmDto): Promise<VkmEntity> {
    const existingVkm = await this.vkmRepository.findById(id);
    
    if (!existingVkm) {
      throw new NotFoundException(`VKM with ID ${id} not found`);
    }

    const updatedVkm = await this.vkmRepository.update(id, dto);
    
    if (!updatedVkm) {
      throw new NotFoundException(`Failed to update VKM with ID ${id}`);
    }
    
    return updatedVkm;
  }
}

import { Inject, Injectable } from '@nestjs/common';
import type { IVkmRepository } from '../ports/vkm-repository.port';
import { VKM_REPOSITORY } from '../ports/vkm-repository.port';
import { VkmEntity } from '../../../core/vkm/entities/vkm.entity';
import { CreateVkmDto } from '../dtos/vkm.dto';

/**
 * Use Case: Create a new VKM (Admin only)
 */
@Injectable()
export class CreateVkmUseCase {
  constructor(
    @Inject(VKM_REPOSITORY)
    private readonly vkmRepository: IVkmRepository,
  ) {}

  async execute(dto: CreateVkmDto): Promise<VkmEntity> {
    const vkmData = {
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
    };

    return await this.vkmRepository.create(vkmData);
  }
}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VkmDocument, VkmSchema } from './schemas/vkm.schema';
import { MongoVkmRepository } from './repositories/mongo-vkm.repository';
import { VKM_REPOSITORY } from '../../../application/vkm/ports/vkm-repository.port';

/**
 * Infrastructure Layer - VKM Database Module
 * Provides database schema and repository implementation
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VkmDocument.name, schema: VkmSchema },
    ]),
  ],
  providers: [
    {
      provide: VKM_REPOSITORY,
      useClass: MongoVkmRepository,
    },
  ],
  exports: [VKM_REPOSITORY],
})
export class VkmDatabaseModule {}

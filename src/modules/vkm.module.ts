import { Module } from '@nestjs/common';
import { DatabaseModule } from '../db/database.module';
import { VkmController } from '../controllers/vkm.controller';
import { VkmService } from '../services/vkm.service';
import { VkmDao } from '../infrastructure/dao/vkm.dao';
import { UserDao } from '../infrastructure/dao/user.dao';
import { VKM_REPOSITORY } from '../application/ports/vkm-repository.port';
import { USER_REPOSITORY } from '../application/ports/user-repository.port';

/**
 * VKM Module - Handles VKM features
 */
@Module({
  imports: [DatabaseModule],
  controllers: [VkmController],
  providers: [
    VkmService,
    VkmDao,
    UserDao,
    { provide: VKM_REPOSITORY, useExisting: VkmDao },
    { provide: USER_REPOSITORY, useExisting: UserDao },
  ],
  exports: [VkmService, VkmDao],
})
export class VkmModule {}

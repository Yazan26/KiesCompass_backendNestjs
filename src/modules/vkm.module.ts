import { Module } from '@nestjs/common';
import { DatabaseModule } from '../db/database.module';
import { VkmController } from '../controllers/vkm.controller';
import { VkmService } from '../services/vkm.service';
import { VkmDao } from '../dao/vkm.dao';
import { UserDao } from '../dao/user.dao';

/**
 * VKM Module - Handles VKM features
 */
@Module({
  imports: [DatabaseModule],
  controllers: [VkmController],
  providers: [VkmService, VkmDao, UserDao],
  exports: [VkmService, VkmDao],
})
export class VkmModule {}

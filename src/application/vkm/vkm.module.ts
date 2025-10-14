import { Module } from '@nestjs/common';
import { VkmController } from '../../presentation/vkm/controllers/vkm.controller';
import { VkmDatabaseModule } from '../../infrastructure/vkm/database/vkm-database.module';
import { DatabaseModule } from '../../infrastructure/auth/database/database.module';
import { GetAllVkmsUseCase } from './use-cases/get-all-vkms.use-case';
import { GetVkmByIdUseCase } from './use-cases/get-vkm-by-id.use-case';
import { GetUserFavoritesUseCase } from './use-cases/get-user-favorites.use-case';
import { CreateVkmUseCase } from './use-cases/create-vkm.use-case';
import { UpdateVkmUseCase } from './use-cases/update-vkm.use-case';
import { DeleteVkmUseCase } from './use-cases/delete-vkm.use-case';
import { DeactivateVkmUseCase } from './use-cases/deactivate-vkm.use-case';
import { ToggleFavoriteVkmUseCase } from './use-cases/toggle-favorite-vkm.use-case';
import { GetVkmRecommendationsUseCase } from './use-cases/get-vkm-recommendations.use-case';

/**
 * VKM Module - Main module for VKM feature
 * Follows clean architecture by organizing layers
 */
@Module({
  imports: [
    VkmDatabaseModule, // Infrastructure layer
    DatabaseModule, // For user repository access
  ],
  controllers: [VkmController], // Presentation layer
  providers: [
    // Application layer - Use cases
    GetAllVkmsUseCase,
    GetVkmByIdUseCase,
    CreateVkmUseCase,
    UpdateVkmUseCase,
    DeleteVkmUseCase,
    DeactivateVkmUseCase,
    ToggleFavoriteVkmUseCase,
    GetVkmRecommendationsUseCase,
    GetUserFavoritesUseCase,
  ],
  exports: [
    // Export use cases if other modules need them
    GetAllVkmsUseCase,
    GetVkmByIdUseCase,
    GetUserFavoritesUseCase,
  ],
})
export class VkmModule {}

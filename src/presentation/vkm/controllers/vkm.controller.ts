import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Logger, InternalServerErrorException } from '@nestjs/common';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CreateVkmDto, UpdateVkmDto, VkmResponseDto, GetAllVkmsQueryDto } from '../../../application/vkm/dtos/vkm.dto';
import { GetAllVkmsUseCase } from '../../../application/vkm/use-cases/get-all-vkms.use-case';
import { GetVkmByIdUseCase } from '../../../application/vkm/use-cases/get-vkm-by-id.use-case';
import { CreateVkmUseCase } from '../../../application/vkm/use-cases/create-vkm.use-case';
import { UpdateVkmUseCase } from '../../../application/vkm/use-cases/update-vkm.use-case';
import { DeleteVkmUseCase } from '../../../application/vkm/use-cases/delete-vkm.use-case';
import { DeactivateVkmUseCase } from '../../../application/vkm/use-cases/deactivate-vkm.use-case';
import { ToggleFavoriteVkmUseCase } from '../../../application/vkm/use-cases/toggle-favorite-vkm.use-case';
import { GetVkmRecommendationsUseCase } from '../../../application/vkm/use-cases/get-vkm-recommendations.use-case';
import { GetUserFavoritesUseCase } from '../../../application/vkm/use-cases/get-user-favorites.use-case';
import type { IUserRepository } from '../../../application/auth/ports/user-repository.port';
import { USER_REPOSITORY } from '../../../application/auth/ports/user-repository.port';
import { Inject } from '@nestjs/common';

/**
 * VKM Controller - Handles all VKM-related HTTP requests
 * Includes both user and admin endpoints
 */
@ApiTags('VKM')
@Controller('vkm')
export class VkmController {
  constructor(
    private readonly getAllVkmsUseCase: GetAllVkmsUseCase,
    private readonly getVkmByIdUseCase: GetVkmByIdUseCase,
    private readonly createVkmUseCase: CreateVkmUseCase,
    private readonly updateVkmUseCase: UpdateVkmUseCase,
    private readonly deleteVkmUseCase: DeleteVkmUseCase,
    private readonly deactivateVkmUseCase: DeactivateVkmUseCase,
    private readonly toggleFavoriteVkmUseCase: ToggleFavoriteVkmUseCase,
    private readonly getVkmRecommendationsUseCase: GetVkmRecommendationsUseCase,
  private readonly getUserFavoritesUseCase: GetUserFavoritesUseCase,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  /**
   * GET /vkm - Get all VKMs with optional filters
   * Public or authenticated users
   */
  @Get()
  @ApiOperation({ summary: 'Get all VKMs', description: 'Retrieve all VKM modules with optional filtering' })
  @ApiQuery({ name: 'location', required: false, example: 'Den Bosch', description: 'Filter by location' })
  @ApiQuery({ name: 'level', required: false, example: 'NLQF5', description: 'Filter by education level' })
  @ApiQuery({ name: 'studyCredit', required: false, example: 15, type: Number, description: 'Filter by study credits' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' })
  @ApiResponse({ status: 200, description: 'List of VKMs retrieved successfully', type: [VkmResponseDto] })
  async getAllVkms(
    @Query() query: GetAllVkmsQueryDto,
    @CurrentUser() user?: any,
  ): Promise<VkmResponseDto[]> {
    const vkms = await this.getAllVkmsUseCase.execute({
      location: query.location,
      level: query.level,
      studyCredit: query.studyCredit,
      isActive: query.isActive, // Don't default to true - let undefined pass through
    });

    // If user is authenticated, check which VKMs are favorited
    let favoriteIds: string[] = [];
    if (user) {
      favoriteIds = await this.userRepository.getFavoriteVkmIds(user.userId);
    }

    return vkms.map((vkm) => ({
      ...vkm.toPublicObject(),
      isFavorited: favoriteIds.includes(vkm.id),
    }));
  }

  /**
   * GET /vkm/:id - Get a single VKM by ID
   * Public or authenticated users
   */
  // NOTE: moved getVkmById below static routes to avoid route conflicts with '/favorites'

  /**
   * GET /vkm/recommendations - Get personalized VKM recommendations
   * Requires authentication
   */
  @Get('recommendations/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get personalized recommendations', description: 'Get VKM recommendations tailored to the user' })
  @ApiQuery({ name: 'limit', required: false, example: 10, type: Number, description: 'Number of recommendations' })
  @ApiResponse({ status: 200, description: 'Recommendations retrieved successfully', type: [VkmResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized - authentication required' })
  async getRecommendations(
    @CurrentUser() user: any,
    @Query('limit') limit?: number,
  ): Promise<VkmResponseDto[]> {
    const vkms = await this.getVkmRecommendationsUseCase.execute(
      user.userId,
      limit || 10,
    );

    const favoriteIds = await this.userRepository.getFavoriteVkmIds(user.userId);

    return vkms.map((vkm) => ({
      ...vkm.toPublicObject(),
      isFavorited: favoriteIds.includes(vkm.id),
    }));
  }

  /**
   * GET /vkm/favorites - Get all favorite VKMs for the authenticated user
   */
  @Get('favorites')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my favorites', description: "Return all VKMs the authenticated user has favorited" })
  @ApiResponse({ status: 200, description: 'Favorite VKMs retrieved successfully', type: [VkmResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized - authentication required' })
  async getMyFavorites(@CurrentUser() user: any): Promise<VkmResponseDto[]> {
    try {
      const vkms = await this.getUserFavoritesUseCase.execute(user.userId);
      // All returned vkms are favorited
      return vkms.map((vkm) => ({
        ...vkm.toPublicObject(),
        isFavorited: true,
      }));
    } catch (err: any) {
      Logger.error('Failed to get user favorites', err?.stack || err?.message || err, 'VkmController');
      throw new InternalServerErrorException('Failed to retrieve favorites');
    }
  }

  /**
   * POST /vkm/:id/favorite - Toggle favorite status for a VKM
   * Requires authentication
   */
  @Post(':id/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toggle favorite', description: 'Add or remove a VKM from favorites' })
  @ApiParam({ name: 'id', example: '68ed766ca5d5dc8235d7ce66', description: 'VKM unique identifier' })
  @ApiResponse({ status: 200, description: 'Favorite status toggled successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - authentication required' })
  @ApiResponse({ status: 404, description: 'VKM not found' })
  async toggleFavorite(
    @Param('id') vkmId: string,
    @CurrentUser() user: any,
  ): Promise<{ isFavorited: boolean; message: string }> {
    const result = await this.toggleFavoriteVkmUseCase.execute(
      user.userId,
      vkmId,
    );
    return {
      isFavorited: result.isFavorited,
      message: result.isFavorited
        ? 'VKM added to favorites'
        : 'VKM removed from favorites',
    };
  }

  /**
   * POST /vkm - Create a new VKM
   * Admin only
   */
  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create VKM (Admin)', description: 'Create a new VKM module - admin access required' })
  @ApiResponse({ status: 201, description: 'VKM created successfully', type: VkmResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized - authentication required' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin access required' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  async createVkm(@Body() dto: CreateVkmDto): Promise<VkmResponseDto> {
    const vkm = await this.createVkmUseCase.execute(dto);
    return vkm.toPublicObject();
  }

  /**
   * PUT /vkm/:id - Update a VKM
   * Admin only
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update VKM (Admin)', description: 'Update an existing VKM module - admin access required' })
  @ApiParam({ name: 'id', example: '68ed766ca5d5dc8235d7ce66', description: 'VKM unique identifier' })
  @ApiResponse({ status: 200, description: 'VKM updated successfully', type: VkmResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized - authentication required' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin access required' })
  @ApiResponse({ status: 404, description: 'VKM not found' })
  async updateVkm(
    @Param('id') id: string,
    @Body() dto: UpdateVkmDto,
  ): Promise<VkmResponseDto> {
    const vkm = await this.updateVkmUseCase.execute(id, dto);
    return vkm.toPublicObject();
  }

  /**
   * DELETE /vkm/:id - Delete a VKM
   * Admin only
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete VKM (Admin)', description: 'Permanently delete a VKM module - admin access required' })
  @ApiParam({ name: 'id', example: '68ed766ca5d5dc8235d7ce66', description: 'VKM unique identifier' })
  @ApiResponse({ status: 204, description: 'VKM deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - authentication required' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin access required' })
  @ApiResponse({ status: 404, description: 'VKM not found' })
  async deleteVkm(@Param('id') id: string): Promise<void> {
    await this.deleteVkmUseCase.execute(id);
  }

  /**
   * PATCH /vkm/:id/deactivate - Deactivate a VKM
   * Admin only
   */
  @Patch(':id/deactivate')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deactivate VKM (Admin)', description: 'Soft delete a VKM by marking it inactive - admin access required' })
  @ApiParam({ name: 'id', example: '68ed766ca5d5dc8235d7ce66', description: 'VKM unique identifier' })
  @ApiResponse({ status: 200, description: 'VKM deactivated successfully', type: VkmResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized - authentication required' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin access required' })
  @ApiResponse({ status: 404, description: 'VKM not found' })
  async deactivateVkm(@Param('id') id: string): Promise<VkmResponseDto> {
    const vkm = await this.deactivateVkmUseCase.execute(id);
    return vkm.toPublicObject();
  }

  /**
   * GET /vkm/:id - Get a single VKM by ID
   * Placed after static routes to avoid conflicts with static paths like '/favorites'
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get VKM by ID', description: 'Retrieve a specific VKM module by its ID' })
  @ApiParam({ name: 'id', example: '68ed766ca5d5dc8235d7ce66', description: 'VKM unique identifier' })
  @ApiResponse({ status: 200, description: 'VKM retrieved successfully', type: VkmResponseDto })
  @ApiResponse({ status: 404, description: 'VKM not found' })
  async getVkmById(
    @Param('id') id: string,
    @CurrentUser() user?: any,
  ): Promise<VkmResponseDto> {
    const vkm = await this.getVkmByIdUseCase.execute(id);

    let isFavorited = false;
    if (user) {
      const favoriteIds = await this.userRepository.getFavoriteVkmIds(user.userId);
      isFavorited = favoriteIds.includes(vkm.id);
    }

    return {
      ...vkm.toPublicObject(),
      isFavorited,
    };
  }
}

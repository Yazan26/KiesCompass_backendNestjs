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
import { VkmService } from '../services/vkm.service';
import { CreateVkmDto, UpdateVkmDto, VkmResponseDto, GetAllVkmsQueryDto } from '../util/dtos/vkm.dto';
import { JwtAuthGuard } from '../middleware/jwt-auth.guard';
import { AdminGuard } from '../middleware/admin.guard';
import { CurrentUser } from '../util/decorators/current-user.decorator';

/**
 * Controller Layer - VKM Controller
 * Handles HTTP requests for VKM resources
 * Asks Service for business logic
 */
@ApiTags('VKM')
@Controller('vkm')
export class VkmController {
  constructor(private readonly vkmService: VkmService) {}

  /**
   * GET /vkm - Get all VKMs with optional filters
   */
  @Get()
  @ApiOperation({ summary: 'Get all VKMs', description: 'Retrieve all VKM modules with optional filtering' })
  @ApiQuery({ name: 'location', required: false, example: 'Den Bosch' })
  @ApiQuery({ name: 'level', required: false, example: 'NLQF5' })
  @ApiQuery({ name: 'studyCredit', required: false, example: 15, type: Number })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'List of VKMs retrieved successfully', type: [VkmResponseDto] })
  async getAllVkms(@Query() query: GetAllVkmsQueryDto, @CurrentUser() user?: any): Promise<VkmResponseDto[]> {
    return this.vkmService.getAllVkms(query, user?.userId);
  }

  /**
   * GET /vkm/favorites - Get user's favorite VKMs
   */
  @Get('favorites')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my favorites', description: "Return all VKMs the authenticated user has favorited" })
  @ApiResponse({ status: 200, description: 'Favorite VKMs retrieved successfully', type: [VkmResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyFavorites(@CurrentUser() user: any): Promise<VkmResponseDto[]> {
    return this.vkmService.getUserFavorites(user.userId);
  }

  /**
   * GET /vkm/recommendations/me - Get personalized recommendations
   */
  @Get('recommendations/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get personalized recommendations' })
  @ApiQuery({ name: 'limit', required: false, example: 10, type: Number })
  @ApiResponse({ status: 200, description: 'Recommendations retrieved successfully', type: [VkmResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getRecommendations(@CurrentUser() user: any, @Query('limit') limit?: number): Promise<VkmResponseDto[]> {
    return this.vkmService.getRecommendations(user.userId, limit || 10);
  }

  /**
   * GET /vkm/:id - Get a single VKM by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get VKM by ID' })
  @ApiParam({ name: 'id', example: '68ed766ca5d5dc8235d7ce66' })
  @ApiResponse({ status: 200, description: 'VKM retrieved successfully', type: VkmResponseDto })
  @ApiResponse({ status: 404, description: 'VKM not found' })
  async getVkmById(@Param('id') id: string, @CurrentUser() user?: any): Promise<VkmResponseDto> {
    return this.vkmService.getVkmById(id, user?.userId);
  }

  /**
   * POST /vkm/:id/favorite - Toggle favorite status
   */
  @Post(':id/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toggle favorite', description: 'Add or remove a VKM from favorites' })
  @ApiParam({ name: 'id', example: '68ed766ca5d5dc8235d7ce66' })
  @ApiResponse({ status: 200, description: 'Favorite status toggled successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'VKM not found' })
  async toggleFavorite(
    @Param('id') vkmId: string,
    @CurrentUser() user: any,
  ): Promise<{ isFavorited: boolean; message: string }> {
    return this.vkmService.toggleFavorite(user.userId, vkmId);
  }

  /**
   * POST /vkm - Create a new VKM (Admin only)
   */
  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create VKM (Admin)', description: 'Create a new VKM module - admin access required' })
  @ApiResponse({ status: 201, description: 'VKM created successfully', type: VkmResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin access required' })
  async createVkm(@Body() dto: CreateVkmDto): Promise<VkmResponseDto> {
    return this.vkmService.createVkm(dto);
  }

  /**
   * PUT /vkm/:id - Update a VKM (Admin only)
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update VKM (Admin)', description: 'Update an existing VKM module - admin access required' })
  @ApiParam({ name: 'id', example: '68ed766ca5d5dc8235d7ce66' })
  @ApiResponse({ status: 200, description: 'VKM updated successfully', type: VkmResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin access required' })
  @ApiResponse({ status: 404, description: 'VKM not found' })
  async updateVkm(@Param('id') id: string, @Body() dto: UpdateVkmDto): Promise<VkmResponseDto> {
    return this.vkmService.updateVkm(id, dto);
  }

  /**
   * DELETE /vkm/:id - Delete a VKM permanently (Admin only)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete VKM (Admin)', description: 'Permanently delete a VKM module - admin access required' })
  @ApiParam({ name: 'id', example: '68ed766ca5d5dc8235d7ce66' })
  @ApiResponse({ status: 204, description: 'VKM deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin access required' })
  @ApiResponse({ status: 404, description: 'VKM not found' })
  async deleteVkm(@Param('id') id: string): Promise<void> {
    await this.vkmService.deleteVkm(id);
  }

  /**
   * PATCH /vkm/:id/deactivate - Deactivate a VKM (Admin only)
   */
  @Patch(':id/deactivate')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deactivate VKM (Admin)', description: 'Soft delete a VKM by marking it inactive' })
  @ApiParam({ name: 'id', example: '68ed766ca5d5dc8235d7ce66' })
  @ApiResponse({ status: 200, description: 'VKM deactivated successfully', type: VkmResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin access required' })
  @ApiResponse({ status: 404, description: 'VKM not found' })
  async deactivateVkm(@Param('id') id: string): Promise<VkmResponseDto> {
    return this.vkmService.deactivateVkm(id);
  }
}

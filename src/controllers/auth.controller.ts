import { Body, Controller, Post, Get, UseGuards, Put, Delete, Param, Query } from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import {
  RegisterDto,
  LoginDto,
  AuthResponseDto,
  UserResponseDto,
  AdminUserResponseDto,
  UpdateUserDto,
} from '../util/dtos/auth.dto';
import { JwtAuthGuard } from '../middleware/jwt-auth.guard';
import { AdminGuard } from '../middleware/admin.guard';
import { CurrentUser } from '../util/decorators/current-user.decorator';

/**
 * Controller Layer - Auth Controller
 * Handles HTTP requests for authentication
 * Asks Service for business logic
 */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Username or email already in use' })
  async register(@Body() dto: RegisterDto): Promise<UserResponseDto> {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with username and password' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }





  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(
    @CurrentUser() user: { userId: string },
  ): Promise<UserResponseDto> {
    return this.authService.getUserProfile(user.userId);
  }

  // ==================== ADMIN ENDPOINTS ====================

  @Get('/users')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Get all users with optional filtering' })
  @ApiQuery({ name: 'username', required: false, description: 'Filter by username (partial match)' })
  @ApiQuery({ name: 'email', required: false, description: 'Filter by email (partial match)' })
  @ApiQuery({ name: 'firstname', required: false, description: 'Filter by firstname (partial match)' })
  @ApiQuery({ name: 'lastname', required: false, description: 'Filter by lastname (partial match)' })
  @ApiQuery({ name: 'role', required: false, enum: ['student', 'admin'], description: 'Filter by role' })
  @ApiResponse({
    status: 200,
    description: 'List of users retrieved',
    type: [AdminUserResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getAllUsers(
    @Query('username') username?: string,
    @Query('email') email?: string,
    @Query('firstname') firstname?: string,
    @Query('lastname') lastname?: string,
    @Query('role') role?: string,
  ): Promise<AdminUserResponseDto[]> {
    const filters = {
      ...(username && { username }),
      ...(email && { email }),
      ...(firstname && { firstname }),
      ...(lastname && { lastname }),
      ...(role && { role }),
    };
    
    return this.authService.getAllUsers(Object.keys(filters).length > 0 ? filters : undefined);
  }

  @Get('/users/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Get user by ID with full details' })
  @ApiResponse({
    status: 200,
    description: 'User details retrieved',
    type: AdminUserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id') id: string): Promise<AdminUserResponseDto> {
    return this.authService.getUserById(id);
  }

  @Put('/users/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Update user details' })
  @ApiResponse({
    status: 200,
    description: 'User successfully updated',
    type: AdminUserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'Username or email already in use' })
  async updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<AdminUserResponseDto> {
    return this.authService.updateUser(id, dto);
  }

  @Delete('/users/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Delete user' })
  @ApiResponse({
    status: 200,
    description: 'User successfully deleted',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'User successfully deleted' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(@Param('id') id: string): Promise<{ message: string }> {
    return this.authService.deleteUser(id);
  }
}

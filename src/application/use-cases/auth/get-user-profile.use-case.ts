import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IUserRepository } from '../../ports/user-repository.port';
import { USER_REPOSITORY } from '../../ports/user-repository.port';
import { UserResponseDto } from '../../dtos/auth.dto';

/**
 * Application Layer - Get User Profile Use Case
 * Retrieves user profile information
 */
@Injectable()
export class GetUserProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.toSafeObject();
  }
}

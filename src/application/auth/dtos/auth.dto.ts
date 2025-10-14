import { IsEmail, MinLength, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Application Layer - DTOs for Auth
 */
export class RegisterDto {
  @ApiProperty({ example: 'johndoe' })
  @IsString()
  @Matches(/^[a-zA-Z0-9_]{3,20}$/, { message: 'Username must be 3-20 characters, alphanumeric or underscore' })
  username: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @MinLength(10, { message: 'Password must be at least 10 characters long' })
  @Matches(/^(?=.*[!@#$%^&*(),.?":{}|<>]).+$/, { message: 'Password must contain at least one symbol' })
  password: string;
}

export class LoginDto {
  @ApiProperty({ example: 'johndoe' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(1, { message: 'Password is required' })
  password: string;
}

export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiHSDFSADFuyInR5cCI6IkpXVCJ9...' })
  access_token: string;
}

export class UserResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  id: string;

  @ApiProperty({ example: 'johndoe' })
  username: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: '2023-10-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2023-10-01T00:00:00.000Z' })
  updatedAt: Date;
}
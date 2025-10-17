import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for creating a new VKM
 */
export class CreateVkmDto {
  @ApiProperty({
    example: 'Learning and working abroad',
    description: 'VKM module name',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  name: string;

  @ApiProperty({
    example: 'Internationaal, persoonlijke ontwikkeling, verpleegkunde',
    description: 'Brief description of the module',
  })
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  shortDescription: string;

  @ApiProperty({
    example:
      'Studenten kiezen binnen de (stam) van de opleiding van Verpleegkunde steeds vaker voor een stage in het buitenland...',
    description: 'Full description of the module',
  })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({
    example:
      'Studenten kiezen binnen de (stam) van de opleiding van Verpleegkunde steeds vaker voor een stage in het buitenland...',
    description: 'Detailed content of the module',
  })
  @IsString()
  @MinLength(10)
  content: string;

  @ApiProperty({ example: 15, description: 'Number of study credits (EC)' })
  @IsNumber()
  @Min(0)
  studyCredit: number;

  @ApiProperty({
    example: 'Den Bosch',
    description: 'Location where module is offered',
  })
  @IsString()
  @MinLength(2)
  location: string;

  @ApiProperty({ example: '58', description: 'Contact person ID' })
  @IsString()
  contactId: string;

  @ApiProperty({
    example: 'NLQF5',
    description: 'Education level (e.g., NLQF5, NLQF6)',
  })
  @IsString()
  level: string;

  @ApiProperty({
    example:
      'De student toont professioneel gedrag conform de beroepscode bij laagcomplexe zorgvragers...',
    description: 'Expected learning outcomes',
  })
  @IsString()
  learningOutcomes: string;
}

/**
 * DTO for updating an existing VKM
 */
export class UpdateVkmDto {
  @ApiProperty({ example: 'Updated VKM Name', required: false })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  name?: string;

  @ApiProperty({ example: 'Updated short description', required: false })
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  shortDescription?: string;

  @ApiProperty({ example: 'Updated full description', required: false })
  @IsOptional()
  @IsString()
  @MinLength(10)
  description?: string;

  @ApiProperty({ example: 'Updated content', required: false })
  @IsOptional()
  @IsString()
  @MinLength(10)
  content?: string;

  @ApiProperty({ example: 30, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  studyCredit?: number;

  @ApiProperty({ example: 'Breda', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  location?: string;

  @ApiProperty({ example: '60', required: false })
  @IsOptional()
  @IsString()
  contactId?: string;

  @ApiProperty({ example: 'NLQF6', required: false })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiProperty({ example: 'Updated learning outcomes', required: false })
  @IsOptional()
  @IsString()
  learningOutcomes?: string;

  @ApiProperty({
    example: false,
    required: false,
    description: 'Active status',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

/**
 * DTO for VKM response
 */
export class VkmResponseDto {
  @ApiProperty({ example: '68ed766ca5d5dc8235d7ce66' })
  id: string;

  @ApiProperty({ example: 'Learning and working abroad' })
  name: string;

  @ApiProperty({
    example: 'Internationaal, persoonlijke ontwikkeling, verpleegkunde',
  })
  shortDescription: string;

  @ApiProperty({
    example: 'Studenten kiezen binnen de (stam) van de opleiding...',
  })
  description: string;

  @ApiProperty({
    example: 'Studenten kiezen binnen de (stam) van de opleiding...',
  })
  content: string;

  @ApiProperty({ example: 15 })
  studyCredit: number;

  @ApiProperty({ example: 'Den Bosch' })
  location: string;

  @ApiProperty({ example: '58' })
  contactId: string;

  @ApiProperty({ example: 'NLQF5' })
  level: string;

  @ApiProperty({ example: 'De student toont professioneel gedrag conform...' })
  learningOutcomes: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2025-10-14T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-10-14T10:00:00.000Z' })
  updatedAt: Date;

  @ApiProperty({
    example: false,
    required: false,
    description: 'Whether the VKM is favorited by current user',
  })
  isFavorited?: boolean;
}

/**
 * DTO for query parameters when getting all VKMs
 */
export class GetAllVkmsQueryDto {
  @ApiProperty({
    example: 'learning',
    required: false,
    description: 'Filter by name (partial match, case-insensitive)',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    example: 'Den Bosch',
    required: false,
    description: 'Filter by location (partial match, case-insensitive)',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    example: 'NLQF5',
    required: false,
    description: 'Filter by education level (exact match)',
  })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiProperty({
    example: 15,
    required: false,
    description: 'Filter by study credits (exact match)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  studyCredit?: number;

  @ApiProperty({
    example: 'verpleegkunde',
    required: false,
    description: 'Search in short description (partial match, case-insensitive)',
  })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiProperty({
    example: 'stage',
    required: false,
    description: 'Search in description (partial match, case-insensitive)',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'student',
    required: false,
    description: 'Search in content (partial match, case-insensitive)',
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({
    example: 'professioneel',
    required: false,
    description: 'Search in learning outcomes (partial match, case-insensitive)',
  })
  @IsOptional()
  @IsString()
  learningOutcomes?: string;

  @ApiProperty({
    example: '58',
    required: false,
    description: 'Filter by contact ID (exact match)',
  })
  @IsOptional()
  @IsString()
  contactId?: string;

  @ApiProperty({
    example: true,
    required: false,
    description: 'Filter by active status',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isActive?: boolean;
}

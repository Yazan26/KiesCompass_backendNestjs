import type { VkmEntity } from '../../../core/vkm/entities/vkm.entity';

export interface CreateVkmData {
  name: string;
  shortDescription: string;
  description: string;
  content: string;
  studyCredit: number;
  location: string;
  contactId: string;
  level: string;
  learningOutcomes: string;
  isActive: boolean;
}

/**
 * Application Layer - VKM Repository Port
 * Interface defining the contract for VKM data access
 */
export interface IVkmRepository {
  /**
   * Find all VKMs with optional filters
   */
  findAll(filters?: {
    location?: string;
    level?: string;
    studyCredit?: number;
    isActive?: boolean;
  }): Promise<VkmEntity[]>;

  /**
   * Find a VKM by ID
   */
  findById(id: string): Promise<VkmEntity | null>;

  /**
   * Create a new VKM
   */
  create(vkm: CreateVkmData): Promise<VkmEntity>;

  /**
   * Update a VKM
   */
  update(id: string, updates: Partial<VkmEntity>): Promise<VkmEntity | null>;

  /**
   * Delete a VKM
   */
  delete(id: string): Promise<boolean>;

  /**
   * Deactivate a VKM
   */
  deactivate(id: string): Promise<VkmEntity | null>;

  /**
   * Get recommendations based on user preferences
   * This is a placeholder - real implementation would use more sophisticated logic
   */
  getRecommendations(userId: string, limit?: number): Promise<VkmEntity[]>;

  /**
   * Find multiple VKMs by their IDs
   */
  findByIds(ids: string[]): Promise<VkmEntity[]>;
}

/**
 * Token for dependency injection
 */
export const VKM_REPOSITORY = Symbol('VKM_REPOSITORY');

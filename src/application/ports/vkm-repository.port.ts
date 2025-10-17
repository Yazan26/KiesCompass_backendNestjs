export const VKM_REPOSITORY = 'VKM_REPOSITORY';

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
  isActive?: boolean;
}

export interface IVkmRepository {
  findAll(filters?: {
    location?: string;
    level?: string;
    studyCredit?: number;
    isActive?: boolean;
  }): Promise<any[]>;
  findById(id: string): Promise<any | null>;
  findByIds(ids: string[]): Promise<any[]>;
  create(data: CreateVkmData): Promise<any>;
  update(id: string, updates: Partial<CreateVkmData>): Promise<any | null>;
  delete(id: string): Promise<boolean>;
  deactivate(id: string): Promise<any | null>;
  getRecommendations(userId: string, limit?: number): Promise<any[]>;
}

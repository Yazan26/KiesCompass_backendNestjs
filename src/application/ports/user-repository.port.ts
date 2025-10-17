export const USER_REPOSITORY = 'USER_REPOSITORY';

export interface IUserRepository {
  findByUsername(username: string): Promise<any | null>;
  findByEmail(email: string): Promise<any | null>;
  findById(id: string): Promise<any | null>;
  findByFirstandLastname(firstname: string, lastname: string): Promise<any | null>;
  // Search users with optional query across username, email, firstname, lastname.
  // Supports pagination via page & limit.
  search(query?: string, page?: number, limit?: number): Promise<{results: any[]; total: number}>;
  create(username: string, email: string, firstname: string, lastname: string, passwordHash: string): Promise<any>;
  existsByUsername(username: string): Promise<boolean>;
  existsByEmail(email: string): Promise<boolean>;
  toggleFavoriteVkm(userId: string, vkmId: string): Promise<boolean>;
  getFavoriteVkmIds(userId: string): Promise<string[]>;
}

export const USER_REPOSITORY = 'USER_REPOSITORY';

export interface IUserRepository {
  findByUsername(username: string): Promise<any | null>;
  findByEmail(email: string): Promise<any | null>;
  findById(id: string): Promise<any | null>;
  create(username: string, email: string, passwordHash: string): Promise<any>;
  existsByUsername(username: string): Promise<boolean>;
  existsByEmail(email: string): Promise<boolean>;
  toggleFavoriteVkm(userId: string, vkmId: string): Promise<boolean>;
  getFavoriteVkmIds(userId: string): Promise<string[]>;
}

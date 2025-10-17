export const USER_REPOSITORY = 'USER_REPOSITORY';

export interface IUserRepository {
  findByUsername(username: string): Promise<any | null>;
  findByEmail(email: string): Promise<any | null>;
  findById(id: string): Promise<any | null>;
  findByFirstandLastname(firstname: string, lastname: string): Promise<any | null>;
  create(username: string, email: string, firstname: string, lastname: string, passwordHash: string): Promise<any>;
  existsByUsername(username: string): Promise<boolean>;
  existsByEmail(email: string): Promise<boolean>;
  toggleFavoriteVkm(userId: string, vkmId: string): Promise<boolean>;
  getFavoriteVkmIds(userId: string): Promise<string[]>;
  findAll(filters?: {
    username?: string;
    email?: string;
    firstname?: string;
    lastname?: string;
    role?: string;
  }): Promise<any[]>;
  update(userId: string, updates: {
    username?: string;
    email?: string;
    firstname?: string;
    lastname?: string;
    role?: string;
  }): Promise<any | null>;
  delete(userId: string): Promise<boolean>;
}

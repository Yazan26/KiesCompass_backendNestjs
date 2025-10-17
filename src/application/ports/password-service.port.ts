export const PASSWORD_SERVICE = 'PASSWORD_SERVICE';

export interface IPasswordService {
  hash(password: string): Promise<string>;
  compare(password: string, hash: string): Promise<boolean>;
}

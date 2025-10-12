/**
 * Domain Layer - Password Value Object
 * Ensures password requirements at the domain level
 */
export class Password {
  private readonly value: string;

  constructor(password: string) {
    if (!this.isValid(password)) {
      throw new Error('Password must be at least 10 characters long');
    }
    this.value = password;
  }

  private isValid(password: string): boolean {
    return typeof password === 'string' && password.length >= 10 && /[!@#$%^&*(),.?":{}|<>]/.test(password);
  }

  getValue(): string {
    return this.value;
  }
}

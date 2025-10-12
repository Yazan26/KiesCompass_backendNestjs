/**
 * Domain Layer - Username Value Object
 * Ensures username validity at the domain level
 */
export class Username {
  private readonly value: string;

  constructor(username: string) {
    if (!this.isValid(username)) {
      throw new Error('Invalid username format');
    }
    this.value = username.trim();
  }

  private isValid(username: string): boolean {
    // Username should be 3-20 characters, alphanumeric, underscore, no spaces
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Username): boolean {
    return this.value === other.value;
  }
}

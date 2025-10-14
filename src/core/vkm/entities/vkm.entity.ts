/**
 * Domain Layer - VKM Entity
 * Core business entity representing a Vrije Keuze Module in the system
 */
export class VkmEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly shortDescription: string,
    public readonly description: string,
    public readonly content: string,
    public readonly studyCredit: number,
    public readonly location: string,
    public readonly contactId: string,
    public readonly level: string,
    public readonly learningOutcomes: string,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  /**
   * Factory method to create a new VKM entity
   */
  static create(
    id: string,
    name: string,
    shortDescription: string,
    description: string,
    content: string,
    studyCredit: number,
    location: string,
    contactId: string,
    level: string,
    learningOutcomes: string,
    isActive: boolean = true,
    createdAt?: Date,
    updatedAt?: Date,
  ): VkmEntity {
    return new VkmEntity(
      id,
      name,
      shortDescription,
      description,
      content,
      studyCredit,
      location,
      contactId,
      level,
      learningOutcomes,
      isActive,
      createdAt || new Date(),
      updatedAt || new Date(),
    );
  }

  /**
   * Create a public VKM object for API responses
   */
  toPublicObject(): {
    id: string;
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
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this.id,
      name: this.name,
      shortDescription: this.shortDescription,
      description: this.description,
      content: this.content,
      studyCredit: this.studyCredit,
      location: this.location,
      contactId: this.contactId,
      level: this.level,
      learningOutcomes: this.learningOutcomes,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Deactivate the VKM
   */
  deactivate(): VkmEntity {
    return new VkmEntity(
      this.id,
      this.name,
      this.shortDescription,
      this.description,
      this.content,
      this.studyCredit,
      this.location,
      this.contactId,
      this.level,
      this.learningOutcomes,
      false,
      this.createdAt,
      new Date(),
    );
  }
}

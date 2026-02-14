import { Prisma } from "@prisma/client";
import { IBaseRepository } from "@/domain/interfaces/repositories";
import { NotFoundError } from "@/domain/errors";

export abstract class BaseService<T extends { id: string }> {
  protected abstract readonly entityName: string;

  constructor(protected readonly repository: IBaseRepository<T>) {}

  async findById(id: string): Promise<T> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new NotFoundError(this.entityName, id);
    }
    return entity;
  }

  async findAll(filters?: Record<string, unknown>): Promise<T[]> {
    return this.repository.findAll(filters);
  }

  async create(data: Partial<T>): Promise<T> {
    return this.repository.create(data);
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    try {
      return await this.repository.update(id, data);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        throw new NotFoundError(this.entityName, id);
      }
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      return await this.repository.delete(id);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        throw new NotFoundError(this.entityName, id);
      }
      throw error;
    }
  }
}

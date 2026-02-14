import { IBaseRepository } from "@/domain/interfaces/repositories";

export abstract class BaseRepository<T> implements IBaseRepository<T> {
  protected abstract get delegate(): {
    findUnique(args: { where: { id: string } }): Promise<unknown>;
    findMany(args?: Record<string, unknown>): Promise<unknown[]>;
    create(args: { data: Record<string, unknown> }): Promise<unknown>;
    update(args: { where: { id: string }; data: Record<string, unknown> }): Promise<unknown>;
    delete(args: { where: { id: string } }): Promise<unknown>;
    count(args?: Record<string, unknown>): Promise<number>;
  };

  protected abstract toEntity(raw: unknown): T;
  protected abstract toCreateData(data: Partial<T>): Record<string, unknown>;
  protected abstract toUpdateData(data: Partial<T>): Record<string, unknown>;

  async findById(id: string): Promise<T | null> {
    const raw = await this.delegate.findUnique({ where: { id } });
    return raw ? this.toEntity(raw) : null;
  }

  async findAll(filters?: Record<string, unknown>): Promise<T[]> {
    const raw = await this.delegate.findMany(filters ? { where: filters } : undefined);
    return raw.map((r) => this.toEntity(r));
  }

  async create(data: Partial<T>): Promise<T> {
    const raw = await this.delegate.create({ data: this.toCreateData(data) });
    return this.toEntity(raw);
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const raw = await this.delegate.update({
      where: { id },
      data: this.toUpdateData(data),
    });
    return this.toEntity(raw);
  }

  async delete(id: string): Promise<void> {
    await this.delegate.delete({ where: { id } });
  }

  async count(filters?: Record<string, unknown>): Promise<number> {
    return this.delegate.count(filters ? { where: filters } : undefined);
  }
}

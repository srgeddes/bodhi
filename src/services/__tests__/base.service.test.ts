import { Prisma } from "@prisma/client";
import { BaseService } from "../base.service";
import { NotFoundError } from "@/domain/errors";
import { IBaseRepository } from "@/domain/interfaces/repositories";

interface TestEntity {
  id: string;
  name: string;
}

class TestService extends BaseService<TestEntity> {
  protected readonly entityName = "TestEntity";
}

function createMockRepository(): jest.Mocked<IBaseRepository<TestEntity>> {
  return {
    findById: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  };
}

describe("BaseService", () => {
  let service: TestService;
  let repository: jest.Mocked<IBaseRepository<TestEntity>>;

  const testEntity: TestEntity = { id: "entity-1", name: "Test" };

  beforeEach(() => {
    repository = createMockRepository();
    service = new TestService(repository);
  });

  describe("findById", () => {
    it("returns entity when found", async () => {
      repository.findById.mockResolvedValue(testEntity);

      const result = await service.findById("entity-1");

      expect(result).toEqual(testEntity);
      expect(repository.findById).toHaveBeenCalledWith("entity-1");
    });

    it("throws NotFoundError when entity is not found", async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById("missing-id")).rejects.toThrow(NotFoundError);
      await expect(service.findById("missing-id")).rejects.toThrow(
        "TestEntity with id 'missing-id' not found"
      );
    });
  });

  describe("findAll", () => {
    it("delegates to repository", async () => {
      const entities = [testEntity, { id: "entity-2", name: "Other" }];
      repository.findAll.mockResolvedValue(entities);

      const result = await service.findAll({ status: "active" });

      expect(result).toEqual(entities);
      expect(repository.findAll).toHaveBeenCalledWith({ status: "active" });
    });
  });

  describe("create", () => {
    it("delegates to repository", async () => {
      repository.create.mockResolvedValue(testEntity);

      const result = await service.create({ name: "Test" });

      expect(result).toEqual(testEntity);
      expect(repository.create).toHaveBeenCalledWith({ name: "Test" });
    });
  });

  describe("update", () => {
    it("delegates to repository directly without pre-fetch", async () => {
      const updated = { ...testEntity, name: "Updated" };
      repository.update.mockResolvedValue(updated);

      const result = await service.update("entity-1", { name: "Updated" });

      expect(result).toEqual(updated);
      expect(repository.findById).not.toHaveBeenCalled();
      expect(repository.update).toHaveBeenCalledWith("entity-1", { name: "Updated" });
    });

    it("throws NotFoundError when Prisma returns P2025", async () => {
      repository.update.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError("Record not found", { code: "P2025", clientVersion: "0.0.0" })
      );

      await expect(service.update("missing-id", { name: "Updated" })).rejects.toThrow(
        NotFoundError
      );
    });

    it("re-throws non-Prisma errors", async () => {
      repository.update.mockRejectedValue(new Error("DB connection lost"));

      await expect(service.update("entity-1", { name: "Updated" })).rejects.toThrow(
        "DB connection lost"
      );
    });
  });

  describe("delete", () => {
    it("delegates to repository directly without pre-fetch", async () => {
      repository.delete.mockResolvedValue(undefined);

      await service.delete("entity-1");

      expect(repository.findById).not.toHaveBeenCalled();
      expect(repository.delete).toHaveBeenCalledWith("entity-1");
    });

    it("throws NotFoundError when Prisma returns P2025", async () => {
      repository.delete.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError("Record not found", { code: "P2025", clientVersion: "0.0.0" })
      );

      await expect(service.delete("missing-id")).rejects.toThrow(NotFoundError);
    });

    it("re-throws non-Prisma errors", async () => {
      repository.delete.mockRejectedValue(new Error("DB connection lost"));

      await expect(service.delete("entity-1")).rejects.toThrow("DB connection lost");
    });
  });
});

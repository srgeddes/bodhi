import { BaseEntity } from "../base.entity";

class ConcreteEntity extends BaseEntity {
  constructor(id?: string) {
    super(id);
  }
}

describe("BaseEntity", () => {
  it("auto-generates a UUID when no id is provided", () => {
    const entity = new ConcreteEntity();

    expect(entity.id).toBeDefined();
    expect(typeof entity.id).toBe("string");
    expect(entity.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    );
  });

  it("uses the provided id when one is given", () => {
    const entity = new ConcreteEntity("custom-id-123");
    expect(entity.id).toBe("custom-id-123");
  });

  it("sets createdAt and updatedAt to the current date", () => {
    const before = new Date();
    const entity = new ConcreteEntity();
    const after = new Date();

    expect(entity.createdAt).toBeInstanceOf(Date);
    expect(entity.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(entity.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    expect(entity.updatedAt).toBeInstanceOf(Date);
    expect(entity.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(entity.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  it("equals returns true when two entities have the same id", () => {
    const a = new ConcreteEntity("same-id");
    const b = new ConcreteEntity("same-id");
    expect(a.equals(b)).toBe(true);
  });

  it("equals returns false when two entities have different ids", () => {
    const a = new ConcreteEntity("id-1");
    const b = new ConcreteEntity("id-2");
    expect(a.equals(b)).toBe(false);
  });
});

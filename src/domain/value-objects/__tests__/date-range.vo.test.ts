import { ValidationError } from "@/domain/errors";

import { DateRange } from "../date-range.vo";

describe("DateRange", () => {
  describe("construction", () => {
    it("creates a valid date range", () => {
      const start = new Date("2024-01-01");
      const end = new Date("2024-12-31");
      const range = new DateRange(start, end);
      expect(range.start).toEqual(start);
      expect(range.end).toEqual(end);
    });

    it("allows same start and end date", () => {
      const date = new Date("2024-06-15");
      const range = new DateRange(date, date);
      expect(range.start).toEqual(date);
      expect(range.end).toEqual(date);
    });

    it("throws ValidationError when start is after end", () => {
      const start = new Date("2024-12-31");
      const end = new Date("2024-01-01");
      expect(() => new DateRange(start, end)).toThrow(ValidationError);
    });
  });

  describe("contains", () => {
    const range = new DateRange(new Date("2024-01-01"), new Date("2024-12-31"));

    it("returns true for date inside range", () => {
      expect(range.contains(new Date("2024-06-15"))).toBe(true);
    });

    it("returns false for date outside range", () => {
      expect(range.contains(new Date("2025-06-15"))).toBe(false);
    });

    it("returns true for date on start boundary", () => {
      expect(range.contains(new Date("2024-01-01"))).toBe(true);
    });

    it("returns true for date on end boundary", () => {
      expect(range.contains(new Date("2024-12-31"))).toBe(true);
    });
  });

  describe("overlaps", () => {
    const range = new DateRange(new Date("2024-03-01"), new Date("2024-06-30"));

    it("returns true for overlapping ranges", () => {
      const other = new DateRange(new Date("2024-05-01"), new Date("2024-08-31"));
      expect(range.overlaps(other)).toBe(true);
    });

    it("returns false for non-overlapping ranges", () => {
      const other = new DateRange(new Date("2024-07-02"), new Date("2024-09-30"));
      expect(range.overlaps(other)).toBe(false);
    });

    it("returns true for adjacent ranges sharing a boundary", () => {
      const other = new DateRange(new Date("2024-06-30"), new Date("2024-09-30"));
      expect(range.overlaps(other)).toBe(true);
    });
  });

  describe("durationInDays", () => {
    it("calculates correct duration", () => {
      const range = new DateRange(new Date("2024-01-01"), new Date("2024-01-08"));
      expect(range.durationInDays()).toBe(7);
    });

    it("returns 0 for same start and end", () => {
      const date = new Date("2024-06-15");
      const range = new DateRange(date, date);
      expect(range.durationInDays()).toBe(0);
    });
  });
});

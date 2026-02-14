import {
  getDateRange,
  getMonthsInRange,
  formatMonthShort,
  formatMonthYear,
} from "@/utils/date.utils";

describe("Date utilities", () => {
  describe("getDateRange", () => {
    it("week returns 7-day range", () => {
      const { start, end } = getDateRange("week");
      const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

      expect(diffDays).toBeGreaterThanOrEqual(6.9);
      expect(diffDays).toBeLessThanOrEqual(7.1);
    });

    it("month starts at the 1st of the current month", () => {
      const { start, end } = getDateRange("month");
      const now = new Date();

      expect(start.getDate()).toBe(1);
      expect(start.getMonth()).toBe(now.getMonth());
      expect(start.getFullYear()).toBe(now.getFullYear());
      expect(start <= end).toBe(true);
    });

    it("quarter returns ~90-day range", () => {
      const { start, end } = getDateRange("quarter");
      const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

      expect(diffDays).toBeGreaterThanOrEqual(88);
      expect(diffDays).toBeLessThanOrEqual(93);
    });

    it("year returns ~365-day range", () => {
      const { start, end } = getDateRange("year");
      const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

      expect(diffDays).toBeGreaterThanOrEqual(364);
      expect(diffDays).toBeLessThanOrEqual(367);
    });

    it("ytd starts at January 1 of the current year", () => {
      const { start } = getDateRange("ytd");

      expect(start.getMonth()).toBe(0);
      expect(start.getDate()).toBe(1);
      expect(start.getFullYear()).toBe(new Date().getFullYear());
    });

    it("returns end close to the current time", () => {
      const before = new Date();
      const { end } = getDateRange("week");
      const after = new Date();

      expect(end.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(end.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe("getMonthsInRange", () => {
    it("returns correct month-start array", () => {
      const start = new Date(2024, 0, 15); // Jan 15, 2024
      const end = new Date(2024, 2, 10); // Mar 10, 2024
      const months = getMonthsInRange(start, end);

      expect(months).toHaveLength(3);
      expect(months[0].getMonth()).toBe(0); // Jan
      expect(months[1].getMonth()).toBe(1); // Feb
      expect(months[2].getMonth()).toBe(2); // Mar
    });

    it("returns single month for same month range", () => {
      const start = new Date(2024, 5, 1);
      const end = new Date(2024, 5, 30);
      const months = getMonthsInRange(start, end);

      expect(months).toHaveLength(1);
      expect(months[0].getMonth()).toBe(5);
    });

    it("sets each date to the 1st of the month", () => {
      const start = new Date(2024, 3, 20);
      const end = new Date(2024, 5, 5);
      const months = getMonthsInRange(start, end);

      for (const month of months) {
        expect(month.getDate()).toBe(1);
      }
    });
  });

  describe("formatMonthShort", () => {
    it("formats month abbreviation", () => {
      expect(formatMonthShort(new Date(2024, 0, 1))).toBe("Jan");
      expect(formatMonthShort(new Date(2024, 5, 1))).toBe("Jun");
      expect(formatMonthShort(new Date(2024, 11, 1))).toBe("Dec");
    });
  });

  describe("formatMonthYear", () => {
    it("formats month and year", () => {
      const result = formatMonthYear(new Date(2024, 0, 1));

      expect(result).toBe("Jan 2024");
    });

    it("works for different months", () => {
      expect(formatMonthYear(new Date(2025, 8, 15))).toBe("Sep 2025");
    });
  });
});

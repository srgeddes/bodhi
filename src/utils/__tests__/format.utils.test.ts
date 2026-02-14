import {
  formatCurrency,
  formatDate,
  formatPercent,
  formatCompactNumber,
} from "@/utils/format.utils";

describe("Format utilities", () => {
  describe("formatCurrency", () => {
    it("formats positive amount", () => {
      expect(formatCurrency(1234.5)).toBe("$1,234.50");
    });

    it("formats negative amount", () => {
      const result = formatCurrency(-500);

      expect(result).toContain("500.00");
    });

    it("formats zero", () => {
      expect(formatCurrency(0)).toBe("$0.00");
    });

    it("formats different currency", () => {
      const result = formatCurrency(100, "EUR");

      // Intl formatting for EUR in en-US locale
      expect(result).toContain("100");
      expect(result).toContain("00");
    });
  });

  describe("formatDate", () => {
    // Use noon UTC to avoid timezone-induced date shifts
    const testDate = new Date("2024-06-15T12:00:00.000Z");

    it("formats with medium style by default", () => {
      const result = formatDate(testDate);

      expect(result).toContain("Jun");
      expect(result).toContain("15");
      expect(result).toContain("2024");
    });

    it("formats short style without year", () => {
      const result = formatDate(testDate, "short");

      // short = month/day only, e.g. "6/15"
      expect(result).toContain("6");
      expect(result).toContain("15");
    });

    it("formats long style with full month", () => {
      const result = formatDate(testDate, "long");

      expect(result).toContain("June");
      expect(result).toContain("15");
      expect(result).toContain("2024");
    });

    it("accepts string input", () => {
      const result = formatDate("2024-06-15T12:00:00.000Z");

      expect(result).toContain("Jun");
      expect(result).toContain("2024");
    });
  });

  describe("formatPercent", () => {
    it("formats decimal as percentage", () => {
      expect(formatPercent(0.252)).toBe("25.2%");
    });

    it("accepts custom decimals", () => {
      expect(formatPercent(0.2567, 2)).toBe("25.67%");
    });

    it("formats zero", () => {
      expect(formatPercent(0)).toBe("0.0%");
    });
  });

  describe("formatCompactNumber", () => {
    it("formats thousands", () => {
      const result = formatCompactNumber(1200);

      expect(result).toContain("1.2");
      expect(result.toUpperCase()).toContain("K");
    });

    it("formats millions", () => {
      const result = formatCompactNumber(2500000);

      expect(result).toContain("2.5");
      expect(result.toUpperCase()).toContain("M");
    });

    it("formats small numbers as-is", () => {
      const result = formatCompactNumber(42);

      expect(result).toBe("42");
    });
  });
});

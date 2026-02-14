import { ValidationError } from "@/domain/errors";

import { ConfidenceScore } from "../confidence-score.vo";

describe("ConfidenceScore", () => {
  describe("construction", () => {
    it("creates with valid value", () => {
      const score = new ConfidenceScore(0.5);
      expect(score.value).toBe(0.5);
    });

    it("creates with 0", () => {
      expect(new ConfidenceScore(0).value).toBe(0);
    });

    it("creates with 1", () => {
      expect(new ConfidenceScore(1).value).toBe(1);
    });

    it("throws ValidationError for value below 0", () => {
      expect(() => new ConfidenceScore(-0.1)).toThrow(ValidationError);
    });

    it("throws ValidationError for value above 1", () => {
      expect(() => new ConfidenceScore(1.1)).toThrow(ValidationError);
    });
  });

  describe("isHigh", () => {
    it("returns true for 0.8", () => {
      expect(new ConfidenceScore(0.8).isHigh()).toBe(true);
    });

    it("returns true for 0.95", () => {
      expect(new ConfidenceScore(0.95).isHigh()).toBe(true);
    });

    it("returns false for 0.79", () => {
      expect(new ConfidenceScore(0.79).isHigh()).toBe(false);
    });
  });

  describe("isMedium", () => {
    it("returns true for 0.5", () => {
      expect(new ConfidenceScore(0.5).isMedium()).toBe(true);
    });

    it("returns true for 0.7", () => {
      expect(new ConfidenceScore(0.7).isMedium()).toBe(true);
    });

    it("returns false for 0.8 (at high threshold)", () => {
      expect(new ConfidenceScore(0.8).isMedium()).toBe(false);
    });

    it("returns false for 0.49", () => {
      expect(new ConfidenceScore(0.49).isMedium()).toBe(false);
    });
  });

  describe("isLow", () => {
    it("returns true for 0.3", () => {
      expect(new ConfidenceScore(0.3).isLow()).toBe(true);
    });

    it("returns true for 0.49", () => {
      expect(new ConfidenceScore(0.49).isLow()).toBe(true);
    });

    it("returns false for 0.5", () => {
      expect(new ConfidenceScore(0.5).isLow()).toBe(false);
    });
  });

  describe("comparison", () => {
    it("equals returns true for same value", () => {
      const a = new ConfidenceScore(0.75);
      const b = new ConfidenceScore(0.75);
      expect(a.equals(b)).toBe(true);
    });

    it("equals returns false for different values", () => {
      const a = new ConfidenceScore(0.75);
      const b = new ConfidenceScore(0.85);
      expect(a.equals(b)).toBe(false);
    });
  });

  describe("formatting", () => {
    it("toString formats as a percentage with one decimal", () => {
      const score = new ConfidenceScore(0.85);
      expect(score.toString()).toBe("85.0%");
    });

    it("toString handles 50%", () => {
      const score = new ConfidenceScore(0.5);
      expect(score.toString()).toBe("50.0%");
    });
  });
});

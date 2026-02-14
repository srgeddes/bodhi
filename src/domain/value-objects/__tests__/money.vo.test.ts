import Decimal from "decimal.js";

import { ValidationError } from "@/domain/errors";

import { Money } from "../money.vo";

describe("Money", () => {
  describe("construction", () => {
    it("creates from number", () => {
      const money = new Money(100);
      expect(money.toNumber()).toBe(100);
      expect(money.currency).toBe("USD");
    });

    it("creates from string", () => {
      const money = new Money("99.99", "EUR");
      expect(money.toNumber()).toBe(99.99);
      expect(money.currency).toBe("EUR");
    });

    it("creates from Decimal", () => {
      const money = new Money(new Decimal("42.10"), "GBP");
      expect(money.toNumber()).toBe(42.1);
      expect(money.currency).toBe("GBP");
    });

    it("normalizes currency to uppercase", () => {
      const money = new Money(10, "eur");
      expect(money.currency).toBe("EUR");
    });

    it("defaults currency to USD", () => {
      const money = new Money(0);
      expect(money.currency).toBe("USD");
    });
  });

  describe("arithmetic", () => {
    it("adds two Money values", () => {
      const a = new Money(10);
      const b = new Money(20);
      const result = a.add(b);
      expect(result.toNumber()).toBe(30);
      expect(result.currency).toBe("USD");
    });

    it("subtracts two Money values", () => {
      const a = new Money(50);
      const b = new Money(20);
      expect(a.subtract(b).toNumber()).toBe(30);
    });

    it("multiplies by a numeric factor", () => {
      const money = new Money(25);
      expect(money.multiply(3).toNumber()).toBe(75);
    });

    it("negates the amount", () => {
      const money = new Money(15);
      expect(money.negate().toNumber()).toBe(-15);
    });

    it("throws ValidationError when adding with mismatched currency", () => {
      const usd = new Money(10, "USD");
      const eur = new Money(10, "EUR");
      expect(() => usd.add(eur)).toThrow(ValidationError);
    });

    it("throws ValidationError when subtracting with mismatched currency", () => {
      const usd = new Money(10, "USD");
      const eur = new Money(10, "EUR");
      expect(() => usd.subtract(eur)).toThrow(ValidationError);
    });
  });

  describe("predicates", () => {
    it("isPositive returns true for positive amounts", () => {
      expect(new Money(5).isPositive()).toBe(true);
    });

    it("isNegative returns true for negative amounts", () => {
      expect(new Money(-5).isNegative()).toBe(true);
    });

    it("isZero returns true for zero amount", () => {
      expect(new Money(0).isZero()).toBe(true);
    });

    it("isZero returns false for non-zero amount", () => {
      expect(new Money(0.01).isZero()).toBe(false);
    });
  });

  describe("comparison", () => {
    it("equals returns true for same amount and currency", () => {
      const a = new Money(10, "USD");
      const b = new Money(10, "USD");
      expect(a.equals(b)).toBe(true);
    });

    it("equals returns false for different amounts", () => {
      const a = new Money(10, "USD");
      const b = new Money(20, "USD");
      expect(a.equals(b)).toBe(false);
    });

    it("equals returns false for different currencies", () => {
      const a = new Money(10, "USD");
      const b = new Money(10, "EUR");
      expect(a.equals(b)).toBe(false);
    });
  });

  describe("formatting", () => {
    it("toString formats with 2 decimal places and currency", () => {
      const money = new Money(10, "USD");
      expect(money.toString()).toBe("10.00 USD");
    });

    it("toNumber returns a JavaScript number", () => {
      const money = new Money("99.95");
      expect(typeof money.toNumber()).toBe("number");
      expect(money.toNumber()).toBe(99.95);
    });
  });
});

import Decimal from "decimal.js";
import { ValidationError } from "@/domain/errors";

export class Money {
  readonly amount: Decimal;
  readonly currency: string;

  constructor(amount: number | string | Decimal, currency: string = "USD") {
    this.amount = new Decimal(amount);
    this.currency = currency.toUpperCase();
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amount.plus(other.amount), this.currency);
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amount.minus(other.amount), this.currency);
  }

  multiply(factor: number | Decimal): Money {
    return new Money(this.amount.times(factor), this.currency);
  }

  negate(): Money {
    return new Money(this.amount.negated(), this.currency);
  }

  isPositive(): boolean {
    return this.amount.isPositive();
  }

  isNegative(): boolean {
    return this.amount.isNegative();
  }

  isZero(): boolean {
    return this.amount.isZero();
  }

  equals(other: Money): boolean {
    return this.currency === other.currency && this.amount.equals(other.amount);
  }

  toNumber(): number {
    return this.amount.toNumber();
  }

  toString(): string {
    return `${this.amount.toFixed(2)} ${this.currency}`;
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new ValidationError(
        `Currency mismatch: cannot operate on ${this.currency} and ${other.currency}`
      );
    }
  }
}

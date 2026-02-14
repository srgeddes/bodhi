import { ValidationError } from "@/domain/errors";

export class ConfidenceScore {
  readonly value: number;

  constructor(value: number) {
    if (value < 0 || value > 1) {
      throw new ValidationError(`ConfidenceScore must be between 0 and 1, got ${value}`);
    }
    this.value = value;
  }

  isHigh(): boolean {
    return this.value >= 0.8;
  }

  isMedium(): boolean {
    return this.value >= 0.5 && this.value < 0.8;
  }

  isLow(): boolean {
    return this.value < 0.5;
  }

  equals(other: ConfidenceScore): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return `${(this.value * 100).toFixed(1)}%`;
  }
}

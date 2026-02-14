import { ValidationError } from "@/domain/errors";

export class DateRange {
  readonly start: Date;
  readonly end: Date;

  constructor(start: Date, end: Date) {
    if (start > end) {
      throw new ValidationError("DateRange start must be before or equal to end");
    }
    this.start = start;
    this.end = end;
  }

  contains(date: Date): boolean {
    return date >= this.start && date <= this.end;
  }

  overlaps(other: DateRange): boolean {
    return this.start <= other.end && this.end >= other.start;
  }

  durationInDays(): number {
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.round((this.end.getTime() - this.start.getTime()) / msPerDay);
  }
}

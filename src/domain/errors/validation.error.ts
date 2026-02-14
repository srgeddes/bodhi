import { AppError } from "./base.error";

export class ValidationError extends AppError {
  readonly statusCode = 400;
  readonly fieldErrors?: Record<string, string[]>;

  constructor(message: string, fieldErrors?: Record<string, string[]>) {
    super(message);
    this.fieldErrors = fieldErrors;
  }
}

import { AppError } from "./base.error";

export class ConflictError extends AppError {
  readonly statusCode = 409;

  constructor(message: string) {
    super(message);
  }
}

import { AppError } from "./base.error";

export class ForbiddenError extends AppError {
  readonly statusCode = 403;

  constructor(message: string = "Forbidden") {
    super(message);
  }
}

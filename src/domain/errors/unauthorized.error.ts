import { AppError } from "./base.error";

export class UnauthorizedError extends AppError {
  readonly statusCode = 401;

  constructor(message: string = "Unauthorized") {
    super(message);
  }
}

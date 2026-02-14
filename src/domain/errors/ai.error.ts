import { AppError } from "./base.error";

export class AiError extends AppError {
  readonly statusCode = 502;

  constructor(message: string = "AI service error") {
    super(message);
  }
}

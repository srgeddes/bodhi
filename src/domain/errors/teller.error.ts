import { AppError } from "./base.error";

export class TellerError extends AppError {
  readonly statusCode = 502;
  readonly tellerErrorCode: string;

  constructor(message: string, tellerErrorCode: string) {
    super(message);
    this.tellerErrorCode = tellerErrorCode;
  }
}

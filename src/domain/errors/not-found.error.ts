import { AppError } from "./base.error";

export class NotFoundError extends AppError {
  readonly statusCode = 404;

  constructor(entityName: string, id?: string) {
    super(id ? `${entityName} with id '${id}' not found` : entityName);
  }
}

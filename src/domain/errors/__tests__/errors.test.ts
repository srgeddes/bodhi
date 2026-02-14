import {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  TellerError,
  AiError,
} from "@/domain/errors";

describe("Error hierarchy", () => {
  describe("ValidationError", () => {
    it("has statusCode 400", () => {
      const error = new ValidationError("Invalid input");
      expect(error.statusCode).toBe(400);
    });

    it("is an instance of AppError and Error", () => {
      const error = new ValidationError("Invalid");
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(Error);
    });

    it("stores fieldErrors when provided", () => {
      const fieldErrors = { email: ["Required", "Must be valid"] };
      const error = new ValidationError("Validation failed", fieldErrors);
      expect(error.fieldErrors).toEqual(fieldErrors);
    });

    it("has undefined fieldErrors when not provided", () => {
      const error = new ValidationError("Validation failed");
      expect(error.fieldErrors).toBeUndefined();
    });

    it("has name set to ValidationError", () => {
      const error = new ValidationError("Invalid input");
      expect(error.name).toBe("ValidationError");
    });
  });

  describe("UnauthorizedError", () => {
    it("has statusCode 401", () => {
      const error = new UnauthorizedError();
      expect(error.statusCode).toBe(401);
      expect(error).toBeInstanceOf(AppError);
    });

    it("has default message", () => {
      expect(new UnauthorizedError().message).toBe("Unauthorized");
    });

    it("accepts a custom message", () => {
      const error = new UnauthorizedError("Token expired");
      expect(error.message).toBe("Token expired");
    });

    it("has name set to UnauthorizedError", () => {
      expect(new UnauthorizedError().name).toBe("UnauthorizedError");
    });
  });

  describe("ForbiddenError", () => {
    it("has statusCode 403", () => {
      const error = new ForbiddenError();
      expect(error.statusCode).toBe(403);
      expect(error).toBeInstanceOf(AppError);
    });

    it("has default message", () => {
      expect(new ForbiddenError().message).toBe("Forbidden");
    });

    it("has name set to ForbiddenError", () => {
      expect(new ForbiddenError().name).toBe("ForbiddenError");
    });
  });

  describe("NotFoundError", () => {
    it("has statusCode 404 and message includes entity name and id", () => {
      const error = new NotFoundError("User", "abc-123");
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe("User with id 'abc-123' not found");
    });

    it("is an instance of AppError", () => {
      const error = new NotFoundError("Account", "xyz");
      expect(error).toBeInstanceOf(AppError);
    });

    it("has name set to NotFoundError", () => {
      const error = new NotFoundError("Widget", "w-1");
      expect(error.name).toBe("NotFoundError");
    });
  });

  describe("ConflictError", () => {
    it("has statusCode 409", () => {
      const error = new ConflictError("Email already exists");
      expect(error.statusCode).toBe(409);
      expect(error.message).toBe("Email already exists");
    });

    it("has name set to ConflictError", () => {
      const error = new ConflictError("Duplicate");
      expect(error.name).toBe("ConflictError");
    });
  });

  describe("TellerError", () => {
    it("has statusCode 502 and stores tellerErrorCode", () => {
      const error = new TellerError("Institution down", "INSTITUTION_DOWN");
      expect(error.statusCode).toBe(502);
      expect(error.tellerErrorCode).toBe("INSTITUTION_DOWN");
      expect(error.message).toBe("Institution down");
    });

    it("has name set to TellerError", () => {
      const error = new TellerError("Teller failure", "UNAUTHORIZED");
      expect(error.name).toBe("TellerError");
    });
  });

  describe("AiError", () => {
    it("has statusCode 502 and default message", () => {
      const error = new AiError();
      expect(error.statusCode).toBe(502);
      expect(error.message).toBe("AI service error");
    });

    it("accepts a custom message", () => {
      const error = new AiError("Model timeout");
      expect(error.message).toBe("Model timeout");
    });

    it("has name set to AiError", () => {
      expect(new AiError().name).toBe("AiError");
    });
  });
});

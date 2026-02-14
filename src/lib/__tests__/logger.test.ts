import { logger } from "../logger";

describe("logger", () => {
  beforeEach(() => {
    jest.spyOn(console, "debug").mockImplementation();
    jest.spyOn(console, "info").mockImplementation();
    jest.spyOn(console, "warn").mockImplementation();
    jest.spyOn(console, "error").mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("exposes debug, info, warn, and error methods", () => {
    expect(typeof logger.debug).toBe("function");
    expect(typeof logger.info).toBe("function");
    expect(typeof logger.warn).toBe("function");
    expect(typeof logger.error).toBe("function");
  });

  it("logger.info calls console.info with a formatted message", () => {
    logger.info("Server started");

    expect(console.info).toHaveBeenCalledTimes(1);
    const output = (console.info as jest.Mock).mock.calls[0][0] as string;
    expect(output).toContain("Server started");
    expect(output).toContain("[INFO]");
  });

  it("logger.error calls console.error with a formatted message", () => {
    logger.error("Connection failed", { code: "ECONNREFUSED" });

    expect(console.error).toHaveBeenCalledTimes(1);
    const output = (console.error as jest.Mock).mock.calls[0][0] as string;
    expect(output).toContain("Connection failed");
    expect(output).toContain("[ERROR]");
    expect(output).toContain("ECONNREFUSED");
  });

  it("logger.warn calls console.warn", () => {
    logger.warn("Deprecation notice");

    expect(console.warn).toHaveBeenCalledTimes(1);
    const output = (console.warn as jest.Mock).mock.calls[0][0] as string;
    expect(output).toContain("Deprecation notice");
  });

  it("logger.debug calls console.debug in non-production", () => {
    logger.debug("Verbose detail");

    expect(console.debug).toHaveBeenCalledTimes(1);
    const output = (console.debug as jest.Mock).mock.calls[0][0] as string;
    expect(output).toContain("Verbose detail");
  });

  it("includes context object in the formatted output", () => {
    logger.info("Request received", { method: "GET", path: "/api/accounts" });

    const output = (console.info as jest.Mock).mock.calls[0][0] as string;
    expect(output).toContain("GET");
    expect(output).toContain("/api/accounts");
  });
});

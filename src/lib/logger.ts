type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel: LogLevel =
  (process.env.LOG_LEVEL as LogLevel) ?? (process.env.NODE_ENV === "production" ? "info" : "debug");

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

const SENSITIVE_KEYS = new Set([
  "password",
  "passwordhash",
  "token",
  "accesstoken",
  "refreshtoken",
  "secret",
  "apikey",
  "authorization",
  "cookie",
  "encryptionkey",
]);

function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEYS.has(key.toLowerCase());
}

function sanitize(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (isSensitiveKey(key)) {
      result[key] = "[REDACTED]";
    } else if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      result[key] = sanitize(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result;
}

function formatMessage(level: LogLevel, message: string, context?: Record<string, unknown>): string {
  const safeContext = context ? sanitize(context) : undefined;
  if (process.env.NODE_ENV === "production") {
    return JSON.stringify({ level, message, ...safeContext, timestamp: new Date().toISOString() });
  }
  const prefix = `[${level.toUpperCase()}]`;
  const contextStr = safeContext ? ` ${JSON.stringify(safeContext)}` : "";
  return `${prefix} ${message}${contextStr}`;
}

export const logger = {
  debug(message: string, context?: Record<string, unknown>): void {
    if (shouldLog("debug")) console.debug(formatMessage("debug", message, context));
  },
  info(message: string, context?: Record<string, unknown>): void {
    if (shouldLog("info")) console.info(formatMessage("info", message, context));
  },
  warn(message: string, context?: Record<string, unknown>): void {
    if (shouldLog("warn")) console.warn(formatMessage("warn", message, context));
  },
  error(message: string, context?: Record<string, unknown>): void {
    if (shouldLog("error")) console.error(formatMessage("error", message, context));
  },
};

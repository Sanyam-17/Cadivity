import "server-only";

type Level = "info" | "warn" | "error";

type LogData = Record<string, unknown>;

function write(level: Level, message: string, data?: LogData) {
  const payload = {
    ts: new Date().toISOString(),
    level,
    message,
    ...data,
  };
  const line = JSON.stringify(payload);
  if (level === "error") {
    console.error(line);
    return;
  }
  if (level === "warn") {
    console.warn(line);
    return;
  }
  console.log(line);
}

export const logger = {
  info: (message: string, data?: LogData) => write("info", message, data),
  warn: (message: string, data?: LogData) => write("warn", message, data),
  error: (message: string, data?: LogData) => write("error", message, data),
};

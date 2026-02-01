import winston from "winston";

const { combine, timestamp, printf, colorize, errors } = winston.format;

const customFormat = printf(({ level, message, timestamp: ts, stack }) => {
  const time = ts || new Date().toISOString();
  if (stack) {
    return `${time} ${level}: ${message} - ${stack}`;
  }
  return `${time} ${level}: ${message}`;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(
    errors({ stack: true }),
    timestamp(),
    colorize({ all: process.env.NODE_ENV !== "production" }),
    customFormat
  ),
  transports: [
    new winston.transports.Console({
      stderrLevels: ["error"],
    }),
  ],
  exitOnError: false,
});

export default logger;

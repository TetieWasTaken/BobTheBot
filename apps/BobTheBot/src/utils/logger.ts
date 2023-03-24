import { pino } from "pino";

/**
 * Logger for the application
 */
export const logger = pino({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: true,
    },
  },
  level: "trace",
});

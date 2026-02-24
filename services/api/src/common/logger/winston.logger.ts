import * as winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, context, stack }) => {
  const log = {
    timestamp,
    level,
    context: context || 'App',
    message,
  };

  if (stack) {
    log['stack'] = stack;
  }

  return JSON.stringify(log);
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat,
  ),
  defaultMeta: { service: 'p2pspb-api' },
  transports: [
    // Console
    new winston.transports.Console({
      format: combine(colorize(), logFormat),
    }),
    // File: errors
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    // File: all
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
  ],
});

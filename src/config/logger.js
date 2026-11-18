import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',

  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),

  defaultMeta: {
    service: 'acquisitions-api',
  },

  transports: [
    // Docker collects logs from stdout/stderr
    new winston.transports.Console(),

    // File logging only in development
    ...(process.env.NODE_ENV !== 'production'
      ? [
          new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
          }),

          new winston.transports.File({
            filename: 'logs/combined.log',
          }),
        ]
      : []),
  ],
});

export default logger;

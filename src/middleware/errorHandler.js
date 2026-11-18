import logger from '../config/logger.js';

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode =
    Number.isInteger(err.statusCode) &&
    err.statusCode >= 400 &&
    err.statusCode < 600
      ? err.statusCode
      : 500;

  logger.error('Application error', {
    message: err.message,
    method: req.method,
    url: req.originalUrl,
    stack: err.stack,
  });

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? 'Internal server error' : err.message,
  });
};

export default errorHandler;

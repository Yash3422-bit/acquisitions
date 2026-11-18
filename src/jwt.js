import jwt from 'jsonwebtoken';
import logger from './config/logger.js';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not configured');
}

export const jwttoken = {
  sign: (payload) => {
    try {
      return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
      });
    } catch (error) {
      logger.error('Failed to generate JWT token', {
        message: error.message,
        stack: error.stack,
      });

      throw new Error('Failed to generate JWT token', {
        cause: error,
      });
    }
  },

  verify: (token) => {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      logger.warn('JWT verification failed', {
        message: error.message,
      });

      throw error;
    }
  },
};

import express from 'express';
import logger from '../config/logger.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// POST /api/auth
router.post('/', (req, res) => {
  logger.info('Auth API endpoint accessed');

  res.status(200).json({
    message: 'Acquisitions Auth API is working!',
  });
});

// POST /api/auth/sign-up
router.post('/sign-up', authLimiter, (req, res) => {
  logger.info('User sign-up endpoint accessed');

  res.send('POST /api/auth/sign-up response');
});

// POST /api/auth/sign-in
router.post('/sign-in', authLimiter, (req, res) => {
  logger.info('User sign-in endpoint accessed');

  res.send('POST /api/auth/sign-in response');
});

// POST /api/auth/sign-out
router.post('/sign-out', (req, res) => {
  logger.info('User sign-out endpoint accessed');

  res.send('POST /api/auth/sign-out response');
});

// GET /api/auth/profile
router.get('/profile', authMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Protected profile accessed successfully',
    user: req.user,
  });
});

export default router;

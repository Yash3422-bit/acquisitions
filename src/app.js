import express from 'express';
import logger from './config/logger.js';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import requestLogger from './middleware/requestLogger.js';
import errorHandler from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimiter.js';

const app = express();

// Security middleware
app.use(helmet());

const allowedOrigins = [process.env.CLIENT_URL].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    credentials: true,
  })
);

// Request body size limits
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(cookieParser());
app.use(requestLogger);

app.use(
  morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

// General API rate limiting
app.use('/api', generalLimiter);

// Health check
app.get('/', (req, res) => {
  logger.info('Hello from Acquisitions!');

  res.status(200).send('Hello from Acquisition!');
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/api/auth', (req, res) => {
  res.status(200).json({ message: 'Acquisitions API is running!' });
});

app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'Acquisitions API is running!',
    status: 'OK',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Centralized error handler (keep last)
app.use(errorHandler);

export default app;

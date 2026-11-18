import { eq } from 'drizzle-orm';
import { jwttoken } from '../jwt.js';
import { db } from '../config/database.js';
import { users } from '../models/user.model.js';

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token is required',
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token is required',
      });
    }

    const decoded = jwttoken.verify(token);

    if (!Number.isInteger(decoded.userId) || decoded.userId <= 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token',
      });
    }

    const [user] = await db
      .select({
        id: users.id,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, decoded.userId));

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account no longer exists',
      });
    }

    req.user = {
      userId: user.id,
      role: user.role,
    };

    next();
  } catch (error) {
    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError' ||
      error.name === 'NotBeforeError'
    ) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication token',
      });
    }

    next(error);
  }
};

export default authMiddleware;

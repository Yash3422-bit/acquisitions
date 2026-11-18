import bcrypt from 'bcryptjs';
import { and, eq } from 'drizzle-orm';
import { db } from '../config/database.js';
import { users } from '../models/user.model.js';
import logger from '../config/logger.js';

// CREATE USER
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required',
      });
    }

    if (
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof password !== 'string'
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input types',
      });
    }

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (
      !normalizedName ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid name and email',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const [newUser] = await db
      .insert(users)
      .values({
        name: normalizedName,
        email: normalizedEmail,
        password: hashedPassword,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
      });

    logger.info('User created successfully', {
      userId: newUser.id,
    });

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: newUser,
    });
  } catch (error) {
    let dbError = error;

    while (dbError && dbError.code !== '23505' && dbError.cause) {
      dbError = dbError.cause;
    }

    if (dbError?.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Email already exists',
      });
    }

    next(error);
  }
};

// GET ALL USERS - ADMIN ONLY
export const getAllUsers = async (req, res, next) => {
  try {
    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
      })
      .from(users);

    return res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      count: allUsers.length,
      users: allUsers,
    });
  } catch (error) {
    next(error);
  }
};

// GET USER BY ID - OWNER OR ADMIN
export const getUserById = async (req, res, next) => {
  try {
    const userId = Number(req.params.id);

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID',
      });
    }

    const conditions = [eq(users.id, userId)];

    if (req.user.role !== 'admin') {
      conditions.push(eq(users.id, req.user.userId));
    }

    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      })
      .from(users)
      .where(and(...conditions));

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE USER - OWNER OR ADMIN
export const updateUser = async (req, res, next) => {
  try {
    const userId = Number(req.params.id);
    const { name, email, password } = req.body;

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID',
      });
    }

    if (name === undefined && email === undefined && password === undefined) {
      return res.status(400).json({
        success: false,
        message: 'At least one field is required to update',
      });
    }

    const updateData = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Name must be a non-empty string',
        });
      }

      updateData.name = name.trim();
    }

    if (email !== undefined) {
      if (
        typeof email !== 'string' ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
      ) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email',
        });
      }

      updateData.email = email.trim().toLowerCase();
    }

    if (password !== undefined) {
      if (typeof password !== 'string' || password.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 8 characters long',
        });
      }

      updateData.password = await bcrypt.hash(password, 12);
    }

    const conditions = [eq(users.id, userId)];

    if (req.user.role !== 'admin') {
      conditions.push(eq(users.id, req.user.userId));
    }

    const [updatedUser] = await db
      .update(users)
      .set({
        ...updateData,
        updated_at: new Date(),
      })
      .where(and(...conditions))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      });

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    logger.info('User updated successfully', {
      userId: updatedUser.id,
    });

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    let dbError = error;

    while (dbError && dbError.code !== '23505' && dbError.cause) {
      dbError = dbError.cause;
    }

    if (dbError?.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Email already exists',
      });
    }

    next(error);
  }
};

// DELETE USER - ADMIN ONLY
export const deleteUser = async (req, res, next) => {
  try {
    const userId = Number(req.params.id);

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID',
      });
    }

    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
      });

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    logger.info('User deleted successfully', {
      userId: deletedUser.id,
    });

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      user: deletedUser,
    });
  } catch (error) {
    next(error);
  }
};

import 'dotenv/config';

import jwt from 'jsonwebtoken';
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Authorization API', () => {
  it('should reject normal users from admin-only routes', async () => {
    const token = jwt.sign(
      { userId: 5, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const response = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      'Access denied. Admin privileges required'
    );
  });

  it('should prevent users from accessing another user profile', async () => {
    const token = jwt.sign(
      { userId: 5, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const response = await request(app)
      .get('/api/users/1')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');
  });

  it('should prevent users from updating another user profile', async () => {
    const token = jwt.sign(
      { userId: 5, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const response = await request(app)
      .put('/api/users/1')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Unauthorized Update Test' });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');
  });
});

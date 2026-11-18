import 'dotenv/config';

import jwt from 'jsonwebtoken';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import request from 'supertest';

vi.mock('../src/config/database.js', () => ({
  db: {
    select: vi.fn(),
    update: vi.fn(),
  },
  sql: vi.fn(),
}));

import { db } from '../src/config/database.js';
import app from '../src/app.js';

const normalUser = [{ id: 5, role: 'user' }];

const mockSelectResults = (results) => {
  db.select.mockImplementation(() => ({
    from: () => ({
      where: () => Promise.resolve(results.shift()),
    }),
  }));
};

const createToken = () =>
  jwt.sign({ userId: 5, role: 'user' }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });

describe('Authorization API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should reject normal users from admin-only routes', async () => {
    mockSelectResults([[...normalUser]]);

    const response = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${createToken()}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      'Access denied. Admin privileges required'
    );
  });

  it('should prevent users from accessing another user profile', async () => {
    mockSelectResults([[...normalUser], []]);

    const response = await request(app)
      .get('/api/users/1')
      .set('Authorization', `Bearer ${createToken()}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');
  });

  it('should prevent users from updating another user profile', async () => {
    mockSelectResults([[...normalUser]]);

    db.update.mockReturnValue({
      set: () => ({
        where: () => ({
          returning: () => Promise.resolve([]),
        }),
      }),
    });

    const response = await request(app)
      .put('/api/users/1')
      .set('Authorization', `Bearer ${createToken()}`)
      .send({ name: 'Unauthorized Update Test' });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');
  });
});

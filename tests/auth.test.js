import 'dotenv/config';

import jwt from 'jsonwebtoken';
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Authentication API', () => {
  it('should reject requests without an authentication token', async () => {
    const response = await request(app).get('/api/users/5');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Authentication token is required');
  });

  it('should reject invalid authentication tokens', async () => {
    const response = await request(app)
      .get('/api/users/5')
      .set('Authorization', 'Bearer invalid.fake.token');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(
      'Invalid or expired authentication token'
    );
  });

  it('should reject expired authentication tokens', async () => {
    const token = jwt.sign({ userId: 5 }, process.env.JWT_SECRET, {
      expiresIn: '0s',
    });

    const response = await request(app)
      .get('/api/users/5')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(
      'Invalid or expired authentication token'
    );
  });
});

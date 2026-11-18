import 'dotenv/config';

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Health API', () => {
  it('should return 200 when health endpoint is accessed', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('OK');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime');
  });

  it('should return 404 for an unknown route', async () => {
    const response = await request(app).get('/api/unknown-route');

    expect(response.status).toBe(404);
  });
});

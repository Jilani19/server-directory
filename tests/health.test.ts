import request from 'supertest';
import express from 'express';
import { healthRoutes } from '../src/domains/health/HealthRoutes';
import { errorHandler } from '../src/middleware/errorHandler';

const app = express();
app.use(express.json());
app.use('/api/v1/health', healthRoutes);
app.use(errorHandler);

describe('Health Diagnostic Endpoints', () => {
  it('GET /api/v1/health/liveness should return UP', async () => {
    const res = await request(app).get('/api/v1/health/liveness');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('UP');
    expect(res.body.meta.timestamp).toBeDefined();
  });

  it('GET /api/v1/health/readiness should return READY', async () => {
    const res = await request(app).get('/api/v1/health/readiness');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('READY');
  });

  it('GET /api/v1/health/version should return 1.0.0', async () => {
    const res = await request(app).get('/api/v1/health/version');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.version).toBe('1.0.0');
  });
});

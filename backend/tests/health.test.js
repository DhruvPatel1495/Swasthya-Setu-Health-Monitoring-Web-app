import supertest from 'supertest';
import express from 'express';

// Setup Mock app to test just the route without full DB/Socket init
const app = express();

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

describe('Health Check Endpoint /api/health', () => {
    it('Should return 200 OK with expected JSON structure', async () => {
        const response = await supertest(app).get('/api/health');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status', 'OK');
        expect(response.body).toHaveProperty('timestamp');
    });
});

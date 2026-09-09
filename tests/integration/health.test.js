import request from 'supertest';
import { test, expect } from 'vitest';
import app from '../../api/app.js';

test('GET /health returns 200', async() => {
	const response = await request(app)
		.get('/health');

	expect(response.statusCode).toBe(200);
});


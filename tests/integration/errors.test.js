import express from 'express';
import request from 'supertest';
import { describe, test, expect } from 'vitest';
import errorHandler from '../../api/middleware/error.handler.js';
import ApiError, { ClientError, ValidationError } from '../../api/utils/errors.js';

const app = express();
app.use(express.json());

app.get('/mongoose-validation-error', () => {
    const error = new Error('Account validation failed');
    error.name = 'ValidationError';
    error.errors = {
        bvn: { path: 'bvn', message: 'bvn is required' }
    };
    throw error;
});

app.get('/client-error', () => {
    throw new ClientError('invalid account id', { status: 400 });
});

app.get('/validation-error', () => {
    throw new ValidationError('bvn must be 11 digits');
});

app.get('/api-error', () => {
    throw new ApiError('unable to reach nibss', { status: 502 });
});

app.get('/unexpected-error', () => {
    throw new Error('boom');
});

app.use(errorHandler);

describe('global error handler', () => {
    test('maps mongoose ValidationError to 422 with details', async () => {
        const response = await request(app).get('/mongoose-validation-error');

        expect(response.statusCode).toBe(422);
        expect(response.body.error.status).toBe(422);
        expect(response.body.error.message).toBe('Account validation failed');
        expect(response.body.error.details).toEqual([
            { field: 'bvn', message: 'bvn is required' }
        ]);
    });

    test('passes through ClientError status and message', async () => {
        const response = await request(app).get('/client-error');

        expect(response.statusCode).toBe(400);
        expect(response.body.error.status).toBe(400);
        expect(response.body.error.message).toBe('invalid account id');
        expect(response.body.error.details).toBeUndefined();
    });

    test('defaults custom ValidationError to 422', async () => {
        const response = await request(app).get('/validation-error');

        expect(response.statusCode).toBe(422);
        expect(response.body.error.status).toBe(422);
        expect(response.body.error.message).toBe('bvn must be 11 digits');
        expect(response.body.error.details).toBeUndefined();
    });

    test('passes through ApiError status and message', async () => {
        const response = await request(app).get('/api-error');

        expect(response.statusCode).toBe(502);
        expect(response.body.error.status).toBe(502);
        expect(response.body.error.message).toBe('unable to reach nibss');
        expect(response.body.error.details).toBeUndefined();
    });

    test('returns 500 for unexpected errors', async () => {
        const response = await request(app).get('/unexpected-error');

        expect(response.statusCode).toBe(500);
        expect(response.body.error.status).toBe(500);
        expect(response.body.error.message).toBe('boom');
        expect(response.body.error.details).toBeUndefined();
    });
});

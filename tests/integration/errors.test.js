import request from 'supertest';
import app from '../../api/app.js';

describe('global error handler', () => {
    test('maps ValidationError to 422 with details', async () => {
        const response = await request(app)
            .post('/accounts')
            .send({ firstName: 'John' });

        expect(response.statusCode).toBe(422);
        expect(response.body.error.status).toBe(422);
        expect(response.body.error.message).toBeDefined();
        expect(response.body.error.details[0].message).toBeDefined();
    });

    test('returns 500 for unexpected errors', async () => {
        const response = await request(app)
            .post('/accounts')
            .send({
                firstName: 'John',
                lastName: 'Doe',
                dob: '2000-01-01',
                bvn: '12345678901',
                password: 'password123'
            });

        expect(response.statusCode).toBe(500);
        expect(response.body.error.status).toBe(500);
        expect(response.body.error.message).toBe('Something went wrong');
    });
});

import request from 'supertest';
import mongoose from 'mongoose';
import { test, expect, vi, beforeAll, afterAll, beforeEach } from 'vitest';
import app from '../../api/app.js';
import Account from '../../api/models/account.model.js';
import nibss from '../../api/clients/nibss.client.js';
import { verifyToken } from '../../api/utils/jwt.js';

vi.mock('../../api/clients/nibss.client.js', () => ({
    default: {
        verifyBvn: vi.fn(),
        verifyNin: vi.fn(),
        createAccount: vi.fn()
    }
}));

const signupBody = {
    email: 'john@example.com',
    dob: '2000-01-01',
    bvn: '12345678901',
    password: 'password123'
};

const loginBody = {
    email: 'john@example.com',
    password: 'password123'
};

const testDbUri = new URL(process.env.MONGODB_URI);
testDbUri.pathname = '/lly-bank-test';

beforeAll(async () => {
    await mongoose.connect(testDbUri.href);
});

afterAll(async () => {
    await mongoose.disconnect();
});

beforeEach(async () => {
    await Account.deleteMany({});
    vi.clearAllMocks();
    nibss.verifyBvn.mockResolvedValue({ firstName: 'John', lastName: 'Doe' });
    nibss.createAccount.mockResolvedValue('0123456789');

    await request(app).post('/accounts').send(signupBody);
});

test('POST /auth/login returns a valid token for correct credentials', async () => {
    const response = await request(app).post('/auth/login').send(loginBody);

    expect(response.statusCode).toBe(200);
    expect(typeof response.body.data.token).toBe('string');

    const payload = verifyToken(response.body.data.token);
    const account = await Account.findOne({ email: 'john@example.com' });
    expect(payload.sub).toBe(String(account._id));
});

test('POST /auth/login rejects a wrong password', async () => {
    const response = await request(app).post('/auth/login').send({
        ...loginBody,
        password: 'wrongpassword'
    });

    expect(response.statusCode).toBe(401);
});

test('POST /auth/login rejects an unknown email', async () => {
    const response = await request(app).post('/auth/login').send({
        ...loginBody,
        email: 'nobody@example.com'
    });

    expect(response.statusCode).toBe(401);
});

test('POST /auth/login rejects a missing email or password', async () => {
    for (const field of ['email', 'password']) {
        const body = { ...loginBody };
        delete body[field];

        const response = await request(app).post('/auth/login').send(body);

        expect(response.statusCode).toBe(422);
    }
});

test('POST /auth/login rejects an empty or non-string email or password', async () => {
    for (const value of ['', '   ', 123]) {
        for (const field of ['email', 'password']) {
            const body = { ...loginBody };
            body[field] = value;

            const response = await request(app).post('/auth/login').send(body);

            expect(response.statusCode).toBe(422);
        }
    }
});

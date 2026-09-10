import request from 'supertest';
import mongoose from 'mongoose';
import { test, expect, vi, beforeAll, afterAll, beforeEach } from 'vitest';
import app from '../../api/app.js';
import Account from '../../api/models/account.model.js';
import nibss from '../../api/clients/nibss.client.js';

vi.mock('../../api/clients/nibss.client.js', () => ({
    default: {
        verifyBvn: vi.fn(),
        verifyNin: vi.fn(),
        createAccount: vi.fn(),
        createBvn: vi.fn(),
        createNin: vi.fn()
    }
}));

const customerBody = {
    email: 'john@example.com',
    dob: '2000-01-01',
    bvn: '12345678901',
    password: 'password123'
};

const adminBody = {
    email: process.env.ADMIN_EMAIL,
    dob: '1990-01-01',
    bvn: '12345678909',
    password: 'password123'
};

const bvnRecord = {
    bvn: '11111111111',
    firstName: 'Jane',
    lastName: 'Doe',
    dob: '1995-05-10',
    phone: '08012345678'
};

const ninRecord = {
    nin: '22222222222',
    firstName: 'Jake',
    lastName: 'Doe',
    dob: '1993-03-03'
};

async function login(email) {
    const response = await request(app)
        .post('/api/auth/login')
        .send({ email, password: 'password123' });
    return response.body.data.token;
}

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
    nibss.createAccount
        .mockResolvedValueOnce('0123456789')
        .mockResolvedValueOnce('9876543210');
    nibss.createBvn.mockResolvedValue({ data: bvnRecord });
    nibss.createNin.mockResolvedValue({ data: ninRecord });

    await request(app).post('/api/accounts').send(customerBody);
    await request(app).post('/api/accounts').send(adminBody);
});

test('POST /admin/bvn rejects an unauthenticated request', async () => {
    const response = await request(app).post('/api/admin/bvn').send(bvnRecord);

    expect(response.statusCode).toBe(401);
});

test('POST /admin/bvn rejects a customer token', async () => {
    const token = await login(customerBody.email);

    const response = await request(app)
        .post('/api/admin/bvn')
        .set('Authorization', `Bearer ${token}`)
        .send(bvnRecord);

    expect(response.statusCode).toBe(403);
    expect(nibss.createBvn).not.toHaveBeenCalled();
});

test('POST /admin/bvn inserts a bvn record for an admin', async () => {
    const token = await login(adminBody.email);

    const response = await request(app)
        .post('/api/admin/bvn')
        .set('Authorization', `Bearer ${token}`)
        .send(bvnRecord);

    expect(response.statusCode).toBe(201);
    expect(nibss.createBvn).toHaveBeenCalledTimes(1);
    expect(nibss.createBvn).toHaveBeenCalledWith(bvnRecord);
    expect(response.body.data).toEqual({ data: bvnRecord });
});

test('POST /admin/nin inserts a nin record for an admin', async () => {
    const token = await login(adminBody.email);

    const response = await request(app)
        .post('/api/admin/nin')
        .set('Authorization', `Bearer ${token}`)
        .send(ninRecord);

    expect(response.statusCode).toBe(201);
    expect(nibss.createNin).toHaveBeenCalledTimes(1);
    expect(nibss.createNin).toHaveBeenCalledWith(ninRecord);
    expect(response.body.data).toEqual({ data: ninRecord });
});

test('POST /admin/bvn rejects an incomplete body', async () => {
    const token = await login(adminBody.email);
    const { phone, ...body } = bvnRecord;

    const response = await request(app)
        .post('/api/admin/bvn')
        .set('Authorization', `Bearer ${token}`)
        .send(body);

    expect(response.statusCode).toBe(422);
    expect(nibss.createBvn).not.toHaveBeenCalled();
});

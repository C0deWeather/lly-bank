import request from 'supertest';
import mongoose from 'mongoose';
import { test, expect, vi, beforeAll, afterAll, beforeEach } from 'vitest';
import app from '../../api/app.js';
import Account from '../../api/models/account.model.js';
import nibss from '../../api/clients/nibss.client.js';
import { ExternalApiError } from '../../api/utils/errors.js';

vi.mock('../../api/clients/nibss.client.js', () => ({
    default: {
        verifyBvn: vi.fn(),
        verifyNin: vi.fn(),
        createAccount: vi.fn()
    }
}));

const validBody = {
    email: 'john@example.com',
    dob: '2000-01-01',
    bvn: '12345678901',
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
    nibss.verifyNin.mockResolvedValue({ firstName: 'John', lastName: 'Doe' });
    nibss.createAccount.mockResolvedValue('0123456789');
});

test('POST /accounts creates an account and stores a hashed password', async () => {
    const response = await request(app).post('/api/accounts').send(validBody);

    expect(response.statusCode).toBe(201);
    expect(response.body).toMatchObject({
        message: 'Account was succesfully created',
        data: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            accountNumber: '0123456789'
        }
    });
    expect(response.body.data.password).toBeUndefined();

    const stored = await Account.findOne({ email: 'john@example.com' }).select('+password');
    expect(stored).not.toBeNull();
    expect(stored.password).not.toBe('password123');
    expect(stored.password.startsWith('$2')).toBe(true);
});

test('POST /accounts creates an account using nin when bvn is absent', async () => {
    const { bvn, ...body } = validBody;
    body.nin = '98765432101';

    const response = await request(app).post('/api/accounts').send(body);

    expect(response.statusCode).toBe(201);
    expect(nibss.verifyNin).toHaveBeenCalledWith({ nin: '98765432101' });
    expect(nibss.verifyBvn).not.toHaveBeenCalled();
    expect(nibss.createAccount).toHaveBeenCalledWith({
        kycType: 'nin',
        kycID: '98765432101',
        dob: '2000-01-01'
    });

    const stored = await Account.findOne({ email: 'john@example.com' });
    expect(stored.nin).toBe('98765432101');
    expect(stored.bvn).toBeUndefined();
});

test('POST /accounts prefers bvn when both bvn and nin are provided', async () => {
    const response = await request(app).post('/api/accounts').send({
        ...validBody,
        nin: '98765432101'
    });

    expect(response.statusCode).toBe(201);
    expect(nibss.verifyBvn).toHaveBeenCalledWith({ bvn: '12345678901' });
    expect(nibss.verifyNin).not.toHaveBeenCalled();
    expect(nibss.createAccount).toHaveBeenCalledWith({
        kycType: 'bvn',
        kycID: '12345678901',
        dob: '2000-01-01'
    });

    const stored = await Account.findOne({ email: 'john@example.com' });
    expect(stored.bvn).toBe('12345678901');
    expect(stored.nin).toBeUndefined();
});

test('POST /accounts rejects a body without bvn or nin', async () => {
    const { bvn, ...body } = validBody;

    const response = await request(app).post('/api/accounts').send(body);

    expect(response.statusCode).toBe(422);
    expect(response.body.error.message).toBe('either bvn or nin is required');
    expect(await Account.countDocuments()).toBe(0);
});

test('POST /accounts returns 409 for a duplicate email', async () => {
    await request(app).post('/api/accounts').send(validBody);

    const response = await request(app).post('/api/accounts').send({
        ...validBody,
        bvn: '12345678902'
    });

    expect(response.statusCode).toBe(409);
    expect(response.body.error.message).toBe('an account with this email already exists');
    expect(await Account.countDocuments()).toBe(1);
});

test('POST /accounts returns 502 and stores nothing when nibss verification fails', async () => {
    nibss.verifyBvn.mockRejectedValue(new ExternalApiError('bvn not found', { status: 502 }));

    const response = await request(app).post('/api/accounts').send(validBody);

    expect(response.statusCode).toBe(502);
    expect(await Account.countDocuments()).toBe(0);
});

import { describe, test, expect, vi, beforeEach } from 'vitest';
import Account from '../../api/models/account.model.js';
import nibss from '../../api/clients/nibss.client.js';
import { createAccount } from '../../api/services/account.service.js';

vi.mock('../../api/models/account.model.js', () => ({
    default: { create: vi.fn() }
}));

vi.mock('../../api/clients/nibss.client.js', () => ({
    default: {
        verifyBvn: vi.fn(),
        verifyNin: vi.fn(),
        createAccount: vi.fn()
    }
}));

const validInput = {
    email: 'john@example.com',
    dob: '2000-01-01',
    bvn: '12345678901',
    password: 'password123'
};

const kycRecord = {
    firstName: 'John',
    lastName: 'Doe'
};

beforeEach(() => {
    vi.clearAllMocks();
    nibss.verifyBvn.mockResolvedValue(kycRecord);
    nibss.verifyNin.mockResolvedValue(kycRecord);
    nibss.createAccount.mockResolvedValue('0123456789');
    Account.create.mockImplementation(async (data) => data);
});

describe('createAccount', () => {
    test('verifies bvn when provided', async () => {
        await createAccount(validInput);

        expect(nibss.verifyBvn).toHaveBeenCalledWith({ bvn: validInput.bvn });
        expect(nibss.verifyNin).not.toHaveBeenCalled();
    });

    test('falls back to nin when bvn is not provided', async () => {
        await createAccount({ ...validInput, bvn: undefined, nin: '98765432101' });

        expect(nibss.verifyNin).toHaveBeenCalledWith({ nin: '98765432101' });
        expect(nibss.verifyBvn).not.toHaveBeenCalled();
    });

    test('extracts names from the nibss verification record', async () => {
        await createAccount(validInput);

        expect(Account.create).toHaveBeenCalledWith(expect.objectContaining({
            firstName: 'John',
            lastName: 'Doe'
        }));
    });

    test('requests an account number from nibss using bvn as kycType', async () => {
        await createAccount(validInput);

        expect(nibss.createAccount).toHaveBeenCalledWith({
            kycType: 'bvn',
            kycID: '12345678901',
            dob: '2000-01-01'
        });
    });

    test('requests an account number from nibss using nin as kycType', async () => {
        await createAccount({ ...validInput, bvn: undefined, nin: '98765432101' });

        expect(nibss.createAccount).toHaveBeenCalledWith({
            kycType: 'nin',
            kycID: '98765432101',
            dob: '2000-01-01'
        });
    });

    test('stores the account with the generated account number', async () => {
        await createAccount(validInput);

        expect(Account.create).toHaveBeenCalledWith(expect.objectContaining({
            email: 'john@example.com',
            password: 'password123',
            accountNumber: '0123456789'
        }));
    });

    test('returns the stored account data', async () => {
        const result = await createAccount(validInput);

        expect(result.accountNumber).toBe('0123456789');
        expect(result.email).toBe('john@example.com');
    });

    test('rejects without creating anything when identity verification fails', async () => {
        nibss.verifyBvn.mockRejectedValue(new Error('bvn not found'));

        await expect(createAccount(validInput)).rejects.toThrow('bvn not found');
        expect(nibss.createAccount).not.toHaveBeenCalled();
        expect(Account.create).not.toHaveBeenCalled();
    });

    test('propagates duplicate-account errors from the database', async () => {
        const error = new Error('E11000 duplicate key error');
        error.code = 11000;
        Account.create.mockRejectedValue(error);

        await expect(createAccount(validInput)).rejects.toMatchObject({ code: 11000 });
    });
});

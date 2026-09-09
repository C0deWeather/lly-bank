import { describe, test, expect, vi } from 'vitest';
import validateBody from '../../api/middleware/validators.js';

const validBody = {
    email: 'john@example.com',
    dob: '2000-01-01',
    bvn: '12345678901',
    nin: '98765432101',
    password: 'password123'
};

function run(body) {
    const req = { body };
    validateBody(req, {}, () => {});
    return req.body;
}

describe('validateBody', () => {
    test('accepts a body with bvn only', () => {
        const { bvn, nin } = run({ ...validBody, nin: undefined });
        expect(bvn).toBe('12345678901');
        expect(nin).toBeUndefined();
    });

    test('accepts a body with nin only', () => {
        const { bvn, nin } = run({ ...validBody, bvn: undefined });
        expect(bvn).toBeUndefined();
        expect(nin).toBe('98765432101');
    });

    test('accepts a body with both bvn and nin', () => {
        const { bvn, nin } = run(validBody);
        expect(bvn).toBe('12345678901');
        expect(nin).toBe('98765432101');
    });

    test('throws when neither bvn nor nin is provided', () => {
        expect(() => run({ ...validBody, bvn: undefined, nin: undefined }))
            .toThrow('either bvn or nin is required');
    });

    test('throws when a required field is missing', () => {
        for (const field of ['email', 'dob', 'password']) {
            const body = { ...validBody };
            delete body[field];
            expect(() => run(body)).toThrow(/^invalid \w+$/);
        }
    });

    test('throws when a field is an empty string', () => {
        for (const field of ['email', 'dob', 'bvn', 'nin', 'password']) {
            const body = { ...validBody };
            body[field] = '';
            expect(() => run(body)).toThrow('cannot be empty');
        }
    });

    test('throws when a field is whitespace only', () => {
        expect(() => run({ ...validBody, email: '   ' })).toThrow('cannot be empty');
    });

    test('throws when a field is not a string', () => {
        for (const field of ['email', 'dob', 'bvn', 'nin', 'password']) {
            const body = { ...validBody };
            body[field] = 123;
            expect(() => run(body)).toThrow(/^invalid \w+$/);
        }
    });

    test('drops client-provided names from the body', () => {
        const result = run({
            ...validBody,
            firstName: 'John',
            lastName: 'Doe'
        });
        expect(result.firstName).toBeUndefined();
        expect(result.lastName).toBeUndefined();
    });

    test('trims whitespace from provided fields', () => {
        const result = run({
            ...validBody,
            email: ' john@example.com ',
            bvn: ' 12345678901 '
        });
        expect(result.email).toBe('john@example.com');
        expect(result.bvn).toBe('12345678901');
    });

    test('calls next() on success', () => {
        const next = vi.fn();
        validateBody({ body: validBody }, {}, next);
        expect(next).toHaveBeenCalledTimes(1);
    });
});

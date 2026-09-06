import { jest } from '@jest/globals';
import validateBody from '../../api/middleware/validators.js';

const validBody = {
    firstName: 'John',
    lastName: 'Doe',
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
        for (const field of ['firstName', 'lastName', 'dob', 'password']) {
            const body = { ...validBody };
            delete body[field];
            expect(() => run(body)).toThrow(/^invalid \w+$/);
        }
    });

    test('throws when a field is an empty string', () => {
        for (const field of ['firstName', 'lastName', 'dob', 'bvn', 'nin', 'password']) {
            const body = { ...validBody };
            body[field] = '';
            expect(() => run(body)).toThrow('cannot be empty');
        }
    });

    test('throws when a field is whitespace only', () => {
        expect(() => run({ ...validBody, firstName: '   ' })).toThrow('cannot be empty');
    });

    test('throws when a field is not a string', () => {
        for (const field of ['firstName', 'lastName', 'dob', 'bvn', 'nin', 'password']) {
            const body = { ...validBody };
            body[field] = 123;
            expect(() => run(body)).toThrow(/^invalid \w+$/);
        }
    });

    test('trims whitespace from provided fields', () => {
        const result = run({
            ...validBody,
            firstName: '  John  ',
            bvn: ' 12345678901 '
        });
        expect(result.firstName).toBe('John');
        expect(result.bvn).toBe('12345678901');
    });

    test('calls next() on success', () => {
        const next = jest.fn();
        validateBody({ body: validBody }, {}, next);
        expect(next).toHaveBeenCalledTimes(1);
    });
});

import jwt from 'jsonwebtoken';
import { describe, test, expect } from 'vitest';
import { isTokenExpired, generateToken } from '../../api/utils/jwt.js';
import config from '../../api/config/env.js';

describe('generateToken', () => {
    test('includes the role claim in the payload', () => {
        const token = generateToken('some-id', 'admin');

        const payload = jwt.verify(token, config.jwtSecret);
        expect(payload.sub).toBe('some-id');
        expect(payload.role).toBe('admin');
    });

    test('defaults the role to customer', () => {
        const token = generateToken('some-id');

        const payload = jwt.verify(token, config.jwtSecret);
        expect(payload.role).toBe('customer');
    });
});

describe('jwt expiration', () => {
    test('should return true for invalid token', () => {
        const mock_token = null;
        expect(isTokenExpired(mock_token)).toBe(true);
    });

    test('should return true for expired token', () => {
        const now = Math.floor(Date.now() / 1000);
        const mock_token = jwt.sign(
            {
                iat: now - 7200,
                exp: now - 3600
            },
            "this1secret2is3for4mock5pirposes6only8"
        );
        expect(isTokenExpired(mock_token)).toBe(true);
    });

    test('should return false for valid token', () => {
        const now = Math.floor(Date.now() / 1000);
        const mock_token = jwt.sign(
            {
                iat: now,
                exp: now + 3600
            },                                                      "this1secret2is3for4mock5pirposes6only8"            );                                                      expect(isTokenExpired(mock_token)).toBe(false);      });
});

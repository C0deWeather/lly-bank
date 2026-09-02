import jwt from 'jsonwebtoken';
import { isTokenExpired } from '../../api/utils/jwt.js';

describe('jwt expiration', () => {
    test('should return true for invalid token', () => {
        mock_token = null;
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

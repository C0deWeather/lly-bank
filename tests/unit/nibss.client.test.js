import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import nibss from '../../api/clients/nibss.client.js';
import nibssConfig from '../../api/config/nibss.js';
import { ExternalApiError } from '../../api/utils/errors.js';

const baseUrl = nibssConfig.baseUrl;

function jsonResponse(body, status = 200) {
    return {
        ok: status >= 200 && status < 300,
        status,
        json: async () => body
    };
}

function makeToken(expiresInSeconds) {
    const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
    const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
    return `${encode({ alg: 'none', typ: 'JWT' })}.${encode({ exp })}.test-signature`;
}

function mockToken(token = 'token-value') {
    fetch.mockResolvedValueOnce(jsonResponse({ token }));
}

beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    nibss.accessToken = null;
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('request handling', () => {
    test('returns the parsed response body on success', async () => {
        fetch.mockResolvedValue(jsonResponse({ account: { accountNumber: '0123456789' } }));

        const result = await nibss.createAccount({
            kycType: 'bvn',
            kycID: '12345678901',
            dob: '2000-01-01'
        });

        expect(result).toBe('0123456789');
        expect(fetch).toHaveBeenCalledWith(
            `${baseUrl}/api/account/create`,
            expect.objectContaining({ method: 'POST' })
        );
    });

    test('wraps network failures in a 502 ExternalApiError', async () => {
        fetch.mockRejectedValue(new Error('connection reset'));

        const error = await nibss.getName('0123456789').catch((e) => e);

        expect(error).toBeInstanceOf(ExternalApiError);
        expect(error.message).toBe('nibss could not complete the request');
        expect(error.status).toBe(502);
    });

    test('wraps non-json responses in a 502 ExternalApiError', async () => {
        fetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => {
                throw new Error('not json');
            }
        });

        const error = await nibss.getName('0123456789').catch((e) => e);

        expect(error).toBeInstanceOf(ExternalApiError);
        expect(error.status).toBe(502);
    });

    test('surfaces NIBSS error messages as a 502 by default', async () => {
        fetch.mockResolvedValue(jsonResponse({ message: 'account not found' }, 500));

        const error = await nibss.getName('0123456789').catch((e) => e);

        expect(error).toBeInstanceOf(ExternalApiError);
        expect(error.message).toBe('account not found');
        expect(error.status).toBe(502);
    });

    test('preserves the 404 status from NIBSS', async () => {
        fetch.mockResolvedValue(jsonResponse({ message: 'not found' }, 404));

        const error = await nibss.getName('0123456789').catch((e) => e);

        expect(error.status).toBe(404);
    });
});

describe('getAccessToken', () => {
    test('fetches a token once and caches it while valid', async () => {
        const token = makeToken(3600);
        mockToken(token);

        const first = await nibss.getAccessToken();
        const second = await nibss.getAccessToken();

        expect(first).toBe(token);
        expect(second).toBe(token);
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(
            `${baseUrl}/api/auth/token`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    apiKey: nibssConfig.apiKey,
                    apiSecret: nibssConfig.apiSecret
                })
            }
        );
    });

    test('requests a new token when the cached one is expired', async () => {
        nibss.accessToken = makeToken(-60);
        mockToken('fresh-token');

        const token = await nibss.getAccessToken();

        expect(token).toBe('fresh-token');
        expect(fetch).toHaveBeenCalledTimes(1);
    });
});

describe('protected operations', () => {
    test('getName sends the bearer token and returns the enquiry result', async () => {
        mockToken();
        fetch.mockResolvedValueOnce(jsonResponse({ firstName: 'John', lastName: 'Doe' }));

        const result = await nibss.getName('0123456789');

        expect(result).toEqual({ firstName: 'John', lastName: 'Doe' });
        expect(fetch).toHaveBeenLastCalledWith(
            `${baseUrl}/api/account/name-enquiry/0123456789`,
            { headers: { Authorization: 'Bearer token-value' } }
        );
    });

    test('getAccountBalance queries the balance endpoint with the bearer token', async () => {
        mockToken();
        fetch.mockResolvedValueOnce(jsonResponse({ balance: 5000 }));

        const result = await nibss.getAccountBalance('0123456789');

        expect(result).toEqual({ balance: 5000 });
        expect(fetch).toHaveBeenLastCalledWith(
            `${baseUrl}/api/account/balance/0123456789`,
            { headers: { Authorization: 'Bearer token-value' } }
        );
    });

    test('initiateTransfer posts the transfer body with the bearer token', async () => {
        mockToken();
        fetch.mockResolvedValueOnce(jsonResponse({ reference: 'ref-1', status: 'SUCCESS' }));
        const transferBody = { from: '0123456789', to: '9876543210', amount: 1500 };

        const result = await nibss.initiateTransfer(transferBody);

        expect(result).toEqual({ reference: 'ref-1', status: 'SUCCESS' });
        expect(fetch).toHaveBeenLastCalledWith(
            `${baseUrl}/api/transfer`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer token-value'
                },
                body: JSON.stringify(transferBody)
            }
        );
    });

    test('getTransactionStatus queries the transaction endpoint with the bearer token', async () => {
        mockToken();
        fetch.mockResolvedValueOnce(jsonResponse({ reference: 'ref-1', status: 'SUCCESS' }));

        const result = await nibss.getTransactionStatus('ref-1');

        expect(result).toEqual({ reference: 'ref-1', status: 'SUCCESS' });
        expect(fetch).toHaveBeenLastCalledWith(
            `${baseUrl}/api/transaction/ref-1`,
            { headers: { Authorization: 'Bearer token-value' } }
        );
    });

    test('verifyBvn posts the bvn object and unwraps the record', async () => {
        mockToken();
        const kycRecord = { firstName: 'John', lastName: 'Doe' };
        fetch.mockResolvedValueOnce(jsonResponse({ data: kycRecord }));

        const result = await nibss.verifyBvn({ bvn: '12345678901' });

        expect(result).toEqual(kycRecord);

        expect(fetch).toHaveBeenLastCalledWith(
            `${baseUrl}/api/validateBvn`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer token-value'
                },
                body: JSON.stringify({ bvn: '12345678901' })
            }
        );
    });

    test('verifyNin posts the nin object and unwraps the record', async () => {
        mockToken();
        const kycRecord = { firstName: 'Jane', lastName: 'Doe' };
        fetch.mockResolvedValueOnce(jsonResponse({ data: kycRecord }));

        const result = await nibss.verifyNin({ nin: '98765432101' });

        expect(result).toEqual(kycRecord);

        expect(fetch).toHaveBeenLastCalledWith(
            `${baseUrl}/api/validateNin`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer token-value'
                },
                body: JSON.stringify({ nin: '98765432101' })
            }
        );
    });
});

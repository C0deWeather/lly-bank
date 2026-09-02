import nibssConfig from '../config/nibss.js';
import { ExternalApiError } from '../utils/errors.js'
import { isTokenInvalid } from '../utils/jwt.js';

class NibssClient {
    constructor(nibssConfig) {
        this.config = nibssConfig;
        this.accessToken = null;
    }

    async request(path, options = {}) {
        let response;

        try {
            response = await fetch(
                `${this.config.baseUrl}${path}`,
                options
            );
        } catch (error) {
            throw new ExternalApiError(
                'Network failure',
                { cause: error }
            );
        }
    
        const data = await response.json();
    
        if (!response.ok) {
            throw new ExternalApiError(
                data.message || 'Request failed',
                { status: response.status }
            );
        }
    
        return data;
    }

    async getAccessToken() {
        if (isTokenInvalid(this.accessToken)) {         
            const data = await this.request(
                '/api/auth/token',
                {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        apiKey: this.config.apiKey,
                        apiSecret: this.config.apiSecret
                    })
                });
    
            this.accessToken = data.token;
        }

        return this.accessToken
    }

    async createAccount(requestBody) {
        const data = await this.request(
            '/api/account/create',
            {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestBody)
            });
        return data;
    }

    async getName(accountNumber) {
        const data = await this.request(
            `/api/account/name-enquiry/${accountNumber}`,
            {
                headers: {
                    "Authorization": `Bearer ${this.getAccessToken()}`
                }
            }
        );

        return data;
    }


    async getAccountBalance(accountNumber) {
        const data = await this.request(
            `/api/account/balance/${accountNumber}`,
            {
                headers: {
                    "Authorization": `Bearer ${this.getAccessToken()}`
                }
            }
        );

        return data;
    }

    async initiateTransfer(requestBody) {
        const data = await this.request(
            '/api/transfer',
            {                                                           method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.getAccessToken()}`
                },
                body: JSON.stringify(requestBody)
            }
        );

        return data;
    }

    async getTransactionStatus(transactionId) {
        const data = await this.request(
            `/api/transaction/${transactionId}`,
            headers: {
                "Authorization": `Bearer ${this.getAccessToken()}`
            }
        );

        return data;
    }

    async createBvn(requestBody) {
        const data = await this.request(                            '/api/insertBvn',
            {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.getAccessToken()}`
                },
                body: JSON.stringify(requestBody)                   }
        );

        return data;                                        }

    async createNin(requestBody) {                              const data = await this.request(                            '/api/insertNin',                                       {                                                           method: 'POST',
                headers: {                                                  "Content-Type": "application/json",                     "Authorization": `Bearer ${this.getA
ccessToken()}`                                                          },                                                      body: JSON.stringify(requestBody)                   }
        );
                                                                return data;                                        }

    async verifyBvn(requestBody) {
        const data = await this.request(
            '/api/validateBvn',
            {
                headers: {
                    "Content-Type": "application/json",                     "Authorization": `Bearer ${this.getAccessToken()}`  },                                                      body: JSON.stringify(requestBody)                   }                                                   );
        
        return data
    }

    async verifyNin(requestBody) {                              const data = await this.request(
            '/api/validateNin',                                     {                                                           headers: {                                                  "Content-Type": "application/json",                     "Authorization": `Bearer ${this.getAccessToken()}`  },                                                      body: JSON.stringify(requestBody)                   }                                                   );                                                                                                              return data                                         }

}

export default class ApiError extends Error {
    constructor(message, options = {}) {
        super(message, options);
        this.status = options.status || 500
    }
}

export class ExternalApiError extends ApiError {}
export class ClientError extends ApiError {}

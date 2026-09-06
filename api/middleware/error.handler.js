import { ApiError, ValidationError } from '../utils/errors.js';

function formatDetails(err) {
    if (err instanceof ValidationError) {
        return [{ message: err.message }];
    }

    if (err.name === 'ValidationError') {
        return Object.values(err.errors).map((e) => ({
            field: e.path,
            message: e.message
        }));
    }

    return undefined;
}

export default function errorHandler(err, req, res, next) {
    let status = err.status;
    let message = err.message;
    let details = formatDetails(err);

    if (err.code === 11000) {
        status = 409;
        const field = Object.keys(err.keyPattern || {})[0];
        message = field
            ? `an account with this ${field} already exists`
            : 'duplicate record';
        details = undefined;
    } else if (err.name === 'ValidationError') {
        status = 422;
    }

    if (!status || status === 500) {
        console.error(err);
        status = 500;
        message = 'Something went wrong';
        details = undefined;
    }

    res.status(status).json({
        error: {
            status,
            message,
            ...(details && { details })
        }
    });
}

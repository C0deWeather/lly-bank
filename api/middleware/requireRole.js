import { ClientError } from '../utils/errors.js';

export default function requireRole(role) {
    return function (req, res, next) {
        if (req.account == null) {
            throw new ClientError('authentication required', { status: 401 });
        }

        if (req.account.role !== role) {
            throw new ClientError('you do not have permission to perform this action', { status: 403 });
        }

        next();
    };
}

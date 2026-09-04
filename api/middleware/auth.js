import { verifyToken } from "../utils/jwt.js"
import { ClientError } from "../utils/errors.js"

export default function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        throw new ClientError("Authorization header is required", { status: 401 });
    }

    const [scheme, token] = authHeader.split(" ");

    if ( scheme !== "Bearer" || !token ) {
        throw new ClientError("Invalid authorization header", { status: 401 });
    }

    try {
        const payload = verifyToken(token);
        req.account = payload;
    } catch(error) {
        throw new ClientError("Invalid or expired token", 
            {
                cause: error,
                status: 401
            }
        );
    }

    next();
}

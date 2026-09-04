import jwt from 'jsonwebtoken';
import config from "../config/env.js";

function generateToken(id) {
    return jwt.sign(
        { sub: id },
        config.jwtSecret,
        { expiresIn: "1h"}
    };
}

function verifyToken(token) {
    // Returns the decoded payload
    return jwt.verify(token, config.jwtSecret);
}

function isTokenExpired(token) {
    if (token === null) {
        return true;
    }

    payload = jwt.decode(token);

    if (Date.now() >= payload.exp * 1000) {
        return true;
    }
    return false;
}
export { isTokenExpired };

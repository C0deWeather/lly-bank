import jwt from 'jsonwebtoken';
import config from "../config/env.js";

function generateToken(id, role = 'customer') {
    return jwt.sign(
        { sub: id, role },
        config.jwtSecret,
        { expiresIn: "1h" }
    );
}

function verifyToken(token) {
    // Returns the decoded payload
    return jwt.verify(token, config.jwtSecret);
}

function isTokenExpired(token) {
    if (token === null) {
        return true;
    }

    const payload = jwt.decode(token);

    if (Date.now() >= payload.exp * 1000) {
        return true;
    }
    return false;
}

export { generateToken, verifyToken, isTokenExpired };

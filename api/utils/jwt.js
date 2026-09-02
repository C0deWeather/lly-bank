import jwt from 'jsonwebtoken';

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

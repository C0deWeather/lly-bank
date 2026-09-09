import bcrypt from 'bcryptjs';
import Account from '../models/account.model.js';
import { generateToken } from '../utils/jwt.js';
import { ClientError } from '../utils/errors.js';

export async function loginController(req, res) {
    const { email, password } = req.body;
    const account = await Account.findOne({ email }).select('+password');

    if (account == null || !(await bcrypt.compare(password, account.password))) {
        throw new ClientError('invalid email or password', { status: 401 });
    }

    res.json({
        message: 'Login successful',
        data: { token: generateToken(account._id) }
    });
}

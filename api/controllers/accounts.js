import { createAccount } from '../services/account.service.js';

export async function createAccountController(req, res) {
    const accountData = await createAccount(req.body);
    res.status(201).json({
        message: 'Account was succesfully created',
        data: accountData
    });
}
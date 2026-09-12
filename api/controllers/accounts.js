import { createAccount } from '../services/account.service.js';
import Account from '../models/account.model.js';
import nibss from '../clients/nibss.client.js';
import { ClientError } from '../utils/errors.js';

export async function createAccountController(req, res) {
    const accountData = await createAccount(req.body);
    res.status(201).json({
        message: 'Account was succesfully created',
        data: accountData
    });
}

export async function getBalanceController(req, res) {
    const account = await Account.findById(req.account.sub);
    if (!account) {
        throw new ClientError('Account not found', { status: 404 });
    }

    const balance = await nibss.getAccountBalance(account.accountNumber);

    res.status(200).json({
        message: 'Account balance was successfully retrieved',
        data: balance
    });
}
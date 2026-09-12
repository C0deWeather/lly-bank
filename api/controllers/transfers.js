import { initiateTransfer } from '../services/transfer.service.js';

export async function initiateTransferController(req, res) {
    const accountId = req.account.sub;
    const { to, amount } = req.body;

    const result = await initiateTransfer(accountId, { to, amount });

    res.status(200).json(result);
}

import Account from '../models/account.model.js';
import nibss from '../clients/nibss.client.js';
import { ClientError } from '../utils/errors.js';

export async function initiateTransfer(accountId, { to, amount }) {
    const account = await Account.findById(accountId);
    if (!account) {
        throw new ClientError('Account not found', { status: 404 });
    }
    const from = account.accountNumber;

    const nameEnquiry = await nibss.getName(to);
    const recipientName = nameEnquiry.accountName ?? nameEnquiry.name ?? 'Unknown';

    const transferResponse = await nibss.initiateTransfer({
        from,
        to,
        amount: String(amount)
    });

    return {
        message: 'Transfer successful',
        transaction: {
            referenceId: transferResponse.reference,
            amount: transferResponse.amount,
            sender: transferResponse.from ?? from,
            recipient: transferResponse.to ?? to,
            recipientName
        },
        status: transferResponse.status ?? 'SUCCESS'
    };
}

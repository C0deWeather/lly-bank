import nibss from '../clients/nibss.client.js';

export async function getTransactionController(req, res) {
    const transaction = await nibss.getTransactionStatus(req.params.id);

    res.status(200).json({
        message: 'Transaction was successfully retrieved',
        data: transaction
    });
}

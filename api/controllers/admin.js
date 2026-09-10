import nibss from '../clients/nibss.client.js';

export async function createBvnController(req, res) {
    const data = await nibss.createBvn(req.body);
    res.status(201).json({
        message: 'BVN record was successfully created',
        data
    });
}

export async function createNinController(req, res) {
    const data = await nibss.createNin(req.body);
    res.status(201).json({
        message: 'NIN record was successfully created',
        data
    });
}

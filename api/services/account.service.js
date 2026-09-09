import Account from '../models/account.model.js';
import nibss from '../clients/nibss.client.js';

export async function createAccount(data) {
    const kycRecord = await verifyIdentity(data);
    const accountNumber = await nibss.createAccount({
        kycType: data.bvn == null ? 'nin' : 'bvn',
        kycID: data.bvn ?? data.nin,
        dob: data.dob
    });
    const accountData = {
        firstName: kycRecord.firstName,
        lastName: kycRecord.lastName,
        email: data.email,
        password: data.password,
        dob: data.dob,
        accountNumber
    };
    if (data.bvn == null) {
        accountData.nin = data.nin;
    } else {
        accountData.bvn = data.bvn;
    }
    await Account.create(accountData);
    const { password, ...account } = accountData;
    return account;
}

async function verifyIdentity(data) {
    return data.bvn == null ? nibss.verifyNin(data.nin) : nibss.verifyBvn(data.bvn);
}

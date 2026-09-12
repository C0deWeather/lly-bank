import { ValidationError } from '../utils/errors.js';

function validateField(field, value) {
    if (typeof value !== "string") {
        throw new ValidationError(`invalid ${field}`);
    }

    const trimmed = value.trim();

    if (!trimmed) {
        throw new ValidationError(`${field} field cannot be empty`);
    }

    return trimmed;
}

export default function validateBody(req, res, next) {
    const { email, dob, bvn, nin, password } = req.body;

    if (bvn == null && nin == null) {
        throw new ValidationError("either bvn or nin is required");
    }

    req.body = {
        email: validateField("email", email),
        dob: validateField("dob", dob),
        bvn: bvn == null ? undefined : validateField("bvn", bvn),
        nin: nin == null ? undefined : validateField("nin", nin),
        password: validateField("password", password)
    };

    next();
}

export function validateLoginBody(req, res, next) {
    const { email, password } = req.body;

    req.body = {
        email: validateField("email", email),
        password: validateField("password", password)
    };

    next();
}

export function validateBvnInsertBody(req, res, next) {
    const { bvn, firstName, lastName, dob, phone } = req.body;

    req.body = {
        bvn: validateField("bvn", bvn),
        firstName: validateField("firstName", firstName),
        lastName: validateField("lastName", lastName),
        dob: validateField("dob", dob),
        phone: validateField("phone", phone)
    };

    next();
}

export function validateTransferBody(req, res, next) {
    const { to, amount } = req.body;

    const recipientAccount = validateField("to", to);

    let transferAmount = amount;
    if (typeof transferAmount === "string") {
        transferAmount = transferAmount.trim();
    }
    if (transferAmount === "" || transferAmount == null) {
        throw new ValidationError("amount field cannot be empty");
    }
    const parsed = Number(transferAmount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        throw new ValidationError("amount must be a positive number");
    }

    req.body = {
        to: recipientAccount,
        amount: parsed
    };

    next();
}

export function validateNinInsertBody(req, res, next) {
    const { nin, firstName, lastName, dob } = req.body;

    req.body = {
        nin: validateField("nin", nin),
        firstName: validateField("firstName", firstName),
        lastName: validateField("lastName", lastName),
        dob: validateField("dob", dob)
    };

    next();
}

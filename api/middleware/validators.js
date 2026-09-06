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
    const { firstName, lastName, dob, bvn, nin, password } = req.body;

    if (bvn == null && nin == null) {
        throw new ValidationError("either bvn or nin is required");
    }

    req.body = {
        firstName: validateField("name", firstName),
        lastName: validateField("name", lastName),
        dob: validateField("dob", dob),
        bvn: bvn == null ? undefined : validateField("bvn", bvn),
        nin: nin == null ? undefined : validateField("nin", nin),
        password: validateField("password", password)
    };

    next();
}
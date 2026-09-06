import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true
        },
        accountNumber: {
            type: String,
            required: true,
            unique: true
        },
        dob: {
            type: Date,
            required: true
        },
        bvn: {
            type: String,
            unique: true
        },
        nin: {
            type: String,
            unique: true
        }
    },
    {
        timestamps: true
    }
);

const Account = mongoose.model('Account', accountSchema);

export default Account;
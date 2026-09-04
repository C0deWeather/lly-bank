import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true
        },
        lastName: {
            type: String,
            required: true,
            trim: true
        },
        accountNumber: {
            type: String,
            required: true,
            validate: {
                validator: value => /^\d{10}$/.test(value),
                message: 'Account number must be 10 digits long'
            }
        },
        phoneNumber: {
            type: String,
            required: true,
            validate: {
                validator: value => /^\d{11}$/.test(value),
                message: 'Phone number must be 11 digits long'
            }
        },
        email: {
            type: String,
            required: true,
            trim: true
        },
        dob: {
            type: Date,
            required: true
        }
    },
    {
        timestamps: true
    }
});

const Account = mongoose.model('Account', accountSchema);

export default Account;

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true,
            select: false
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
        },
        nin: {
            type: String,
        }
    },
    {
        timestamps: true
    }
);

accountSchema.index(
    { bvn: 1 },
    {
        unique: true,
        partialFilterExpression: {
            bvn: { $type: 'string' }
        }
    }
);

accountSchema.index(
    { nin: 1 },
    {
        unique: true,
        partialFilterExpression: {
            nin: { $type: 'string' }
        }
    }
);

accountSchema.pre('save', async function () {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
});

const Account = mongoose.model('Account', accountSchema);

export default Account;
import mongoose from 'mongoose';
import config from './env.js';
import ApiError from '../utils/errors.js'

export default async function connectDB() {
    try {
        await mongoose.connect(config.mongodbUri);
        console.log('MongoDB connected');
    } catch(error) {
        throw new ApiError(
            'Failed to connect to MongoDB',
            { cause: error }
        );
    }
}
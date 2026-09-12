import { Router } from 'express';
import { getTransactionController } from '../controllers/transactions.js';
import authenticate from '../middleware/auth.js';

const router = Router();

router.get('/:id', authenticate, getTransactionController);

export default router;

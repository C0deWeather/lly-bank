import { Router } from 'express';
import { createAccountController, getBalanceController } from '../controllers/accounts.js';
import validateBody from '../middleware/validators.js';
import authenticate from '../middleware/auth.js';

const router = Router();

router.post('/', validateBody, createAccountController);
router.get('/balance', authenticate, getBalanceController);

export default router;

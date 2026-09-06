import { Router } from 'express';
import { createAccountController } from '../controllers/accounts.js';
import validateBody from '../middleware/validators.js';

const router = Router();

router.post('/', validateBody, createAccountController);

export default router;

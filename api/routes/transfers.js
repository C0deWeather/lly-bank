import { Router } from 'express';
import { initiateTransferController } from '../controllers/transfers.js';
import authenticate from '../middleware/auth.js';
import { validateTransferBody } from '../middleware/validators.js';

const router = Router();

router.post('/', authenticate, validateTransferBody, initiateTransferController);

export default router;

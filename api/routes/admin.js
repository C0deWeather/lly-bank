import { Router } from 'express';
import { createBvnController, createNinController } from '../controllers/admin.js';
import authenticate from '../middleware/auth.js';
import requireRole from '../middleware/requireRole.js';
import { validateBvnInsertBody, validateNinInsertBody } from '../middleware/validators.js';

const router = Router();

router.post('/bvn', authenticate, requireRole('admin'), validateBvnInsertBody, createBvnController);
router.post('/nin', authenticate, requireRole('admin'), validateNinInsertBody, createNinController);

export default router;

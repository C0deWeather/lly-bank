import { Router } from 'express';
import { loginController } from '../controllers/auth.js';
import { validateLoginBody } from '../middleware/validators.js';

const router = Router();

router.post('/login', validateLoginBody, loginController);

export default router;

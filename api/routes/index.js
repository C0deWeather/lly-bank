import { Router } from 'express';
import healthRouter from './health.js';
import accountsRouter from './accounts.js';
import authRouter from './auth.js';

const router = Router();

router.use(healthRouter);
router.use('/auth', authRouter);
router.use('/accounts', accountsRouter);

export default router;

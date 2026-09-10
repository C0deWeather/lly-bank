import { Router } from 'express';
import healthRouter from './health.js';
import accountsRouter from './accounts.js';
import authRouter from './auth.js';
import adminRouter from './admin.js';

const router = Router();

router.use(healthRouter);
router.use('/auth', authRouter);
router.use('/accounts', accountsRouter);
router.use('/admin', adminRouter);

export default router;

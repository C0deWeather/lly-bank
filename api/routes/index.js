import { Router } from 'express';
import healthRouter from './health.js';
import accountsRouter from './accounts.js';
import authRouter from './auth.js';
import adminRouter from './admin.js';
import transfersRouter from './transfers.js';
import transactionsRouter from './transactions.js';

const router = Router();

router.use(healthRouter);
router.use('/auth', authRouter);
router.use('/accounts', accountsRouter);
router.use('/admin', adminRouter);
router.use('/transfers', transfersRouter);
router.use('/transactions', transactionsRouter);

export default router;

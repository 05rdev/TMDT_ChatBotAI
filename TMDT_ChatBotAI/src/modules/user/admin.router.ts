import { Router } from 'express';
import { AdminLogController } from './controllers/admin-log.controller';
import { AdminStatsController } from './controllers/admin-stats.controller';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';

const router = Router();
const adminLogController = new AdminLogController();
const adminStatsController = new AdminStatsController();

// Route xem logs
router.get('/logs', authenticate, authorize(['ADMIN']), adminLogController.listLogs);

// Route thống kê doanh thu
router.get('/stats/revenue', authenticate, authorize(['ADMIN']), adminStatsController.getRevenueStats);

export default router;

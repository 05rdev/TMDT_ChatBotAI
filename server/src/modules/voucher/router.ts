import { Router } from 'express';
import { VoucherController } from './controllers/voucher.controller';
import { authorize } from '../../middlewares/authorize';
import { authenticate } from '../../middlewares/authenticate';

const router = Router();
const voucherController = new VoucherController();

// Public routes
router.get('/active', voucherController.getActive);
router.post('/check', authenticate, voucherController.checkValid);

// Admin routes
router.use(authenticate, authorize(['ADMIN']));
router.get('/', voucherController.getAll);
router.post('/', voucherController.create);
router.put('/:id', voucherController.update);
router.delete('/:id', voucherController.delete);

export default router;

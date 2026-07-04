import { Router } from 'express';
import { SupportController } from './controllers/support.controller';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';

const router = Router();
const supportController = new SupportController();

router.use(authenticate);

// User & Admin shared
router.get('/my', supportController.getMyTickets);
router.get('/:id', supportController.getDetails);
router.post('/:id/reply', supportController.reply);
router.post('/', supportController.create);

// Admin only
router.get('/', authorize(['ADMIN']), supportController.getAll);
router.put('/:id/status', authorize(['ADMIN']), supportController.updateStatus);

export default router;

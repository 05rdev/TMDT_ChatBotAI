import { Router } from 'express';
import { AIController } from './controllers/ai.controller';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';

const router = Router();
const aiController = new AIController();

// Route sinh embedding (Chỉ Admin mới có quyền test thủ công)
router.post('/embedding', authenticate, authorize(['ADMIN']), aiController.generateEmbedding);

export default router;

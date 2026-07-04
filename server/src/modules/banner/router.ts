import { Router } from 'express';
import { BannerController } from './controllers/banner.controller';
import { authenticate, authorize } from '../../middlewares/authenticate';
import { upload } from '../../middlewares/upload.middleware';

const router = Router();
const bannerController = new BannerController();

// Public: Lấy danh sách banner đang hoạt động
router.get('/', bannerController.getAll);
router.get('/:id', bannerController.getById);

// Admin: CRUD banner
router.post('/upload', authenticate, authorize('ADMIN'), upload.single('image'), bannerController.uploadImage);
router.post('/', authenticate, authorize('ADMIN'), bannerController.create);
router.put('/:id', authenticate, authorize('ADMIN'), bannerController.update);
router.delete('/:id', authenticate, authorize('ADMIN'), bannerController.delete);

export default router;

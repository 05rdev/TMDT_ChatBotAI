import { Router } from 'express';
import { CategoryController } from './controllers/category.controller';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';

const router = Router();
const categoryController = new CategoryController();

// [Public] Lấy danh sách danh mục
router.get('/', categoryController.getAll);

// [Admin] Tạo danh mục mới
router.post('/', authenticate, authorize(['ADMIN']), categoryController.create);

export default router;

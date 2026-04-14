import { Router } from 'express';
import { ProductController } from './controllers/product.controller';
import { CategoryController } from './controllers/category.controller';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { upload } from '../../middlewares/upload.middleware';

const router = Router();
const productController = new ProductController();
const categoryController = new CategoryController();

/**
 * PRODUCT ROUTES
 */

// [Public] Lấy danh sách sản phẩm
router.get('/', productController.getAll);

// [Public] Tìm kiếm thông minh bằng AI
router.get('/search-ai', productController.searchAI);

// [Public] Chi tiết sản phẩm
router.get('/:id', productController.getById);

// [Admin] Tạo sản phẩm mới
router.post('/', authenticate, authorize(['ADMIN']), productController.create);

// [Admin] Cập nhật sản phẩm
router.put('/:id', authenticate, authorize(['ADMIN']), productController.update);

// [Admin] Xóa mềm sản phẩm
router.delete('/:id', authenticate, authorize(['ADMIN']), productController.delete);

// [Admin] Upload nhiều ảnh sản phẩm (tối đa 5 ảnh)
router.post(
  '/:id/images',
  authenticate,
  authorize(['ADMIN']),
  upload.array('images', 5),
  productController.uploadImages
);

export default router;


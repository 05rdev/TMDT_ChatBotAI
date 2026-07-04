import { Router } from 'express';
import { ProductController } from './controllers/product.controller';
import { ReviewController } from './controllers/review.controller';
import { authenticate } from '../../middlewares/authenticate';
import { CategoryController } from './controllers/category.controller';
import { authorize } from '../../middlewares/authorize';
import { upload } from '../../middlewares/upload.middleware';

const router = Router();
const productController = new ProductController();
const categoryController = new CategoryController();
const reviewController = new ReviewController();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Quản lý sản phẩm và danh mục
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Lấy danh sách sản phẩm với bộ lọc
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: categoryId
 *         schema: { type: string }
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *     responses:
 *       200:
 *         description: Danh sách sản phẩm
 */
router.get('/', productController.getAll);

/**
 * @swagger
 * /api/products/hot:
 *   get:
 *     summary: Sản phẩm bán chạy nhất (Hot)
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: number, default: 8 }
 *     responses:
 *       200:
 *         description: Danh sách sản phẩm bán chạy
 */
router.get('/hot', productController.getHotProducts);

/**
 * @swagger
 * /api/products/new:
 *   get:
 *     summary: Sản phẩm mới nhất
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: number, default: 8 }
 *     responses:
 *       200:
 *         description: Danh sách sản phẩm mới
 */
router.get('/new', productController.getNewProducts);

/**
 * @swagger
 * /api/products/slug/{slug}:
 *   get:
 *     summary: Chi tiết sản phẩm bằng Slug
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 */
router.get('/slug/:slug', productController.getBySlug);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Chi tiết sản phẩm
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Thông tin chi tiết sản phẩm và các phiên bản
 */
router.get('/:id', productController.getById);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Tạo sản phẩm mới (Admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Tạo thành công
 */
router.post('/', authenticate, authorize(['ADMIN']), productController.create);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Cập nhật sản phẩm (Admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.put('/:id', authenticate, authorize(['ADMIN']), productController.update);
router.patch('/:id', authenticate, authorize(['ADMIN']), productController.update);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Xóa sản phẩm (Admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Đã xóa mềm sản phẩm
 */
router.delete('/:id', authenticate, authorize(['ADMIN']), productController.delete);

/**
 * @swagger
 * /api/products/{id}/upload:
 *   post:
 *     summary: Upload ảnh sản phẩm (Admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Upload thành công
 */
router.post(
  '/:id/upload',
  authenticate,
  authorize(['ADMIN']),
  upload.array('images', 5),
  productController.uploadImages
);

router.delete(
  '/images/:imageId',
  authenticate,
  authorize(['ADMIN']),
  productController.deleteImage
);

router.patch(
  '/:id/images/:imageId/primary',
  authenticate,
  authorize(['ADMIN']),
  productController.setPrimaryImage
);

// --- Review Routes ---

/**
 * @swagger
 * /api/products/{productId}/reviews:
 *   get:
 *     summary: Lấy danh sách đánh giá của sản phẩm
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 */
router.get('/:productId/reviews', reviewController.getByProduct);

/**
 * @swagger
 * /api/products/{productId}/reviews:
 *   post:
 *     summary: Tạo đánh giá mới (Chỉ cho người đã mua)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:productId/reviews', authenticate, reviewController.create);

/**
 * @swagger
 * /api/reviews/{id}:
 *   put:
 *     summary: Cập nhật đánh giá
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 */
router.put('/reviews/:id', authenticate, reviewController.update);

/**
 * @swagger
 * /api/reviews/{id}:
 *   delete:
 *     summary: Xóa đánh giá
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/reviews/:id', authenticate, reviewController.delete);

export default router;

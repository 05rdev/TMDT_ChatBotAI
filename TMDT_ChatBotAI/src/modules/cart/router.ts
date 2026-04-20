import { Router } from 'express';
import { CartController } from './controllers/cart.controller';
import { authenticate } from '../../middlewares/authenticate';

const router = Router();
const cartController = new CartController();

// Tất cả các route giỏ hàng yêu cầu đăng nhập
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Quản lý giỏ hàng của người dùng
 */

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Lấy danh sách sản phẩm trong giỏ hàng
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trả về danh sách item và tổng tiền
 */
router.get('/', cartController.get);

/**
 * @swagger
 * /api/cart:
 *   post:
 *     summary: Thêm sản phẩm vào giỏ
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, productVariantId, quantity]
 *             properties:
 *               productId: { type: string }
 *               productVariantId: { type: string }
 *               quantity: { type: integer, minimum: 1 }
 *     responses:
 *       201:
 *         description: Đã thêm vào giỏ
 */
router.post('/', cartController.add);

/**
 * @swagger
 * /api/cart/{productVariantId}:
 *   put:
 *     summary: Cập nhật số lượng sản phẩm trong giỏ
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productVariantId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quantity]
 *             properties:
 *               quantity: { type: integer }
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.put('/:productVariantId', cartController.update);

/**
 * @swagger
 * /api/cart:
 *   delete:
 *     summary: Xóa toàn bộ giỏ hàng
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Đã làm trống giỏ hàng
 */
router.delete('/', cartController.clear);

/**
 * @swagger
 * /api/cart/{productVariantId}:
 *   delete:
 *     summary: Xóa một sản phẩm khỏi giỏ
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productVariantId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Đã xóa sản phẩm
 */
router.delete('/:productVariantId', cartController.remove);

export default router;

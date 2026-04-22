import { Router } from 'express';
import { OrderController } from './controllers/order.controller';
import { PaymentController } from './controllers/payment.controller';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';

const router = Router();
const orderController = new OrderController();
const paymentController = new PaymentController();

// Tất cả route đơn hàng yêu cầu đăng nhập
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Quản lý đơn hàng và thanh toán
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Tạo đơn hàng mới từ giỏ hàng
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [address, phone, paymentMethod]
 *             properties:
 *               address: { type: string }
 *               phone: { type: string }
 *               paymentMethod: { type: string, enum: [COD, STRIPE, MOMO] }
 *     responses:
 *       201:
 *         description: Đặt hàng thành công
 */
router.post('/', orderController.create);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Lấy lịch sử đơn hàng của người dùng
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Danh sách đơn hàng
 */
router.get('/', orderController.getMyOrders);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Chi tiết đơn hàng
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Thông tin chi tiết đơn hàng
 */
router.get('/:id', orderController.getById);

/**
 * @swagger
 * /api/orders/{id}/cancel:
 *   patch:
 *     summary: Hủy đơn hàng (Chỉ khi trạng thái PENDING)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Hủy đơn hàng thành công
 */
router.patch('/:id/cancel', orderController.cancel);
router.patch('/:id/info', orderController.updateInfo);
router.patch('/:id/return', orderController.returnOrder);

// --- Payment Routes ---

/**
 * @swagger
 * /api/orders/checkout:
 *   post:
 *     summary: Khởi tạo thanh toán trực tuyến
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId, method]
 *             properties:
 *               orderId: { type: string }
 *               method: { type: string, enum: [STRIPE, MOMO] }
 *     responses:
 *       200:
 *         description: Link thanh toán giả lập
 */
router.post('/checkout', paymentController.create);

/**
 * @swagger
 * /api/orders/vnpay-return:
 *   get:
 *     summary: Xử lý redirect từ VNPay
 *     tags: [Orders]
 *     responses:
 *       302:
 *         description: Redirect về frontend
 */
router.get('/vnpay-return', paymentController.vnpayReturn);

/**
 * @swagger
 * /api/orders/webhook:
 *   post:
 *     summary: Webhook giả lập để xác nhận thanh toán (Dành cho thử nghiệm)
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId, success]
 *             properties:
 *               orderId: { type: string }
 *               success: { type: boolean }
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái thành công
 */
router.post('/webhook', paymentController.mockWebhook);

// [Admin] Cập nhật trạng thái đơn hàng
router.patch('/:id/status', authorize(['ADMIN']), orderController.updateStatus);

export default router;

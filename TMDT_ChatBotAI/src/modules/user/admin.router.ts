import { Router } from 'express';
import { AdminStatsController } from './controllers/admin-stats.controller';
import { AdminOrderController } from './controllers/admin-order.controller';
import { AdminUserController } from './controllers/admin-user.controller';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';

const router = Router();
const adminStatsController = new AdminStatsController();
const adminOrderController = new AdminOrderController();
const adminUserController = new AdminUserController();

// Tất cả các route admin yêu cầu xác thực và quyền ADMIN
router.use(authenticate, authorize(['ADMIN']));

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Các API quản trị hệ thống
 */

/**
 * @swagger
 * /api/admin/stats/overview:
 *   get:
 *     summary: Tổng quan Dashboard Admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trả về các chỉ số doanh thu, đơn hàng, user mới
 */
router.get('/stats/overview', adminStatsController.getOverview);

/**
 * @swagger
 * /api/admin/stats/top-products:
 *   get:
 *     summary: Danh sách sản phẩm bán chạy nhất
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Top 10 sản phẩm bán chạy nhất
 */
router.get('/stats/top-products', adminStatsController.getTopProducts);

/**
 * @swagger
 * /api/admin/stats/category:
 *   get:
 *     summary: Doanh thu theo danh mục
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Báo cáo danh thu theo từng category
 */
router.get('/stats/category', adminStatsController.getCategoryStats);

/**
 * @swagger
 * /api/admin/stats/revenue-trend:
 *   get:
 *     summary: Biểu đồ xu hướng doanh thu
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [day, month]
 *     responses:
 *       200:
 *         description: Dữ liệu doanh thu theo dòng thời gian
 */
router.get('/stats/revenue-trend', adminStatsController.getRevenueTrend);

/**
 * @swagger
 * /api/admin/products/low-stock:
 *   get:
 *     summary: Danh sách sản phẩm sắp hết hàng
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách sản phẩm có stock < 10
 */
router.get('/products/low-stock', adminStatsController.getLowStock);

/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     summary: Quản lý danh sách đơn hàng toàn hệ thống
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Danh sách đơn hàng có thể lọc theo trạng thái và thời gian
 */
router.get('/orders', adminOrderController.getAll);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Danh sách tất cả người dùng
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trả về danh sách user
 */
router.get('/users', adminUserController.getAll);

/**
 * @swagger
 * /api/admin/users/{id}/status:
 *   patch:
 *     summary: Cập nhật trạng thái user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isActive: { type: boolean }
 *     responses:
 *       200:
 *         description: Đã cập nhật
 */
router.patch('/users/:id/status', adminUserController.updateStatus);

/**
 * @swagger
 * /api/admin/users/{id}/role:
 *   patch:
 *     summary: Cập nhật quyền user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role: { type: string, enum: [USER, ADMIN] }
 *     responses:
 *       200:
 *         description: Đã cập nhật
 */
router.patch('/users/:id/role', adminUserController.updateRole);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   put:
 *     summary: Cập nhật thông tin user (tên, email)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *     responses:
 *       200:
 *         description: Đã cập nhật
 */
router.put('/users/:id', adminUserController.updateUser);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Xoá user (soft delete)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Đã xoá
 */
router.delete('/users/:id', adminUserController.delete);

export default router;

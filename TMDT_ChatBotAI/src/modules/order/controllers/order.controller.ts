import { Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service';
import { createOrderSchema, updateOrderStatusSchema } from '../dto/order.schema';
import { AuthRequest } from '../../../middlewares/authenticate';

const orderService = new OrderService();

export class OrderController {
  /**
   * Đặt hàng (User)
   */
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const validatedData = createOrderSchema.parse(req.body);
      const order = await orderService.createOrder(userId, validatedData);
      
      return res.status(201).json({
        success: true,
        message: 'Đặt hàng thành công',
        data: order
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Xem lịch sử đơn hàng (User)
   */
  async getMyOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const result = await orderService.getMyOrders(userId, page, limit);
      return res.json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Chi tiết đơn hàng (User)
   */
  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const order = await orderService.getOrderById(id as string, userId);
      
      return res.json({
        success: true,
        data: order
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Hủy đơn hàng (User)
   */
  async cancel(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const { reason } = req.body;
      
      const order = await orderService.cancelOrder(id as string, userId, reason);
      
      return res.json({
        success: true,
        message: 'Đơn hàng đã được hủy thành công',
        data: order
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cập nhật thông tin nhận hàng (User)
   */
  async updateInfo(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const { address, phone } = req.body;
      
      const order = await orderService.updateOrderInfo(id as string, userId, { address, phone });
      
      return res.json({
        success: true,
        message: 'Cập nhật thông tin nhận hàng thành công',
        data: order
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Yêu cầu hoàn trả (User)
   */
  async returnOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      
      const order = await orderService.returnOrder(id as string, userId);
      
      return res.json({
        success: true,
        message: 'Đã gửi yêu cầu hoàn trả đơn hàng',
        data: order
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cập nhật trạng thái đơn (Admin)
   */
  async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = updateOrderStatusSchema.parse(req.body);
      
      const order = await orderService.updateStatus(id as string, status);
      return res.json({
        success: true,
        message: 'Cập nhật trạng thái đơn hàng thành công',
        data: order
      });
    } catch (error) {
      next(error);
    }
  }
}

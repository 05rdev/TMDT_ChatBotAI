import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../../order/services/order.service';

const orderService = new OrderService();

export class AdminOrderController {
  /**
   * Lấy tất cả đơn hàng kèm filter (Admin)
   */
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await orderService.getAllOrders(req.query);
      return res.json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }
}

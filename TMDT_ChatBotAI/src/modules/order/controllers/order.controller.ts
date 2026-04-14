import { Request, Response } from 'express';
import { OrderService } from '../services/order.service';

const orderService = new OrderService();

export class OrderController {
  async create(req: Request, res: Response) {
    try {
      // Giả sử userId lấy từ middleware auth
      const userId = 'user-id-placeholder'; 
      const order = await orderService.createOrder(userId, req.body);
      return res.status(201).json({ success: true, data: order });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const userId = 'user-id-placeholder';
      const orders = await orderService.getMyOrders(userId);
      return res.json({ success: true, data: orders });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/payment.service';

const paymentService = new PaymentService();

export class PaymentController {
  /**
   * Tạo yêu cầu thanh toán (User)
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId, method } = req.body;
      const data = await paymentService.createPayment(orderId, method);
      
      return res.json({
        success: true,
        message: 'Khởi tạo thanh toán thành công (Simulated)',
        data
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Webhook giả lập để trigger hoàn thành thanh toán
   */
  async mockWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId, success } = req.body;
      const order = await paymentService.processPaymentWebhook(orderId, success);
      
      return res.json({
        success: true,
        message: success ? 'Thanh toán thành công (Simulated)' : 'Thanh toán thất bại (Simulated)',
        data: order
      });
    } catch (error) {
      next(error);
    }
  }
}

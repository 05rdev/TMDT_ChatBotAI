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
      const ipAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
      
      const data = await paymentService.createPayment(orderId, method, ipAddr as string);
      
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

  /**
   * Xử lý VNPay Return URL (Redirect từ VNPay về)
   */
  async vnpayReturn(req: Request, res: Response, next: NextFunction) {
    try {
      const vnp_Params = req.query;
      const result = await paymentService.processVnpayReturn(vnp_Params);
      
      if (result.success) {
        // Có thể redirect về trang báo thành công trên frontend
        return res.redirect(`${process.env.CORS_ORIGIN}/checkout/success?orderId=${result.orderId}`);
      } else {
        return res.redirect(`${process.env.CORS_ORIGIN}/checkout/failed?orderId=${result.orderId}`);
      }
    } catch (error) {
      next(error);
    }
  }
}

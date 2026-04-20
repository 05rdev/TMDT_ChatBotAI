import { prisma } from '../../../lib/prisma';
import { AppError } from '../../../middlewares/error.middleware';
import { VNPayService } from './vnpay.service';

export class PaymentService {
  /**
   * Giả lập việc khởi tạo thanh toán
   */
  async createPayment(orderId: string, method: string, ipAddr: string = '127.0.0.1') {
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) throw new AppError(404, 'Không tìm thấy đơn hàng');

    // Giả lập logic sinh link hoặc secret tùy theo phương thức
    let paymentData: any = {
      orderId,
      amount: Number(order.totalAmount),
      method,
      status: 'PENDING'
    };

    if (method === 'STRIPE') {
      paymentData.checkoutUrl = `https://checkout.stripe.com/pay/mock_${orderId}`;
      paymentData.clientSecret = `pi_mock_secret_${Math.random().toString(36).substring(7)}`;
    } else if (method === 'MOMO') {
      paymentData.payUrl = `https://test-payment.momo.vn/pay/mock_${orderId}`;
      paymentData.qrCode = `momo_qr_mock_data_${orderId}`;
    } else if (method === 'VNPAY') {
      const orderInfo = `Thanh toan don hang ${orderId}`;
      paymentData.payUrl = VNPayService.createPaymentUrl(
        ipAddr,
        Number(order.totalAmount),
        orderId,
        orderInfo
      );
    } else {
      paymentData.message = 'Vui lòng thanh toán khi nhận hàng (COD)';
    }

    return paymentData;
  }

  /**
   * Xử lý Webhook giả lập để xác nhận thanh toán thành công
   */
  async processPaymentWebhook(orderId: string, success: boolean = true) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { payment: true }
      });

      if (!order) throw new AppError(404, 'Đơn hàng không tồn tại');

      if (success) {
        // Cập nhật Payment thành SUCCESS
        await tx.payment.update({
          where: { orderId },
          data: { 
            status: 'SUCCESS',
            transactionId: `mock_trans_${Date.now()}`
          }
        });

        // Cập nhật Order sang PROCESSING
        return tx.order.update({
          where: { id: orderId },
          data: { status: 'PROCESSING' }
        });
      } else {
        // Cập nhật Payment thành FAILED
        await tx.payment.update({
          where: { orderId },
          data: { status: 'FAILED' }
        });

        // Tùy chọn: Để order ở PENDING để khách thử lại hoặc chuyển sang CANCELLED
        return tx.order.update({
          where: { id: orderId },
          data: { status: 'PENDING' }
        });
      }
    });
  }

  /**
   * Xử lý kết quả trả về từ VNPay
   */
  async processVnpayReturn(vnp_Params: any) {
    const isValid = VNPayService.verifyReturnUrl(vnp_Params);
    const orderId = vnp_Params['vnp_TxnRef'];
    const responseCode = vnp_Params['vnp_ResponseCode'];

    if (!isValid) {
      return { success: false, orderId, message: 'Chữ ký VNPay không hợp lệ' };
    }

    // Response Code == '00' là giao dịch thành công
    const isSuccess = responseCode === '00';
    
    await this.processPaymentWebhook(orderId, isSuccess);

    return { success: isSuccess, orderId };
  }
}

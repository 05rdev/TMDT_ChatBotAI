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
    } else if (method === 'SEPAY') {
      const bankId = process.env.SEPAY_BANK_ID || 'MB';
      const accountNo = process.env.SEPAY_ACCOUNT_NO || '123115678';
      const accountName = process.env.SEPAY_ACCOUNT_NAME || 'HUYNH VAN DINH';
      // Tạo mã thanh toán không chứa dấu gạch ngang để tối ưu độ dài cho chuyển khoản
      const description = `US${orderId.replace(/-/g, '')}`;

      paymentData.bankId = bankId;
      paymentData.accountNo = accountNo;
      paymentData.accountName = accountName;
      paymentData.description = description;
      paymentData.qrCode = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${order.totalAmount}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(accountName)}`;
      paymentData.payUrl = paymentData.qrCode;
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

  /**
   * Xử lý webhook gọi về từ SePay khi có biến động số dư chuyển khoản
   */
  async processSepayWebhook(transaction: any) {
    const { transferType, transferAmount, transactionContent, referenceNumber, id } = transaction;

    if (transferType !== 'in') {
      return { success: false, message: 'Bỏ qua giao dịch không phải nhận tiền (transferType = out)' };
    }

    // Trích xuất UUID từ nội dung giao dịch chuyển khoản
    const orderId = this.extractUUID(transactionContent || '');
    if (!orderId) {
      return { success: false, message: 'Không tìm thấy mã đơn hàng hợp lệ trong nội dung chuyển khoản' };
    }

    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { payment: true }
      });

      if (!order) {
        throw new AppError(404, `Không tìm thấy đơn hàng với mã ${orderId}`);
      }

      // Nếu đơn hàng đã được cập nhật trước đó
      if (order.status !== 'PENDING') {
        return { success: true, message: 'Đơn hàng đã được thanh toán hoặc xử lý trước đó', orderId };
      }

      const amount = Number(transferAmount);
      const expectedAmount = Number(order.totalAmount);

      // Chấp nhận sai số nhỏ dưới 100 VND do làm tròn số ở ngân hàng/cổng thanh toán
      if (amount < expectedAmount - 100) {
        throw new AppError(400, `Số tiền chuyển khoản (${amount}) không khớp với giá trị đơn hàng (${expectedAmount})`);
      }

      // Cập nhật Payment thành SUCCESS
      await tx.payment.update({
        where: { orderId },
        data: {
          status: 'SUCCESS',
          transactionId: `sepay_${id || referenceNumber || Date.now()}`
        }
      });

      // Cập nhật Order sang PROCESSING
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: 'PROCESSING' }
      });

      // Tạo thông báo thành công cho người dùng
      try {
        const NotificationService = require('../../notification/services/notification.service').NotificationService;
        const notificationService = new NotificationService();
        await notificationService.createNotification(
          order.userId,
          'Thanh toán thành công',
          `Đơn hàng #${order.id.slice(0, 8)} đã được thanh toán tự động qua chuyển khoản ngân hàng SePay.`,
          'ORDER'
        );
      } catch (err) {
        console.error('Không gửi được thông báo thanh toán thành công:', err);
      }

      return { success: true, order: updatedOrder };
    });
  }

  /**
   * Helper trích xuất UUID ra khỏi chuỗi (hỗ trợ cả dạng chuẩn có gạch ngang hoặc dạng viết liền 32 ký tự hex)
   */
  private extractUUID(text: string): string | null {
    if (!text) return null;
    
    // 1. Tìm UUID dạng chuẩn có gạch ngang
    const standardMatch = text.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
    if (standardMatch) return standardMatch[0].toLowerCase();

    // 2. Tìm UUID không có gạch ngang (32 ký tự hex) - thường gặp khi chuyển khoản nội dung rút gọn
    const noHyphenMatch = text.match(/[0-9a-f]{32}/i);
    if (noHyphenMatch) {
      const raw = noHyphenMatch[0].toLowerCase();
      return `${raw.slice(0, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}-${raw.slice(16, 20)}-${raw.slice(20)}`;
    }

    return null;
  }
}

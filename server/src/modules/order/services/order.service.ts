import { prisma } from '../../../lib/prisma';
import { AppError } from '../../../middlewares/error.middleware';
import { VoucherService } from '../../voucher/services/voucher.service';
import { mailService } from '../../mail/mail.service';

export class OrderService {
  /**
   * Tạo đơn hàng mới từ giỏ hàng (Sử dụng Transaction)
   */
  async createOrder(userId: string, data: any) {
    const { address, phone, paymentMethod, cartItemIds } = data;

    // 1. Lấy giỏ hàng của người dùng
    const whereClause: any = { userId };
    if (cartItemIds && Array.isArray(cartItemIds) && cartItemIds.length > 0) {
      whereClause.id = { in: cartItemIds };
    }

    const cartItems = await prisma.cart.findMany({
      where: whereClause,
      include: {
        variant: true,
        product: true
      }
    });

    if (cartItems.length === 0) {
      throw new AppError(400, 'Giỏ hàng của bạn đang trống');
    }

    // 2. Tính tổng tiền
    let totalAmount = cartItems.reduce((sum, item) => {
      return sum + Number(item.variant.price) * item.quantity;
    }, 0);

    let appliedVoucherId: string | undefined = undefined;

    // 2.5 Kiểm tra và áp dụng Voucher
    if (data.voucherCode) {
      const voucherService = new VoucherService();
      const uniqueCategoryIds = Array.from(new Set(cartItems.map(item => item.product.categoryId)));
      const uniqueProductIds = Array.from(new Set(cartItems.map(item => item.productId)));
      const result = await voucherService.validateVoucher(data.voucherCode, totalAmount, uniqueCategoryIds, userId, uniqueProductIds);
      totalAmount = Math.max(0, totalAmount - result.discountAmount);
      appliedVoucherId = result.voucher.id;
    }

    // 3. Thực thi Transaction nguyên tử
    const order = await prisma.$transaction(async (tx) => {
      // A. KIÊM TRA TỒN KHO VÀ CẬP NHẬT
      for (const item of cartItems) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.productVariantId },
          include: { product: true }
        });

        if (!variant || variant.product.isDeleted) {
          throw new AppError(404, 'Sản phẩm hoặc phiên bản không tồn tại');
        }

        if (!variant.product.isActive) {
          throw new AppError(400, `Sản phẩm ${variant.product.name} hiện đang ngừng kinh doanh`);
        }

        if (variant.stock < item.quantity) {
          throw new AppError(400, `Sản phẩm ${variant.product.name} phiên bản ${variant.name} đã hết hàng hoặc không đủ tồn kho`);
        }

        // Trừ kho
        await tx.productVariant.update({
          where: { id: item.productVariantId },
          data: { stock: { decrement: item.quantity } }
        });
      }

      // B. TẠO ĐƠN HÀNG
      const order = await tx.order.create({
        data: {
          userId,
          totalAmount,
          address,
          phone,
          status: 'PENDING',
          voucherId: appliedVoucherId,
          items: {
            create: cartItems.map(item => ({
              productId: item.productId,
              productVariantId: item.productVariantId,
              quantity: item.quantity,
              price: item.variant.price
            }))
          }
        }
      });

      // B2. Nếu có voucher, tăng số lần sử dụng
      if (appliedVoucherId) {
        await tx.voucher.update({
          where: { id: appliedVoucherId },
          data: { usedCount: { increment: 1 } }
        });
      }

      // C. TẠO THÔNG TIN THANH TOÁN
      await tx.payment.create({
        data: {
          orderId: order.id,
          method: paymentMethod,
          amount: totalAmount,
          status: 'PENDING'
        }
      });

      // D. XÓA GIỎ HÀNG (Chỉ xóa những món đã đặt)
      await tx.cart.deleteMany({
        where: {
          id: { in: cartItems.map(i => i.id) }
        }
      });

      // E. GHI NHẬN HÀNH VI (AI Behavioral Log)
      // Chúng ta sẽ ghi nhận cho từng sản phẩm khác nhau trong đơn
      const uniqueProductIds = Array.from(new Set(cartItems.map(i => i.productId)));
      await tx.userBehavior.createMany({
        data: uniqueProductIds.map(productId => ({
          userId,
          productId,
          type: 'PURCHASE'
        }))
      });

      return order;
    });

    const fullOrder = await this.getOrderById(order.id);
    void mailService.sendOrderCreated(fullOrder).catch((error) => {
      console.error('Failed to send order created email', error);
    });

    return fullOrder;
  }

  /**
   * Lấy lịch sử đơn hàng của User
   */
  async getMyOrders(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: {
                    take: 1,
                    orderBy: { isPrimary: 'desc' }
                  }
                }
              },
              variant: { select: { name: true } }
            }
          },
          payment: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.order.count({ where: { userId } })
    ]);

    return {
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Chi tiết đơn hàng
   */
  async getOrderById(id: string, userId?: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: {
                  take: 1,
                  orderBy: { isPrimary: 'desc' }
                }
              }
            },
            variant: { select: { name: true } }
          }
        },
        payment: true,
        user: { select: { name: true, email: true } },
        voucher: true
      }
    });

    if (!order) throw new AppError(404, 'Không tìm thấy đơn hàng');

    // Nếu không phải Admin và không đúng User chủ sở hữu thì lỗi
    if (userId && order.userId !== userId) {
      throw new AppError(403, 'Bạn không có quyền xem đơn hàng này');
    }

    return order;
  }

  /**
   * Hủy đơn hàng (Chỉ khi PENDING)
   */
  async cancelOrder(id: string, userId: string, reason?: string) {
    const order = await this.getOrderById(id, userId);

    if (order.status !== 'PENDING' && order.status !== 'PROCESSING') {
      throw new AppError(400, 'Chỉ có thể hủy đơn hàng đang chờ duyệt hoặc đang đóng gói');
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      // 1. Cập nhật trạng thái
      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          cancelReason: reason
        } as any
      });

      // 2. Hoàn lại tồn kho
      for (const item of order.items) {
        await tx.productVariant.update({
          where: { id: item.productVariantId },
          data: { stock: { increment: item.quantity } }
        });
      }

      return updatedOrder;
    });

    const fullOrder = await this.getOrderById(updatedOrder.id);
    void mailService.sendOrderStatusChanged(fullOrder, order.status).catch((error) => {
      console.error('Failed to send order cancelled email', error);
    });

    return fullOrder;
  }

  /**
   * Cập nhật thông tin đơn hàng (Chỉ khi PENDING hoặc PROCESSING)
   */
  async updateOrderInfo(id: string, userId: string, data: { address?: string, phone?: string }) {
    const order = await this.getOrderById(id, userId);

    if (order.status !== 'PENDING' && order.status !== 'PROCESSING') {
      throw new AppError(400, 'Chỉ có thể chỉnh sửa thông tin khi đơn hàng đang chờ duyệt hoặc đang đóng gói');
    }

    return prisma.order.update({
      where: { id },
      data: {
        ...(data.address && { address: data.address }),
        ...(data.phone && { phone: data.phone })
      }
    });
  }

  /**
   * Yêu cầu hoàn trả hàng (Chỉ khi DELIVERED)
   */
  async returnOrder(id: string, userId: string) {
    const order = await this.getOrderById(id, userId);

    // Dựa theo logic hiện tại, ta có thể đánh dấu status là CANCELLED hoặc một trạng thái khác,
    // Tuy nhiên theo schema ta chỉ có các status chuẩn, tạm thời chuyển status sang CANCELLED
    // và ghi chú là hoàn trả hoặc nếu có thêm trạng thái RETURNED thì update sau.
    // Vì yêu cầu là "hoàn trả hàng", ta sẽ đổi status thành CANCELLED và cộng lại kho (hoặc ghi chú).
    if (order.status !== 'DELIVERED') {
      throw new AppError(400, 'Chỉ có thể yêu cầu hoàn trả khi đơn hàng đã giao thành công');
    }

    // Để an toàn không cần đổi schema, ta có thể lưu vào db một ActivityLog hoặc cập nhật status
    // Ta cập nhật tạm thành CANCELLED để người dùng thấy đơn đã được hoàn, 
    // trong thực tế có thể cần thêm status RETURNED vào DB.
    const updatedOrder = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id },
        data: { status: 'CANCELLED' } // Tạm dùng CANCELLED cho việc hoàn trả
      });

      // Hoàn lại tồn kho
      for (const item of order.items) {
        await tx.productVariant.update({
          where: { id: item.productVariantId },
          data: { stock: { increment: item.quantity } }
        });
      }

      return updatedOrder;
    });

    const fullOrder = await this.getOrderById(updatedOrder.id);
    void mailService.sendOrderStatusChanged(fullOrder, order.status).catch((error) => {
      console.error('Failed to send order return email', error);
    });

    return fullOrder;
  }

  /**
   * Lấy danh sách tất cả đơn hàng (Admin)
   */
  async getAllOrders(query: any) {
    const { status, fromDate, toDate, page = 1, limit = 10 } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (status) where.status = status;
    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = new Date(fromDate);
      if (toDate) where.createdAt.lte = new Date(toDate);
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { name: true, email: true } },
          payment: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.order.count({ where })
    ]);

    return {
      orders,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    };
  }

  /**
   * Cập nhật trạng thái đơn hàng (Admin)
   */
  async updateStatus(id: string, status: any) {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) throw new AppError(404, 'Đơn hàng không tồn tại');

    const currentStatus = order.status;
    const newStatus = status;

    if (currentStatus !== newStatus) {
      // 1. DELIVERED và CANCELLED là trạng thái cuối cùng (chỉ đọc)
      if (currentStatus === 'DELIVERED') {
        throw new AppError(400, 'Đơn hàng đã hoàn thành (DELIVERED), không thể chỉnh sửa trạng thái.');
      }
      if (currentStatus === 'CANCELLED') {
        throw new AppError(400, 'Đơn hàng đã bị hủy (CANCELLED), không thể chỉnh sửa trạng thái.');
      }

      // 2. Ràng buộc luồng trạng thái (State Machine)
      if (currentStatus === 'PENDING') {
        // PENDING -> PROCESSING hoặc CANCELLED
        if (newStatus !== 'PROCESSING' && newStatus !== 'CANCELLED') {
          throw new AppError(400, 'Luồng trạng thái không hợp lệ. Đơn hàng chờ duyệt (PENDING) chỉ có thể chuyển sang đang xử lý (PROCESSING) hoặc hủy (CANCELLED).');
        }
      } else if (currentStatus === 'PROCESSING') {
        // PROCESSING -> SHIPPED hoặc CANCELLED
        if (newStatus !== 'SHIPPED' && newStatus !== 'CANCELLED') {
          throw new AppError(400, 'Luồng trạng thái không hợp lệ. Đơn hàng đang xử lý (PROCESSING) chỉ có thể chuyển sang đang giao hàng (SHIPPED) hoặc hủy (CANCELLED).');
        }
      } else if (currentStatus === 'SHIPPED') {
        // SHIPPED -> DELIVERED
        if (newStatus !== 'DELIVERED') {
          throw new AppError(400, 'Luồng trạng thái không hợp lệ. Đơn hàng đang giao hàng (SHIPPED) chỉ có thể chuyển sang đã giao hàng (DELIVERED).');
        }
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status }
    });
    const fullOrder = await this.getOrderById(updatedOrder.id);

    // Tạo thông báo cho user
    try {
      const { translateOrderStatus } = require('../../../utils/status-mapper');
      const NotificationService = require('../../notification/services/notification.service').NotificationService;
      const notificationService = new NotificationService();
      await notificationService.createNotification(
        order.userId,
        'Cập nhật đơn hàng',
        `Đơn hàng #${order.id.slice(0, 8)} của bạn đã chuyển sang trạng thái: ${translateOrderStatus(status)}`,
        'ORDER'
      );
    } catch (err) {
      console.error('Failed to send order update notification', err);
    }

    if (currentStatus !== newStatus) {
      void mailService.sendOrderStatusChanged(fullOrder, currentStatus).catch((error) => {
        console.error('Failed to send order status email', error);
      });
    }

    return fullOrder;
  }
}

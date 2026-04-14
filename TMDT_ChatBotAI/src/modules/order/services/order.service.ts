import { prisma } from '../../../lib/prisma';
import { AppError } from '../../../middlewares/error.middleware';

export class OrderService {
  /**
   * Tạo đơn hàng mới từ giỏ hàng (Sử dụng Transaction)
   */
  async createOrder(userId: string, data: any) {
    const { address, phone, paymentMethod } = data;

    // 1. Lấy giỏ hàng của người dùng
    const cartItems = await prisma.cart.findMany({
      where: { userId },
      include: {
        variant: true,
      }
    });

    if (cartItems.length === 0) {
      throw new AppError(400, 'Giỏ hàng của bạn đang trống');
    }

    // 2. Tính tổng tiền
    const totalAmount = cartItems.reduce((sum, item) => {
      return sum + Number(item.variant.price) * item.quantity;
    }, 0);

    // 3. Thực thi Transaction nguyên tử
    return prisma.$transaction(async (tx) => {
      // A. KIÊM TRA TỒN KHO VÀ CẬP NHẬT
      for (const item of cartItems) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.productVariantId }
        });


        if (!variant || variant.stock < item.quantity) {
          throw new AppError(400, `Sản phẩm ${item.productId} phiên bản ${item.productVariantId} đã hết hàng hoặc không đủ tồn kho`);
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

      // C. TẠO THÔNG TIN THANH TOÁN
      await tx.payment.create({
        data: {
          orderId: order.id,
          method: paymentMethod,
          amount: totalAmount,
          status: 'PENDING'
        }
      });

      // D. XÓA GIỎ HÀNG
      await tx.cart.deleteMany({
        where: { userId }
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
              product: { select: { name: true } },
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
            product: { select: { name: true, images: { where: { isPrimary: true }, take: 1 } } },
            variant: { select: { name: true } }
          }
        },
        payment: true,
        user: { select: { name: true, email: true } }
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
  async cancelOrder(id: string, userId: string) {
    const order = await this.getOrderById(id, userId);

    if (order.status !== 'PENDING') {
      throw new AppError(400, 'Chỉ có thể hủy đơn hàng đang ở trạng thái Chờ xử lý');
    }

    return prisma.$transaction(async (tx) => {
      // 1. Cập nhật trạng thái
      const updatedOrder = await tx.order.update({
        where: { id },
        data: { status: 'CANCELLED' }
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

    return prisma.order.update({
      where: { id },
      data: { status }
    });
  }
}

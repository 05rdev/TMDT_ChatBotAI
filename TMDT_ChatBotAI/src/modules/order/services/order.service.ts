import { prisma } from '../../../common/utils/prisma.service';

export class OrderService {
  async createOrder(userId: string, data: any) {
    // Logic tạo đơn hàng (đây là boilerplate)
    return prisma.order.create({
      data: {
        userId,
        totalAmount: data.totalAmount,
        address: data.address,
        phone: data.phone,
        items: {
          create: data.items // [{ productId, productVariantId, quantity, price }]
        }
      }
    });
  }

  async getMyOrders(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: { items: true, payment: true },
      orderBy: { createdAt: 'desc' }
    });
  }
}

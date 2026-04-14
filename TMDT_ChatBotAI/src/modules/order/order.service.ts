import { prisma } from '@lib/prisma';
import { AppError } from '@middlewares/error.middleware';
import { CreateOrderInput } from './order.dto';

export class OrderService {
  async create(userId: string, data: CreateOrderInput) {
    // Lấy tất cả products trong 1 query để tránh N+1
    const productIds = data.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw new AppError(400, 'One or more products not found');
    }

    // Kiểm tra tồn kho
    for (const item of data.items) {
      const product = products.find((p: any) => p.id === item.productId)!;
      if (product.stock < item.quantity) {
        throw new AppError(400, `Insufficient stock for "${product.name}"`);
      }
    }

    const totalAmount = data.items.reduce((sum, item) => {
      const product = products.find((p: any) => p.id === item.productId)!;
      return sum + Number(product.price) * item.quantity;
    }, 0);

    // Transaction: tạo order + giảm stock + xóa cart
    const order = await prisma.$transaction(async (tx: any) => {
      const newOrder = await tx.order.create({
        data: {
          userId,
          totalAmount,
          orderItems: {
            create: data.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: products.find((p: any) => p.id === item.productId)!.price,
            })),
          },
        },
        include: { orderItems: true },
      });

      // Giảm stock
      await Promise.all(
        data.items.map((item) =>
          tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          }),
        ),
      );

      // Xóa cart items đã order
      await tx.cart.deleteMany({
        where: { userId, productId: { in: productIds } },
      });

      return newOrder;
    });

    return order;
  }

  async getMyOrders(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          orderItems: { include: { product: { select: { name: true, slug: true } } } },
        },
      }),
      prisma.order.count({ where: { userId } }),
    ]);
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getById(orderId: string, userId: string) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { orderItems: { include: { product: true } } },
    });
    if (!order) throw new AppError(404, 'Order not found');
    return order;
  }
}

export const orderService = new OrderService();

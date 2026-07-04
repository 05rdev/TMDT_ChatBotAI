import { prisma } from '../../../lib/prisma';
import { AppError } from '../../../middlewares/error.middleware';

export class CartService {
  async getCart(userId: string) {
    const cartItems = await prisma.cart.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            isActive: true,
            isDeleted: true,
            images: { orderBy: { isPrimary: 'desc' }, take: 1 },
          },
        },
        variant: {
          select: {
            id: true,
            name: true,
            price: true,
            stock: true,
          },
        },
      },
    });

    const items = cartItems.map((item) => ({
      ...item,
      subtotal: Number(item.variant.price) * item.quantity,
    }));

    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

    return { items, totalAmount };
  }

  async addItem(userId: string, data: any) {
    const { productId, productVariantId, quantity } = data;

    const variant = await prisma.productVariant.findUnique({
      where: { id: productVariantId },
      include: { product: true },
    });

    if (!variant || variant.productId !== productId || variant.product.isDeleted) {
      throw new AppError(404, 'San pham hoac phien ban khong hop le');
    }

    if (!variant.product.isActive) {
      throw new AppError(400, 'San pham nay hien dang ngung kinh doanh');
    }

    if (variant.stock <= 0) {
      throw new AppError(400, 'San pham nay da het hang');
    }

    if (variant.stock < quantity) {
      throw new AppError(400, `San pham nay chi con ${variant.stock} trong kho`);
    }

    const existingItem = await prisma.cart.findUnique({
      where: {
        userId_productVariantId: {
          userId,
          productVariantId,
        },
      },
    });

    if (existingItem) {
      const nextQuantity = existingItem.quantity + quantity;
      if (nextQuantity > variant.stock) {
        throw new AppError(400, `San pham nay chi con ${variant.stock} trong kho`);
      }

      return prisma.cart.update({
        where: { id: existingItem.id },
        data: { quantity: nextQuantity },
      });
    }

    return prisma.cart.create({
      data: {
        userId,
        productId,
        productVariantId,
        quantity,
      },
    });
  }

  async updateItem(userId: string, productVariantId: string, quantity: number) {
    if (quantity <= 0) {
      return this.removeItem(userId, productVariantId);
    }

    const variant = await prisma.productVariant.findUnique({
      where: { id: productVariantId },
    });

    if (!variant || variant.stock < quantity) {
      throw new AppError(400, 'So luong vuot qua ton kho kha dung');
    }

    return prisma.cart.update({
      where: {
        userId_productVariantId: {
          userId,
          productVariantId,
        },
      },
      data: { quantity },
    });
  }

  async removeItem(userId: string, productVariantId: string) {
    return prisma.cart.delete({
      where: {
        userId_productVariantId: {
          userId,
          productVariantId,
        },
      },
    });
  }

  async clearCart(userId: string) {
    return prisma.cart.deleteMany({
      where: { userId },
    });
  }
}

import { prisma } from '../../../lib/prisma';
import { AppError } from '../../../middlewares/error.middleware';

export class CartService {
  /**
   * Lấy chi tiết giỏ hàng của user
   */
  async getCart(userId: string) {
    const cartItems = await prisma.cart.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            images: { where: { isPrimary: true }, take: 1 }
          }
        },
        variant: {
          select: {
            id: true,
            name: true,
            price: true,
            stock: true
          }
        }
      }
    });

    // Tính toán tổng tiền
    const items = cartItems.map(item => ({
      ...item,
      subtotal: Number(item.variant.price) * item.quantity
    }));

    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

    return {
      items,
      totalAmount
    };
  }

  /**
   * Thêm sản phẩm vào giỏ hàng
   */
  async addItem(userId: string, data: any) {
    const { productId, productVariantId, quantity } = data;

    // Kiểm tra sản phẩm và variant tồn tại
    const variant = await prisma.productVariant.findUnique({
      where: { id: productVariantId },
    });

    if (!variant || variant.productId !== productId) {
      throw new AppError(404, 'Sản phẩm hoặc phiên bản không hợp lệ');
    }

    if (variant.stock < quantity) {
      throw new AppError(400, `Sản phẩm này chỉ còn ${variant.stock} trong kho`);
    }

    // Tìm xem đã có trong giỏ chưa
    const existingItem = await prisma.cart.findUnique({
      where: {
        userId_productVariantId: {
          userId,
          productVariantId
        }
      }
    });

    if (existingItem) {
      // Cập nhật số lượng
      return prisma.cart.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity }
      });
    }

    // Tạo mới
    return prisma.cart.create({
      data: {
        userId,
        productId,
        productVariantId,
        quantity
      }
    });
  }

  /**
   * Cập nhật số lượng trong giỏ
   */
  async updateItem(userId: string, productVariantId: string, quantity: number) {
    if (quantity <= 0) {
      return this.removeItem(userId, productVariantId);
    }

    // Kiểm tra tồn kho trước khi cập nhật
    const variant = await prisma.productVariant.findUnique({
      where: { id: productVariantId }
    });

    if (!variant || variant.stock < quantity) {
      throw new AppError(400, 'Số lượng vượt quá tồn kho khả dụng');
    }

    return prisma.cart.update({
      where: {
        userId_productVariantId: {
          userId,
          productVariantId
        }
      },
      data: { quantity }
    });
  }

  /**
   * Xóa một item khỏi giỏ
   */
  async removeItem(userId: string, productVariantId: string) {
    return prisma.cart.delete({
      where: {
        userId_productVariantId: {
          userId,
          productVariantId
        }
      }
    });
  }

  /**
   * Xóa toàn bộ giỏ hàng
   */
  async clearCart(userId: string) {
    return prisma.cart.deleteMany({
      where: { userId }
    });
  }
}

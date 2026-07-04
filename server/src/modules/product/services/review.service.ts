import { prisma } from '../../../lib/prisma';
import { AppError } from '../../../middlewares/error.middleware';

export class ReviewService {
  /**
   * Tạo đánh giá mới
   */
  async createReview(userId: string, data: { productId: string; rating: number; comment: string }) {
    const { productId, rating, comment } = data;

    // 1. Kiểm tra xem người dùng đã mua sản phẩm này và đơn hàng đã hoàn tất chưa
    const orderWithProduct = await prisma.order.findFirst({
      where: {
        userId,
        status: 'DELIVERED',
        items: {
          some: { productId }
        }
      }
    });

    if (!orderWithProduct) {
      throw new AppError(400, 'Bạn chỉ có thể đánh giá sản phẩm sau khi đơn hàng đã hoàn tất');
    }

    // 2. Kiểm tra xem đã đánh giá chưa (mỗi người 1 đánh giá / sản phẩm)
    const existingReview = await prisma.review.findFirst({
      where: { userId, productId }
    });

    if (existingReview) {
      throw new AppError(400, 'Bạn đã đánh giá sản phẩm này rồi');
    }

    // 3. Tạo đánh giá
    const review = await prisma.review.create({
      data: {
        userId,
        productId,
        rating,
        comment
      },
      include: {
        user: { select: { name: true, avatar: true } }
      }
    });

    return review;
  }

  /**
   * Lấy danh sách đánh giá của sản phẩm
   */
  async getProductReviews(productId: string) {
    return prisma.review.findMany({
      where: { productId },
      include: {
        user: { select: { name: true, avatar: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Cập nhật đánh giá
   */
  async updateReview(userId: string, id: string, data: { rating?: number; comment?: string }) {
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) throw new AppError(404, 'Không tìm thấy đánh giá');
    if (review.userId !== userId) throw new AppError(403, 'Bạn không có quyền sửa đánh giá này');

    return prisma.review.update({
      where: { id },
      data,
      include: { user: { select: { name: true, avatar: true } } }
    });
  }

  /**
   * Xóa đánh giá
   */
  async deleteReview(userId: string, id: string) {
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) throw new AppError(404, 'Không tìm thấy đánh giá');
    if (review.userId !== userId) throw new AppError(403, 'Bạn không có quyền xóa đánh giá này');

    return prisma.review.delete({ where: { id } });
  }
}

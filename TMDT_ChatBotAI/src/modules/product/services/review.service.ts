import { prisma } from '../../../lib/prisma';
import { AppError } from '../../../middlewares/error.middleware';

export class ReviewService {
  /**
   * Tạo đánh giá mới (Chỉ áp dụng cho khách đã mua hàng)
   */
  async createReview(userId: string, productId: string, data: { rating: number; comment?: string }) {
    // 1. Kiểm tra xem người dùng đã mua sản phẩm này chưa
    const hasPurchased = await prisma.order.findFirst({
      where: {
        userId,
        status: 'DELIVERED',
        items: {
          some: { productId }
        }
      }
    });

    if (!hasPurchased) {
      throw new AppError(403, 'Bạn chỉ có thể đánh giá sản phẩm sau khi đã mua và nhận hàng thành công');
    }

    // 2. Kiểm tra xem đã đánh giá chưa
    const existingReview = await prisma.review.findFirst({
      where: { userId, productId }
    });

    if (existingReview) {
      throw new AppError(400, 'Bạn đã thực hiện đánh giá cho sản phẩm này rồi');
    }

    // 3. Tạo review
    return prisma.review.create({
      data: {
        userId,
        productId,
        rating: data.rating,
        comment: data.comment
      },
      include: {
        user: { select: { name: true, avatar: true } }
      }
    });
  }

  /**
   * Lấy danh sách đánh giá kèm thống kê
   */
  async getProductReviews(productId: string, query: { page?: number; limit?: number; sort?: string }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    let orderBy: any = { createdAt: 'desc' };
    if (query.sort === 'highest') orderBy = { rating: 'desc' };
    if (query.sort === 'lowest') orderBy = { rating: 'asc' };

    const [reviews, total, aggregateData, starDistribution] = await Promise.all([
      prisma.review.findMany({
        where: { productId },
        include: { user: { select: { name: true, avatar: true } } },
        orderBy,
        skip,
        take: limit
      }),
      prisma.review.count({ where: { productId } }),
      prisma.review.aggregate({
        where: { productId },
        _avg: { rating: true },
        _count: { id: true }
      }),
      // Thống kê số lượng từng loại sao
      prisma.review.groupBy({
        by: ['rating'],
        where: { productId },
        _count: { id: true }
      })
    ]);

    // Format lại star distribution thành object {1: count, 2: count, ...}
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    starDistribution.forEach(item => {
      distribution[item.rating] = item._count.id;
    });

    return {
      reviews,
      stats: {
        avgRating: Number(aggregateData._avg.rating?.toFixed(1)) || 0,
        totalReviews: aggregateData._count.id,
        distribution
      },
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Cập nhật đánh giá
   */
  async updateReview(id: string, userId: string, data: { rating?: number; comment?: string }) {
    const review = await prisma.review.findUnique({ where: { id } });
    
    if (!review) throw new AppError(404, 'Không tìm thấy đánh giá');
    if (review.userId !== userId) throw new AppError(403, 'Bạn không có quyền sửa đánh giá này');

    return prisma.review.update({
      where: { id },
      data
    });
  }

  /**
   * Xóa đánh giá (Chủ review hoặc Admin)
   */
  async deleteReview(id: string, userId: string, isAdmin: boolean = false) {
    const review = await prisma.review.findUnique({ where: { id } });
    
    if (!review) throw new AppError(404, 'Không tìm thấy đánh giá');
    if (review.userId !== userId && !isAdmin) {
      throw new AppError(403, 'Bạn không có quyền xóa đánh giá này');
    }

    return prisma.review.delete({ where: { id } });
  }
}

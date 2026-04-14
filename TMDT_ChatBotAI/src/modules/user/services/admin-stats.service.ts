import { prisma } from '../../../lib/prisma';

export class AdminStatsService {
  /**
   * Thống kê tổng quan cho Dashboard
   */
  async getDashboardOverview() {
    const [totalRevenue, totalOrders, totalUsers, totalProducts, lowStockProducts, totalNewUsers] = await Promise.all([
      // Tổng doanh thu thực tế (Thanh toán thành công)
      prisma.payment.aggregate({
        where: { status: 'SUCCESS' },
        _sum: { amount: true }
      }),
      // Tổng đơn hàng (không tính đơn hủy)
      prisma.order.count({
        where: { NOT: { status: 'CANCELLED' } }
      }),
      // Tổng khách hàng
      prisma.user.count({
        where: { role: 'USER' }
      }),
      // Tổng số sản phẩm
      prisma.product.count({
        where: { isDeleted: false }
      }),
      // Sản phẩm sắp hết hàng (stock < 10)
      prisma.productVariant.count({
        where: { stock: { lt: 10 } }
      }),
      // New users in current month
      prisma.user.count({
        where: {
          role: 'USER',
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      })
    ]);

    return {
      revenue: Number(totalRevenue._sum.amount) || 0,
      orders: totalOrders,
      users: totalUsers,
      totalProducts,
      lowStockAlert: lowStockProducts,
      newUsersThisMonth: totalNewUsers
    };
  }

  /**
   * Bảng xếp hạng sản phẩm bán tốt nhất
   */
  async getTopSellingProducts(limit: number = 10) {
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true
      },
      where: {
        order: { NOT: { status: 'CANCELLED' } }
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: limit
    });

    // Lấy thông tin chi tiết của sản phẩm
    const productDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true, slug: true }
        });
        return {
          id: item.productId,
          name: product?.name,
          slug: product?.slug,
          totalSold: item._sum?.quantity || 0
        };
      })
    );

    return productDetails;
  }

  /**
   * Thống kê doanh thu theo từng danh mục
   */
  async getCategoryRevenue() {
    const stats = await prisma.orderItem.findMany({
      where: {
        order: { status: 'DELIVERED' } // Chỉ tính doanh thu đơn đã giao
      },
      include: {
        product: {
          include: { category: true }
        }
      }
    });

    const categoryStats: Record<string, number> = {};

    stats.forEach(item => {
      const catName = item.product.category.name;
      const subtotal = Number(item.price) * item.quantity;
      categoryStats[catName] = (categoryStats[catName] || 0) + subtotal;
    });

    return Object.entries(categoryStats).map(([name, total]) => ({
      name,
      total
    }));
  }

  /**
   * Lấy danh sách sản phẩm sắp hết hàng cùng thông tin chi tiết
   */
  async getLowStockProducts() {
    return prisma.productVariant.findMany({
      where: { stock: { lt: 10 } },
      include: {
        product: {
          select: { name: true, slug: true, images: { where: { isPrimary: true }, take: 1 } }
        }
      },
      orderBy: { stock: 'asc' }
    });
  }
}

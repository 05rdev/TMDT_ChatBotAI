import { prisma } from '../../../lib/prisma';
import { Prisma } from '@prisma/client';
import { AppError } from '../../../middlewares/error.middleware';
import { cacheSet, cacheGet, cacheDelPattern } from '../../../lib/redis';

export class ProductService {
  /**
   * Lấy danh sách sản phẩm với Phân trang, Lọc, Sắp xếp và Tìm kiếm
   */
  async getProducts(query: any) {
    const { page, limit, categoryId, minPrice, maxPrice, rating, sortBy, order, search } = query;
    const skip = (page - 1) * limit;

    // Tạo key cache dựa trên các tham số query
    const cacheKey = `products:list:${JSON.stringify(query)}`;
    const cachedData = await cacheGet<string>(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    // Xây dựng điều kiện lọc
    const where: Prisma.ProductWhereInput = {
      isDeleted: false,
    };

    if (categoryId) where.categoryId = categoryId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Lọc theo rating (trung bình) - Cần dùng subquery hoặc tính toán sau
    // Ở đây ta lọc đơn giản theo các sản phẩm có ít nhất 1 review đạt rating >= x
    if (rating) {
      where.reviews = {
        some: { rating: { gte: rating } }
      };
    }

    // Lọc theo giá (Lấy giá từ ProductVariant)
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.variants = {
        some: {
          price: {
            gte: minPrice,
            lte: maxPrice,
          },
        },
      };
    }

    // Truy vấn dữ liệu
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: { orderBy: { isPrimary: 'desc' }, take: 1 },
          variants: { orderBy: { price: 'asc' }, take: 1 }, // Lấy giá thấp nhất để hiển thị
          category: { select: { name: true } },
          _count: { select: { reviews: true } }
        },
        orderBy: sortBy === 'price' 
          ? { variants: { _count: 'asc' } } // Prisma không hỗ trợ order trực tiếp theo relation aggregate dễ dàng
          : { [sortBy]: order },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    // Lấy tổng số lượng đã bán từ OrderItem cho các sản phẩm này
    const soldCounts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      where: {
        productId: { in: products.map(p => p.id) },
        order: { status: { not: 'CANCELLED' } }
      }
    });

    const productsWithStats = products.map(p => {
      const soldData = soldCounts.find(s => s.productId === p.id);
      return {
        ...p,
        soldCount: soldData?._sum?.quantity || 0,
        primaryImage: p.images[0]?.url || null,
        minPrice: p.variants[0]?.price || 0
      };
    });

    const result = {
      products: productsWithStats,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };

    // Cache kết quả trong 5 phút (300s)
    await cacheSet(cacheKey, JSON.stringify(result), 300);

    return result;
  }

  /**
   * Chi tiết sản phẩm kèm rating trung bình
   */
  async getById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id, isDeleted: false },
      include: {
        images: true,
        variants: true,
        category: true,
        reviews: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { name: true, avatar: true } } }
        },
      },
    });

    if (!product) throw new AppError(404, 'Không tìm thấy sản phẩm');

    // Tính toán average rating
    const aggregate = await prisma.review.aggregate({
      where: { productId: id },
      _avg: { rating: true },
      _count: { rating: true }
    });

    return {
      ...product,
      averageRating: aggregate._avg.rating || 0,
      totalReviews: aggregate._count.rating
    };
  }

  /**
   * Chi tiết sản phẩm bằng Slug (Dùng cho Frontend)
   */
  async getBySlug(slug: string) {
    const product = await prisma.product.findUnique({
      where: { slug, isDeleted: false },
      include: {
        images: true,
        variants: true,
        category: true,
        reviews: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { name: true, avatar: true } } }
        },
      },
    });

    if (!product) throw new AppError(404, 'Không tìm thấy sản phẩm');

    // Tính toán average rating
    const aggregate = await prisma.review.aggregate({
      where: { productId: product.id },
      _avg: { rating: true },
      _count: { rating: true }
    });

    return {
      ...product,
      averageRating: aggregate._avg.rating || 0,
      totalReviews: aggregate._count.rating
    };
  }

  /**
   * Sản phẩm bán chạy nhất (dựa trên tổng quantity trong OrderItem)
   */
  async getHotProducts(limit: number = 8) {
    // Query raw để GROUP BY productId, SUM quantity
    const hotProductIds = await prisma.$queryRaw<{ productId: string; totalSold: number }[]>`
      SELECT "productId", CAST(SUM("quantity") AS INTEGER) as "totalSold"
      FROM "OrderItem"
      GROUP BY "productId"
      ORDER BY "totalSold" DESC
      LIMIT ${limit}
    `;

    if (hotProductIds.length === 0) {
      // Fallback: trả sản phẩm mới nhất nếu chưa có đơn hàng
      return this.getNewProducts(limit);
    }

    const ids = hotProductIds.map(p => p.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: ids }, isDeleted: false },
      include: {
        images: { orderBy: { isPrimary: 'desc' }, take: 1 },
        variants: { orderBy: { price: 'asc' }, take: 1 },
        category: { select: { name: true } },
      },
    });

    // Giữ thứ tự theo totalSold
    const productMap = new Map(products.map(p => [p.id, p]));
    return hotProductIds
      .map(h => productMap.get(h.productId))
      .filter(Boolean);
  }

  /**
   * Sản phẩm mới nhất (sắp xếp theo createdAt DESC)
   */
  async getNewProducts(limit: number = 8) {
    return prisma.product.findMany({
      where: { isDeleted: false },
      include: {
        images: { orderBy: { isPrimary: 'desc' }, take: 1 },
        variants: { orderBy: { price: 'asc' }, take: 1 },
        category: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Tạo sản phẩm mới kèm Variants
   */
  async create(data: any) {
    const { name, slug, description, categoryId, variants } = data;

    // Kiểm tra slug
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) throw new AppError(400, 'Slug sản phẩm đã tồn tại');

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        categoryId,
        variants: {
          create: variants
        }
      },
      include: { variants: true }
    });

    await this.clearProductCache();
    return product;
  }

  /**
   * Cập nhật sản phẩm
   */
  async update(id: string, data: any) {
    const { variants, ...productData } = data;

    // Nếu có variants, ta sẽ cập nhật hoặc tạo mới (Để đơn giản ở đây ta xóa cũ tạo mới nếu truyền mảng mới)
    // Trong thực tế nên xử lý update từng variant id
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...productData,
        ...(variants && {
          variants: {
            deleteMany: {},
            create: variants
          }
        })
      },
      include: { variants: true }
    });

    await this.clearProductCache();
    return product;
  }

  /**
   * Xóa mềm sản phẩm
   */
  async softDelete(id: string) {
    const product = await prisma.product.update({
      where: { id },
      data: { isDeleted: true }
    });

    await this.clearProductCache();
    return product;
  }

  /**
   * Xóa tất cả cache liên quan đến danh sách sản phẩm
   */
  private async clearProductCache() {
    try {
      await cacheDelPattern('products:list:*');
      console.log('🧹 Product cache cleared');
    } catch (error) {
      console.error('❌ Failed to clear product cache:', error);
    }
  }

  /**
   * Thêm ảnh sản phẩm
   */
  async addImages(productId: string, imageUrls: string[]) {
    const imagesData = imageUrls.map(url => ({
      productId,
      url,
      isPrimary: false
    }));

    return prisma.productImage.createMany({
      data: imagesData
    });
  }

  /**
   * Tìm kiếm bằng Vector (AI Search) - Giữ nguyên logic cũ nhưng thêm isDeleted check
   */
  async searchByVector(embedding: number[], limit: number = 10) {
    const vectorString = `[${embedding.join(',')}]`;
    return prisma.$queryRaw<any[]>(Prisma.sql`
      SELECT p.id, p.name, p.slug, p.description
      FROM "Product" p
      WHERE p."isDeleted" = false AND p.embedding IS NOT NULL
      ORDER BY p.embedding <=> ${vectorString}::vector ASC
      LIMIT ${limit}
    `);
  }

  /**
   * Xóa ảnh sản phẩm
   */
  async deleteImage(imageId: string) {
    return prisma.productImage.delete({
      where: { id: imageId }
    });
  }

  /**
   * Đặt ảnh làm ảnh chính
   */
  async setPrimaryImage(productId: string, imageId: string) {
    return prisma.$transaction([
      // 1. Reset tất cả ảnh của sản phẩm này về false
      prisma.productImage.updateMany({
        where: { productId },
        data: { isPrimary: false }
      }),
      // 2. Đặt ảnh được chọn thành true
      prisma.productImage.update({
        where: { id: imageId },
        data: { isPrimary: true }
      })
    ]);
  }
}

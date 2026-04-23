import { prisma } from '../../../lib/prisma';
import { Prisma } from '@prisma/client';
import { AppError } from '../../../middlewares/error.middleware';
import { cacheSet, cacheGet, cacheDelPattern } from '../../../lib/redis';

export class ProductService {
  /**
   * Bổ sung thông tin Sold Count và Rating cho danh sách sản phẩm
   */
  async enrichProductData(products: any[]) {
    if (products.length === 0) return [];

    const productIds = products.map(p => p.id);

    // 1. Lấy tổng số lượng đã bán
    const soldCounts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      where: {
        productId: { in: productIds },
        order: { status: { not: 'CANCELLED' } }
      }
    });

    // 2. Lấy rating trung bình
    const ratingStats = await prisma.review.groupBy({
      by: ['productId'],
      _avg: { rating: true },
      _count: { rating: true },
      where: {
        productId: { in: productIds }
      }
    });

    return products.map(p => {
      const soldData = soldCounts.find(s => s.productId === p.id);
      const ratingData = ratingStats.find(r => r.productId === p.id);
      return {
        ...p,
        soldCount: soldData?._sum?.quantity || 0,
        averageRating: ratingData?._avg?.rating || 0,
        totalReviews: ratingData?._count?.rating || 0,
        primaryImage: p.images?.[0]?.url || p.primaryImage || null,
        minPrice: p.variants?.[0]?.price ? Number(p.variants[0].price) : (p.minPrice ? Number(p.minPrice) : 0)
      };
    });
  }

  /**
   * Lấy danh sách sản phẩm với Phân trang, Lọc, Sắp xếp và Tìm kiếm
   */
  async getProducts(query: any) {
    const { page, limit, categoryId, minPrice, maxPrice, rating, sortBy, order, search } = query;
    const skip = (page - 1) * limit;

    const cacheKey = `products:list:${JSON.stringify(query)}`;
    const cachedData = await cacheGet<string>(cacheKey);
    if (cachedData) return JSON.parse(cachedData);

    const where: Prisma.ProductWhereInput = { isDeleted: false };
    if (categoryId) where.categoryId = categoryId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (rating) {
      where.reviews = { some: { rating: { gte: rating } } };
    }

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

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: { orderBy: { isPrimary: 'desc' }, take: 1 },
          variants: { orderBy: { price: 'asc' }, take: 1 },
          category: { select: { name: true } },
        },
        orderBy: sortBy === 'price' ? { createdAt: 'desc' } : { [sortBy]: order },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    const enrichedProducts = await this.enrichProductData(products);

    const result = {
      products: enrichedProducts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };

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

  async getHotProducts(limit: number = 8) {
    const hotProductIds = await prisma.$queryRaw<{ productId: string; totalSold: number }[]>`
      SELECT "productId", CAST(SUM("quantity") AS INTEGER) as "totalSold"
      FROM "OrderItem"
      GROUP BY "productId"
      ORDER BY "totalSold" DESC
      LIMIT ${limit}
    `;

    if (hotProductIds.length === 0) return this.getNewProducts(limit);

    const ids = hotProductIds.map(p => p.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: ids }, isDeleted: false },
      include: {
        images: { orderBy: { isPrimary: 'desc' }, take: 1 },
        variants: { orderBy: { price: 'asc' }, take: 1 },
        category: { select: { name: true } },
      },
    });

    const productMap = new Map(products.map(p => [p.id, p]));
    const orderedProducts = hotProductIds
      .map(h => productMap.get(h.productId))
      .filter((p): p is any => !!p);

    return this.enrichProductData(orderedProducts);
  }

  async getTopRatedProducts(limit: number = 8) {
    const topRatedIds = await prisma.$queryRaw<{ productId: string; avgRating: number }[]>`
      SELECT "productId", AVG("rating") as "avgRating"
      FROM "Review"
      GROUP BY "productId"
      ORDER BY "avgRating" DESC, COUNT("id") DESC
      LIMIT ${limit}
    `;

    if (topRatedIds.length === 0) return this.getNewProducts(limit);

    const ids = topRatedIds.map(p => p.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: ids }, isDeleted: false },
      include: {
        images: { orderBy: { isPrimary: 'desc' }, take: 1 },
        variants: { orderBy: { price: 'asc' }, take: 1 },
        category: { select: { name: true } },
      },
    });

    const productMap = new Map(products.map(p => [p.id, p]));
    const orderedProducts = topRatedIds
      .map(h => productMap.get(h.productId))
      .filter((p): p is any => !!p);

    return this.enrichProductData(orderedProducts);
  }

  async getNewProducts(limit: number = 8) {
    const products = await prisma.product.findMany({
      where: { isDeleted: false },
      include: {
        images: { orderBy: { isPrimary: 'desc' }, take: 1 },
        variants: { orderBy: { price: 'asc' }, take: 1 },
        category: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return this.enrichProductData(products);
  }

  async create(data: any) {
    const { name, slug, description, categoryId, variants } = data;
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) throw new AppError(400, 'Slug sản phẩm đã tồn tại');

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        categoryId,
        variants: { create: variants }
      },
      include: { variants: true }
    });

    await this.clearProductCache();
    return product;
  }

  async update(id: string, data: any) {
    const { variants, ...productData } = data;
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

  async softDelete(id: string) {
    const product = await prisma.product.update({
      where: { id },
      data: { isDeleted: true }
    });
    await this.clearProductCache();
    return product;
  }

  private async clearProductCache() {
    try {
      await cacheDelPattern('products:list:*');
    } catch (error) {
      console.error('❌ Failed to clear product cache:', error);
    }
  }

  async addImages(productId: string, imageUrls: string[]) {
    const imagesData = imageUrls.map(url => ({ productId, url, isPrimary: false }));
    return prisma.productImage.createMany({ data: imagesData });
  }

  async searchByVector(embedding: number[], limit: number = 10) {
    const vectorString = `[${embedding.join(',')}]`;
    const products = await prisma.$queryRaw<any[]>(Prisma.sql`
      SELECT p.id, p.name, p.slug, p.description
      FROM "Product" p
      WHERE p."isDeleted" = false AND p.embedding IS NOT NULL
      ORDER BY p.embedding <=> ${vectorString}::vector ASC
      LIMIT ${limit}
    `);

    // Cần lấy thêm include cho enrichProductData
    if (products.length === 0) return [];
    
    const fullProducts = await prisma.product.findMany({
      where: { id: { in: products.map(p => p.id) } },
      include: {
        images: { orderBy: { isPrimary: 'desc' }, take: 1 },
        variants: { orderBy: { price: 'asc' }, take: 1 },
        category: { select: { name: true } },
      }
    });

    return this.enrichProductData(fullProducts);
  }

  async deleteImage(imageId: string) {
    return prisma.productImage.delete({ where: { id: imageId } });
  }

  async setPrimaryImage(productId: string, imageId: string) {
    return prisma.$transaction([
      prisma.productImage.updateMany({ where: { productId }, data: { isPrimary: false } }),
      prisma.productImage.update({ where: { id: imageId }, data: { isPrimary: true } })
    ]);
  }
}

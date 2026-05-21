import { prisma } from '../../../lib/prisma';
import { Prisma } from '@prisma/client';
import { AppError } from '../../../middlewares/error.middleware';
import { cacheSet, cacheGet, cacheDelPattern } from '../../../lib/redis';
import { EmbeddingHelper } from '../../ai/embeddingHelper';
import { VisionHelper } from '../../ai/vision/visionHelper';

const embeddingHelper = new EmbeddingHelper();
const visionHelper = new VisionHelper();

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
    if (!query.isAdmin) {
      where.isActive = true;
    }
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
      where: { slug, isDeleted: false, isActive: true },
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
      where: { id: { in: ids }, isDeleted: false, isActive: true },
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
      where: { id: { in: ids }, isDeleted: false, isActive: true },
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
      where: { isDeleted: false, isActive: true },
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

    // 🔥 Cập nhật Embedding cho AI (chạy nền hoặc đợi)
    this.syncEmbedding(product.id, name, description).catch(err => console.error('Sync embedding error:', err));

    return product;
  }

  async update(id: string, data: any) {
    const { variants, ...productData } = data;

    // Chuẩn bị dữ liệu cập nhật
    const updateData: any = { ...productData };

    // Chỉ cập nhật variants nếu được cung cấp và có dữ liệu
    if (variants && Array.isArray(variants) && variants.length > 0) {
      updateData.variants = {
        deleteMany: {},
        create: variants
      };
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: { variants: true }
    });

    await this.clearProductCache();

    // 🔥 Cập nhật Embedding cho AI và đồng bộ trạng thái
    // Nếu sản phẩm bị ẩn (isActive: false), AI sẽ tự động bỏ qua khi tìm kiếm nhờ filter ở intelligentSearch
    this.syncEmbedding(product.id, product.name, product.description || '').catch(err => console.error('Sync embedding error:', err));

    return product;
  }

  /**
   * Đồng bộ Vector Embedding (Text & Image) cho AI
   */
  private async syncEmbedding(productId: string, name: string, description: string) {
    try {
      // 1. Text Embedding
      const text = EmbeddingHelper.buildProductEmbeddingText({ name, description });
      const embedding = await embeddingHelper.generateEmbedding(text);
      const vectorString = `[${embedding.join(',')}]`;

      await prisma.$executeRawUnsafe(
        `UPDATE "Product" SET "embedding" = ${vectorString}::vector WHERE "id" = $1`,
        productId
      );

      // 2. Image Embedding (cho ảnh Primary)
      const primaryImage = await prisma.productImage.findFirst({
        where: { productId, isPrimary: true }
      });
      if (primaryImage) {
        await this.syncSingleImageEmbedding(primaryImage.id, primaryImage.url);

        // Cập nhật luôn vào Product.imageEmbedding để tương thích ngược
        const img = await prisma.productImage.findUnique({ where: { id: primaryImage.id } });
        if (img && (img as any).imageEmbedding) {
          // Lấy lại từ DB vì syncSingleImageEmbedding dùng raw SQL
          const imgData: any = await prisma.$queryRawUnsafe(
            `SELECT "imageEmbedding"::text FROM "ProductImage" WHERE id = $1`,
            primaryImage.id
          );
          if (imgData?.[0]?.imageEmbedding) {
            await prisma.$executeRawUnsafe(
              `UPDATE "Product" SET "imageEmbedding" = $1::vector WHERE "id" = $2`,
              imgData[0].imageEmbedding,
              productId
            );
          }
        }
      }

      console.log(`✅ AI Context (Text) updated for product: ${name}`);
    } catch (error) {
      console.error(`❌ Failed to sync AI context for product ${productId}:`, error);
    }
  }

  /**
   * Đồng bộ embedding cho một ảnh cụ thể
   */
  private async syncSingleImageEmbedding(imageId: string, imageUrl: string) {
    try {
      const isReady = await visionHelper.isServiceReady();
      if (!isReady) return;

      const embedding = await visionHelper.generateImageEmbedding(imageUrl);
      const vectorString = `[${embedding.join(',')}]`;

      await prisma.$executeRawUnsafe(
        `UPDATE "ProductImage" SET "imageEmbedding" = ${vectorString}::vector WHERE "id" = $1`,
        imageId
      );
      console.log(`✅ Image embedding updated: ${imageUrl}`);
    } catch (error) {
      console.error(`❌ Failed to sync image embedding for ${imageUrl}:`, error);
    }
  }

  async softDelete(id: string) {
    // 1. Kiểm tra xem sản phẩm có trong đơn hàng nào không
    const orderItemsCount = await prisma.orderItem.count({
      where: { productId: id }
    });
    if (orderItemsCount > 0) {
      throw new AppError(400, 'Không thể xóa sản phẩm này vì đã tồn tại trong lịch sử đơn hàng.');
    }

    // 2. Kiểm tra xem sản phẩm có trong giỏ hàng nào không
    const cartItemsCount = await prisma.cart.count({
      where: { productId: id }
    });
    if (cartItemsCount > 0) {
      throw new AppError(400, 'Không thể xóa sản phẩm này vì đang có trong giỏ hàng của người dùng.');
    }

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
    const result = await prisma.productImage.createMany({ data: imagesData });

    await this.clearProductCache();

    // 🔥 Chạy nền việc tạo embedding cho các ảnh mới
    const newImages = await prisma.productImage.findMany({
      where: { productId, url: { in: imageUrls } }
    });

    newImages.forEach(img => {
      this.syncSingleImageEmbedding(img.id, img.url).catch(e => console.error(e));
    });

    return result;
  }

  async searchByVector(embedding: number[], limit: number = 10) {
    const vectorString = `[${embedding.join(',')}]`;
    const products = await prisma.$queryRaw<any[]>(Prisma.sql`
      SELECT p.id, p.name, p.slug, p.description
      FROM "Product" p
      WHERE p."isDeleted" = false AND p."isActive" = true AND p.embedding IS NOT NULL
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
    const result = await prisma.productImage.delete({ where: { id: imageId } });
    await this.clearProductCache();
    return result;
  }

  async setPrimaryImage(productId: string, imageId: string) {
    const result = await prisma.$transaction([
      prisma.productImage.updateMany({ where: { productId }, data: { isPrimary: false } }),
      prisma.productImage.update({ where: { id: imageId }, data: { isPrimary: true } })
    ]);
    await this.clearProductCache();
    return result;
  }
}

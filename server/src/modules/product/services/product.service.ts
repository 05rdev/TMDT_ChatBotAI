import { prisma } from '../../../lib/prisma';
import { Prisma } from '@prisma/client';
import { AppError } from '../../../middlewares/error.middleware';
import { cacheDelPattern } from '../../../lib/redis';
import { EmbeddingHelper } from '../../ai/embeddingHelper';
import { VisionHelper } from '../../ai/vision/visionHelper';
import { buildAttributeEmbeddingText, normalizeProductAttributes, NormalizedProductAttribute } from '../attribute-taxonomy';

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
          variants: {
            orderBy: { price: 'asc' },
            select: { id: true, name: true, price: true, stock: true }
          },
          category: { select: { name: true } },
          attributes: true,
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
        attributes: true,
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
        attributes: true,
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
          variants: {
            orderBy: { price: 'asc' },
            select: { id: true, name: true, price: true, stock: true }
          },
          category: { select: { name: true } },
          attributes: true,
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
          variants: {
            orderBy: { price: 'asc' },
            select: { id: true, name: true, price: true, stock: true }
          },
          category: { select: { name: true } },
          attributes: true,
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
          variants: {
            orderBy: { price: 'asc' },
            select: { id: true, name: true, price: true, stock: true }
          },
          category: { select: { name: true } },
          attributes: true,
        },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return this.enrichProductData(products);
  }

  private async replaceProductAttributes(
    tx: Prisma.TransactionClient,
    productId: string,
    attributes: NormalizedProductAttribute[]
  ) {
    await tx.productAttribute.deleteMany({ where: { productId } });
    if (attributes.length === 0) return;

    await tx.productAttribute.createMany({
      data: attributes.map((attr) => ({
        productId,
        key: attr.key,
        value: attr.value,
        unit: attr.unit || null,
      })),
      skipDuplicates: true,
    });
  }

  async create(data: any) {
    const { name, slug, description, categoryId, variants, attributes = [] } = data;
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) throw new AppError(400, 'Slug sản phẩm đã tồn tại');

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { name: true },
    });

    const normalizedAttributes = normalizeProductAttributes({
      name,
      description,
      categoryName: category?.name,
      variants,
      attributes,
    });

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        categoryId,
        variants: { create: variants },
        attributes: { create: normalizedAttributes }
      },
      include: { variants: true, attributes: true, category: true }
    });

    await this.clearProductCache();

    // 🔥 Cập nhật Embedding cho AI (chạy nền hoặc đợi)
    this.syncEmbedding(product.id, name, description).catch(err => console.error('Sync embedding error:', err));

    return product;
  }

  async update(id: string, data: any) {
    const { variants, attributes, ...productData } = data;

    // Sử dụng transaction để đảm bảo toàn vẹn dữ liệu
    const finalProduct = await prisma.$transaction(async (tx) => {
      // 1. Cập nhật thông tin cơ bản của product trước
      const updatedProduct = await tx.product.update({
        where: { id },
        data: productData,
      });

      // 2. Xử lý logic variants thông minh (Smart Sync)
      if (variants && Array.isArray(variants)) {
        // Lấy danh sách variants hiện có trong DB của sản phẩm này
        const dbVariants = await tx.productVariant.findMany({
          where: { productId: id },
          include: { 
            _count: { 
              select: { orderItems: true, cartItems: true } 
            } 
          }
        });

        const incomingIds = variants.map(v => v.id).filter(Boolean) as string[];

        // A. Xóa hoặc vô hiệu hóa các variant cũ không còn xuất hiện trong incoming variants
        const toDelete = dbVariants.filter(dbV => !incomingIds.includes(dbV.id));
        for (const variantToDelete of toDelete) {
          const hasOrders = variantToDelete._count.orderItems > 0;
          if (hasOrders) {
            // Nếu đã có order, KHÔNG xóa cứng để tránh vi phạm khoá ngoại (P2003)
            // Thay vào đó, cập nhật stock = 0 để vô hiệu hóa việc mua sắm biến thể này
            await tx.productVariant.update({
              where: { id: variantToDelete.id },
              data: { 
                stock: 0, 
                // Thay đổi sku để tránh trùng lặp SKU khi tạo variant mới
                sku: `${variantToDelete.sku}_archived_${Date.now()}` 
              }
            });
          } else {
            // Nếu chưa có order, xóa cứng an toàn
            // Trước hết xóa cart items liên quan (nếu có)
            if (variantToDelete._count.cartItems > 0) {
              await tx.cart.deleteMany({
                where: { productVariantId: variantToDelete.id }
              });
            }
            await tx.productVariant.delete({
              where: { id: variantToDelete.id }
            });
          }
        }

        // B. Cập nhật các variant đang có hoặc tạo mới các variant chưa có
        for (const v of variants) {
          if (v.id && dbVariants.some(dbV => dbV.id === v.id)) {
            // Update
            const { id: _, productId: __, ...updatePayload } = v;
            await tx.productVariant.update({
              where: { id: v.id },
              data: updatePayload
            });
          } else {
            // Create
            const { id: _, ...createPayload } = v;
            await tx.productVariant.create({
              data: {
                ...createPayload,
                productId: id
              }
            });
          }
        }
      }

      // Lấy product đầy đủ thông tin variants đã được xử lý xong
      const productForAttributes = await tx.product.findUnique({
        where: { id },
        include: {
          category: { select: { name: true } },
          variants: true,
          attributes: true,
        }
      });

      if (productForAttributes) {
        const normalizedAttributes = normalizeProductAttributes({
          name: productForAttributes.name,
          description: productForAttributes.description,
          categoryName: productForAttributes.category?.name,
          variants: productForAttributes.variants,
          attributes: Array.isArray(attributes) ? attributes : productForAttributes.attributes,
        });

        await this.replaceProductAttributes(tx, id, normalizedAttributes);
      }

      return tx.product.findUnique({
        where: { id },
        include: { variants: true, attributes: true, category: true }
      });
    });

    await this.clearProductCache();

    // 🔥 Cập nhật Embedding cho AI và đồng bộ trạng thái
    // Nếu sản phẩm bị ẩn (isActive: false), AI sẽ tự động bỏ qua khi tìm kiếm nhờ filter ở intelligentSearch
    if (finalProduct) {
      this.syncEmbedding(finalProduct.id, finalProduct.name, finalProduct.description || '').catch(err => console.error('Sync embedding error:', err));
    }

    return finalProduct;
  }

  /**
   * Đồng bộ Vector Embedding (Text & Image) cho AI
   */
  private async syncEmbedding(productId: string, name: string, description: string) {
    try {
      // Lấy đầy đủ thông tin Product kèm Category và Attributes để sinh embedding chính xác nhất
      const fullProduct = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          category: { select: { name: true } },
          attributes: true,
          variants: true,
        }
      });

      if (!fullProduct) {
        console.warn(`⚠️ Cannot sync embedding: Product ${productId} not found.`);
        return;
      }

      // 1. Text Embedding với đầy đủ thông số kỹ thuật và danh mục
      const text = buildAttributeEmbeddingText({
        name: fullProduct.name,
        description: fullProduct.description || '',
        categoryName: fullProduct.category?.name || null,
        variants: fullProduct.variants,
        attributes: fullProduct.attributes || []
      });
      
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
        variants: {
          orderBy: { price: 'asc' },
          select: { id: true, name: true, price: true, stock: true }
        },
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

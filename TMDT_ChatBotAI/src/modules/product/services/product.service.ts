import { prisma } from '../../../lib/prisma';
import { Prisma } from '@prisma/client';
import { AppError } from '../../../middlewares/error.middleware';
import { cacheSet, cacheGet } from '../../../lib/redis';

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
          images: { where: { isPrimary: true }, take: 1 },
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

    const result = {
      products,
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
   * Tạo sản phẩm mới kèm Variants
   */
  async create(data: any) {
    const { name, slug, description, categoryId, variants } = data;

    // Kiểm tra slug
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) throw new AppError(400, 'Slug sản phẩm đã tồn tại');

    return prisma.product.create({
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
  }

  /**
   * Cập nhật sản phẩm
   */
  async update(id: string, data: any) {
    const { variants, ...productData } = data;

    // Nếu có variants, ta sẽ cập nhật hoặc tạo mới (Để đơn giản ở đây ta xóa cũ tạo mới nếu truyền mảng mới)
    // Trong thực tế nên xử lý update từng variant id
    return prisma.product.update({
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
  }

  /**
   * Xóa mềm sản phẩm
   */
  async softDelete(id: string) {
    return prisma.product.update({
      where: { id },
      data: { isDeleted: true }
    });
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
}

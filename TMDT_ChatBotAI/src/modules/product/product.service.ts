import slugify from 'slugify';
import { prisma } from '@lib/prisma';
import { cacheGet, cacheSet, cacheDel } from '@lib/redis';
import { AppError } from '@middlewares/error.middleware';
import { CreateProductInput, UpdateProductInput, ProductQueryInput } from './product.dto';

const CACHE_TTL = 300; // 5 phút

export class ProductService {
  async getAll(query: ProductQueryInput) {
    const cacheKey = `products:list:${JSON.stringify(query)}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return cached;

    const { page, limit, categoryId, minPrice, maxPrice } = query;
    const skip = (page - 1) * limit;

    const where = {
      ...(categoryId && { categoryId }),
      ...((minPrice !== undefined || maxPrice !== undefined) && {
        price: {
          ...(minPrice !== undefined && { gte: minPrice }),
          ...(maxPrice !== undefined && { lte: maxPrice }),
        },
      }),
    };

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { images: { where: { isPrimary: true } }, category: { select: { id: true, name: true } } },
      }),
      prisma.product.count({ where }),
    ]);

    const result = { data, total, page, totalPages: Math.ceil(total / limit) };
    await cacheSet(cacheKey, result, CACHE_TTL);
    return result;
  }

  async getBySlug(slug: string) {
    const cacheKey = `products:slug:${slug}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return cached;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        images: true,
        category: true,
        reviews: { include: { user: { select: { name: true } } }, take: 10, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!product) throw new AppError(404, 'Product not found');

    await cacheSet(cacheKey, product, CACHE_TTL);
    return product;
  }

  async create(data: CreateProductInput) {
    const slug = slugify(data.name, { lower: true, strict: true });
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) throw new AppError(409, `Slug "${slug}" already exists`);

    const product = await prisma.product.create({ data: { ...data, slug } });
    await cacheDel('products:list:*');
    return product;
  }

  async update(id: string, data: UpdateProductInput) {
    const product = await prisma.product.update({ where: { id }, data });
    await cacheDel(`products:slug:${product.slug}`, 'products:list:*');
    return product;
  }

  async delete(id: string) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw new AppError(404, 'Product not found');
    await prisma.product.delete({ where: { id } });
    await cacheDel(`products:slug:${product.slug}`, 'products:list:*');
  }
}

export const productService = new ProductService();

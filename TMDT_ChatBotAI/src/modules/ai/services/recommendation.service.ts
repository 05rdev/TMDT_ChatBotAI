import { prisma } from '../../../lib/prisma';
import { Prisma } from '@prisma/client';
import { cacheGet, cacheSet } from '../../../lib/redis';

export class RecommendationService {
  /**
   * 1. Sản phẩm tương tự (Similar Products)
   * Dựa trên Vector Similarity
   */
  async getSimilarProducts(productId: string, limit: number = 6) {
    // Lấy embedding của sản phẩm hiện tại
    const products = await prisma.$queryRaw<any[]>`
      SELECT embedding FROM "Product" WHERE id = ${productId} LIMIT 1
    `;

    if (!products || products.length === 0 || !products[0].embedding) return [];

    const vectorString = `[${products[0].embedding.toString()}]`;

    // Tìm top N sản phẩm gần nhất
    return prisma.$queryRaw<any[]>(Prisma.sql`
      SELECT p.id, p.name, p.slug, p.description,
             p.embedding <=> ${vectorString}::vector AS distance
      FROM "Product" p
      WHERE p.id != ${productId} 
        AND p."isDeleted" = false 
        AND p.embedding IS NOT NULL
      ORDER BY distance ASC
      LIMIT ${limit}
    `);
  }

  /**
   * 2. Gợi ý cá nhân hóa (Personalized Recommendations)
   * Chiến lược: Lấy 5 tương tác gần nhất -> Tính vector trung bình -> Tìm top 10 SP tương đồng
   */
  async getPersonalized(userId: string, limit: number = 10) {
    const cacheKey = `rec:${userId}`;
    
    // 1. Kiểm tra Cache Redis
    const cachedData = await cacheGet<string>(cacheKey);
    if (cachedData) {
      console.log('🚀 Serving recommendations from Redis Cache');
      return JSON.parse(cachedData);
    }

    // 2. Lấy 5 hành vi gần nhất (VIEW hoặc PURCHASE)
    const behaviors = await prisma.userBehavior.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { productId: true }
    });

    // Fallback: Nếu không có lịch sử, lấy sản phẩm bán chạy nhất
    if (behaviors.length === 0) {
      const topSelling = await this.getTopSellingFallback(limit);
      await cacheSet(cacheKey, JSON.stringify(topSelling), 600); // Cache 10p
      return topSelling;
    }

    // 3. Lấy Embeddings của các sản phẩm đó
    const productIds = behaviors.map(b => b.productId);
    const productsWithEmbeddings = await prisma.$queryRaw<any[]>`
      SELECT id, embedding FROM "Product" 
      WHERE id IN (${Prisma.join(productIds)}) 
        AND embedding IS NOT NULL
    `;

    if (productsWithEmbeddings.length === 0) {
      return this.getTopSellingFallback(limit);
    }

    // 4. Tính toán Vector trung bình (Mean Vector)
    const vectorSize = 1536;
    const avgVector = new Array(vectorSize).fill(0);
    
    productsWithEmbeddings.forEach(p => {
      const emb = typeof p.embedding === 'string' 
        ? p.embedding.replace('[', '').replace(']', '').split(',').map(Number)
        : p.embedding as number[];
        
      emb.forEach((val: number, i: number) => avgVector[i] += val);
    });

    const finalVector = avgVector.map(val => val / productsWithEmbeddings.length);
    const vectorString = `[${finalVector.join(',')}]`;

    // 5. Query Vector Search (loại trừ các sản phẩm đã tương tác gần đây)
    const recommendations = await prisma.$queryRaw<any[]>(Prisma.sql`
      SELECT p.id, p.name, p.slug, p.description,
             p.embedding <=> ${vectorString}::vector AS distance
      FROM "Product" p
      WHERE p."isDeleted" = false 
        AND p.id NOT IN (${Prisma.join(productIds)})
        AND p.embedding IS NOT NULL
      ORDER BY distance ASC
      LIMIT ${limit}
    `);

    // 6. Lưu vào Cache (TTL 10 phút)
    await cacheSet(cacheKey, JSON.stringify(recommendations), 600);

    return recommendations;
  }

  /**
   * Fallback: Trả về sản phẩm bán chạy nhất hoặc mới nhất
   */
  private async getTopSellingFallback(limit: number) {
    // Giả định logic bán chạy dựa trên số lượng trong OrderItem
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _count: { productId: true },
      orderBy: { _count: { productId: 'desc' } },
      take: limit
    });

    const ids = topProducts.map(tp => tp.productId);
    
    if (ids.length === 0) {
      return prisma.product.findMany({ 
        where: { isDeleted: false }, 
        take: limit 
      });
    }

    return prisma.product.findMany({
      where: { id: { in: ids }, isDeleted: false }
    });
  }
}

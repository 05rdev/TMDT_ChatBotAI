import { prisma } from '../../../lib/prisma';
import { Prisma } from '@prisma/client';
import { cacheGet, cacheSet } from '../../../lib/redis';

export class RecommendationService {
  /**
   * 1. Sản phẩm tương tự (Similar Products)
   * Dựa trên Vector Similarity
   */
  async getSimilarProducts(productId: string, limit: number = 6) {
    try {
      // 1. Lấy embedding của sản phẩm hiện tại
      const products = await prisma.$queryRaw<any[]>`
        SELECT embedding::text FROM "Product" WHERE id = ${productId} LIMIT 1
      `;

      if (!products || products.length === 0 || !products[0].embedding) {
        console.log(`ℹ️ Product ${productId} has no embedding. Returning fallback.`);
        return this.getTopSellingFallback(limit);
      }

      const rawEmb = products[0].embedding;
      
      // Chuyển đổi embedding sang định dạng chuỗi vector của Postgres [v1, v2, ...]
      let vectorString: string;
      if (Array.isArray(rawEmb)) {
        vectorString = `[${rawEmb.join(',')}]`;
      } else if (typeof rawEmb === 'string') {
        vectorString = rawEmb.startsWith('[') ? rawEmb : `[${rawEmb}]`;
      } else {
        // Handle cases where it might be a Buffer or other object
        vectorString = `[${rawEmb.toString()}]`;
      }

      // 2. Tìm top N sản phẩm gần nhất bằng toán tử <=> (cosine distance)
      const results = await prisma.$queryRaw<any[]>(Prisma.sql`
        SELECT p.id, p.embedding <=> ${vectorString}::vector AS distance
        FROM "Product" p
        WHERE p.id != ${productId} 
          AND p."isDeleted" = false 
          AND p.embedding IS NOT NULL
        ORDER BY distance ASC
        LIMIT ${limit}
      `);

      if (results.length === 0) return [];

      // 3. Hydrate dữ liệu đầy đủ (Ảnh, Giá, Danh mục)
      const productIds = results.map(r => r.id);
      const fullProducts = await prisma.product.findMany({
        where: { id: { in: productIds } },
        include: {
          images: { orderBy: { isPrimary: 'desc' }, take: 1 },
          variants: { orderBy: { price: 'asc' }, take: 1 },
          category: { select: { name: true } }
        }
      });

      // 4. Map lại để giữ đúng thứ tự ưu tiên của AI và chuyển đổi Decimal sang Number
      const recommendations = results.map(r => {
        const p = fullProducts.find(fp => fp.id === r.id);
        if (!p) return null;
        
        // Lấy giá thấp nhất và ép kiểu về Number
        const price = p.variants[0]?.price ? Number(p.variants[0].price) : 0;
        const imageUrl = p.images[0]?.url || null;

        return {
          ...p,
          distance: r.distance,
          minPrice: price,
          primaryImage: imageUrl,
          // Đảm bảo variants cũng có price dạng number để frontend không bị lỗi
          variants: p.variants.map(v => ({ ...v, price: Number(v.price) }))
        };
      }).filter(Boolean);

      return recommendations;
    } catch (error: any) {
      console.error(`❌ getSimilarProducts Error for ID ${productId}:`, error.message);
      
      // Nếu lỗi do thiếu extension vector hoặc sai kích thước vector, trả về fallback
      if (error.message.includes('vector') || error.message.includes('dimension')) {
        return this.getTopSellingFallback(limit);
      }
      
      return [];
    }
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
    const firstEmb = productsWithEmbeddings[0].embedding;
    const sampleEmb = typeof firstEmb === 'string' 
      ? firstEmb.replace('[', '').replace(']', '').split(',').map(Number)
      : firstEmb as number[];
      
    const vectorSize = sampleEmb.length;
    const avgVector = new Array(vectorSize).fill(0);
    
    productsWithEmbeddings.forEach(p => {
      const emb = typeof p.embedding === 'string' 
        ? p.embedding.replace('[', '').replace(']', '').split(',').map(Number)
        : p.embedding as number[];
      
      // Ensure the embedding has the same size
      if (emb.length === vectorSize) {
        emb.forEach((val: number, i: number) => avgVector[i] += val);
      }
    });

    const finalVector = avgVector.map(val => val / productsWithEmbeddings.length);
    const vectorString = `[${finalVector.join(',')}]`;

    // 5. Query Vector Search (loại trừ các sản phẩm đã tương tác gần đây)
    const results = await prisma.$queryRaw<any[]>(Prisma.sql`
      SELECT p.id, p.embedding <=> ${vectorString}::vector AS distance
      FROM "Product" p
      WHERE p."isDeleted" = false 
        AND p.id NOT IN (${Prisma.join(productIds)})
        AND p.embedding IS NOT NULL
      ORDER BY distance ASC
      LIMIT ${limit}
    `);

    if (results.length === 0) return [];

    // 6. Hydrate dữ liệu đầy đủ
    const recIds = results.map(r => r.id);
    const fullProducts = await prisma.product.findMany({
      where: { id: { in: recIds } },
      include: {
        images: { orderBy: { isPrimary: 'desc' }, take: 1 },
        variants: { orderBy: { price: 'asc' }, take: 1 },
        category: { select: { name: true } }
      }
    });

    const recommendations = results.map(r => {
      const p = fullProducts.find(fp => fp.id === r.id);
      if (!p) return null;

      const price = p.variants[0]?.price ? Number(p.variants[0].price) : 0;
      const imageUrl = p.images[0]?.url || null;

      return {
        ...p,
        distance: r.distance,
        minPrice: price,
        primaryImage: imageUrl,
        variants: p.variants.map(v => ({ ...v, price: Number(v.price) }))
      };
    }).filter(Boolean);

    // 7. Lưu vào Cache (TTL 10 phút)
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
      const fallbackProducts = await prisma.product.findMany({ 
        where: { isDeleted: false }, 
        include: {
          images: { orderBy: { isPrimary: 'desc' }, take: 1 },
          variants: { orderBy: { price: 'asc' }, take: 1 },
          category: { select: { name: true } }
        },
        take: limit 
      });
      return this.mapProductStats(fallbackProducts);
    }

    const products = await prisma.product.findMany({
      where: { id: { in: ids }, isDeleted: false },
      include: {
        images: { orderBy: { isPrimary: 'desc' }, take: 1 },
        variants: { orderBy: { price: 'asc' }, take: 1 },
        category: { select: { name: true } }
      }
    });

    return this.mapProductStats(products);
  }

  /**
   * Helper để map giá và ảnh cho đồng bộ
   */
  private mapProductStats(products: any[]) {
    return products.map(p => ({
      ...p,
      minPrice: p.variants[0]?.price ? Number(p.variants[0].price) : 0,
      primaryImage: p.images[0]?.url || null,
      variants: p.variants.map((v: any) => ({ ...v, price: Number(v.price) }))
    }));
  }
}

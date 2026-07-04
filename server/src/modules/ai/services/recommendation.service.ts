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
   * 2. Gợi ý cá nhân hóa (Hybrid Recommendations)
   * Thuật toán: 0.4 * Vector Score + 0.4 * Collaborative Score + 0.2 * Recency Boost
   */
  async getPersonalized(userId: string, limit: number = 10) {
    const cacheKey = `rec:hybrid:${userId}`;
    
    // 1. Kiểm tra Cache Redis
    const cachedData = await cacheGet<string>(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    // 2. Lấy lịch sử hành vi của user (Top 10 gần nhất)
    const recentBehaviors = await prisma.userBehavior.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { productId: true }
    });

    if (recentBehaviors.length === 0) {
      return this.getTopSellingFallback(limit);
    }

    const interactedProductIds = Array.from(new Set(recentBehaviors.map(b => b.productId)));

    // 3. Tính Mean Vector (Profile Vector)
    const productsWithEmbeddings = await prisma.$queryRaw<any[]>`
      SELECT embedding::text FROM "Product" 
      WHERE id IN (${Prisma.join(interactedProductIds)}) 
        AND embedding IS NOT NULL
    `;

    let vectorString = '[]';
    if (productsWithEmbeddings.length > 0) {
      const sampleEmb = typeof productsWithEmbeddings[0].embedding === 'string' 
        ? productsWithEmbeddings[0].embedding.replace('[', '').replace(']', '').split(',').map(Number)
        : productsWithEmbeddings[0].embedding;
      
      const avgVector = new Array(sampleEmb.length).fill(0);
      productsWithEmbeddings.forEach(p => {
        const emb = typeof p.embedding === 'string' 
          ? p.embedding.replace('[', '').replace(']', '').split(',').map(Number)
          : p.embedding;
        if (emb.length === avgVector.length) {
          emb.forEach((val: number, i: number) => avgVector[i] += val);
        }
      });
      const finalVector = avgVector.map(val => val / productsWithEmbeddings.length);
      vectorString = `[${finalVector.join(',')}]`;
    }

    // 4. Hybrid Query (Raw SQL for Performance)
    // - Vector Score: 1 - cosine_distance
    // - Collab Score: Đếm số lượng người dùng khác cũng mua/xem các sản phẩm này
    // - Recency Score: Log scale dựa trên số ngày kể từ khi tạo
    const results = await prisma.$queryRaw<any[]>(Prisma.sql`
      WITH vector_scores AS (
        SELECT id, 1 - (embedding <=> ${vectorString}::vector) as score
        FROM "Product"
        WHERE "isDeleted" = false AND embedding IS NOT NULL
          AND id NOT IN (${Prisma.join(interactedProductIds)})
      ),
      collab_signals AS (
        SELECT "productId", COUNT(*) as signal_count
        FROM "UserBehavior"
        WHERE "productId" NOT IN (${Prisma.join(interactedProductIds)})
          AND "userId" IN (
            SELECT DISTINCT "userId" 
            FROM "UserBehavior" 
            WHERE "productId" IN (${Prisma.join(interactedProductIds)})
              AND "userId" != ${userId}
          )
        GROUP BY "productId"
      )
      SELECT p.id,
             (0.4 * COALESCE(vs.score, 0) + 
              0.4 * (1 - 1/(1 + COALESCE(cs.signal_count, 0))) + 
              0.2 * (1 - 1/(1 + EXTRACT(EPOCH FROM (NOW() - p."createdAt"))/864000))) as final_score
      FROM "Product" p
      LEFT JOIN vector_scores vs ON p.id = vs.id
      LEFT JOIN collab_signals cs ON p.id = cs."productId"
      WHERE p."isDeleted" = false
        AND p.id NOT IN (${Prisma.join(interactedProductIds)})
      ORDER BY final_score DESC
      LIMIT ${limit}
    `);

    // 5. Hydrate & Return
    const recIds = results.map(r => r.id);
    const recommendations = await prisma.product.findMany({
      where: { id: { in: recIds } },
      include: {
        images: { orderBy: { isPrimary: 'desc' }, take: 1 },
        variants: { orderBy: { price: 'asc' }, take: 1 },
        category: { select: { name: true } }
      }
    });

    const finalResult = results.map(r => {
      const p = recommendations.find(fp => fp.id === r.id);
      if (!p) return null;
      return {
        ...p,
        score: r.final_score,
        minPrice: Number(p.variants[0]?.price || 0),
        primaryImage: p.images[0]?.url || null,
        variants: p.variants.map(v => ({ ...v, price: Number(v.price) }))
      };
    }).filter(Boolean);

    await cacheSet(cacheKey, JSON.stringify(finalResult), 600);
    return finalResult;
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

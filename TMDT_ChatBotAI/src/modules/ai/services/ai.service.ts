import { PrismaClient, Prisma } from '@prisma/client';
import { EmbeddingHelper } from '../embeddingHelper';
import { ProductService } from '../../product/services/product.service';

const prisma = new PrismaClient();
const embeddingHelper = new EmbeddingHelper();

// Từ khóa gợi ý người dùng đang mô tả tính năng/cảm xúc, không phải tên sản phẩm cụ thể
const FEATURE_KEYWORDS = [
  'tiết kiệm điện', 'mỏng nhẹ', 'bền', 'pin lâu', 'chụp ảnh đẹp',
  'tốt cho', 'phù hợp', 'dùng để', 'loại nào', 'tư vấn', 'gợi ý',
  'nên mua', 'muốn mua', 'cần mua', 'tìm', 'kiếm'
];

// Từ khóa tên thương hiệu/model cụ thể → nên dùng keyword search
const BRAND_KEYWORDS = [
  'iphone', 'samsung', 'xiaomi', 'sony', 'lg', 'panasonic', 'toshiba',
  'sharp', 'philips', 'daikin', 'mitsubishi', 'electrolux', 'bosch'
];

export class AIService {
  private ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434/api/chat';
  private modelName = process.env.OLLAMA_MODEL || 'qwen2.5:3b';
  private readonly PARSE_TIMEOUT_MS = 8_000;
  private productService = new ProductService();

  /**
   * Phân tích câu truy vấn tự nhiên bằng Ollama sang JSON chuẩn
   */
  private async parseQueryWithAI(query: string) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.PARSE_TIMEOUT_MS);

    const systemPrompt = `
      Bạn là chuyên gia phân tích dữ liệu mua sắm. 
      Nhiệm vụ: Chuyển câu truy vấn mua sắm tiếng Việt sang JSON.
      JSON Schema: {
        "category": string | null,
        "priceMin": number | null,
        "priceMax": number | null,
        "minRating": number | null,
        "minSold": number | null,
        "minReviews": number | null,
        "keywords": string | null,
        "features": string[] | null,
        "sort": "price_asc" | "price_desc" | "newest" | "best_selling" | "top_rated" | "most_reviewed" | null
      }
      QUY TẮC: Trả về DUY NHẤT JSON. Không giải thích. 
      XỬ LÝ TIỀN TỆ & TIÊU CHÍ: 
      - "tr", "triệu", "củ" -> x1.000.000 (Vd: 5tr -> 5000000)
      - "k" -> x1.000 (Vd: 500k -> 500000)
      - "dưới 5tr" -> priceMax: 5000000
      - "trên 10tr" -> priceMin: 10000000
      - "trên 4 sao", "4 sao trở lên" -> minRating: 4
      - "bán chạy", "nhiều người mua" -> sort: "best_selling"
      - "đánh giá tốt", "uy tín" -> sort: "top_rated"
      - "nhiều bình luận", "nhiều review" -> sort: "most_reviewed"
    `;

    try {
      const response = await fetch(this.ollamaUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.modelName,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Phân tích: "${query}"` }
          ],
          stream: false,
          format: 'json'
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);
      if (!response.ok) return null;
      const data: any = await response.json();
      return JSON.parse(data.message.content);
    } catch (error: any) {
      clearTimeout(timeout);
      const reason = error.name === 'AbortError' ? 'timeout' : error.message;
      console.warn(`⚠️ Ollama Query Parsing Failed (${reason}), using fallback regex.`);
      return null;
    }
  }

  /**
   * Fallback Regex để bắt giá tiền nếu AI không phân tích được
   */
  private extractFiltersRegex(query: string) {
    const filters: any = { 
      category: null, 
      priceMin: null, 
      priceMax: null, 
      minRating: null,
      keywords: null,
      sort: null 
    };
    const q = query.toLowerCase();

    // Price regex
    const maxPriceMatch = q.match(/(?:dưới|u|<=)\s*(\d+(?:\.\d+)?)\s*(tr|triệu|củ|m|k)/i);
    if (maxPriceMatch) {
      let val = parseFloat(maxPriceMatch[1]);
      const unit = maxPriceMatch[2].toLowerCase();
      if (['tr', 'triệu', 'củ', 'm'].includes(unit)) val *= 1000000;
      else if (unit === 'k') val *= 1000;
      filters.priceMax = val;
    }

    const minPriceMatch = q.match(/(?:trên|từ|>=)\s*(\d+(?:\.\d+)?)\s*(tr|triệu|củ|m|k)/i);
    if (minPriceMatch) {
      let val = parseFloat(minPriceMatch[1]);
      const unit = minPriceMatch[2].toLowerCase();
      if (['tr', 'triệu', 'củ', 'm'].includes(unit)) val *= 1000000;
      else if (unit === 'k') val *= 1000;
      filters.priceMin = val;
    }

    // Rating regex
    const ratingMatch = q.match(/(\d+)\s*sao/i);
    if (ratingMatch) {
      filters.minRating = parseInt(ratingMatch[1]);
    }

    // Sort/Priority keywords
    if (q.includes('bán chạy') || q.includes('nhiều người mua')) filters.sort = 'best_selling';
    if (q.includes('đánh giá cao') || q.includes('tốt nhất')) filters.sort = 'top_rated';
    if (q.includes('mới nhất') || q.includes('vừa về')) filters.sort = 'newest';

    // Category fallback
    if (q.includes('tivi') || q.includes('television')) filters.category = 'Tivi';
    if (q.includes('máy lọc nước')) filters.category = 'Máy lọc nước';
    if (q.includes('tủ lạnh')) filters.category = 'Tủ lạnh';
    if (q.includes('máy giặt')) filters.category = 'Máy giặt';
    if (q.includes('máy lạnh') || q.includes('điều hòa')) filters.category = 'Máy lạnh';

    return filters;
  }

  /**
   * Quyết định có nên dùng Semantic Search hay không.
   * 
   * Dùng Semantic khi:
   *   - Query mô tả tính năng/cảm xúc ("tiết kiệm điện", "tư vấn", "nên mua gì")
   *   - Query dài (> 5 từ) nhưng KHÔNG chứa tên thương hiệu/model cụ thể
   * 
   * Dùng Keyword khi:
   *   - Query ngắn có tên model/thương hiệu ("iphone 15 pro", "samsung tv 55")
   *   - Query có số model rõ ràng
   */
  private shouldUseSemanticSearch(query: string, aiFilters: any): boolean {
    const q = query.toLowerCase();
    const wordCount = q.split(/\s+/).length;

    // Nếu chứa tên thương hiệu cụ thể → keyword chính xác hơn
    const hasBrandKeyword = BRAND_KEYWORDS.some(brand => q.includes(brand));
    if (hasBrandKeyword) return false;

    // Nếu có từ khóa mô tả tính năng → semantic tốt hơn
    const hasFeatureKeyword = FEATURE_KEYWORDS.some(kw => q.includes(kw));
    if (hasFeatureKeyword) return true;

    // Nếu AI extract được features → semantic
    if (aiFilters?.features && aiFilters.features.length > 0) return true;

    // Query dài (> 5 từ) mà không phải tên model → semantic
    if (wordCount > 5) return true;

    return false;
  }

  /**
   * TÌM KIẾM THÔNG MINH (Hybrid Search)
   */
  async intelligentSearch(query: string, limit: number = 20) {
    console.log(`🤖 AI Searching for: "${query}"`);

    // 1. Phân tích ý định người dùng (AI + Regex Fallback)
    let aiFilters = await this.parseQueryWithAI(query);
    const regexFilters = this.extractFiltersRegex(query);
    
    // Hợp nhất bộ lọc an toàn: Ưu tiên AI, nhưng nếu AI trả về null thì giữ Regex Fallback
    const mergedFilters = { ...regexFilters };
    if (aiFilters) {
      for (const [key, value] of Object.entries(aiFilters)) {
        if (value !== null && value !== undefined && value !== '') {
          (mergedFilters as any)[key] = value;
        }
      }
    }
    aiFilters = mergedFilters;
    
    console.log('Final Filters:', JSON.stringify(aiFilters));

    // 2. Quyết định loại search
    const useSemanticSearch = this.shouldUseSemanticSearch(query, aiFilters);

    // 3. Xây dựng điều kiện lọc Prisma (Lọc cứng)
    const where: Prisma.ProductWhereInput = { isDeleted: false };

    // Tăng pool size nếu có lọc nâng cao để tránh bị rỗng sau khi filter
    const poolLimit = aiFilters?.minRating || aiFilters?.minSold || aiFilters?.minReviews || aiFilters?.sort ? 100 : limit;

    if (aiFilters) {
      if (aiFilters.category) {
        where.category = { name: { contains: aiFilters.category, mode: 'insensitive' } };
      }
      if (aiFilters.keywords) {
        where.OR = [
          { name: { contains: aiFilters.keywords, mode: 'insensitive' } },
          { slug: { contains: aiFilters.keywords, mode: 'insensitive' } }
        ];
      }
      if (aiFilters.priceMin !== null || aiFilters.priceMax !== null) {
        where.variants = {
          some: {
            AND: [
              aiFilters.priceMin !== null ? { price: { gte: aiFilters.priceMin } } : {},
              aiFilters.priceMax !== null ? { price: { lte: aiFilters.priceMax } } : {},
            ]
          }
        };
      }
    }

    let products: any[] = [];

    if (useSemanticSearch) {
      console.log('🔍 Executing Semantic Search...');
      try {
        products = await this.searchSemantic(query, poolLimit, aiFilters);
      } catch (err) {
        console.warn('⚠️ Semantic search failed, falling back to keyword search:', err);
      }
    }

    // Keyword search nếu không dùng semantic hoặc semantic trả về rỗng
    if (!useSemanticSearch || products.length === 0) {
      console.log('🔍 Executing Keyword Search...');
      products = await prisma.product.findMany({
        where,
        include: {
          images: { orderBy: { isPrimary: 'desc' }, take: 1 },
          category: { select: { name: true } },
          variants: { orderBy: { price: 'asc' }, take: 1 }
        },
        take: poolLimit,
        orderBy: aiFilters?.sort === 'newest' ? { createdAt: 'desc' } : undefined
      });
    }

    // 4. Fallback cuối: Tìm rộng bằng từ khóa gốc
    if (products.length === 0) {
      console.log('🔄 Fallback to broad keyword search...');
      products = await prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ],
          isDeleted: false
        },
        include: {
          images: { orderBy: { isPrimary: 'desc' }, take: 1 },
          variants: { orderBy: { price: 'asc' }, take: 1 }
        },
        take: limit
      });
    }

    // 4. Bổ sung dữ liệu (Sold, Rating, Reviews)
    let enrichedProducts = await this.productService.enrichProductData(products);

    // 5. Lọc và Sắp xếp nâng cao dựa trên ý định người dùng
    if (aiFilters) {
      // Lọc theo rating trung bình (chính xác hơn filter Prisma `some`)
      if (aiFilters.minRating) {
        enrichedProducts = enrichedProducts.filter(p => p.averageRating >= aiFilters.minRating);
      }
      // Lọc theo số lượt bán
      if (aiFilters.minSold) {
        enrichedProducts = enrichedProducts.filter(p => p.soldCount >= aiFilters.minSold);
      }
      // Lọc theo số lượt bình luận
      if (aiFilters.minReviews) {
        enrichedProducts = enrichedProducts.filter(p => p.totalReviews >= aiFilters.minReviews);
      }

      // Sắp xếp
      if (aiFilters.sort) {
        switch (aiFilters.sort) {
          case 'best_selling':
            enrichedProducts.sort((a, b) => b.soldCount - a.soldCount);
            break;
          case 'top_rated':
            enrichedProducts.sort((a, b) => b.averageRating - a.averageRating || b.totalReviews - a.totalReviews);
            break;
          case 'most_reviewed':
            enrichedProducts.sort((a, b) => b.totalReviews - a.totalReviews);
            break;
          case 'price_asc':
            enrichedProducts.sort((a, b) => a.minPrice - b.minPrice);
            break;
          case 'price_desc':
            enrichedProducts.sort((a, b) => b.minPrice - a.minPrice);
            break;
        }
      }
    }

    return enrichedProducts.slice(0, limit).map(p => ({
      ...p,
      searchType: useSemanticSearch ? 'semantic' : 'keyword',
    }));
  }

  /**
   * Tìm kiếm Semantic (Vector) kết hợp lọc SQL
   */
  async searchSemantic(query: string, limit: number = 10, filters: any = null) {
    // Sẽ throw nếu embedding service không hoạt động → caller xử lý fallback
    const queryVector = await embeddingHelper.generateEmbedding(query);
    const vectorString = `[${queryVector.join(',')}]`;

    // Sử dụng Raw SQL để tính toán Rating và Sold Count ngay trong câu truy vấn để lọc/sắp xếp chính xác
    const results = await prisma.$queryRaw<any[]>(Prisma.sql`
      SELECT p.id, p.name, p.slug, p.description,
             MIN(v.price) as "minPrice",
             p.embedding <=> ${vectorString}::vector AS distance,
             COALESCE(avg_rating.rating, 0) as "averageRating",
             COALESCE(sold_stats.sold, 0) as "soldCount",
             COALESCE(avg_rating.total_reviews, 0) as "totalReviews"
      FROM "Product" p
      JOIN "ProductVariant" v ON p.id = v."productId"
      JOIN "Category" c ON p."categoryId" = c.id
      LEFT JOIN (
          SELECT "productId", AVG(rating) as rating, COUNT(rating) as total_reviews
          FROM "Review"
          GROUP BY "productId"
      ) avg_rating ON p.id = avg_rating."productId"
      LEFT JOIN (
          SELECT oi."productId", SUM(oi.quantity) as sold
          FROM "OrderItem" oi
          JOIN "Order" o ON oi."orderId" = o.id
          WHERE o.status != 'CANCELLED'
          GROUP BY oi."productId"
      ) sold_stats ON p.id = sold_stats."productId"
      WHERE p."isDeleted" = false 
        AND p.embedding IS NOT NULL
        ${filters?.category ? Prisma.sql`AND c.name ILIKE ${'%' + filters.category + '%'}` : Prisma.empty}
        ${filters?.priceMin ? Prisma.sql`AND v.price >= ${filters.priceMin}` : Prisma.empty}
        ${filters?.priceMax ? Prisma.sql`AND v.price <= ${filters.priceMax}` : Prisma.empty}
      GROUP BY p.id, c.name, avg_rating.rating, avg_rating.total_reviews, sold_stats.sold
      HAVING 1=1
        ${filters?.minRating ? Prisma.sql`AND COALESCE(avg_rating.rating, 0) >= ${filters.minRating}` : Prisma.empty}
        ${filters?.minSold ? Prisma.sql`AND COALESCE(sold_stats.sold, 0) >= ${filters.minSold}` : Prisma.empty}
        ${filters?.minReviews ? Prisma.sql`AND COALESCE(avg_rating.total_reviews, 0) >= ${filters.minReviews}` : Prisma.empty}
      ORDER BY 
        ${filters?.sort === 'best_selling' ? Prisma.sql`"soldCount" DESC,` : Prisma.empty}
        ${filters?.sort === 'top_rated' ? Prisma.sql`"averageRating" DESC,` : Prisma.empty}
        distance ASC
      LIMIT ${limit}
    `);

    if (results.length === 0) return [];

    const productIds = results.map(r => r.id);
    const fullDetails = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        images: { orderBy: { isPrimary: 'desc' }, take: 1 },
        category: { select: { name: true } },
        variants: { orderBy: { price: 'asc' }, take: 1 }
      }
    });

    return results.map(r => {
      const p = fullDetails.find(fd => fd.id === r.id);
      if (!p) return null;
      return {
        ...p,
        distance: r.distance,
        averageRating: Number(r.averageRating),
        soldCount: Number(r.soldCount),
        totalReviews: Number(r.totalReviews),
        minPrice: p.variants?.[0]?.price ? Number(p.variants[0].price) : 0,
        primaryImage: p.images?.[0]?.url || null,
        variants: p.variants.map(v => ({ ...v, price: Number(v.price) }))
      };
    }).filter(Boolean);
  }

  /**
   * Public method để generate embedding (dùng trong seed script và controller test)
   */
  async generateEmbedding(text: string): Promise<number[]> {
    return embeddingHelper.generateEmbedding(text);
  }
}
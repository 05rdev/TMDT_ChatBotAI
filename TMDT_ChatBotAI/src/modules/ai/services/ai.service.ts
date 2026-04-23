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
  'sharp', 'philips', 'daikin', 'mitsubishi', 'electrolux', 'bosch', 'apple'
];

const STOP_WORDS = [
  'tìm', 'kiếm', 'mua', 'bán', 'giá', 'cho', 'có', 'tại', 'ở', 'là', 'cái', 'chiếc', 'loại',
  'mẫu', 'những', 'các', 'của', 'với', 'khoảng', 'tầm', 'trong', 'dưới', 'trên', 'hơn'
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

    // Price Range regex (Vd: 5-10tr, 5tr đến 10tr)
    const rangeMatch = q.match(/(\d+(?:\.\d+)?)\s*(?:-|đến|tới)\s*(\d+(?:\.\d+)?)\s*(tr|triệu|củ|m|k)/i);
    if (rangeMatch) {
      let min = parseFloat(rangeMatch[1]);
      let max = parseFloat(rangeMatch[2]);
      const unit = rangeMatch[3].toLowerCase();
      const multiplier = ['tr', 'triệu', 'củ', 'm'].includes(unit) ? 1000000 : 1000;
      filters.priceMin = min * multiplier;
      filters.priceMax = max * multiplier;
    } else {
      // Single price regex
      const maxPriceMatch = q.match(/(?:dưới|u|<=|tầm|khoảng|~|giá|quanh)\s*(\d+(?:\.\d+)?)\s*(tr|triệu|củ|m|k)/i);
      if (maxPriceMatch) {
        let val = parseFloat(maxPriceMatch[1]);
        const unit = maxPriceMatch[2].toLowerCase();
        const multiplier = ['tr', 'triệu', 'củ', 'm'].includes(unit) ? 1000000 : 1000;
        
        if (q.match(/(tầm|khoảng|~|quanh|giá)/)) {
          filters.priceMin = val * 0.8 * multiplier;
          filters.priceMax = val * 1.2 * multiplier;
        } else {
          filters.priceMax = val * multiplier;
        }
      }

      const minPriceMatch = q.match(/(?:trên|từ|>=|hơn|>)\s*(\d+(?:\.\d+)?)\s*(tr|triệu|củ|m|k)/i);
      if (minPriceMatch) {
        let val = parseFloat(minPriceMatch[1]);
        const unit = minPriceMatch[2].toLowerCase();
        const multiplier = ['tr', 'triệu', 'củ', 'm'].includes(unit) ? 1000000 : 1000;
        filters.priceMin = val * multiplier;
      }
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
    if (q.includes('máy lạnh') || (q.includes('điều hòa') && !q.includes('quạt'))) filters.category = 'Máy lạnh';
    if (q.includes('quạt điều hòa') || q.includes('máy làm mát')) filters.category = 'Quạt điều hòa';

    return filters;
  }

  /**
   * Quyết định có nên dùng Semantic Search hay không.
   */
  private shouldUseSemanticSearch(query: string, aiFilters: any): boolean {
    const q = query.toLowerCase();
    const wordCount = q.split(/\s+/).length;

    const hasBrandKeyword = BRAND_KEYWORDS.some(brand => q.includes(brand));
    if (hasBrandKeyword) return false;

    const hasFeatureKeyword = FEATURE_KEYWORDS.some(kw => q.includes(kw));
    if (hasFeatureKeyword) return true;

    if (aiFilters?.features && aiFilters.features.length > 0) return true;

    if (wordCount > 5) return true;

    return false;
  }

  /**
   * TÌM KIẾM THÔNG MINH (Hybrid Search)
   */
  async intelligentSearch(query: string, limit: number = 20, categoryId?: string) {
    console.log(`🤖 AI Searching for: "${query}" (Category: ${categoryId || 'All'})`);

    // 1. Phân tích ý định người dùng
    let aiFilters = await this.parseQueryWithAI(query);
    const regexFilters = this.extractFiltersRegex(query);
    
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

    // 3. Xây dựng điều kiện lọc Prisma
    const where: Prisma.ProductWhereInput = { isDeleted: false, isActive: true };
    const poolLimit = aiFilters?.minRating || aiFilters?.minSold || aiFilters?.minReviews || aiFilters?.sort ? 100 : limit;

    if (aiFilters) {
      if (aiFilters.category) {
        where.category = { name: { contains: aiFilters.category, mode: 'insensitive' } };
      } else if (categoryId) {
        where.categoryId = categoryId;
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
        products = await this.searchSemantic(query, poolLimit, aiFilters, categoryId);
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

    // 3.5 Fallback trung gian: Nếu có lọc mà không ra kết quả, thử bỏ lọc để giữ đúng Category
    if (products.length === 0 && (aiFilters?.priceMin || aiFilters?.priceMax || aiFilters?.minRating)) {
      console.log('🔄 Relaxing filters (removing price/rating) but keeping Category...');
      const relaxedWhere: Prisma.ProductWhereInput = { 
        isDeleted: false,
        isActive: true,
        ...(where.category ? { category: where.category } : {}),
        ...(where.categoryId ? { categoryId: where.categoryId } : {})
      };
      
      products = await prisma.product.findMany({
        where: relaxedWhere,
        include: {
          images: { orderBy: { isPrimary: 'desc' }, take: 1 },
          category: { select: { name: true } },
          variants: { orderBy: { price: 'asc' }, take: 1 }
        },
        take: limit
      });
    }

    // 4. Fallback cuối: Tìm rộng bằng cách tách từ
    if (products.length === 0) {
      console.log('🔄 Fallback to broad word search...');
      const words = query.toLowerCase().split(/\s+/)
        .filter(w => w.length > 1 && !STOP_WORDS.includes(w));
      
      if (words.length === 0) return []; // Không còn từ khóa nào để tìm
      
      products = await prisma.product.findMany({
        where: {
          OR: words.map(word => ({
            OR: [
              { name: { contains: word, mode: 'insensitive' } },
              { description: { contains: word, mode: 'insensitive' } }
            ]
          })),
          isDeleted: false,
          isActive: true,
          ...(categoryId ? { categoryId } : {}),
          ...(aiFilters?.priceMin || aiFilters?.priceMax ? {
            variants: {
              some: {
                AND: [
                  aiFilters.priceMin !== null ? { price: { gte: aiFilters.priceMin } } : {},
                  aiFilters.priceMax !== null ? { price: { lte: aiFilters.priceMax } } : {},
                ]
              }
            }
          } : {})
        },
        include: {
          images: { orderBy: { isPrimary: 'desc' }, take: 1 },
          variants: { orderBy: { price: 'asc' }, take: 1 }
        },
        take: limit
      });
    }

    // 5. Bổ sung dữ liệu (Sold, Rating, Reviews)
    let enrichedProducts = await this.productService.enrichProductData(products);

    // 6. Lọc và Sắp xếp nâng cao
    if (aiFilters) {
      if (aiFilters.minRating) {
        enrichedProducts = enrichedProducts.filter(p => p.averageRating >= aiFilters.minRating);
      }
      if (aiFilters.minSold) {
        enrichedProducts = enrichedProducts.filter(p => p.soldCount >= aiFilters.minSold);
      }
      if (aiFilters.minReviews) {
        enrichedProducts = enrichedProducts.filter(p => p.totalReviews >= aiFilters.minReviews);
      }

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
  async searchSemantic(query: string, limit: number = 10, filters: any = null, categoryId?: string): Promise<any[]> {
    const queryVector = await embeddingHelper.generateEmbedding(query);
    const vectorString = `[${queryVector.join(',')}]`;

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
        AND p."isActive" = true
        AND p.embedding IS NOT NULL
        ${filters?.category ? Prisma.sql`AND c.name ILIKE ${'%' + filters.category + '%'}` : (categoryId ? Prisma.sql`AND p."categoryId" = ${categoryId}` : Prisma.empty)}
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
   * Tóm tắt đánh giá sản phẩm bằng AI
   */
  async summarizeReviews(productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 50
        }
      }
    });

    if (!product || product.reviews.length === 0) {
      return { 
        pros: [], 
        cons: [], 
        sentiment: "Chưa có dữ liệu", 
        conclusion: "Sản phẩm chưa có đánh giá nào để tóm tắt." 
      };
    }

    const reviewTexts = product.reviews.map(r => `- ${r.rating} sao: ${r.comment}`).join('\n');

    const systemPrompt = `
      Bạn là chuyên gia phân tích phản hồi khách hàng. 
      Nhiệm vụ: Tóm tắt các đánh giá của khách hàng về sản phẩm "${product.name}".
      Yêu cầu phản hồi bằng tiếng Việt, định dạng JSON:
      {
        "pros": ["ưu điểm 1", "ưu điểm 2"],
        "cons": ["nhược điểm 1", "nhược điểm 2"],
        "sentiment": "Tích cực/Tiêu cực/Trung lập",
        "conclusion": "Câu chốt tóm gọn về sản phẩm"
      }
      QUY TẮC: Trả về DUY NHẤT JSON. Không giải thích thêm.
    `;

    try {
      const response = await fetch(this.ollamaUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.modelName,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Danh sách đánh giá:\n${reviewTexts}` }
          ],
          stream: false,
          format: 'json'
        })
      });

      if (!response.ok) throw new Error('Ollama error');
      const data: any = await response.json();
      const content = data.message.content;
      return typeof content === 'string' ? JSON.parse(content) : content;
    } catch (error) {
      console.error('AI Review Summary Error:', error);
      return null;
    }
  }

  /**
   * Phân tích doanh thu và đưa ra nhận xét
   */
  async analyzeRevenue(revenueData: any[]) {
    const dataText = revenueData.map(d => `${d.date || d.month}: ${d.total.toLocaleString()}đ`).join('\n');

    const systemPrompt = `
      Bạn là chuyên gia phân tích tài chính và chiến lược kinh doanh. 
      Nhiệm vụ: Phân tích dữ liệu doanh thu của cửa hàng và đưa ra lời khuyên.
      Yêu cầu phản hồi bằng tiếng Việt, định dạng JSON:
      {
        "analysis": "Nhận xét về xu hướng tăng trưởng, các điểm biến động mạnh",
        "insights": ["insight 1", "insight 2"],
        "suggestions": ["đề xuất 1", "đề xuất 2"],
        "overallStatus": "Tốt/Ổn định/Cần cải thiện"
      }
      QUY TẮC: Trả về DUY NHẤT JSON. Không giải thích thêm.
    `;

    try {
      const response = await fetch(this.ollamaUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.modelName,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Dữ liệu doanh thu:\n${dataText}` }
          ],
          stream: false,
          format: 'json'
        })
      });

      if (!response.ok) throw new Error('Ollama error');
      const data: any = await response.json();
      const content = data.message.content;
      return typeof content === 'string' ? JSON.parse(content) : content;
    } catch (error) {
      console.error('AI Revenue Analysis Error:', error);
      return null;
    }
  }

  /**
   * Public method để generate embedding
   */
  async generateEmbedding(text: string): Promise<number[]> {
    return embeddingHelper.generateEmbedding(text);
  }
}
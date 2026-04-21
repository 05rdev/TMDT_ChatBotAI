import { PrismaClient, Prisma } from '@prisma/client';
import { EmbeddingHelper } from '../embeddingHelper';

const prisma = new PrismaClient();
const embeddingHelper = new EmbeddingHelper();

export class AIService {
  /**
   * Tạo vector embedding từ văn bản
   */
  async generateEmbedding(text: string): Promise<number[]> {
    return embeddingHelper.generateEmbedding(text);
  }

  /**
   * Trích xuất khoảng giá mong muốn từ câu truy vấn tự nhiên (Regex fallback)
   */
  private extractPriceRange(query: string) {
    const queryLower = query.toLowerCase();
    let minPrice: number | undefined;
    let maxPrice: number | undefined;

    const normalizeNumber = (val: string, unit: string) => {
      let num = parseFloat(val.replace(/\./g, '').replace(/,/g, ''));
      if (unit.includes('k')) return num * 1000;
      if (unit.includes('triệu') || unit.includes('tr')) return num * 1000000;
      return num;
    };

    const underMatch = queryLower.match(/(?:dưới|thấp hơn|tối đa|bé hơn)\s+([\d.,]+)\s*(k|triệu|tr|đ|vnđ)?/);
    if (underMatch) maxPrice = normalizeNumber(underMatch[1], underMatch[2] || '');

    const overMatch = queryLower.match(/(?:trên|hơn|cao hơn|tối thiểu|lớn hơn)\s+([\d.,]+)\s*(k|triệu|tr|đ|vnđ)?/);
    if (overMatch) minPrice = normalizeNumber(overMatch[1], overMatch[2] || '');

    return { minPrice, maxPrice };
  }

  private ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434/api/chat';
  private modelName = process.env.OLLAMA_MODEL || 'qwen2.5:3b';

  /**
   * Phân tích câu truy vấn tự nhiên bằng Ollama sang JSON
   */
  private async parseQueryWithAI(query: string) {
    const systemPrompt = `
      Bạn là chuyên gia phân tích dữ liệu mua sắm. 
      Nhiệm vụ: Chuyển câu truy vấn tiếng Việt sang JSON để lọc sản phẩm.
      JSON Schema: {
        "category": string | null, // Tên danh mục (Laptop, Điện thoại, Đồng hồ, ...)
        "priceMin": number | null,
        "priceMax": number | null,
        "searchTerm": string | null, // Từ khóa sản phẩm chính (Vd: "Macbook", "iPhone 15")
        "sort": "price_asc" | "price_desc" | "newest" | null
      }

      QUY TẮC:
      - Chỉ trả về duy nhất khối JSON, không giải thích gì thêm.
      - Chuyển đổi các đơn vị tiền tệ (Vd: "10tr" -> 10000000, "500k" -> 500000).
      - Nếu không có thông tin, để null.
    `;

    try {
      const response = await fetch(this.ollamaUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.modelName,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Phân tích câu: "${query}"` }
          ],
          stream: false,
          format: 'json'
        })
      });

      if (!response.ok) return null;
      const data: any = await response.json();
      return JSON.parse(data.message.content);
    } catch (error) {
      console.warn('⚠️ Ollama Query Parsing Failed:', error);
      return null;
    }
  }

  /**
   * Tìm kiếm thông minh - Kết hợp AI Parsing và DB Query
   */
  async intelligentSearch(query: string, limit: number = 20) {
    // 1. Thử phân tích bằng AI
    const filters = await this.parseQueryWithAI(query);
    console.log('🔍 AI Filters:', filters);

    if (filters) {
      // 2. Xây dựng điều kiện tìm kiếm Prisma
      const where: Prisma.ProductWhereInput = {
        isDeleted: false,
      };

      if (filters.category) {
        where.category = { name: { contains: filters.category, mode: 'insensitive' } };
      }

      if (filters.searchTerm) {
        where.OR = [
          { name: { contains: filters.searchTerm, mode: 'insensitive' } },
          { description: { contains: filters.searchTerm, mode: 'insensitive' } }
        ];
      }

      // Lọc theo giá (thông qua variants)
      if (filters.priceMin !== null || filters.priceMax !== null) {
        where.variants = {
          some: {
            AND: [
              filters.priceMin !== null ? { price: { gte: filters.priceMin } } : {},
              filters.priceMax !== null ? { price: { lte: filters.priceMax } } : {},
            ]
          }
        };
      }

      // 3. Xử lý sắp xếp
      let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
      if (filters.sort === 'price_asc') orderBy = { variants: { _count: 'asc' } }; // Demo mapping
      if (filters.sort === 'price_desc') orderBy = { variants: { _count: 'desc' } };
      if (filters.sort === 'newest') orderBy = { createdAt: 'desc' };

      // 4. Thực thi query
      const products = await prisma.product.findMany({
        where,
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          category: true,
          variants: { orderBy: { price: 'asc' }, take: 1 }
        },
        orderBy,
        take: limit
      });

      if (products.length > 0) {
        return products.map(p => ({
          ...p,
          searchType: 'intelligent'
        }));
      }
    }

    // 4. Nếu không có kết quả từ AI Parsing, dùng Semantic Search (Vector)
    console.log('🔄 Falling back to Semantic Search...');
    const semanticResults = await this.searchSemantic(query, limit);
    return semanticResults.map(r => ({ ...r, searchType: 'semantic' }));
  }

  /**
   * Tìm kiếm Semantic - Kết hợp Vector Search và Business Filters
   */
  async searchSemantic(query: string, limit: number = 10) {
    // 1. Sinh embedding cho câu truy vấn
    const queryVector = await embeddingHelper.generateEmbedding(query);
    const vectorString = `[${queryVector.join(',')}]`;

    // 2. Trích xuất khoảng giá (Vẫn giữ regex làm dự phòng nhanh)
    const { minPrice, maxPrice } = this.extractPriceRange(query);

    // 3. Thực thi query với xử lý lỗi vector
    try {
      const results = await prisma.$queryRaw<any[]>(Prisma.sql`
        SELECT p.id, p.name, p.slug, p.description,
               MIN(v.price) as "minPrice",
               p.embedding <=> ${vectorString}::vector AS distance
        FROM "Product" p
        JOIN "ProductVariant" v ON p.id = v."productId"
        WHERE p."isDeleted" = false 
          AND p.embedding IS NOT NULL
        GROUP BY p.id
        HAVING 1=1
          ${minPrice ? Prisma.sql`AND MIN(v.price) >= ${minPrice}` : Prisma.empty}
          ${maxPrice ? Prisma.sql`AND MIN(v.price) <= ${maxPrice}` : Prisma.empty}
        ORDER BY distance ASC
        LIMIT ${limit}
      `);

      // 4. Lấy thêm thông tin ảnh sản phẩm
      const productIds = results.map(r => r.id);
      const images = await prisma.productImage.findMany({
        where: { productId: { in: productIds }, isPrimary: true }
      });

      return results.map(r => ({
        ...r,
        primaryImage: images.find(img => img.productId === r.id)?.url,
        distance: Number(r.distance).toFixed(4)
      }));
    } catch (error: any) {
      console.error('❌ Semantic Search Error (Possible dimension mismatch):', error.message);
      // Trả về mảng rỗng thay vì lỗi 500
      return [];
    }
  }
}

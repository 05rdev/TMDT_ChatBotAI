import { PrismaClient, Prisma } from '@prisma/client';
import { EmbeddingHelper } from '../embeddingHelper';

const prisma = new PrismaClient();
const embeddingHelper = new EmbeddingHelper();

export class AIService {
  /**
   * Tạo vector embedding từ văn bản (Wrapper cho EmbeddingHelper để tránh breaking changes)
   */
  async generateEmbedding(text: string): Promise<number[]> {
    return embeddingHelper.generateEmbedding(text);
  }

  /**
   * Trích xuất khoảng giá mong muốn từ câu truy vấn tự nhiên
   * VD: "dưới 300k", "tầm 1 triệu", "trên 500.000đ"
   */
  private extractPriceRange(query: string) {
    const queryLower = query.toLowerCase();
    let minPrice: number | undefined;
    let maxPrice: number | undefined;

    // Helper để chuẩn hóa số (Vd: 300k -> 300000, 1.5 triệu -> 1500000)
    const normalizeNumber = (val: string, unit: string) => {
      let num = parseFloat(val.replace(/\./g, '').replace(/,/g, ''));
      if (unit.includes('k')) return num * 1000;
      if (unit.includes('triệu') || unit.includes('tr')) return num * 1000000;
      return num;
    };

    // 1. Dưới X (dưới 300k, thấp hơn 1tr)
    const underMatch = queryLower.match(/(?:dưới|thấp hơn|tối đa|bé hơn)\s+([\d.,]+)\s*(k|triệu|tr|đ|vnđ)?/);
    if (underMatch) {
      maxPrice = normalizeNumber(underMatch[1], underMatch[2] || '');
    }

    // 2. Trên X (trên 500k, hơn 2 triệu)
    const overMatch = queryLower.match(/(?:trên|hơn|cao hơn|tối thiểu|lớn hơn)\s+([\d.,]+)\s*(k|triệu|tr|đ|vnđ)?/);
    if (overMatch) {
      minPrice = normalizeNumber(overMatch[1], overMatch[2] || '');
    }

    // 3. Khoảng X (tầm 1 triệu, khoảng 500k) -> +/- 20%
    const approxMatch = queryLower.match(/(?:tầm|khoảng|xấp xỉ|đâu đó)\s+([\d.,]+)\s*(k|triệu|tr|đ|vnđ)?/);
    if (approxMatch && !minPrice && !maxPrice) {
      const base = normalizeNumber(approxMatch[1], approxMatch[2] || '');
      minPrice = base * 0.8;
      maxPrice = base * 1.2;
    }

    return { minPrice, maxPrice };
  }

  /**
   * Tìm kiếm Semantic - Kết hợp Vector Search và Business Filters
   */
  async searchSemantic(query: string, limit: number = 10) {
    // 1. Sinh embedding cho câu truy vấn
    const queryVector = await embeddingHelper.generateEmbedding(query);
    const vectorString = `[${queryVector.join(',')}]`;

    // 2. Trích xuất khoảng giá
    const { minPrice, maxPrice } = this.extractPriceRange(query);

    // 3. Xây dựng SQL Raw để tìm kiếm pgvector
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
  }
}

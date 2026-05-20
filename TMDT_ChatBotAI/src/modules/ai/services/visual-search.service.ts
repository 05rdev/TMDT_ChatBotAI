import { PrismaClient, Prisma } from '@prisma/client';
import { VisionHelper } from '../vision/visionHelper';

const prisma = new PrismaClient();
const visionHelper = new VisionHelper();

export class VisualSearchService {
  /**
   * Tìm kiếm sản phẩm bằng hình ảnh (Option A: Vector Similarity)
   * Quy trình: Ảnh -> Local CLIP Embedding (512 dims) -> PGVector Search
   */
  async searchByImage(imageBuffer: Buffer, mimetype: string, limit: number = 10) {
    try {
      // 1. Kiểm tra service CLIP
      const isReady = await visionHelper.isServiceReady();
      if (!isReady) {
        throw new Error('AI Vision Service (CLIP) đang khởi động hoặc chưa sẵn sàng. Vui lòng thử lại sau.');
      }

      // 2. Sinh image embedding từ buffer (Local CLIP)
      console.log('📸 Generating Image Embedding via Local CLIP...');
      const imageVector = await visionHelper.generateImageEmbedding(imageBuffer);
      const vectorString = `[${imageVector.join(',')}]`;

      // 3. Thực hiện Vector Search trên bảng ProductImage để lấy ảnh khớp nhất của mỗi SP
      console.log('🔍 Searching for similar images in database (Fine-grained)...');
      
      const results = await prisma.$queryRaw<any[]>(Prisma.sql`
        WITH ranked_images AS (
            SELECT 
                "productId", 
                "url", 
                "imageEmbedding" <=> ${vectorString}::vector AS distance,
                ROW_NUMBER() OVER(PARTITION BY "productId" ORDER BY ("imageEmbedding" <=> ${vectorString}::vector) ASC) as rank
            FROM "ProductImage"
            WHERE "imageEmbedding" IS NOT NULL
        )
        SELECT p.id, p.name, p.slug, 
               ri.url as "matchedImageUrl",
               ri.distance as "distance",
               MIN(v.price) as "minPrice"
        FROM ranked_images ri
        JOIN "Product" p ON p.id = ri."productId"
        JOIN "ProductVariant" v ON p.id = v."productId"
        WHERE p."isDeleted" = false 
          AND p."isActive" = true
          AND ri.rank = 1
        GROUP BY p.id, ri.url, ri.distance
        ORDER BY ri.distance ASC
        LIMIT ${limit}
      `);

      if (results.length === 0) {
        return {
          description: "Không tìm thấy sản phẩm nào có hình ảnh tương tự trong kho.",
          products: []
        };
      }

      // 4. Hydrate dữ liệu đầy đủ
      const productIds = results.map(r => r.id);
      const fullProducts = await prisma.product.findMany({
        where: { id: { in: productIds } },
        include: {
          category: { select: { name: true } },
          variants: { orderBy: { price: 'asc' }, take: 1 }
        }
      });

      const formattedProducts = results.map(r => {
        const p = fullProducts.find(fp => fp.id === r.id);
        if (!p) return null;
        return {
          ...p,
          distance: r.distance,
          minPrice: Number(r.minPrice),
          primaryImage: r.matchedImageUrl, // Đưa "ảnh giống nhất" lên làm ảnh hiển thị
          variants: p.variants.map(v => ({ ...v, price: Number(v.price) }))
        };
      }).filter(Boolean);

      return {
        description: `Đã tìm thấy ${formattedProducts.length} sản phẩm tương tự. Ảnh hiển thị đã được tự động chọn theo mức độ giống nhất.`,
        products: formattedProducts
      };

    } catch (error: any) {
      console.error('❌ Visual Search Error:', error.message);
      throw new Error(error.message || 'Gặp lỗi khi phân tích hình ảnh. Vui lòng thử lại sau.');
    }
  }
}

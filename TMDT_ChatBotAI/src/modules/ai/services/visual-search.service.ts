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

      // 3. Thực hiện Vector Search trên cột imageEmbedding sử dụng Cosine Distance (<=>)
      console.log('🔍 Searching for similar images in database...');
      const results = await prisma.$queryRaw<any[]>(Prisma.sql`
        SELECT p.id, p.name, p.slug, 
               p."imageEmbedding" <=> ${vectorString}::vector AS distance,
               MIN(v.price) as "minPrice"
        FROM "Product" p
        JOIN "ProductVariant" v ON p.id = v."productId"
        WHERE p."isDeleted" = false 
          AND p."imageEmbedding" IS NOT NULL
        GROUP BY p.id
        ORDER BY distance ASC
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
          images: { orderBy: { isPrimary: 'desc' }, take: 1 },
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
          primaryImage: p.images[0]?.url || null,
          variants: p.variants.map(v => ({ ...v, price: Number(v.price) }))
        };
      }).filter(Boolean);

      return {
        description: `Đã tìm thấy ${formattedProducts.length} sản phẩm tương tự với hình ảnh bạn cung cấp.`,
        products: formattedProducts
      };

    } catch (error: any) {
      console.error('❌ Visual Search Error:', error.message);
      throw new Error(error.message || 'Gặp lỗi khi phân tích hình ảnh. Vui lòng thử lại sau.');
    }
  }
}

import { prisma } from '../../../common/utils/prisma.service';
import { Prisma } from '@prisma/client';

export class ProductService {
  /**
   * Tìm kiếm sản phẩm bằng Vector Search (Semantic Search)
   * Sử dụng pgvector kết hợp HNSW index
   */
  async searchByVector(embedding: number[], limit: number = 10) {
    // Chuyển mảng number thành định dạng vector '[0.1, 0.2, ...]'
    const vectorString = `[${embedding.join(',')}]`;

    // Sử dụng toán tử <=> (cosine distance) trong pgvector
    // Ép kiểu (cast) rõ ràng để tránh lỗi cú pháp SQL
    const products = await prisma.$queryRaw<any[]>(Prisma.sql`
      SELECT 
        p.id, 
        p.name, 
        p.slug, 
        p.description,
        p.embedding <=> ${vectorString}::vector AS distance
      FROM "Product" p
      WHERE p.embedding IS NOT NULL
      ORDER BY distance ASC
      LIMIT ${limit}
    `);

    return products;
  }

  async getAllProducts() {
    return prisma.product.findMany({
      include: {
        images: true,
        variants: true,
        category: true,
      },
    });
  }

  async getProductById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        variants: true,
        category: true,
        reviews: {
          include: {
            user: {
              select: { name: true, avatar: true }
            }
          }
        }
      },
    });
  }
}

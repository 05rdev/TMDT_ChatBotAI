import { PrismaClient } from '@prisma/client';
import { EmbeddingHelper } from '../modules/ai/embeddingHelper';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const embeddingHelper = new EmbeddingHelper();

async function reindex() {
  console.log('🚀 Bắt đầu quá trình cập nhật lại Vector Embeddings (768d)...');
  
  try {
    // 1. Lấy tất cả sản phẩm chưa bị xóa
    const products = await prisma.product.findMany({
      where: { isDeleted: false },
      select: { id: true, name: true, description: true }
    });

    console.log(`📦 Tìm thấy ${products.length} sản phẩm cần xử lý.`);

    let successCount = 0;
    let errorCount = 0;

    for (const product of products) {
      try {
        const textToEmbed = `${product.name} ${product.description || ''}`.trim();
        
        if (!textToEmbed) {
          console.warn(`⚠️ Bỏ qua SP [${product.id}] do không có nội dung.`);
          continue;
        }

        // 2. Tạo embedding mới (768 chiều từ Ollama)
        const embedding = await embeddingHelper.generateEmbedding(textToEmbed);
        
        // 3. Cập nhật vào DB sử dụng SQL Raw (vì Prisma chưa hỗ trợ tốt pgvector type)
        const vectorString = `[${embedding.join(',')}]`;
        
        await prisma.$executeRawUnsafe(
          `UPDATE "Product" SET embedding = $1::vector WHERE id = $2`,
          vectorString,
          product.id
        );

        successCount++;
        if (successCount % 10 === 0) {
          console.log(`✅ Đã xử lý: ${successCount}/${products.length}...`);
        }
      } catch (err: any) {
        console.error(`❌ Lỗi tại SP [${product.id}]:`, err.message);
        errorCount++;
      }
    }

    console.log('\n✨ Hoàn thành quá trình Re-index!');
    console.log(`📊 Tổng kết: Thành công: ${successCount}, Thất bại: ${errorCount}`);

  } catch (error) {
    console.error('💥 Lỗi nghiêm trọng trong quá trình Re-index:', error);
  } finally {
    await prisma.$disconnect();
  }
}

reindex();

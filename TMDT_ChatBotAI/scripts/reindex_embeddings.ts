import { PrismaClient } from '@prisma/client';
import { EmbeddingHelper } from '../src/modules/ai/embeddingHelper';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const embeddingHelper = new EmbeddingHelper();

async function reindex() {
  console.log('🚀 Starting Re-indexing Products with Ollama Embeddings...');
  
  const products = await prisma.product.findMany({
    where: { isDeleted: false }
  });

  console.log(`Found ${products.length} products to update.`);

  for (const product of products) {
    try {
      // Tạo text để embed: Tên + Mô tả
      const textToEmbed = `${product.name}. ${product.description}`;
      console.log(`- Generating embedding for: ${product.name}`);
      
      const embedding = await embeddingHelper.generateEmbedding(textToEmbed);
      
      // Cập nhật vào DB sử dụng SQL thuần vì Prisma chưa hỗ trợ vector type hoàn hảo
      const vectorString = `[${embedding.join(',')}]`;
      await prisma.$executeRawUnsafe(
        `UPDATE "Product" SET embedding = $1::vector WHERE id = $2`,
        vectorString,
        product.id
      );

      console.log(`✅ Updated ${product.name}`);
    } catch (error: any) {
      console.error(`❌ Failed to update ${product.name}:`, error.message);
    }
  }

  console.log('✨ Re-indexing completed!');
  process.exit(0);
}

reindex();

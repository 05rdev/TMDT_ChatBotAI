import { PrismaClient } from '@prisma/client';
import { EmbeddingHelper } from '../src/modules/ai/embeddingHelper';
import { VisionHelper } from '../src/modules/ai/vision/visionHelper';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const embeddingHelper = new EmbeddingHelper();
const visionHelper = new VisionHelper();

async function reindex() {
  console.log('🚀 Starting Unified Re-indexing (Text & Images)...');
  
  // 1. Kiểm tra services
  console.log('Checking services...');
  const visionReady = await visionHelper.isServiceReady();
  if (!visionReady) {
    console.error('❌ CLIP Service is NOT running. Please start it first with: npm run ai:bridge');
    process.exit(1);
  }

  const products = await prisma.product.findMany({
    where: { isDeleted: false },
    include: {
      images: true, // Lấy tất cả ảnh
      category: { select: { name: true } },
      attributes: { select: { key: true, value: true, unit: true } }
    }
  });

  console.log(`Found ${products.length} products to process.`);

  for (const product of products) {
    try {
      console.log(`\n📦 Processing: ${product.name}`);
      
      // --- 1. TEXT EMBEDDING (Cho Product) ---
      const textToEmbed = EmbeddingHelper.buildProductEmbeddingText({
        name: product.name,
        description: product.description,
        categoryName: product.category?.name,
        attributes: product.attributes
      });
      const textVector = await embeddingHelper.generateEmbedding(textToEmbed);
      const textVectorStr = `[${textVector.join(',')}]`;

      // Cập nhật text embedding cho Product
      await prisma.$executeRawUnsafe(
        `UPDATE "Product" SET embedding = $1::vector WHERE id = $2`,
        textVectorStr,
        product.id
      );
      
      // --- 2. IMAGE EMBEDDING (Cho từng ProductImage) ---
      if (product.images.length > 0) {
        console.log(`  🖼️ Found ${product.images.length} images. Generating embeddings...`);
        
        for (const img of product.images) {
          try {
            console.log(`    - Embedding image: ${img.url}`);
            const imageVector = await visionHelper.generateImageEmbedding(img.url);
            const imageVectorStr = `[${imageVector.join(',')}]`;

            // Lưu embedding vào ProductImage
            await prisma.$executeRawUnsafe(
              `UPDATE "ProductImage" SET "imageEmbedding" = $1::vector WHERE id = $2`,
              imageVectorStr,
              img.id
            );

            // Nếu là ảnh primary, cập nhật luôn vào Product.imageEmbedding (để tương thích ngược)
            if (img.isPrimary) {
              await prisma.$executeRawUnsafe(
                `UPDATE "Product" SET "imageEmbedding" = $1::vector WHERE id = $2`,
                imageVectorStr,
                product.id
              );
            }
          } catch (imgErr: any) {
            console.warn(`    ⚠️ Image embedding failed for ${img.url}:`, imgErr.message);
          }
        }
      }

      console.log(`  ✅ Success: ${product.name}`);
    } catch (error: any) {
      console.error(`  ❌ Critical failure for ${product.name}:`, error.message);
    }
  }

  console.log('\n✨ Unified Re-indexing completed!');
  process.exit(0);
}

reindex();

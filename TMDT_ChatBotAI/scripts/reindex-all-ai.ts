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
      images: { orderBy: { isPrimary: 'desc' }, take: 1 },
      category: { select: { name: true } }
    }
  });

  console.log(`Found ${products.length} products to process.`);

  for (const product of products) {
    try {
      console.log(`\n📦 Processing: ${product.name}`);
      
      // --- TEXT EMBEDDING ---
      const textToEmbed = EmbeddingHelper.buildProductEmbeddingText({
        name: product.name,
        description: product.description,
        categoryName: product.category?.name
      });
      const textVector = await embeddingHelper.generateEmbedding(textToEmbed);
      
      // --- IMAGE EMBEDDING ---
      let imageVector: number[] | null = null;
      if (product.images.length > 0) {
        const imageUrl = product.images[0].url;
        console.log(`  🖼️ Generating image embedding for: ${imageUrl}`);
        try {
          imageVector = await visionHelper.generateImageEmbedding(imageUrl);
        } catch (imgErr: any) {
          console.warn(`  ⚠️ Image embedding failed for ${product.name}:`, imgErr.message);
        }
      }

      // --- SAVE TO DB (Raw SQL for vectors) ---
      const textVectorStr = `[${textVector.join(',')}]`;
      const imageVectorStr = imageVector ? `[${imageVector.join(',')}]` : null;

      if (imageVectorStr) {
        await prisma.$executeRawUnsafe(
          `UPDATE "Product" SET embedding = $1::vector, "imageEmbedding" = $2::vector WHERE id = $3`,
          textVectorStr,
          imageVectorStr,
          product.id
        );
      } else {
        await prisma.$executeRawUnsafe(
          `UPDATE "Product" SET embedding = $1::vector WHERE id = $2`,
          textVectorStr,
          product.id
        );
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

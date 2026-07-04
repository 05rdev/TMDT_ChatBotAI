import { PrismaClient } from '@prisma/client';
import { EmbeddingHelper } from '../modules/ai/embeddingHelper';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const embeddingHelper = new EmbeddingHelper();

/**
 * Script to generate embeddings for all products in the database.
 * Usage: npx ts-node src/scripts/generateEmbeddings.ts
 */
async function generateEmbeddings() {
  console.log('🚀 Starting embedding generation for all products...');

  // 1. Fetch all products that need embeddings (or all of them)
  const products = await prisma.product.findMany({
    where: { isDeleted: false },
    include: { category: true }
  });

  console.log(`Found ${products.length} products to process.`);

  const BATCH_SIZE = 20;
  const DELAY_MS = 1000;

  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);
    console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(products.length / BATCH_SIZE)}...`);

    await Promise.all(batch.map(async (product) => {
      try {
        // Construct text for embedding
        const text = `Name: ${product.name}. Category: ${product.category.name}. Description: ${product.description || ''}`;
        
        // Generate vector
        const vector = await embeddingHelper.generateEmbedding(text);
        
        // Update database using Raw SQL (pgvector)
        const vectorString = `[${vector.join(',')}]`;
        await prisma.$executeRawUnsafe(
          `UPDATE "Product" SET embedding = $1::vector WHERE id = $2`,
          vectorString,
          product.id
        );

        console.log(`✅ Updated embedding for: ${product.name}`);
      } catch (error) {
        console.error(`❌ Failed to process product ${product.id}:`, error);
      }
    }));

    // Wait 1 second between batches to avoid rate limits
    if (i + BATCH_SIZE < products.length) {
      console.log(`Waiting ${DELAY_MS}ms for next batch...`);
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
  }

  console.log('✨ Embedding generation complete!');
}

generateEmbeddings()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

/**
 * scripts/seed-embeddings.ts
 * 
 * Script huấn luyện embedding cho toàn bộ sản phẩm trong database.
 * Chạy: npx ts-node scripts/seed-embeddings.ts
 * 
 * Hoạt động:
 *   1. Lấy tất cả sản phẩm chưa có embedding (hoặc --force để làm lại tất cả)
 *   2. Build text mô tả tối ưu cho từng sản phẩm (name + category + description)
 *   3. Gọi Ollama để sinh vector 768 chiều
 *   4. Lưu vào cột Product.embedding (pgvector)
 *   5. Xử lý theo batch để tránh OOM và rate limit
 */

import { PrismaClient } from '@prisma/client';
import { EmbeddingHelper } from '../src/modules/ai/embeddingHelper';

const prisma = new PrismaClient();
const embeddingHelper = new EmbeddingHelper();

const BATCH_SIZE = 10;       // Số sản phẩm xử lý đồng thời mỗi batch
const DELAY_BETWEEN_BATCHES_MS = 500; // Nghỉ giữa các batch để không overload Ollama

async function seedEmbeddings() {
  const forceReseed = process.argv.includes('--force');
  
  console.log('🚀 Starting embedding seed...');
  console.log(`   Mode: ${forceReseed ? 'FORCE (re-embed all)' : 'INCREMENTAL (skip existing)'}`);

  // 1. Lấy sản phẩm cần xử lý
  // Prisma không hỗ trợ filter trực tiếp trên kiểu Unsupported("vector"),
  // nên dùng raw query để lấy ID, sau đó findMany bình thường.
  let productIds: { id: string }[];
  if (forceReseed) {
    productIds = await prisma.$queryRaw`
      SELECT id FROM "Product" WHERE "isDeleted" = false ORDER BY "createdAt" ASC
    `;
  } else {
    productIds = await prisma.$queryRaw`
      SELECT id FROM "Product" WHERE "isDeleted" = false AND embedding IS NULL ORDER BY "createdAt" ASC
    `;
  }

  const ids = productIds.map(r => r.id);
  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    include: { category: { select: { name: true } } },
    orderBy: { createdAt: 'asc' }
  });

  if (products.length === 0) {
    console.log('✅ Tất cả sản phẩm đã có embedding. Dùng --force để re-embed.');
    return;
  }

  console.log(`📦 Found ${products.length} products to embed.\n`);

  let successCount = 0;
  let failCount = 0;

  // 2. Xử lý theo batch
  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(products.length / BATCH_SIZE);

    console.log(`\n🔄 Batch ${batchNum}/${totalBatches} (${batch.length} products)...`);

    // Xử lý song song trong batch
    const results = await Promise.allSettled(
      batch.map(async (product) => {
        // Build text mô tả tối ưu để embedding phản ánh đúng sản phẩm
        const embeddingText = EmbeddingHelper.buildProductEmbeddingText({
          name: product.name,
          categoryName: product.category?.name,
          description: product.description,
        });

        const vector = await embeddingHelper.generateEmbedding(embeddingText);
        const vectorString = `[${vector.join(',')}]`;

        // Lưu vào DB bằng raw query vì Prisma không hỗ trợ kiểu vector trực tiếp
        await prisma.$executeRaw`
          UPDATE "Product"
          SET embedding = ${vectorString}::vector
          WHERE id = ${product.id}
        `;

        return product.name;
      })
    );

    // Thống kê kết quả batch
    results.forEach((result, idx) => {
      if (result.status === 'fulfilled') {
        console.log(`   ✅ ${result.value}`);
        successCount++;
      } else {
        console.error(`   ❌ ${batch[idx].name}: ${result.reason?.message || result.reason}`);
        failCount++;
      }
    });

    // Nghỉ giữa các batch
    if (i + BATCH_SIZE < products.length) {
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES_MS));
    }
  }

  console.log('\n========================================');
  console.log(`✅ Seed hoàn tất!`);
  console.log(`   Success: ${successCount}/${products.length}`);
  if (failCount > 0) {
    console.log(`   Failed:  ${failCount}/${products.length} (chạy lại script để thử lại)`);
  }
  console.log('========================================\n');
}

seedEmbeddings()
  .catch((e) => {
    console.error('❌ Fatal error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
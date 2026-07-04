import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    where: { isDeleted: false },
    include: {
      category: { select: { name: true } },
      attributes: { select: { key: true, value: true, unit: true } },
    },
    orderBy: { createdAt: 'asc' }
  });

  // Old fashion/clothing attribute keys that shouldn't be on tech products
  const oldKeys = ['type', 'gender', 'style', 'occasion', 'material', 'size'];

  console.log('=== PRODUCT ATTRIBUTE ANALYSIS ===\n');
  
  let needsFix = 0;
  let alreadyCorrect = 0;

  for (const p of products) {
    const hasOldAttrs = p.attributes.some(a => oldKeys.includes(a.key));
    const hasNoAttrs = p.attributes.length === 0;
    
    if (hasOldAttrs || hasNoAttrs) {
      needsFix++;
      console.log(`❌ [${p.category?.name}] "${p.name}"`);
      console.log(`   ID: ${p.id}`);
      if (hasNoAttrs) {
        console.log(`   Status: NO ATTRIBUTES`);
      } else {
        console.log(`   Old attrs: ${p.attributes.map(a => `${a.key}=${a.value}`).join(', ')}`);
      }
      console.log('');
    } else {
      alreadyCorrect++;
      console.log(`✅ [${p.category?.name}] "${p.name}" - ${p.attributes.length} attrs OK`);
    }
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Total: ${products.length}`);
  console.log(`Already correct: ${alreadyCorrect}`);
  console.log(`Needs fix: ${needsFix}`);

  // Group by category
  console.log(`\n=== PRODUCTS BY CATEGORY ===`);
  const byCategory: Record<string, typeof products> = {};
  for (const p of products) {
    const cat = p.category?.name || 'Unknown';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(p);
  }
  for (const [cat, prods] of Object.entries(byCategory)) {
    console.log(`${cat}: ${prods.length} products`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());

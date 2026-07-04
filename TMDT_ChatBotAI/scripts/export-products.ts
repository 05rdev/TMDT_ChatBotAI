import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Lấy tất cả danh mục
  const categories = await prisma.category.findMany({
    where: { isDeleted: false },
    select: { id: true, name: true, slug: true, parentId: true }
  });
  console.log('=== CATEGORIES ===');
  console.log(JSON.stringify(categories, null, 2));

  // 2. Lấy tất cả sản phẩm kèm attributes, variants, images
  const products = await prisma.product.findMany({
    where: { isDeleted: false },
    include: {
      category: { select: { name: true, slug: true } },
      attributes: true,
      variants: true,
      images: { select: { url: true, isPrimary: true } }
    },
    orderBy: { createdAt: 'asc' }
  });

  console.log('\n=== PRODUCTS ===');
  console.log(JSON.stringify(products.map(p => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    category: p.category?.name,
    description: p.description?.substring(0, 100),
    attributes: p.attributes,
    variants: p.variants.map(v => ({
      id: v.id,
      name: v.name,
      sku: v.sku,
      price: Number(v.price),
      stock: v.stock,
      attributes: v.attributes
    })),
    images: p.images.length
  })), null, 2));

  console.log(`\nTotal categories: ${categories.length}`);
  console.log(`Total products: ${products.length}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

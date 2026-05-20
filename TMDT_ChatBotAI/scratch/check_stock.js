const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkStock() {
  const lowStock = await prisma.productVariant.findMany({
    where: { stock: { lt: 10 } },
    include: { product: { select: { name: true } } }
  });
  console.log('Low Stock Products (< 10):');
  console.log(JSON.stringify(lowStock, null, 2));
  process.exit(0);
}

checkStock();

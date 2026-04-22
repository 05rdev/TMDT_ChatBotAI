import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const images = await prisma.productImage.findMany({
    take: 10,
    select: {
      url: true,
      product: {
        select: {
          name: true
        }
      }
    }
  });
  console.log(JSON.stringify(images, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

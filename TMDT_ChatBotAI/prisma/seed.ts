import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Đang bắt đầu quá trình seeding...');

  // 1. Tạo Category mẫu
  const electronics = await prisma.category.upsert({
    where: { slug: 'dien-tu' },
    update: {},
    create: {
      name: 'Điện tử',
      slug: 'dien-tu',
    },
  });

  const fashion = await prisma.category.upsert({
    where: { slug: 'thoi-trang' },
    update: {},
    create: {
      name: 'Thời trang',
      slug: 'thoi-trang',
    },
  });

  console.log('✅ Đã tạo các Category');

  // 2. Tạo User mẫu (Admin)
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@tmdt.com' },
    update: {},
    create: {
      name: 'Admin Hệ Thống',
      email: 'admin@tmdt.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Đã tạo User Admin');

  // 3. Tạo Product mẫu kèm Vector Embedding giả lập
  // Để AI Search hoạt động thật sự, bạn cần gọi OpenAI API để tạo vector thực tế.
  // Ở đây tôi dùng vector ngẫu nhiên 1536 dims để demo cấu trúc Database.
  
  const generateRandomVector = (dim: number) => {
    return Array.from({ length: dim }, () => Math.random() * 2 - 1);
  };

  const productsData = [
    {
      name: 'iPhone 15 Pro Max',
      slug: 'iphone-15-pro-max',
      description: 'Siêu phẩm điện thoại Apple năm 2023',
      categoryId: electronics.id,
      variants: [
        { sku: 'IP15-PM-BLK', name: 'Màu đen, 256GB', price: 29990000, stock: 50 },
        { sku: 'IP15-PM-WHT', name: 'Màu trắng, 256GB', price: 29990000, stock: 30 },
      ]
    },
    {
      name: 'Samsung Galaxy S24 Ultra',
      slug: 'samsung-s24-ultra',
      description: 'Điện thoại AI đỉnh cao của Samsung',
      categoryId: electronics.id,
      variants: [
        { sku: 'SS-S24U-GRY', name: 'Titan Xám, 512GB', price: 33990000, stock: 20 },
      ]
    },
    {
      name: 'Áo thun Polo Nam',
      slug: 'ao-thun-polo-nam',
      description: 'Chất liệu cotton thoáng mát, form dáng trẻ trung',
      categoryId: fashion.id,
      variants: [
        { sku: 'POLO-NAVY-M', name: 'Xanh Navy, Size M', price: 350000, stock: 100 },
      ]
    }
  ];

  for (const p of productsData) {
    const vector = generateRandomVector(1536);
    const vectorString = `[${vector.join(',')}]`;

    // Tạo sản phẩm
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        categoryId: p.categoryId,
        variants: {
          create: p.variants
        }
      },
    });

    // Cập nhật Vector Embedding sử dụng $executeRaw 
    // vì Prisma chưa hỗ trợ ghi đè trường Unsupported trực tiếp bằng npx prisma seed/create
    await prisma.$executeRawUnsafe(
      `UPDATE "Product" SET embedding = $1::vector WHERE id = $2`,
      vectorString,
      product.id
    );

    console.log(`📦 Đã tạo sản phẩm: ${p.name}`);
  }

  console.log('✨ Quá trình seeding hoàn tất thành công!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

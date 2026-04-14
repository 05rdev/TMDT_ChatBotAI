import { PrismaClient, UserRole, OrderStatus, PaymentStatus, BehaviorType, ActivityType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker/locale/vi'; // Sử dụng tiếng Việt

const prisma = new PrismaClient();

async function cleanDb() {
  console.log('🧹 Đang dọn dẹp Database...');
  const tablenames = [
    'ChatMessage', 'ActivityLog', 'Cart', 'UserBehavior', 'Review', 
    'Payment', 'OrderItem', 'Order', 'ProductImage', 'ProductVariant', 
    'Product', 'Category', 'RefreshToken', 'User'
  ];

  for (const tablename of tablenames) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" CASCADE;`);
    } catch (error) {
       // Bo qua loi neu bang chua ton tai
    }
  }
}

async function main() {
  await cleanDb();
  console.log('🚀 Bắt đầu seeding dữ liệu UltraShop...');

  // 1. Tạo Người dùng
  console.log('👥 Đang tạo người dùng...');
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin UltraShop',
      email: 'admin@ultrashop.com',
      password: adminPassword,
      role: UserRole.ADMIN,
      avatar: 'https://i.pravatar.cc/150?u=admin'
    }
  });

  const users = await Promise.all(
    Array.from({ length: 40 }).map(() => 
      prisma.user.create({
        data: {
          name: faker.person.fullName(),
          email: faker.internet.email().toLowerCase(),
          password: userPassword,
          role: UserRole.USER,
          avatar: faker.image.avatar()
        }
      })
    )
  );

  // 2. Tạo Danh mục (Categories)
  console.log('📁 Đang tạo danh mục...');
  const categoryNames = [
    'Điện thoại', 'Laptop', 'Máy tính bảng', 'Đồng hồ thông minh', 'Tai nghe',
    'Thời trang Nam', 'Thời trang Nữ', 'Giày dép Sport', 'Phụ kiện',
    'Gia dụng', 'Bếp & Phòng ăn', 'Nội thất', 'Máy ảnh', 'Gaming Gear', 'Sách'
  ];

  const categories = await Promise.all(
    categoryNames.map(name => 
      prisma.category.create({
        data: {
          name,
          slug: faker.helpers.slugify(name).toLowerCase() + '-' + faker.string.nanoid(4)
        }
      })
    )
  );

  // 3. Tạo Sản phẩm
  console.log('📦 Đang tạo 200 sản phẩm...');
  const products: any[] = [];
  
  for (let i = 0; i < 200; i++) {
    const category = faker.helpers.arrayElement(categories);
    const productName = `${faker.commerce.productName()} ${faker.string.alphanumeric(3).toUpperCase()}`;
    
    // Tạo vector ngẫu nhiên 1536 dims
    const vector = Array.from({ length: 1536 }, () => Math.random() * 2 - 1);
    const vectorString = `[${vector.join(',')}]`;

    const product = await prisma.product.create({
      data: {
        name: productName,
        slug: faker.helpers.slugify(productName).toLowerCase() + '-' + faker.string.nanoid(6),
        description: faker.commerce.productDescription(),
        categoryId: category.id,
        images: {
          create: [
            { url: `https://picsum.photos/seed/${i+100}/800/800`, isPrimary: true },
            { url: `https://picsum.photos/seed/${i+200}/800/800` }
          ]
        },
        variants: {
          create: [
            { 
              sku: `SKU-${faker.string.alphanumeric(8).toUpperCase()}`,
              name: 'Mặc định',
              price: faker.number.int({ min: 100000, max: 5000000 }),
              stock: faker.number.int({ min: 0, max: 200 }),
              attributes: { color: faker.color.human(), size: faker.helpers.arrayElement(['S', 'M', 'L', 'XL']) }
            },
            { 
              sku: `SKU-${faker.string.alphanumeric(8).toUpperCase()}`,
              name: 'Bản Cao Cấp',
              price: faker.number.int({ min: 500000, max: 15000000 }),
              stock: faker.number.int({ min: 10, max: 50 }),
              attributes: { color: 'Gold', tier: 'Premium' }
            }
          ]
        }
      },
      include: { variants: true }
    });

    // Cập nhật Vector Embedding cho AI Search
    await prisma.$executeRawUnsafe(
      `UPDATE "Product" SET embedding = $1::vector WHERE id = $2`,
      vectorString,
      product.id
    );

    products.push(product);
  }

  // 4. Tạo Đơn hàng & Item
  console.log('🛒 Đang tạo đơn hàng...');
  for (let i = 0; i < 60; i++) {
    const user = faker.helpers.arrayElement(users) as any;
    const orderProducts = faker.helpers.arrayElements(products, { min: 1, max: 3 }) as any[];
    
    let totalAmount = 0;
    const itemsData = orderProducts.map(p => {
      const variant = faker.helpers.arrayElement(p.variants) as any;
      const quantity = faker.number.int({ min: 1, max: 2 });
      const price = Number(variant.price);
      totalAmount += price * quantity;
      
      return {
        productId: p.id,
        productVariantId: variant.id,
        quantity,
        price
      };
    });

    await prisma.order.create({
      data: {
        userId: user.id,
        status: faker.helpers.arrayElement(Object.values(OrderStatus)),
        totalAmount,
        address: faker.location.streetAddress(true),
        phone: faker.phone.number(),
        createdAt: faker.date.past({ years: 1 }),
        items: {
          create: itemsData
        },
        payment: {
          create: {
            method: faker.helpers.arrayElement(['MOMO', 'VNPAY', 'COD', 'STRIPE']),
            status: faker.helpers.arrayElement(Object.values(PaymentStatus)),
            amount: totalAmount,
            transactionId: faker.string.uuid()
          }
        }
      }
    });
  }

  // 5. Tạo Reviews
  console.log('⭐ Đang tạo đánh giá...');
  for (let i = 0; i < 300; i++) {
    const user = faker.helpers.arrayElement(users) as any;
    const product = faker.helpers.arrayElement(products) as any;
    
    await prisma.review.create({
      data: {
        userId: user.id,
        productId: product.id,
        rating: faker.number.int({ min: 1, max: 5 }),
        comment: faker.lorem.sentences(faker.number.int({ min: 1, max: 3 })),
        createdAt: faker.date.recent({ days: 30 })
      }
    });
  }

  // 6. Tạo Chat Logs & Behavior
  console.log('💬 Đang tạo lịch sử chat & hành vi...');
  for (let i = 0; i < 50; i++) {
    const user = faker.helpers.arrayElement(users) as any;
    await prisma.chatMessage.create({
      data: {
        userId: user.id,
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: i % 2 === 0 ? 'Tôi muốn tìm sản phẩm thông minh' : 'Dạ, em có các mẫu sau ạ...',
        createdAt: faker.date.recent({ days: 7 })
      }
    });

    await prisma.userBehavior.create({
      data: {
        userId: user.id,
        productId: (faker.helpers.arrayElement(products) as any).id,
        type: faker.helpers.arrayElement(Object.values(BehaviorType))
      }
    });
  }

  console.log('✨ QUÁ TRÌNH SEEDING HOÀN TẤT THÀNH CÔNG!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

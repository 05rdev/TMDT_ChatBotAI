import { PrismaClient, UserRole, OrderStatus, PaymentStatus, BehaviorType, ActivityType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker/locale/vi'; // Sử dụng tiếng Việt

const prisma = new PrismaClient();

async function cleanDb() {
  console.log('🧹 Đang dọn dẹp Database...');
  const tablenames = [
    'ChatMessage', 'ActivityLog', 'Cart', 'UserBehavior', 'Review', 
    'Payment', 'OrderItem', 'Order', 'ProductAttribute', 'ProductImage', 'ProductVariant', 
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
  const existingUsers = await prisma.user.count();
  if (existingUsers > 0) {
    console.log('⚠️ Database đã có dữ liệu. Bỏ qua quá trình seed để bảo vệ dữ liệu cũ.');
    console.log('💡 Nếu bạn thực sự muốn chạy lại seed, hãy uncomment hàm cleanDb() và xóa điều kiện này.');
    return;
  }

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
    
    // Tạo vector ngẫu nhiên 768 dims (matching schema)
    const vector = Array.from({ length: 768 }, () => Math.random() * 2 - 1);
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

  // 3.5 Tạo Product Attributes (thuộc tính kỹ thuật theo danh mục)
  console.log('📐 Đang tạo thuộc tính sản phẩm...');
  
  const categoryAttributeMap: Record<string, Array<{ key: string; unit: string; values: () => string }>> = {
    'Điện thoại': [
      { key: 'screen_size', unit: 'inch', values: () => faker.helpers.arrayElement(['5.5', '6.1', '6.5', '6.7', '6.9']) },
      { key: 'ram', unit: 'GB', values: () => faker.helpers.arrayElement(['4', '6', '8', '12', '16']) },
      { key: 'storage', unit: 'GB', values: () => faker.helpers.arrayElement(['64', '128', '256', '512']) },
      { key: 'battery', unit: 'mAh', values: () => faker.helpers.arrayElement(['3000', '4000', '4500', '5000', '5500']) },
      { key: 'camera', unit: 'MP', values: () => faker.helpers.arrayElement(['12', '48', '50', '64', '108', '200']) },
    ],
    'Laptop': [
      { key: 'screen_size', unit: 'inch', values: () => faker.helpers.arrayElement(['13.3', '14', '15.6', '16', '17.3']) },
      { key: 'ram', unit: 'GB', values: () => faker.helpers.arrayElement(['8', '16', '32', '64']) },
      { key: 'storage', unit: 'GB', values: () => faker.helpers.arrayElement(['256', '512', '1000', '2000']) },
      { key: 'cpu', unit: '', values: () => faker.helpers.arrayElement(['Intel i5', 'Intel i7', 'Intel i9', 'AMD Ryzen 5', 'AMD Ryzen 7', 'Apple M2', 'Apple M3']) },
      { key: 'weight', unit: 'kg', values: () => faker.helpers.arrayElement(['1.2', '1.4', '1.6', '1.8', '2.0', '2.3']) },
    ],
    'Máy tính bảng': [
      { key: 'screen_size', unit: 'inch', values: () => faker.helpers.arrayElement(['8.3', '10.2', '10.9', '11', '12.9']) },
      { key: 'ram', unit: 'GB', values: () => faker.helpers.arrayElement(['4', '6', '8', '16']) },
      { key: 'storage', unit: 'GB', values: () => faker.helpers.arrayElement(['64', '128', '256', '512']) },
    ],
    'Gia dụng': [
      { key: 'capacity', unit: 'lít', values: () => faker.helpers.arrayElement(['50', '100', '150', '200', '300', '400', '500', '600']) },
      { key: 'power', unit: 'W', values: () => faker.helpers.arrayElement(['100', '200', '500', '800', '1000', '1200', '1500', '2000']) },
      { key: 'weight', unit: 'kg', values: () => faker.helpers.arrayElement(['3', '5', '8', '10', '15', '20', '30', '50']) },
    ],
    'Bếp & Phòng ăn': [
      { key: 'capacity', unit: 'lít', values: () => faker.helpers.arrayElement(['1', '1.5', '2', '3', '4', '5', '6', '8', '10']) },
      { key: 'power', unit: 'W', values: () => faker.helpers.arrayElement(['300', '500', '800', '1000', '1200', '1500', '1800', '2000']) },
      { key: 'material', unit: '', values: () => faker.helpers.arrayElement(['Inox 304', 'Nhôm', 'Thép không gỉ', 'Gốm', 'Thủy tinh']) },
    ],
    'Nội thất': [
      { key: 'width', unit: 'cm', values: () => faker.helpers.arrayElement(['60', '80', '100', '120', '150', '180', '200']) },
      { key: 'height', unit: 'cm', values: () => faker.helpers.arrayElement(['40', '60', '75', '80', '100', '120', '180', '200']) },
      { key: 'material', unit: '', values: () => faker.helpers.arrayElement(['Gỗ tự nhiên', 'Gỗ MDF', 'Gỗ công nghiệp', 'Kim loại', 'Nhựa cao cấp']) },
      { key: 'weight', unit: 'kg', values: () => faker.helpers.arrayElement(['5', '10', '15', '20', '30', '50', '80']) },
    ],
    'Máy ảnh': [
      { key: 'resolution', unit: 'MP', values: () => faker.helpers.arrayElement(['20', '24', '26', '33', '45', '61']) },
      { key: 'sensor_size', unit: '', values: () => faker.helpers.arrayElement(['APS-C', 'Full Frame', 'Micro 4/3', '1 inch']) },
      { key: 'weight', unit: 'g', values: () => faker.helpers.arrayElement(['300', '400', '500', '650', '800', '1000']) },
    ],
    'Gaming Gear': [
      { key: 'response_time', unit: 'ms', values: () => faker.helpers.arrayElement(['1', '2', '4', '5']) },
      { key: 'refresh_rate', unit: 'Hz', values: () => faker.helpers.arrayElement(['60', '75', '120', '144', '165', '240', '360']) },
      { key: 'connectivity', unit: '', values: () => faker.helpers.arrayElement(['USB', 'Bluetooth 5.0', 'Wireless 2.4GHz', 'USB-C', 'USB + Bluetooth']) },
    ],
    'Đồng hồ thông minh': [
      { key: 'screen_size', unit: 'mm', values: () => faker.helpers.arrayElement(['40', '41', '44', '45', '46', '49']) },
      { key: 'battery_life', unit: 'ngày', values: () => faker.helpers.arrayElement(['1', '2', '3', '5', '7', '14', '18']) },
      { key: 'water_resistance', unit: 'ATM', values: () => faker.helpers.arrayElement(['3', '5', '10']) },
    ],
    'Tai nghe': [
      { key: 'driver_size', unit: 'mm', values: () => faker.helpers.arrayElement(['6', '8', '10', '12', '14', '40', '50']) },
      { key: 'battery_life', unit: 'giờ', values: () => faker.helpers.arrayElement(['4', '6', '8', '10', '20', '30', '40', '60']) },
      { key: 'connectivity', unit: '', values: () => faker.helpers.arrayElement(['Bluetooth 5.0', 'Bluetooth 5.2', 'Bluetooth 5.3', 'Jack 3.5mm', 'USB-C']) },
    ],
  };

  for (const product of products) {
    const category = categories.find(c => c.id === product.categoryId);
    if (!category) continue;
    
    const attrDefs = categoryAttributeMap[category.name];
    if (!attrDefs) continue;

    for (const attr of attrDefs) {
      try {
        await prisma.productAttribute.create({
          data: {
            productId: product.id,
            key: attr.key,
            value: attr.values(),
            unit: attr.unit || null,
          }
        });
      } catch (e) {
        // Skip duplicate key errors
      }
    }
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

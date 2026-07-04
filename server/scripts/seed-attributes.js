const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Format: { productId: { key: [value, unit?] } }
const DATA = {
  // === TAI NGHE ===
  'deb5397a-890f-4699-a7c6-abefc52b6e23': { // AirPods Pro 3
    brand: ['Apple'], type: ['In-ear TWS'], connectivity: ['Bluetooth 5.4'],
    noise_cancellation: ['ANC + Transparency'], battery_life: ['6', 'giờ'],
    driver_size: ['Custom Apple'], microphone: ['Có'], water_resistant: ['IPX4']
  },
  'da43852a-66b7-4c5d-a92b-812c6b985327': { // HyperX Cloud III
    brand: ['HyperX'], type: ['Over-ear Gaming'], connectivity: ['3.5mm + USB'],
    driver_size: ['53', 'mm'], microphone: ['Có - Khử ồn'], noise_cancellation: ['Passive'],
    frequency: ['10Hz - 21kHz']
  },
  'd4bfe112-a4db-4ccd-8280-ba952215e317': { // Havit HV-H2232D
    brand: ['Havit'], type: ['Over-ear Gaming'], connectivity: ['3.5mm'],
    microphone: ['Có - Khử ồn'], noise_cancellation: ['Passive'],
    sound: ['Âm thanh vòm ảo']
  },
  '9251db4c-b9bf-474d-bf4a-b8b2971f1067': { // Xiaomi Buds 5 Pro
    brand: ['Xiaomi'], type: ['In-ear TWS'], connectivity: ['Bluetooth 5.3'],
    noise_cancellation: ['ANC 52dB'], battery_life: ['6.5', 'giờ'],
    driver_size: ['11', 'mm'], microphone: ['Có'], water_resistant: ['IP54'],
    weight: ['5.6', 'g']
  },
  'e224a495-cc12-4069-a901-236170864bed': { // Logitech G321
    brand: ['Logitech'], type: ['Over-ear Gaming'], connectivity: ['2.4GHz LIGHTSPEED + Bluetooth 5.2'],
    driver_size: ['40', 'mm'], microphone: ['Có'], weight: ['210', 'g'],
    battery_life: ['30', 'giờ']
  },

  // === ĐIỆN THOẠI ===
  '9abc6cdf-d54b-4b24-9ccf-832628adeeff': { // Realme C85
    brand: ['Realme'], screen_size: ['6.67', 'inch'], screen_tech: ['IPS LCD'],
    ram: ['8', 'GB'], storage: ['128', 'GB'], battery: ['5160', 'mAh'],
    camera: ['50', 'MP'], os: ['Android 15'], chip: ['Helio G100']
  },
  '26e5e622-39e9-4b92-8695-5844dfa9b2fe': { // iPhone 17 Pro Max
    brand: ['Apple'], screen_size: ['6.9', 'inch'], screen_tech: ['OLED ProMotion'],
    ram: ['12', 'GB'], storage: ['256', 'GB'], battery: ['4900', 'mAh'],
    camera: ['48', 'MP'], os: ['iOS 19'], chip: ['A19 Pro'], connectivity: ['5G']
  },
  '2eca6f19-46e9-4d2c-9fe5-af77803038d9': { // Samsung Galaxy A57 - đã có attrs, bỏ qua
  },

  // === LAPTOP ===
  '50268195-45d5-4cd7-be3e-91f1f249bc22': { // Asus ROG Zephyrus G14
    brand: ['Asus'], cpu: ['Ryzen AI 9 HX 370'], ram: ['32', 'GB'],
    storage: ['1', 'TB SSD'], screen_size: ['14', 'inch'], screen_tech: ['3K OLED 120Hz'],
    gpu: ['RTX 5060 8GB'], os: ['Windows 11'], weight: ['1.5', 'kg']
  },
  'd708039f-b2a9-4868-b262-1793fb19bb25': { // Dell Alienware 16
    brand: ['Dell'], cpu: ['Intel Core Ultra 9'], ram: ['32', 'GB'],
    storage: ['1', 'TB SSD'], screen_size: ['16', 'inch'], screen_tech: ['QHD+ 240Hz'],
    gpu: ['RTX 5070 Ti'], os: ['Windows 11']
  },
  '85edf011-cdf4-4c3d-a079-e16cea300cca': { // Dell Precision 7760
    brand: ['Dell'], cpu: ['Intel Xeon W-11955M'], ram: ['64', 'GB'],
    storage: ['1', 'TB SSD'], screen_size: ['17.3', 'inch'], screen_tech: ['FHD IPS'],
    gpu: ['NVIDIA RTX A4000'], os: ['Windows 10 Pro']
  },
  '0e280f36-d54e-4b1a-93dd-4067c020bea7': { // Dell Latitude 7320
    brand: ['Dell'], cpu: ['i5-1145G7'], ram: ['16', 'GB'],
    storage: ['256', 'GB SSD'], screen_size: ['13.3', 'inch'], screen_tech: ['FHD IPS'],
    gpu: ['Intel Iris Xe'], os: ['Windows 10']
  },
  'b0fd4c30-13c4-41ee-8f5f-7a570bea23e6': { // Lenovo LOQ Gaming
    brand: ['Lenovo'], cpu: ['i7-13650HX'], ram: ['16', 'GB'],
    storage: ['512', 'GB SSD'], screen_size: ['15.6', 'inch'], screen_tech: ['FHD 144Hz'],
    gpu: ['RTX 5050 8GB'], os: ['Windows 11']
  },

  // === MÁY ẢNH ===
  '933cd7d8-45bc-41fd-9811-705e75819a33': { // Canon EOS R50
    brand: ['Canon'], sensor: ['APS-C CMOS'], resolution: ['24.2', 'MP'],
    video: ['4K 30fps'], lens: ['RF-S 18-45mm F4.5-6.3 IS STM'],
    iso_range: ['100-32000'], screen_size: ['3', 'inch']
  },
  '93dc4b66-f386-42a1-9dfb-9cb8f484e11a': { // Fujifilm Instax Mini 12
    brand: ['Fujifilm'], type: ['Máy ảnh lấy liền'], lens: ['60mm f/12.7'],
    flash: ['Tự động'], film: ['Instax Mini'], color: ['Blossom Pink']
  },
  '680a8690-635c-4b55-8379-77d6b41f001a': { // Fujifilm Instax Mini Evo
    brand: ['Fujifilm'], type: ['Máy ảnh lai - In liền + Digital'], sensor: ['1/5 inch CMOS'],
    resolution: ['4.9', 'MP'], lens: ['28mm f/2.0'], film: ['Instax Mini'],
    connectivity: ['Bluetooth'], color: ['Đen']
  },
  'f7b1cd79-08af-49f5-93c1-ae83c32977b9': { // Nikon ZF
    brand: ['Nikon'], sensor: ['FX BSI CMOS'], resolution: ['24.5', 'MP'],
    video: ['4K 30fps + FHD 120fps'], lens: ['24-70mm f/4 S'],
    iso_range: ['100-64000'], chip: ['EXPEED 7']
  },
  'da23d738-724a-47d6-8721-c8b93653eb88': { // Sony A6700
    brand: ['Sony'], sensor: ['APS-C Exmor R CMOS'], resolution: ['26', 'MP'],
    video: ['4K 120fps'], lens: ['E PZ 16-50mm F3.5-5.6 OSS II'],
    iso_range: ['100-32000'], stabilization: ['5-axis IBIS']
  },

  // === MÁY TÍNH BẢNG ===
  '49189589-4122-41b9-9f55-2cd9954d0141': { // iPad Air M4
    brand: ['Apple'], screen_size: ['13', 'inch'], screen_tech: ['Liquid Retina IPS'],
    ram: ['8', 'GB'], storage: ['128', 'GB'], chip: ['Apple M4'],
    os: ['iPadOS'], connectivity: ['Wi-Fi 6E'], color: ['Purple']
  },
  'e9359b5f-7db9-4f18-aefd-a8695f2e413d': { // Surface Pro 7
    brand: ['Microsoft'], screen_size: ['12.3', 'inch'], screen_tech: ['PixelSense Touch'],
    ram: ['8', 'GB'], storage: ['128', 'GB SSD'], chip: ['i5-1035G4'],
    os: ['Windows 10'], gpu: ['Intel Iris Plus']
  },
  '3430a0e3-d0d7-4f21-94c2-f4e793da4d3b': { // Xiaomi Redmi Pad 2
    brand: ['Xiaomi'], screen_size: ['11', 'inch'], screen_tech: ['IPS LCD 90Hz'],
    ram: ['6', 'GB'], storage: ['128', 'GB'], os: ['Xiaomi HyperOS 2'],
    resolution: ['1600x2560']
  },
  'eb7fbe43-7296-449a-aa50-8c62f5b37f40': { // Xiaomi Redmi Pad SE
    brand: ['Xiaomi'], screen_size: ['8.7', 'inch'], screen_tech: ['IPS LCD 90Hz'],
    ram: ['4', 'GB'], storage: ['128', 'GB'], battery: ['6650', 'mAh'],
    connectivity: ['4G LTE + Wi-Fi']
  },

  // === GIA DỤNG ===
  '600a9046-2e76-4070-bb44-3f8042af6c44': { // Bếp từ đôi KAFF
    brand: ['KAFF'], type: ['Bếp từ đôi'], power: ['4400', 'W'],
    material: ['Kính Schott Ceran'], warranty: ['36', 'tháng'],
    origin: ['Đức']
  },
  'c91b1cc7-491d-4a43-aa66-5131db286ded': { // Máy lọc nước Karofi
    brand: ['Karofi'], type: ['RO nóng nguội lạnh Hydrogen'], capacity: ['11', 'lõi'],
    technology: ['RO + Nano Silver'], warranty: ['36', 'tháng']
  },
  '4fa704d7-8f58-4fee-819c-913f8583bf99': { // Máy ép Kuvings
    brand: ['Kuvings'], type: ['Máy ép chậm'], capacity: ['400', 'ml'],
    material: ['Nhựa cao cấp không BPA'], warranty: ['24', 'tháng']
  },
  '1e1b58b3-781c-4d3a-b4ff-40002d5fad6d': { // Nồi chiên không dầu Joyoung
    brand: ['Joyoung'], type: ['Nồi chiên không dầu'], capacity: ['6', 'L'],
    power: ['2100', 'W'], warranty: ['24', 'tháng'],
    feature: ['2 cửa sổ quan sát']
  },
  'db4dc78a-a17c-4b70-9e3e-0d48594194e6': { // Roborock F25
    brand: ['Roborock'], type: ['Robot hút bụi lau nhà'], suction: ['22000', 'Pa'],
    feature: ['Gập nghiêng 180° FlatReach'], wash_temp: ['150', '°C'],
    dry_temp: ['90', '°C']
  },

  // === NỘI THẤT ===
  '4fbf0a8e-3761-4e0c-8518-95e14d45f855': { // Bàn làm việc
    type: ['Bàn làm việc'], material: ['Gỗ MDF + Chân sắt sơn trắng'],
    style: ['Minimalist'], color: ['Trắng + Gỗ tự nhiên']
  },
  '9c71218d-e2b2-45b4-82c4-6bc409deab30': { // Bộ bàn ăn tròn Monet
    brand: ['HAC'], type: ['Bộ bàn ăn tròn 6 ghế'], material: ['Gỗ cao cấp'],
    style: ['Sang trọng'], seats: ['6']
  },
  '50c35079-75e4-4e64-9531-752c1e41705f': { // Giường ngủ Da Bò
    type: ['Giường ngủ'], material: ['Da bò thật + Gỗ'], style: ['Hiện đại'],
    dimensions: ['1m8 x 2m']
  },
  'c5be2391-81bc-4112-96c7-9d6f001fa416': { // Giường Ngủ Nữ Hoàng
    type: ['Giường ngủ'], material: ['Gỗ Hương Đá'], style: ['Cổ điển hoàng gia']
  },
  '14754302-9e0f-4419-b8f1-0f5d6e6e21a1': { // Sofa giường kéo
    type: ['Sofa giường kéo'], material: ['Gỗ Ash + Nệm D40'],
    dimensions: ['1m x 1m9'], color: ['Tùy chọn']
  },

  // === BẾP & PHÒNG ĂN ===
  'f994ac8a-37e1-4273-81fb-74e4e7958dc2': { // Bàn ăn AB062
    type: ['Bàn ăn'], material: ['Mặt đá nhập khẩu + Chân kim loại'],
    style: ['Cao cấp'], origin: ['Nhập khẩu']
  },
  'a4f7fd8a-a14b-4030-8136-457956dcf3d2': { // Bàn ăn Luxury AB074
    type: ['Bàn ăn'], material: ['Mặt đá nhập khẩu'], style: ['Luxury'],
    origin: ['Nhập khẩu']
  },
  'c8907458-7814-46b1-b9e3-4d606b831b5c': { // Bàn ăn AB070
    type: ['Bàn ăn'], material: ['Mặt đá nhập khẩu'], style: ['Sang trọng'],
    origin: ['Nhập khẩu']
  },
  'ce2a9721-cf7b-4bc0-b14a-8171f9ac2ca9': { // Bàn đảo bếp gấp gọn
    type: ['Bàn đảo bếp + Bàn ăn'], material: ['Gỗ công nghiệp'],
    style: ['Thông minh gấp gọn']
  },
  '796e9a56-15cc-4714-bb85-e3d6c1f91683': { // Bàn đảo bếp Bắc Âu
    brand: ['Khanhconcept'], type: ['Bàn đảo bếp'], style: ['Bắc Âu hiện đại'],
    material: ['Gỗ + Kim loại']
  },

  // === THỜI TRANG NAM ===
  '6200cfd7-34c8-4f4d-8a7a-1e7269036d13': { // Áo da bò nam
    brand: ['Navy'], type: ['Áo khoác da'], material: ['Da bò thật'],
    color: ['Đen'], style: ['Thời trang nam'], gender: ['Nam']
  },
  '6176c2a5-1313-4510-8a82-f468a30c7360': { // Áo sơ mi đũi
    type: ['Áo sơ mi tay ngắn'], material: ['Vải đũi'], style: ['Casual mùa hè'],
    gender: ['Nam']
  },
  'af28dfc2-91ef-4715-93a6-6e5e42b4b15d': { // Suit cưới Infinite Love
    type: ['Bộ suit 3 mảnh'], style: ['Suit cưới'], color: ['Xanh Navy'],
    gender: ['Nam'], occasion: ['Cưới / Lễ']
  },
  'ccd909a5-fa59-4253-ae4e-1db9b104e704': { // Suit Prince Charming
    type: ['Bộ suit cưới'], style: ['Suit cưới'], color: ['Trắng'],
    gender: ['Nam'], occasion: ['Cưới / Lễ']
  },
  'db10b02c-58f1-402e-bcd4-d7f247ed54d5': { // Suit Sky Blue
    type: ['Bộ suit 3 mảnh'], style: ['Suit nam'], color: ['Xanh da trời'],
    gender: ['Nam'], occasion: ['Công sở / Lễ']
  },

  // === THỜI TRANG NỮ ===
  'fee8606c-eacb-427f-8807-5f6213f88afd': { // Đầm váy voan
    type: ['Đầm váy voan'], material: ['Voan cao cấp'], style: ['Hàn Quốc sang trọng'],
    gender: ['Nữ'], collar: ['Cổ bẻ']
  },
  'd19ec357-922f-4bbe-8d68-e82bdd102434': { // Set bộ cộc nữ
    type: ['Set bộ quần áo'], material: ['Polyeste cao cấp'], color: ['Be / Hồng / Xanh'],
    style: ['Hàn Quốc'], gender: ['Nữ']
  },
  '569d040a-b54c-4594-a865-0b5aa214a8e2': { // Set bộ quần áo nữ
    type: ['Set bộ quần áo'], material: ['Polyeste cao cấp'], color: ['Đen / Xanh'],
    style: ['Hàn Quốc'], gender: ['Nữ']
  },
  'cc9f0adb-1cd7-46a9-bc5e-74733adfb16c': { // Váy thiết kế
    type: ['Váy liền'], material: ['Vải cao cấp'], style: ['Thanh lịch tinh tế'],
    gender: ['Nữ'], brand: ['Mo Han Yi Mei']
  },

  // === GIÀY DÉP SPORT ===
  'cf10d9f9-baaf-4f87-8dd6-135fcf9fb129': { // Dép quai ngang
    type: ['Dép quai ngang'], style: ['Sport / Văn phòng'], gender: ['Unisex'],
    material: ['EVA']
  },
  '1949fb1b-6b79-4c63-a319-4b83faa87f2d': { // Asics Magic Speed 4
    brand: ['Asics'], type: ['Giày chạy bộ'], material: ['Mesh + FF Blast'],
    gender: ['Nam'], usage: ['Chạy bộ thi đấu']
  },
  '24736bc5-5851-46ce-941e-5c69cbb20914': { // Asics Sonicblast
    brand: ['Asics'], type: ['Giày chạy bộ'], material: ['Mesh + GEL'],
    gender: ['Nam'], usage: ['Chạy bộ hàng ngày']
  },
  '2dcc7110-b084-4b84-84de-d5e84bc7d430': { // Giày Daddy nữ
    type: ['Giày thể thao Daddy'], gender: ['Nữ'], style: ['Streetwear']
  },
  '071f40e6-c400-4f01-a1c6-cf0d93cec0e5': { // Giày đế cao nữ
    type: ['Giày thể thao đế cao'], gender: ['Nữ'], style: ['Tăng chiều cao']
  },
};

async function main() {
  console.log('🚀 Seeding ProductAttributes...\n');
  let totalCreated = 0;
  let totalSkipped = 0;

  for (const [productId, attrs] of Object.entries(DATA)) {
    if (Object.keys(attrs).length === 0) continue;

    for (const [key, valArr] of Object.entries(attrs)) {
      const [value, unit] = valArr;
      try {
        await prisma.productAttribute.upsert({
          where: { productId_key: { productId, key } },
          update: { value, unit: unit || null },
          create: { productId, key, value, unit: unit || null }
        });
        totalCreated++;
      } catch (err) {
        console.error(`  ❌ Error: ${key} for ${productId}: ${err.message}`);
        totalSkipped++;
      }
    }
    // Get product name for logging
    const prod = await prisma.product.findUnique({ where: { id: productId }, select: { name: true } });
    console.log(`  ✅ ${prod?.name || productId}: ${Object.keys(attrs).length} attributes`);
  }

  console.log(`\n🎉 Done! Created/Updated: ${totalCreated}, Skipped: ${totalSkipped}`);

  // Stats
  const total = await prisma.productAttribute.count();
  const products = await prisma.productAttribute.groupBy({ by: ['productId'], _count: true });
  console.log(`📊 Total attributes in DB: ${total}, Products with attributes: ${products.length}`);

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });

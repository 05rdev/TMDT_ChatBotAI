import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Map productId -> new attributes
const fixes: Record<string, { key: string; value: string; unit?: string }[]> = {
  // === LINH KIỆN MÁY TÍNH ===
  // VGA JGINYUE NVIDIA GEFORCE GTX 750 TI 4G DDR5
  'a4f7fd8a-a14b-4030-8136-457956dcf3d2': [
    { key: 'brand', value: 'JGINYUE' },
    { key: 'chip', value: 'NVIDIA GeForce GTX 750 Ti' },
    { key: 'memory', value: '4', unit: 'GB' },
    { key: 'memory_type', value: 'GDDR5' },
    { key: 'interface', value: 'PCIe 3.0 x16' },
    { key: 'type', value: 'Card đồ họa (VGA)' },
  ],
  // Ram DDR4 16GB
  'c8907458-7814-46b1-b9e3-4d606b831b5c': [
    { key: 'brand', value: 'Generic' },
    { key: 'type', value: 'RAM Desktop' },
    { key: 'capacity', value: '16', unit: 'GB' },
    { key: 'memory_type', value: 'DDR4' },
    { key: 'speed', value: '3200', unit: 'MHz' },
    { key: 'voltage', value: '1.2', unit: 'V' },
  ],
  // Mainboard Gigabyte H610M K Rev 1.0 DDR4
  'f994ac8a-37e1-4273-81fb-74e4e7958dc2': [
    { key: 'brand', value: 'Gigabyte' },
    { key: 'type', value: 'Mainboard' },
    { key: 'chipset', value: 'Intel H610' },
    { key: 'socket', value: 'LGA 1700' },
    { key: 'form_factor', value: 'Micro-ATX' },
    { key: 'memory_type', value: 'DDR4' },
    { key: 'ram_slots', value: '2' },
  ],
  // CPU INTEL CORE I3 8100
  'ce2a9721-cf7b-4bc0-b14a-8171f9ac2ca9': [
    { key: 'brand', value: 'Intel' },
    { key: 'type', value: 'CPU' },
    { key: 'series', value: 'Core i3-8100' },
    { key: 'cores', value: '4' },
    { key: 'threads', value: '4' },
    { key: 'base_clock', value: '3.60', unit: 'GHz' },
    { key: 'socket', value: 'FCLGA1151' },
    { key: 'cache', value: '6', unit: 'MB' },
    { key: 'tdp', value: '65', unit: 'W' },
  ],
  // Linh kiện bản lề laptop Acer
  '796e9a56-15cc-4714-bb85-e3d6c1f91683': [
    { key: 'brand', value: 'Acer' },
    { key: 'type', value: 'Bản lề laptop' },
    { key: 'compatibility', value: 'Laptop Acer' },
    { key: 'material', value: 'Kim loại' },
  ],

  // === ĐỒNG HỒ THÔNG MINH ===
  // Huawei Watch Fit 4 43mm dây silicone
  '569d040a-b54c-4594-a865-0b5aa214a8e2': [
    { key: 'brand', value: 'Huawei' },
    { key: 'type', value: 'Đồng hồ thông minh' },
    { key: 'screen_size', value: '1.82', unit: 'inch' },
    { key: 'screen_tech', value: 'AMOLED' },
    { key: 'case_size', value: '43', unit: 'mm' },
    { key: 'strap_material', value: 'Silicone' },
    { key: 'battery_life', value: '10', unit: 'ngày' },
    { key: 'water_resistance', value: '5 ATM' },
    { key: 'connectivity', value: 'Bluetooth 5.2' },
    { key: 'os', value: 'HarmonyOS' },
    { key: 'sensors', value: 'SpO2, nhịp tim, GPS' },
  ],
  // Vòng đeo tay thông minh Mi Band 9 Pro
  'd19ec357-922f-4bbe-8d68-e82bdd102434': [
    { key: 'brand', value: 'Xiaomi' },
    { key: 'type', value: 'Vòng đeo tay thông minh' },
    { key: 'screen_size', value: '1.74', unit: 'inch' },
    { key: 'screen_tech', value: 'AMOLED' },
    { key: 'battery_life', value: '21', unit: 'ngày' },
    { key: 'water_resistance', value: '5 ATM' },
    { key: 'connectivity', value: 'Bluetooth 5.4' },
    { key: 'sensors', value: 'SpO2, nhịp tim, GPS' },
    { key: 'weight', value: '25', unit: 'g' },
  ],
  // Samsung Galaxy Watch8 LTE 40mm dây silicone
  'fee8606c-eacb-427f-8807-5f6213f88afd': [
    { key: 'brand', value: 'Samsung' },
    { key: 'type', value: 'Đồng hồ thông minh' },
    { key: 'screen_size', value: '1.31', unit: 'inch' },
    { key: 'screen_tech', value: 'Super AMOLED' },
    { key: 'case_size', value: '40', unit: 'mm' },
    { key: 'strap_material', value: 'Silicone' },
    { key: 'battery_life', value: '40', unit: 'giờ' },
    { key: 'water_resistance', value: '5 ATM + IP68' },
    { key: 'connectivity', value: 'Bluetooth 5.3, Wi-Fi, LTE' },
    { key: 'os', value: 'Wear OS 5' },
    { key: 'chip', value: 'Exynos W1000' },
    { key: 'sensors', value: 'SpO2, nhịp tim, ECG, nhiệt độ da' },
  ],
  // Xiaomi Redmi Watch 6
  'cc9f0adb-1cd7-46a9-bc5e-74733adfb16c': [
    { key: 'brand', value: 'Xiaomi' },
    { key: 'type', value: 'Đồng hồ thông minh' },
    { key: 'screen_size', value: '1.97', unit: 'inch' },
    { key: 'screen_tech', value: 'AMOLED' },
    { key: 'battery_life', value: '12', unit: 'ngày' },
    { key: 'water_resistance', value: '5 ATM' },
    { key: 'connectivity', value: 'Bluetooth 5.3, GPS' },
    { key: 'sensors', value: 'SpO2, nhịp tim' },
  ],

  // === MÀN HÌNH ===
  // Màn hình di động VSP VP1560FS1
  '4fbf0a8e-3761-4e0c-8518-95e14d45f855': [
    { key: 'brand', value: 'VSP' },
    { key: 'type', value: 'Màn hình di động' },
    { key: 'screen_size', value: '15.6', unit: 'inch' },
    { key: 'resolution', value: 'Full HD (1920x1080)' },
    { key: 'panel_type', value: 'IPS' },
    { key: 'refresh_rate', value: '60', unit: 'Hz' },
    { key: 'response_time', value: '5', unit: 'ms' },
    { key: 'ports', value: 'USB-C, Mini HDMI' },
  ],
  // Màn hình Xiaomi A27i 2026
  'c5be2391-81bc-4112-96c7-9d6f001fa416': [
    { key: 'brand', value: 'Xiaomi' },
    { key: 'type', value: 'Màn hình máy tính' },
    { key: 'screen_size', value: '27', unit: 'inch' },
    { key: 'resolution', value: 'Full HD (1920x1080)' },
    { key: 'panel_type', value: 'IPS' },
    { key: 'refresh_rate', value: '144', unit: 'Hz' },
    { key: 'response_time', value: '6', unit: 'ms' },
    { key: 'ports', value: 'HDMI, VGA' },
  ],
  // Màn hình Viewsonic VA2432-H-2
  '9c71218d-e2b2-45b4-82c4-6bc409deab30': [
    { key: 'brand', value: 'ViewSonic' },
    { key: 'type', value: 'Màn hình máy tính' },
    { key: 'screen_size', value: '24', unit: 'inch' },
    { key: 'resolution', value: 'Full HD (1920x1080)' },
    { key: 'panel_type', value: 'IPS' },
    { key: 'refresh_rate', value: '100', unit: 'Hz' },
    { key: 'response_time', value: '1', unit: 'ms' },
    { key: 'ports', value: 'HDMI, VGA' },
  ],
  // Màn hình MSI PRO MP252L
  '14754302-9e0f-4419-b8f1-0f5d6e6e21a1': [
    { key: 'brand', value: 'MSI' },
    { key: 'type', value: 'Màn hình máy tính' },
    { key: 'screen_size', value: '24.5', unit: 'inch' },
    { key: 'resolution', value: 'Full HD (1920x1080)' },
    { key: 'panel_type', value: 'IPS' },
    { key: 'refresh_rate', value: '100', unit: 'Hz' },
    { key: 'response_time', value: '1', unit: 'ms' },
    { key: 'ports', value: 'HDMI, D-Sub' },
  ],
  // Màn hình Asus VY249HGR
  '50c35079-75e4-4e64-9531-752c1e41705f': [
    { key: 'brand', value: 'Asus' },
    { key: 'type', value: 'Màn hình máy tính' },
    { key: 'screen_size', value: '23.8', unit: 'inch' },
    { key: 'resolution', value: 'Full HD (1920x1080)' },
    { key: 'panel_type', value: 'IPS' },
    { key: 'refresh_rate', value: '120', unit: 'Hz' },
    { key: 'response_time', value: '1', unit: 'ms' },
    { key: 'ports', value: 'HDMI' },
  ],

  // === GAMING GEAR ===
  // Tai nghe Gaming DareU EH733
  'af28dfc2-91ef-4715-93a6-6e5e42b4b15d': [
    { key: 'brand', value: 'DareU' },
    { key: 'type', value: 'Tai nghe Gaming' },
    { key: 'driver', value: '50', unit: 'mm' },
    { key: 'connectivity', value: 'Có dây USB / 3.5mm' },
    { key: 'microphone', value: 'Có (chống ồn)' },
    { key: 'surround', value: '7.1 ảo' },
    { key: 'weight', value: '310', unit: 'g' },
  ],
  // Tay cầm ASUS ROG Raikiri Pro
  'ccd909a5-fa59-4253-ae4e-1db9b104e704': [
    { key: 'brand', value: 'ASUS ROG' },
    { key: 'type', value: 'Tay cầm chơi game' },
    { key: 'connectivity', value: 'Có dây / RF 2.4G / Bluetooth 5.0' },
    { key: 'compatibility', value: 'PC, Xbox' },
    { key: 'battery', value: 'Pin sạc Li-Po' },
    { key: 'features', value: 'Màn hình OLED, Trigger tùy chỉnh, RGB' },
  ],
  // Ghế Gaming GVP-06
  'db10b02c-58f1-402e-bcd4-d7f247ed54d5': [
    { key: 'brand', value: 'GVP' },
    { key: 'type', value: 'Ghế Gaming' },
    { key: 'material', value: 'Da PU cao cấp' },
    { key: 'frame', value: 'Khung thép chắc chắn' },
    { key: 'weight_capacity', value: '150', unit: 'kg' },
    { key: 'features', value: 'Ngả lưng 135°, có gác chân, tay vịn điều chỉnh' },
    { key: 'dimensions', value: '58x62x114 cm' },
  ],
  // Tai nghe Gaming Logitech G522
  '6176c2a5-1313-4510-8a82-f468a30c7360': [
    { key: 'brand', value: 'Logitech' },
    { key: 'type', value: 'Tai nghe Gaming' },
    { key: 'driver', value: '50', unit: 'mm' },
    { key: 'connectivity', value: 'Lightspeed Wireless / Bluetooth / 3.5mm' },
    { key: 'microphone', value: 'Có (tháo rời, chống ồn)' },
    { key: 'surround', value: 'DTS Headphone:X 2.0' },
    { key: 'battery_life', value: '20', unit: 'giờ' },
  ],
  // Chuột gaming Logitech G502 X Plus
  '6200cfd7-34c8-4f4d-8a7a-1e7269036d13': [
    { key: 'brand', value: 'Logitech' },
    { key: 'type', value: 'Chuột Gaming' },
    { key: 'sensor', value: 'HERO 25K' },
    { key: 'dpi', value: '25600' },
    { key: 'connectivity', value: 'Lightspeed Wireless 2.4GHz' },
    { key: 'weight', value: '106', unit: 'g' },
    { key: 'switches', value: 'LIGHTFORCE Hybrid' },
    { key: 'battery_life', value: '130', unit: 'giờ' },
    { key: 'color', value: 'Đen' },
    { key: 'features', value: 'RGB LIGHTSYNC' },
  ],

  // === THIẾT BỊ LƯU TRỮ ===
  // Ổ cứng HDD WD TÍM
  '24736bc5-5851-46ce-941e-5c69cbb20914': [
    { key: 'brand', value: 'Western Digital (WD)' },
    { key: 'type', value: 'Ổ cứng HDD' },
    { key: 'series', value: 'WD Purple' },
    { key: 'capacity', value: '1TB - 8TB' },
    { key: 'interface', value: 'SATA III 6Gb/s' },
    { key: 'rpm', value: '5400' },
    { key: 'usage', value: 'Camera giám sát / Lưu trữ' },
    { key: 'form_factor', value: '3.5 inch' },
  ],
  // Synology DS1825+
  '1949fb1b-6b79-4c63-a319-4b83faa87f2d': [
    { key: 'brand', value: 'Synology' },
    { key: 'type', value: 'NAS Server' },
    { key: 'model', value: 'DS1825+' },
    { key: 'bays', value: '8' },
    { key: 'cpu', value: 'AMD Ryzen V1780B' },
    { key: 'ram', value: '8', unit: 'GB' },
    { key: 'connectivity', value: 'LAN / USB 3.2 Gen 1' },
    { key: 'features', value: 'RAID, Hot-swap, DSM OS' },
  ],
  // NAS Triton Intel J1900 4B
  'cf10d9f9-baaf-4f87-8dd6-135fcf9fb129': [
    { key: 'brand', value: 'Triton' },
    { key: 'type', value: 'NAS Server' },
    { key: 'cpu', value: 'Intel J1900' },
    { key: 'bays', value: '4' },
    { key: 'connectivity', value: 'LAN Gigabit' },
    { key: 'usage', value: 'Lưu trữ đám mây cá nhân' },
  ],
  // Synology Beestation Plus 8TB
  '2dcc7110-b084-4b84-84de-d5e84bc7d430': [
    { key: 'brand', value: 'Synology' },
    { key: 'type', value: 'Lưu trữ đám mây cá nhân' },
    { key: 'model', value: 'BST170-8T' },
    { key: 'capacity', value: '8', unit: 'TB' },
    { key: 'cpu', value: 'Intel Celeron J4125' },
    { key: 'connectivity', value: 'LAN Gigabit, USB 3.2' },
    { key: 'features', value: 'Plug & Play, Synology Photos, BeeFiles' },
  ],
  // USB SanDisk Extreme Pro 2TB
  '071f40e6-c400-4f01-a1c6-cf0d93cec0e5': [
    { key: 'brand', value: 'SanDisk' },
    { key: 'type', value: 'USB Flash Drive' },
    { key: 'model', value: 'Extreme Pro Dual Drive' },
    { key: 'capacity', value: '2', unit: 'TB' },
    { key: 'interface', value: 'USB 3.2 Gen 2' },
    { key: 'speed', value: '1000', unit: 'MB/s' },
    { key: 'connector', value: 'USB-C + USB-A' },
  ],
};

async function main() {
  const productIds = Object.keys(fixes);
  console.log(`🔧 Bắt đầu sửa attributes cho ${productIds.length} sản phẩm...\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const productId of productIds) {
    const newAttrs = fixes[productId];
    
    // Lấy tên sản phẩm
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { name: true }
    });

    if (!product) {
      console.log(`⚠️ Không tìm thấy sản phẩm: ${productId}`);
      errorCount++;
      continue;
    }

    try {
      await prisma.$transaction(async (tx) => {
        // 1. Xóa toàn bộ attributes cũ
        await tx.productAttribute.deleteMany({
          where: { productId }
        });

        // 2. Tạo attributes mới
        await tx.productAttribute.createMany({
          data: newAttrs.map(attr => ({
            productId,
            key: attr.key,
            value: attr.value,
            unit: attr.unit || null
          }))
        });
      });

      successCount++;
      console.log(`✅ [${successCount}/${productIds.length}] "${product.name}" - ${newAttrs.length} attrs`);
    } catch (error: any) {
      errorCount++;
      console.error(`❌ Lỗi "${product.name}": ${error.message}`);
    }
  }

  console.log(`\n=== KẾT QUẢ ===`);
  console.log(`✅ Thành công: ${successCount}`);
  console.log(`❌ Lỗi: ${errorCount}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());

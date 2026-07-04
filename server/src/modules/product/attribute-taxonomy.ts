export type ProductAttributeInput = {
  key: string;
  value: string | number | boolean | null | undefined;
  unit?: string | null;
};

type ProductForAttributeExtraction = {
  name: string;
  description?: string | null;
  categoryName?: string | null;
  variants?: Array<{ name?: string; sku?: string; price?: unknown; stock?: number; attributes?: unknown }>;
  attributes?: ProductAttributeInput[];
};

export type NormalizedProductAttribute = {
  key: string;
  value: string;
  unit?: string | null;
};

const BRAND_NAMES = [
  'acer', 'amd', 'apple', 'asus', 'benq', 'corsair', 'dareu', 'dell', 'gigabyte',
  'havit', 'hp', 'huawei', 'hyperx', 'intel', 'kingston', 'lenovo', 'lg',
  'logitech', 'microsoft', 'msi', 'nvidia', 'oppo', 'razer', 'realme', 'samsung',
  'sandisk', 'seagate', 'sony', 'synology', 'toshiba', 'viewsonic', 'western digital',
  'wd', 'xiaomi'
];

const BRAND_CANONICAL: Record<string, string> = {
  amd: 'AMD',
  hp: 'HP',
  intel: 'Intel',
  lg: 'LG',
  msi: 'MSI',
  nvidia: 'NVIDIA',
  wd: 'Western Digital',
  sandisk: 'SanDisk',
};

const KEY_ALIASES: Record<string, string> = {
  battery: 'battery_mah',
  battery_life: 'battery_life_hours',
  brand_name: 'brand',
  capacity: 'capacity_gb',
  chip: 'cpu',
  color_name: 'color',
  connection: 'connection_type',
  connectivity: 'connection_type',
  cpu_brand_name: 'cpu_brand',
  hard_drive: 'storage_gb',
  memory: 'ram_gb',
  ram: 'ram_gb',
  refresh_rate: 'refresh_rate_hz',
  rom: 'storage_gb',
  screen_size: 'screen_size_inch',
  speed: 'read_speed_mbps',
  storage: 'storage_gb',
  usage: 'use_case',
};

const UNIT_BY_KEY: Record<string, string> = {
  battery_life_hours: 'hour',
  battery_mah: 'mAh',
  capacity_gb: 'GB',
  dpi: 'DPI',
  ram_gb: 'GB',
  read_speed_mbps: 'MB/s',
  refresh_rate_hz: 'Hz',
  screen_size_inch: 'inch',
  storage_gb: 'GB',
  weight_g: 'g',
};

function stripDiacritics(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
}

function compactSpaces(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function normalizeSearchText(value: string) {
  return stripDiacritics(value).toLowerCase();
}

function normalizeKey(key: string) {
  const raw = stripDiacritics(key)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  return KEY_ALIASES[raw] || raw;
}

function normalizeValue(value: ProductAttributeInput['value']) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return compactSpaces(String(value));
}

function normalizeMeasuredValue(key: string, value: string, unit?: string | null) {
  const normalizedUnit = stripDiacritics(unit || '').toLowerCase().trim();
  const inlineUnit = value.match(/^(\d+(?:[.,]\d+)?)\s*(tb|gb|mb|mah|hz|dpi|mb\/s|mbps|g|kg|inch|inches|hour|hours|h)$/i);
  const numericValue = inlineUnit ? Number(inlineUnit[1].replace(',', '.')) : Number(value.replace(',', '.'));
  const detectedUnit = inlineUnit?.[2]?.toLowerCase() || normalizedUnit;

  if (!Number.isFinite(numericValue)) {
    return { value, unit: unit || UNIT_BY_KEY[key] || null };
  }

  if (key === 'capacity_gb' || key === 'storage_gb' || key === 'ram_gb') {
    if (detectedUnit === 'tb') return { value: String(numericValue * 1024), unit: 'GB' };
    if (detectedUnit === 'mb') return { value: String(Math.round((numericValue / 1024) * 100) / 100), unit: 'GB' };
    return { value: String(numericValue), unit: 'GB' };
  }

  if (key === 'read_speed_mbps') {
    if (detectedUnit === 'gb/s' || detectedUnit === 'gbps') return { value: String(numericValue * 1000), unit: 'MB/s' };
    return { value: String(numericValue), unit: 'MB/s' };
  }

  return { value: String(numericValue), unit: unit || UNIT_BY_KEY[key] || null };
}

function toGb(rawValue: number, unit: string) {
  const normalizedUnit = unit.toLowerCase();
  if (normalizedUnit === 'tb') return rawValue * 1024;
  return rawValue;
}

function captureNumber(text: string, regex: RegExp) {
  const match = text.match(regex);
  if (!match) return null;
  const value = Number(match[1].replace(',', '.'));
  return Number.isFinite(value) ? value : null;
}

function captureStorageGb(text: string, regex: RegExp) {
  const match = text.match(regex);
  if (!match) return null;
  const value = Number(match[1].replace(',', '.'));
  if (!Number.isFinite(value)) return null;
  return toGb(value, match[2] || 'gb');
}

function inferBrand(text: string) {
  const normalized = normalizeSearchText(text);
  const brand = BRAND_NAMES
    .map((candidate) => ({ candidate, index: normalized.indexOf(candidate) }))
    .filter((item) => item.index >= 0)
    .sort((a, b) => a.index - b.index || b.candidate.length - a.candidate.length)[0]?.candidate;
  if (!brand) {
    if (/\biphone\b|\bipad\b|\bmacbook\b/.test(normalized)) return 'Apple';
    return null;
  }
  if (BRAND_CANONICAL[brand]) return BRAND_CANONICAL[brand];
  return brand.split(' ').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

function inferCategorySlug(categoryName?: string | null) {
  const cat = normalizeSearchText(categoryName || '');
  if (cat.includes('laptop')) return 'laptop';
  if (cat.includes('may tinh bang')) return 'tablet';
  if (cat.includes('man hinh')) return 'monitor';
  if (cat.includes('gaming')) return 'gaming_gear';
  if (cat.includes('luu tru')) return 'storage';
  if (cat.includes('dien thoai')) return 'phone';
  if (cat.includes('dong ho')) return 'smartwatch';
  if (cat.includes('linh kien')) return 'pc_component';
  return 'general';
}

function inferProductType(text: string, categorySlug: string) {
  const t = normalizeSearchText(text);
  if (categorySlug === 'laptop' || categorySlug === 'tablet' || categorySlug === 'monitor' || categorySlug === 'phone' || categorySlug === 'smartwatch') {
    return categorySlug;
  }

  if (categorySlug === 'gaming_gear') {
    if (t.includes('chuot') || t.includes('mouse')) return 'mouse';
    if (t.includes('tai nghe') || t.includes('headset')) return 'headset';
    if (t.includes('ban phim') || t.includes('keyboard')) return 'keyboard';
    if (t.includes('tay cam') || t.includes('controller')) return 'controller';
    if (t.includes('ghe gaming')) return 'gaming_chair';
    return 'gaming_gear';
  }

  if (categorySlug === 'storage') {
    if (t.includes('usb')) return 'usb_flash_drive';
    if (t.includes('nas')) return 'nas';
    if (t.includes('ssd')) return 'ssd';
    if (t.includes('hdd') || t.includes('o cung')) return 'hdd';
    return 'storage';
  }

  if (categorySlug === 'pc_component') {
    if (t.includes('vga') || t.includes('geforce') || t.includes('radeon')) return 'gpu';
    if (t.includes('mainboard')) return 'mainboard';
    if (t.includes('cpu') || t.includes('core i') || t.includes('ryzen')) return 'cpu';
    if (t.includes('ram')) return 'ram_module';
  }

  return categorySlug;
}

function inferUseCases(text: string, categorySlug: string, productType: string) {
  const t = normalizeSearchText(text);
  const values = new Set<string>();

  if (categorySlug === 'laptop' || categorySlug === 'monitor' || categorySlug === 'pc_component') {
    if (/(gaming|rog|rtx|geforce|radeon|120hz|144hz|165hz|240hz)/.test(t)) values.add('gaming');
    if (/(do hoa|oled|3k|4k|dci-p3|photoshop|render|creator)/.test(t)) values.add('do hoa');
    if (/(van phong|hoc tap|sinh vien|latitude|thinkpad)/.test(t)) values.add('van phong');
  }

  if (categorySlug === 'storage') {
    if (/(camera|giam sat|purple)/.test(t)) values.add('camera giam sat');
    if (/(nas|server|raid)/.test(t)) values.add('nas luu tru');
    if (/(portable|usb|di dong|dual drive)/.test(t)) values.add('di dong');
  }

  if (categorySlug === 'smartwatch') {
    values.add('theo doi suc khoe');
    if (/(gps|sport|fit|watch)/.test(t)) values.add('the thao');
  }

  if (productType === 'mouse' || productType === 'headset' || productType === 'keyboard' || productType === 'controller') {
    values.add('gaming');
  }

  return Array.from(values);
}

function inferKeywords(text: string, categorySlug: string, productType: string, useCases: string[]) {
  const keywords = new Set<string>();
  const brand = inferBrand(text);
  if (brand) keywords.add(brand.toLowerCase());

  const categoryKeywords: Record<string, string[]> = {
    laptop: ['laptop', 'may tinh xach tay', 'notebook'],
    tablet: ['may tinh bang', 'tablet'],
    monitor: ['man hinh', 'monitor'],
    gaming_gear: ['gaming gear', 'phu kien gaming'],
    storage: ['thiet bi luu tru', 'o cung', 'usb', 'nas'],
    phone: ['dien thoai', 'smartphone'],
    smartwatch: ['dong ho thong minh', 'smartwatch', 'vong deo thong minh'],
    pc_component: ['linh kien may tinh', 'pc component'],
  };

  for (const keyword of categoryKeywords[categorySlug] || []) keywords.add(keyword);
  if (productType && productType !== categorySlug) keywords.add(productType.replace(/_/g, ' '));
  for (const useCase of useCases) keywords.add(useCase);

  return Array.from(keywords);
}

function addAttr(map: Map<string, NormalizedProductAttribute>, attr: ProductAttributeInput, manual = false) {
  const key = normalizeKey(attr.key);
  let value = normalizeValue(attr.value);
  if (!key || !value) return;
  if (!manual && map.has(key)) return;
  const measured = normalizeMeasuredValue(key, value, attr.unit);
  value = measured.value;

  map.set(key, {
    key,
    value,
    unit: measured.unit,
  });
}

export function normalizeProductAttributes(product: ProductForAttributeExtraction): NormalizedProductAttribute[] {
  const map = new Map<string, NormalizedProductAttribute>();
  const text = compactSpaces(`${product.name || ''} ${product.description || ''} ${(product.variants || []).map((v) => `${v.name || ''} ${v.sku || ''}`).join(' ')}`);
  const normalized = normalizeSearchText(text);
  const categorySlug = inferCategorySlug(product.categoryName);
  const productType = inferProductType(text, categorySlug);
  const useCases = inferUseCases(text, categorySlug, productType);
  const keywords = inferKeywords(text, categorySlug, productType, useCases);
  const brand = inferBrand(text);

  addAttr(map, { key: 'category_slug', value: categorySlug });
  addAttr(map, { key: 'product_type', value: productType });
  if (brand) addAttr(map, { key: 'brand', value: brand });
  if (useCases.length) addAttr(map, { key: 'use_case', value: useCases.join(', ') });
  if (keywords.length) addAttr(map, { key: 'search_keywords', value: keywords.join(', ') });

  const ramGb = captureStorageGb(normalized, /(?:ram|bo nho)\s*(\d+(?:[.,]\d+)?)\s*(gb|tb)?/i);
  if (ramGb) addAttr(map, { key: 'ram_gb', value: String(ramGb), unit: 'GB' });

  const storageGb = captureStorageGb(normalized, /(?:ssd|hdd|o cung|rom|luu tru|dung luong)\D{0,12}(\d+(?:[.,]\d+)?)\s*(tb|gb)/i)
    || captureStorageGb(normalized, /(\d+(?:[.,]\d+)?)\s*(tb|gb)\s*(?:ssd|hdd|nvme|usb|storage|o cung)/i)
    || (categorySlug === 'storage' ? captureStorageGb(normalized, /(\d+(?:[.,]\d+)?)\s*(tb|gb)\b(?!\s*(?:\/s|ps))/i) : null);
  if (storageGb) addAttr(map, { key: categorySlug === 'storage' ? 'capacity_gb' : 'storage_gb', value: String(storageGb), unit: 'GB' });

  if (productType === 'usb_flash_drive') addAttr(map, { key: 'storage_type', value: 'Flash' });
  else if (/ssd|nvme|m\.2/.test(normalized)) addAttr(map, { key: 'storage_type', value: /nvme/.test(normalized) ? 'NVMe SSD' : 'SSD' });
  else if (/hdd|o cung co/.test(normalized)) addAttr(map, { key: 'storage_type', value: 'HDD' });

  const screenSize = captureNumber(normalized, /(\d+(?:[.,]\d+)?)\s*(?:inch|inches|"|”)/i);
  if (screenSize) addAttr(map, { key: 'screen_size_inch', value: String(screenSize), unit: 'inch' });

  const refreshRate = captureNumber(normalized, /(\d{2,3})\s*hz/i);
  if (refreshRate) addAttr(map, { key: 'refresh_rate_hz', value: String(refreshRate), unit: 'Hz' });

  const dpi = captureNumber(normalized, /(\d{4,6})\s*dpi/i);
  if (dpi) addAttr(map, { key: 'dpi', value: String(dpi), unit: 'DPI' });

  const readSpeed = captureNumber(normalized, /(\d{3,5})\s*(?:mb\/s|mbps)/i);
  if (readSpeed) addAttr(map, { key: 'read_speed_mbps', value: String(readSpeed), unit: 'MB/s' });

  const weight = captureNumber(normalized, /(\d+(?:[.,]\d+)?)\s*g\b/i);
  if (weight) addAttr(map, { key: 'weight_g', value: String(weight), unit: 'g' });

  const batteryMah = captureNumber(normalized, /(\d{3,6})\s*mah/i);
  if (batteryMah) addAttr(map, { key: 'battery_mah', value: String(batteryMah), unit: 'mAh' });

  const batteryHours = captureNumber(normalized, /(\d+(?:[.,]\d+)?)\s*(?:gio|hour|hours|h)\b/i);
  if (batteryHours) addAttr(map, { key: 'battery_life_hours', value: String(batteryHours), unit: 'hour' });

  if (/ips/.test(normalized)) addAttr(map, { key: 'panel_type', value: 'IPS' });
  if (/oled|amoled/.test(normalized)) addAttr(map, { key: 'panel_type', value: /amoled/.test(normalized) ? 'AMOLED' : 'OLED' });

  if (/full\s*hd|fhd|1920\s*x\s*1080|1080\s*x\s*1920/.test(normalized)) addAttr(map, { key: 'screen_resolution', value: 'FHD' });
  else if (/3k/.test(normalized)) addAttr(map, { key: 'screen_resolution', value: '3K' });
  else if (/4k|3840\s*x\s*2160/.test(normalized)) addAttr(map, { key: 'screen_resolution', value: '4K' });

  const cpuMatch = text.match(/(?:Intel\s+Core\s+i[3579][\w-]*|Core\s+i[3579][\w-]*|Ryzen(?:\s+AI)?\s+\d[\w\s-]*|Celeron\s+\w+|AMD\s+Ryzen\s+\w[\w\s-]*)/i);
  if (cpuMatch) addAttr(map, { key: 'cpu', value: compactSpaces(cpuMatch[0]) });
  if (/intel|core i|celeron/.test(normalized)) addAttr(map, { key: 'cpu_brand', value: 'Intel' });
  if (/amd|ryzen/.test(normalized)) addAttr(map, { key: 'cpu_brand', value: 'AMD' });

  const gpuMatch = text.match(/(?:RTX\s*\d{3,4}|GTX\s*\d{3,4}|GeForce\s+[\w\s-]+|Radeon\s+[\w\s-]+|Iris\s+Xe)/i);
  if (gpuMatch) addAttr(map, { key: 'gpu', value: compactSpaces(gpuMatch[0]) });
  if (/rtx|gtx|geforce|radeon/.test(normalized)) addAttr(map, { key: 'gpu_type', value: 'dedicated' });
  else if (/iris xe|integrated|tich hop/.test(normalized)) addAttr(map, { key: 'gpu_type', value: 'integrated' });

  if (/wireless|khong day|bluetooth|2\.4ghz/.test(normalized)) addAttr(map, { key: 'connection_type', value: 'wireless' });
  else if (/co day|usb-c|usb a|usb 3|3\.5mm|sata|lan/.test(normalized)) addAttr(map, { key: 'connection_type', value: 'wired' });

  if (/rgb|led/.test(normalized)) addAttr(map, { key: 'rgb_lighting', value: 'true' });
  if (/pc/.test(normalized)) addAttr(map, { key: 'compatible_with', value: 'PC' });
  if (/xbox/.test(normalized)) addAttr(map, { key: 'compatible_with', value: 'Xbox' });
  if (/ps5|playstation/.test(normalized)) addAttr(map, { key: 'compatible_with', value: 'PS5' });

  if (/usb 3\.2 gen 2/.test(normalized)) addAttr(map, { key: 'interface', value: 'USB 3.2 Gen 2' });
  else if (/usb 3\.2/.test(normalized)) addAttr(map, { key: 'interface', value: 'USB 3.2' });
  else if (/sata/.test(normalized)) addAttr(map, { key: 'interface', value: 'SATA' });
  else if (/lan|rj-45/.test(normalized)) addAttr(map, { key: 'interface', value: 'LAN' });

  if (/portable|di dong|usb/.test(normalized)) addAttr(map, { key: 'form_factor', value: 'portable' });
  else if (/nas|server/.test(normalized)) addAttr(map, { key: 'form_factor', value: 'NAS' });
  else if (/3\.5 inch|desktop/.test(normalized)) addAttr(map, { key: 'form_factor', value: 'internal' });

  if (/hang cu|cu dep|like new|used/.test(normalized)) addAttr(map, { key: 'condition', value: 'used' });
  else addAttr(map, { key: 'condition', value: 'new' });

  if (/den|black/.test(normalized)) addAttr(map, { key: 'color', value: 'black' });
  if (/trang|white/.test(normalized)) addAttr(map, { key: 'color', value: 'white' });
  if (/xam|gray|grey/.test(normalized)) addAttr(map, { key: 'color', value: 'gray' });

  for (const attr of product.attributes || []) {
    addAttr(map, attr, true);
  }

  return Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key));
}

export function buildAttributeEmbeddingText(product: ProductForAttributeExtraction) {
  const attrs = normalizeProductAttributes(product);
  const attrText = attrs
    .map((attr) => `${attr.key}: ${attr.value}${attr.unit ? ` ${attr.unit}` : ''}`)
    .join('; ');

  return compactSpaces([
    `name: ${product.name}`,
    product.categoryName ? `category: ${product.categoryName}` : '',
    product.description ? `description: ${product.description}` : '',
    attrText ? `attributes: ${attrText}` : '',
  ].filter(Boolean).join('. '));
}

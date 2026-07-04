import { PrismaClient, Prisma } from '@prisma/client';
import { EmbeddingHelper } from '../embeddingHelper';
import { ProductService } from '../../product/services/product.service';

const prisma = new PrismaClient();
const embeddingHelper = new EmbeddingHelper();

// Từ khóa gợi ý người dùng đang mô tả tính năng/cảm xúc, không phải tên sản phẩm cụ thể
const FEATURE_KEYWORDS = [
  'tiết kiệm điện', 'mỏng nhẹ', 'bền', 'pin lâu', 'chụp ảnh đẹp',
  'tốt cho', 'phù hợp', 'dùng để', 'loại nào', 'tư vấn', 'gợi ý',
  'nên mua', 'muốn mua', 'cần mua', 'tìm', 'kiếm'
];

// Từ khóa tên thương hiệu/model cụ thể → nên dùng keyword search
const BRAND_KEYWORDS = [
  'iphone', 'samsung', 'xiaomi', 'sony', 'lg', 'panasonic', 'toshiba',
  'sharp', 'philips', 'daikin', 'mitsubishi', 'electrolux', 'bosch', 'apple'
];

const STOP_WORDS = [
  'tìm', 'kiếm', 'mua', 'bán', 'giá', 'cho', 'có', 'tại', 'ở', 'là', 'cái', 'chiếc', 'loại',
  'mẫu', 'những', 'các', 'của', 'với', 'khoảng', 'tầm', 'trong', 'dưới', 'trên', 'hơn'
];

// Từ chỉ giới tính/ngữ cảnh: dùng để lọc chính xác hơn nhưng không search riêng lẻ
const GENDER_CONTEXT_WORDS = ['nam', 'nữ', 'trẻ em', 'bé trai', 'bé gái', 'unisex'];

export class AIService {
  private ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434/api/chat';
  private modelName = process.env.OLLAMA_MODEL || 'qwen2.5:3b';
  private productService = new ProductService();

  /**
   * Chuẩn hóa truy vấn tiếng Việt trước khi gửi lên Ollama
   */
  private normalizeVietnameseQuery(query: string): string {
    return query
      .toLowerCase()
      .replace(/\b(\d+)\s*(?:tr|triệu|củ)\b/g, '$1000000')
      .replace(/\b(\d+)\s*k\b/g, '$1000')
      .replace(/\b(\d+)\s*sao\b/g, '$1 sao')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Parser JSON mạnh mẽ, tự động phục hồi nếu LLM trả về markdown block hoặc chữ thừa
   */
  private parseRobustJson(text: string): any {
    try {
      return JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          return JSON.parse(match[0]);
        } catch { }
      }
      return null;
    }
  }

  /**
   * Phân tích câu truy vấn tự nhiên bằng Ollama sang JSON chuẩn
   */
  private async parseQueryWithAI(query: string, attempt: number = 1) {
    // Attempt 1: 15s timeout (đủ cho cold start). Attempt 2 (retry): 8s timeout.
    const timeoutMs = attempt === 1 ? 15000 : 8000;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const normalizedQuery = this.normalizeVietnameseQuery(query);

    const systemPrompt = `
      Bạn là chuyên gia phân tích dữ liệu mua sắm. 
      Nhiệm vụ: Chuyển câu truy vấn mua sắm tiếng Việt sang JSON.
      JSON Schema: {
        "category": string | null,
        "priceMin": number | null,
        "priceMax": number | null,
        "minRating": number | null,
        "minSold": number | null,
        "minReviews": number | null,
        "keywords": string | null,
        "features": string[] | null,
        "sort": "price_asc" | "price_desc" | "newest" | "best_selling" | "top_rated" | "most_reviewed" | null,
        "attributes": object | null
      }
      QUY TẮC: Trả về DUY NHẤT JSON. Không giải thích. 
      XỬ LÝ TIỀN TỆ & TIÊU CHÍ: 
      - "tr", "triệu", "củ" -> x1.000.000 (Vd: 5tr -> 5000000)
      - "k" -> x1.000 (Vd: 500k -> 500000)
      - "dưới 5tr" -> priceMax: 5000000
      - "trên 10tr" -> priceMin: 10000000
      - "trên 4 sao", "4 sao trở lên" -> minRating: 4
      - "bán chạy", "nhiều người mua" -> sort: "best_selling"
      - "đánh giá tốt", "uy tín" -> sort: "top_rated"
      - "nhiều bình luận", "nhiều review" -> sort: "most_reviewed"
      
      MAPPING TIẾNG VIỆT → KEY TIẾNG ANH (BẮT BUỘC dùng key tiếng Anh):
      - ram, bộ nhớ RAM → ram
      - bộ nhớ, dung lượng, lưu trữ, ROM → storage
      - pin, dung lượng pin → battery
      - màn hình, kích thước màn hình → screen_size
      - camera, chụp ảnh → camera
      - chip, vi xử lý, bộ xử lý, CPU → chip
      - công suất → power
      - dung tích → capacity
      - trọng lượng, cân nặng → weight
      - kết nối → connectivity
      - thương hiệu, hãng → brand
      
      XỬ LÝ THUỘC TÍNH SẢN PHẨM (attributes):
      - Mỗi attribute là object: { "min": number|null, "max": number|null, "exact": string|null }
      - QUAN TRỌNG: Giá trị value trong DB là SỐ THUẦN (vd: ram="12" không phải "12GB")
      - Khi có khoảng (từ X đến Y, X-Y): dùng min + max. KHÔNG dùng exact!
      - Khi có giá trị cụ thể: dùng exact (string)
      
      VÍ DỤ BẮT BUỘC:
      - "ram từ 12 đến 16gb" → attributes: { "ram": { "min": 12, "max": 16, "exact": null } }
      - "ram 12-16gb" → attributes: { "ram": { "min": 12, "max": 16, "exact": null } }
      - "ram 8gb" → attributes: { "ram": { "min": null, "max": null, "exact": "8" } }
      - "ram trên 8gb" → attributes: { "ram": { "min": 8, "max": null, "exact": null } }
      - "bộ nhớ 256gb" → attributes: { "storage": { "min": null, "max": null, "exact": "256" } }
      - "pin trên 5000mah" → attributes: { "battery": { "min": 5000, "max": null, "exact": null } }
      - "điện thoại ram 12gb-16gb" → category: "Điện thoại", attributes: { "ram": { "min": 12, "max": 16, "exact": null } }
    `;

    try {
      const response = await fetch(this.ollamaUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.modelName,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Phân tích: "${normalizedQuery}"` }
          ],
          stream: false,
          format: 'json',
          keep_alive: -1
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);
      if (!response.ok) return null;
      const data: any = await response.json();
      return this.parseRobustJson(data.message.content);
    } catch (error: any) {
      clearTimeout(timeout);
      const reason = error.name === 'AbortError' ? 'timeout' : error.message;
      console.warn(`⚠️ Ollama attempt ${attempt} failed (${reason}).`);
      return null;
    }
  }

  private escapeRegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Chuẩn hóa kích thước kiểu VN (1m8 x 2m -> 1.8x2) để so sánh chính xác
   */
  private normalizeDimension(str: string): string {
    if (!str) return '';
    let s = str.toLowerCase()
      .replace(/\s+/g, '')   // strip spaces
      .replace(/,/g, '.');   // comma to dot
    // 1m8 -> 1.8
    s = s.replace(/(\d+)m(\d+)/g, '$1.$2');
    // strip trailing 'm' units: 1.8m -> 1.8, 2m -> 2
    s = s.replace(/(\d+(?:\.\d+)?)m/g, '$1');
    return s;
  }

  /**
   * Fallback Regex để bắt giá tiền nếu AI không phân tích được
   */
  private extractFiltersRegex(query: string) {
    const filters: any = {
      category: null,
      priceMin: null,
      priceMax: null,
      minRating: null,
      keywords: null,
      sort: null,
      attributes: {}
    };
    let q = query.toLowerCase();

    // Price Range regex with strict word boundary only at the end (Vd: 5-10tr, 5tr đến 10tr)
    const rangeMatch = q.match(/(\d+(?:\.\d+)?)\s*(?:-|đến|tới)\s*(\d+(?:\.\d+)?)\s*(tr|triệu|củ|k|m)\b/i);
    if (rangeMatch) {
      let min = parseFloat(rangeMatch[1]);
      let max = parseFloat(rangeMatch[2]);
      const unit = rangeMatch[3].toLowerCase();
      const multiplier = ['tr', 'triệu', 'củ', 'm'].includes(unit) ? 1000000 : 1000;
      filters.priceMin = min * multiplier;
      filters.priceMax = max * multiplier;
      q = q.replace(rangeMatch[0], '[price_range]');
    } else {
      // Single price regex
      const maxPriceMatch = q.match(/(?:dưới|u|<=|tầm|khoảng|~|giá|quanh)\s*(\d+(?:\.\d+)?)\s*(tr|triệu|củ|k|m)\b/i);
      if (maxPriceMatch) {
        let val = parseFloat(maxPriceMatch[1]);
        const unit = maxPriceMatch[2].toLowerCase();
        const multiplier = ['tr', 'triệu', 'củ', 'm'].includes(unit) ? 1000000 : 1000;

        if (q.match(/(tầm|khoảng|~|quanh|giá)/)) {
          filters.priceMin = val * 0.8 * multiplier;
          filters.priceMax = val * 1.2 * multiplier;
        } else {
          filters.priceMax = val * multiplier;
        }
        q = q.replace(maxPriceMatch[0], '[price_max]');
      }

      const minPriceMatch = q.match(/(?:trên|từ|>=|hơn|>)\s*(\d+(?:\.\d+)?)\s*(tr|triệu|củ|k|m)\b/i);
      if (minPriceMatch) {
        let val = parseFloat(minPriceMatch[1]);
        const unit = minPriceMatch[2].toLowerCase();
        const multiplier = ['tr', 'triệu', 'củ', 'm'].includes(unit) ? 1000000 : 1000;
        filters.priceMin = val * multiplier;
        q = q.replace(minPriceMatch[0], '[price_min]');
      }
    }

    // Rating regex
    const ratingMatch = q.match(/(\d+)\s*sao/i);
    if (ratingMatch) {
      filters.minRating = parseInt(ratingMatch[1]);
      q = q.replace(ratingMatch[0], '[rating]');
    }

    // Sort/Priority keywords
    if (q.includes('bán chạy') || q.includes('nhiều người mua')) filters.sort = 'best_selling';
    if (q.includes('đánh giá cao') || q.includes('tốt nhất')) filters.sort = 'top_rated';
    if (q.includes('mới nhất') || q.includes('vừa về')) filters.sort = 'newest';

    // ===== ATTRIBUTE PARSING WITH TOKEN CONSUMPTION =====
    // Electronics attributes (numeric with units)
    const attrPatterns = [
      { key: 'ram', aliases: ['ram'], units: ['gb'] },
      { key: 'storage', aliases: ['bộ nhớ trong', 'bộ nhớ', 'dung lượng lưu trữ', 'dung lượng', 'lưu trữ', 'rom', 'storage'], units: ['gb', 'tb'] },
      { key: 'battery', aliases: ['dung lượng pin', 'pin', 'battery'], units: ['mah'] },
      { key: 'screen_size', aliases: ['kích thước màn hình', 'màn hình', 'màn', 'screen'], units: ['inch', 'in', '"'] },
      { key: 'camera', aliases: ['camera sau', 'camera trước', 'camera', 'chụp ảnh'], units: ['mp', 'megapixel'] },
      { key: 'cpu', aliases: ['vi xử lý', 'bộ xử lý', 'chip', 'cpu'], units: [] },
      // Appliance attributes
      { key: 'power', aliases: ['công suất', 'power'], units: ['w', 'watt', 'kw'] },
      { key: 'capacity', aliases: ['dung tích', 'thể tích', 'capacity'], units: ['lít', 'l', 'kg'] },
      { key: 'weight', aliases: ['cân nặng', 'trọng lượng', 'nặng', 'weight'], units: ['kg', 'g'] },
      // Furniture numeric: seats
      { key: 'seats', aliases: ['ghế', 'chỗ ngồi', 'chỗ', 'seats'], units: [] },
    ];

    for (const { key, aliases, units } of attrPatterns) {
      const aliasGroup = aliases.map(a => this.escapeRegExp(a)).join('|');
      const unitGroup = units.length > 0 ? `(?:${units.map(u => this.escapeRegExp(u)).join('|')})` : '';
      const unitSuffix = unitGroup ? `(?:\\s*${unitGroup})?` : '';
      const connector = `(?:\\s*(?:trong|màn|sau|trước|dung lượng|chính)?\\s*(?:là|:|đạt|khoảng|tầm|cỡ)?\\s*)`;

      // 1. Range: "ram từ 12 đến 16gb", "ram 12-16gb", "12-16gb ram"
      const rangeRx = new RegExp(`(?:${aliasGroup})${connector}(?:từ\\s+)?([\\d.]+)\\s*(?:-|đến|tới|\\s+to\\s+)\\s*([\\d.]+)${unitSuffix}`, 'i');
      const rangeRxRev = new RegExp(`(?:từ\\s+)?([\\d.]+)\\s*(?:-|đến|tới|\\s+to\\s+)\\s*([\\d.]+)${unitSuffix}${connector}(?:${aliasGroup})`, 'i');

      let m = q.match(rangeRx) || q.match(rangeRxRev);
      if (m) {
        filters.attributes[key] = { min: parseFloat(m[1]), max: parseFloat(m[2]), exact: null };
        q = q.replace(m[0], `[attr_${key}]`);
        continue;
      }

      // 2. Min: "ram trên 8gb", "pin > 5000mah"
      const minRx = new RegExp(`(?:${aliasGroup})${connector}(?:trên|hơn|lớn hơn|>|>=|tối thiểu|ít nhất)\\s*([\\d.]+)${unitSuffix}`, 'i');
      const minRxRev = new RegExp(`(?:trên|hơn|lớn hơn|>|>=|tối thiểu|ít nhất)\\s*([\\d.]+)${unitSuffix}${connector}(?:${aliasGroup})`, 'i');

      m = q.match(minRx) || q.match(minRxRev);
      if (m) {
        filters.attributes[key] = { min: parseFloat(m[1]), max: null, exact: null };
        q = q.replace(m[0], `[attr_${key}]`);
        continue;
      }

      // 3. Max: "ram dưới 8gb"
      const maxRx = new RegExp(`(?:${aliasGroup})${connector}(?:dưới|thấp hơn|nhỏ hơn|<|<=|tối đa)\\s*([\\d.]+)${unitSuffix}`, 'i');
      const maxRxRev = new RegExp(`(?:dưới|thấp hơn|nhỏ hơn|<|<=|tối đa)\\s*([\\d.]+)${unitSuffix}${connector}(?:${aliasGroup})`, 'i');

      m = q.match(maxRx) || q.match(maxRxRev);
      if (m) {
        filters.attributes[key] = { min: null, max: parseFloat(m[1]), exact: null };
        q = q.replace(m[0], `[attr_${key}]`);
        continue;
      }

      // 4. Exact: "ram 8gb", "8gb ram", "6 ghế"
      const exactRx = new RegExp(`(?:${aliasGroup})${connector}([\\d.]+)${unitSuffix}`, 'i');
      const exactRxRev = new RegExp(`([\\d.]+)${unitSuffix}${connector}(?:${aliasGroup})`, 'i');

      m = q.match(exactRx) || q.match(exactRxRev);
      if (m) {
        filters.attributes[key] = { min: null, max: null, exact: m[1] };
        q = q.replace(m[0], `[attr_${key}]`);
        continue;
      }
    }

    // ===== DIMENSION PARSING (1m8x2m, 1.8m x 2m, etc.) =====
    const dimMatch = q.match(/(\d+m\d+|\d+(?:[.,]\d+)?m?)\s*[xX*×]\s*(\d+m\d+|\d+(?:[.,]\d+)?m?)/i);
    if (dimMatch) {
      filters.attributes['dimensions'] = { min: null, max: null, exact: dimMatch[0] };
      q = q.replace(dimMatch[0], '[attr_dimensions]');
    }

    // ===== TEXT ATTRIBUTE PARSING (material, color, style, brand) =====
    // Match patterns like "chất liệu gỗ", "bằng da bò", "màu đen"
    const textAttrPatterns = [
      {
        key: 'material',
        prefixes: ['chất liệu', 'làm bằng', 'bằng', 'vật liệu', 'mặt'],
        knownValues: ['gỗ', 'da bò', 'da', 'đá', 'mặt đá', 'kính', 'kim loại', 'sắt', 'inox', 'nhựa', 'vải', 'nỉ', 'nệm', 'tre', 'mây']
      },
      {
        key: 'color',
        prefixes: ['màu sắc', 'màu', 'color'],
        knownValues: ['đen', 'trắng', 'đỏ', 'xanh', 'xanh lá', 'xanh dương', 'vàng', 'nâu', 'hồng', 'tím', 'cam', 'bạc', 'xám', 'kem', 'be']
      },
      {
        key: 'style',
        prefixes: ['phong cách', 'kiểu'],
        knownValues: ['hiện đại', 'cổ điển', 'tối giản', 'bắc âu', 'luxury', 'sang trọng', 'minimalist', 'vintage', 'industrial']
      },
    ];

    for (const { key, prefixes, knownValues } of textAttrPatterns) {
      // Try prefix-based: "chất liệu gỗ", "màu đen"
      for (const prefix of prefixes) {
        const prefixRx = new RegExp(`${this.escapeRegExp(prefix)}\\s+([\\p{L}\\s]+?)(?=\\s+(?:có|với|và|cho|được|dưới|trên|từ|tầm|khoảng|\\d)|$)`, 'iu');
        const pm = q.match(prefixRx);
        if (pm) {
          filters.attributes[key] = { min: null, max: null, exact: pm[1].trim() };
          q = q.replace(pm[0], `[attr_${key}]`);
          break;
        }
      }
      // Try known value match if prefix didn't match
      if (!filters.attributes[key]) {
        for (const val of knownValues) {
          if (q.includes(val)) {
            filters.attributes[key] = { min: null, max: null, exact: val };
            q = q.replace(val, `[attr_${key}]`);
            break;
          }
        }
      }
    }

    const cleanedQuery = q
      .replace(/\[attr_[a-z_]+\]/gi, '')
      .replace(/\[price_[a-z_]+\]/gi, '')
      .replace(/\[rating\]/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    return { filters, cleanedQuery };
  }

  /**
   * Quyết định có nên dùng Semantic Search hay không.
   */
  private shouldUseSemanticSearch(query: string, aiFilters: any): boolean {
    const q = query.toLowerCase();
    const wordCount = q.split(/\s+/).length;

    const hasBrandKeyword = BRAND_KEYWORDS.some(brand => q.includes(brand));
    if (hasBrandKeyword) return false;

    const hasFeatureKeyword = FEATURE_KEYWORDS.some(kw => q.includes(kw));
    if (hasFeatureKeyword) return true;

    if (aiFilters?.features && aiFilters.features.length > 0) return true;

    if (wordCount > 5) return true;

    return false;
  }

  /**
   * TÌM KIẾM THÔNG MINH (Hybrid Search)
   */
  async intelligentSearch(query: string, limit: number = 20, categoryId?: string, skipCategoryDetection: boolean = false): Promise<any[]> {
    const msgLower = query.toLowerCase();
    console.log(`🤖 AI Searching for: "${query}" (Category: ${categoryId || 'All'}, SkipDetect: ${skipCategoryDetection})`);

    // 1. Phân tích ý định người dùng với cơ chế Retry
    let aiFilters = null;
    try {
      aiFilters = await this.parseQueryWithAI(query, 1);
      if (!aiFilters) {
        console.log('🔄 Ollama Attempt 1 returned null. Retrying with Attempt 2...');
        aiFilters = await this.parseQueryWithAI(query, 2);
      }
    } catch (e) {
      console.warn('⚠️ Ollama parsing errored, falling back to regex.');
    }

    const { filters: regexFilters, cleanedQuery } = this.extractFiltersRegex(query);

    const mergedFilters = { ...regexFilters };
    if (aiFilters) {
      for (const [key, value] of Object.entries(aiFilters)) {
        if (value !== null && value !== undefined && value !== '') {
          (mergedFilters as any)[key] = value;
        }
      }
    }
    aiFilters = mergedFilters;

    if (skipCategoryDetection) {
      aiFilters.category = null;
    }

    // 1.5. TỰ ĐỘNG NHẬN DIỆN DANH MỤC TỪ DATABASE (2-way fuzzy matching)
    const activeSearchQuery = cleanedQuery || query;
    const activeSearchQueryLower = activeSearchQuery.toLowerCase();

    if (!aiFilters.category && !skipCategoryDetection) {
      const categories = await prisma.category.findMany({ where: { isDeleted: false }, select: { name: true } });
      const queryWords = activeSearchQueryLower.split(/\s+/).filter(w => w.length > 1 && !STOP_WORDS.includes(w) && !GENDER_CONTEXT_WORDS.includes(w));

      let bestMatch: { name: string; score: number } | null = null;

      for (const cat of categories) {
        const catLower = cat.name.toLowerCase();
        const catWords = catLower.split(/\s+/);

        // 1. Query chứa đúng tên category (VD: "giày dép sport" trong query)
        if (activeSearchQueryLower.includes(catLower)) {
          bestMatch = { name: cat.name, score: 100 };
          break;
        }

        // 2. Từ khóa chính trong query khớp với từ trong category name
        // VD: "dép" trong query → match "Giày dép Sport"
        let matchScore = 0;
        for (const qWord of queryWords) {
          if (catWords.some(cw => cw.includes(qWord) || qWord.includes(cw))) {
            matchScore += qWord.length; // Ưu tiên từ dài hơn (chính xác hơn)
          }
        }

        if (matchScore > 0 && (!bestMatch || matchScore > bestMatch.score)) {
          bestMatch = { name: cat.name, score: matchScore };
        }
      }

      if (bestMatch) {
        aiFilters.category = bestMatch.name;
        console.log(`📁 Auto-detected category: "${bestMatch.name}" (score: ${bestMatch.score})`);
      }
    }

    console.log('Final Filters:', JSON.stringify(aiFilters));

    // Phân giải Category và Subcategories đệ quy
    const categoryIds: string[] = [];
    if (aiFilters.category && !skipCategoryDetection) {
      const cat = await prisma.category.findFirst({
        where: { name: { contains: aiFilters.category, mode: 'insensitive' }, isDeleted: false },
        include: { children: { where: { isDeleted: false } } }
      });
      if (cat) {
        categoryIds.push(cat.id);
        if (cat.children.length > 0) {
          categoryIds.push(...cat.children.map(c => c.id));
        }
      }
    } else if (categoryId) {
      const cat = await prisma.category.findUnique({
        where: { id: categoryId, isDeleted: false },
        include: { children: { where: { isDeleted: false } } }
      });
      if (cat) {
        categoryIds.push(cat.id);
        if (cat.children.length > 0) {
          categoryIds.push(...cat.children.map(c => c.id));
        }
      }
    }

    // 2. Quyết định loại search
    const useSemanticSearch = this.shouldUseSemanticSearch(query, aiFilters);

    // 3. Xây dựng điều kiện lọc Prisma
    const where: Prisma.ProductWhereInput = { isDeleted: false, isActive: true };
    const poolLimit = aiFilters?.minRating || aiFilters?.minSold || aiFilters?.minReviews || aiFilters?.sort || aiFilters?.attributes ? 100 : limit;

    if (aiFilters) {
      if (categoryIds.length > 0) {
        where.categoryId = { in: categoryIds };
      } else if (aiFilters.category) {
        where.category = { name: { contains: aiFilters.category, mode: 'insensitive' } };
      } else if (categoryId) {
        where.categoryId = categoryId;
      }

      if (aiFilters.keywords) {
        where.OR = [
          { name: { contains: aiFilters.keywords, mode: 'insensitive' } },
          { slug: { contains: aiFilters.keywords, mode: 'insensitive' } }
        ];
      }
      if (aiFilters.priceMin !== null || aiFilters.priceMax !== null) {
        where.variants = {
          some: {
            AND: [
              aiFilters.priceMin !== null ? { price: { gte: aiFilters.priceMin } } : {},
              aiFilters.priceMax !== null ? { price: { lte: aiFilters.priceMax } } : {},
            ]
          }
        };
      }

      // Attribute-based filtering (Prisma level)
      if (aiFilters.attributes && typeof aiFilters.attributes === 'object') {
        const attrConditions: Prisma.ProductWhereInput[] = [];
        // Text attributes need 'contains' or just 'has key' approach
        const textAttrKeys = ['dimensions', 'material', 'color', 'style', 'type', 'brand', 'origin'];

        for (const [attrKey, attrFilter] of Object.entries(aiFilters.attributes as Record<string, any>)) {
          if (!attrFilter) continue;

          let standardizedKey = attrKey;
          if (standardizedKey === 'chip') standardizedKey = 'cpu';

          // Text/dimension attributes: do NOT enforce key at Prisma level to allow name/description fallbacks in post-filter
          if (textAttrKeys.includes(standardizedKey)) {
            continue;
          }
          // Numeric exact match at Prisma level
          else if (attrFilter.exact && !attrFilter.min && !attrFilter.max) {
            attrConditions.push({ attributes: { some: { key: standardizedKey, value: attrFilter.exact.toString() } } });
          } else {
            // For range queries, just ensure the product HAS this attribute key
            if (standardizedKey === 'battery' || standardizedKey === 'battery_life') {
              attrConditions.push({
                attributes: {
                  some: {
                    OR: [
                      { key: 'battery' },
                      { key: 'battery_life' }
                    ]
                  }
                }
              });
            } else if (standardizedKey === 'storage' || standardizedKey === 'rom') {
              attrConditions.push({
                attributes: {
                  some: {
                    OR: [
                      { key: 'storage' },
                      { key: 'rom' }
                    ]
                  }
                }
              });
            } else {
              attrConditions.push({ attributes: { some: { key: standardizedKey } } });
            }
          }
        }
        if (attrConditions.length > 0) {
          where.AND = [...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []), ...attrConditions];
        }
      }
    }

    let products: any[] = [];

    if (useSemanticSearch) {
      console.log('🔍 Executing Semantic Search...');
      try {
        products = await this.searchSemantic(query, poolLimit, aiFilters, undefined, categoryIds);
      } catch (err) {
        console.warn('⚠️ Semantic search failed, falling back to keyword search:', err);
      }
    }

    // Keyword search nếu không dùng semantic hoặc semantic trả về rỗng
    if (!useSemanticSearch || products.length === 0) {
      console.log('🔍 Executing Keyword Search...');

      // Thử tìm bằng CỤM TỪ nguyên vẹn trước (chính xác hơn tách từ)
      const searchText = activeSearchQueryLower.split(/\s+/)
        .filter(w => w.length > 1 && !STOP_WORDS.includes(w))
        .join(' ');

      if (searchText && !where.OR) {
        const phraseWhere = { ...where };
        phraseWhere.OR = [
          { name: { contains: searchText, mode: 'insensitive' as const } },
          { description: { contains: searchText, mode: 'insensitive' as const } },
          { slug: { contains: searchText.replace(/\s+/g, '-'), mode: 'insensitive' as const } }
        ];

        products = await prisma.product.findMany({
          where: phraseWhere,
          include: {
            images: { orderBy: { isPrimary: 'desc' }, take: 1 },
            category: { select: { name: true } },
            variants: { orderBy: { price: 'asc' }, take: 1 },
            attributes: true
          },
          take: poolLimit,
          orderBy: aiFilters?.sort === 'newest' ? { createdAt: 'desc' } : undefined
        });

        if (products.length > 0) {
          console.log(`✅ Full-phrase search found ${products.length} results`);
        }
      }

      // Nếu cụm từ không tìm được, dùng where gốc (có keywords từ AI)
      if (products.length === 0) {
        products = await prisma.product.findMany({
          where,
          include: {
            images: { orderBy: { isPrimary: 'desc' }, take: 1 },
            category: { select: { name: true } },
            variants: { orderBy: { price: 'asc' }, take: 1 },
            attributes: true
          },
          take: poolLimit,
          orderBy: aiFilters?.sort === 'newest' ? { createdAt: 'desc' } : undefined
        });
      }
    }

    // 3.5 Fallback trung gian: Nếu có lọc mà không ra kết quả, thử bỏ lọc để giữ đúng Category
    if (products.length === 0 && (aiFilters?.priceMin || aiFilters?.priceMax || aiFilters?.minRating)) {
      console.log('🔄 Relaxing filters (removing price/rating) but keeping Category...');
      const relaxedWhere: Prisma.ProductWhereInput = {
        isDeleted: false,
        isActive: true,
        ...(categoryIds.length > 0 ? { categoryId: { in: categoryIds } } : categoryId ? { categoryId } : {})
      };

      products = await prisma.product.findMany({
        where: relaxedWhere,
        include: {
          images: { orderBy: { isPrimary: 'desc' }, take: 1 },
          category: { select: { name: true } },
          variants: { orderBy: { price: 'asc' }, take: 1 },
          attributes: true
        },
        take: limit
      });
    }

    // 4. Fallback cuối: Tìm rộng bằng cách tách từ (AND trước, OR sau + relevance scoring)
    if (products.length === 0) {
      console.log('🔄 Fallback to broad word search...');
      // Tách từ chính (bỏ stop words) và từ ngữ cảnh (gender) riêng
      const allWords = activeSearchQueryLower.split(/\s+/).filter(w => w.length > 1 && !STOP_WORDS.includes(w));
      const mainWords = allWords.filter(w => !GENDER_CONTEXT_WORDS.includes(w));
      const contextWords = allWords.filter(w => GENDER_CONTEXT_WORDS.includes(w));

      if (mainWords.length === 0 && contextWords.length === 0) return [];

      const basePriceFilter = aiFilters?.priceMin || aiFilters?.priceMax ? {
        variants: {
          some: {
            AND: [
              aiFilters.priceMin !== null ? { price: { gte: aiFilters.priceMin } } : {},
              aiFilters.priceMax !== null ? { price: { lte: aiFilters.priceMax } } : {},
            ]
          }
        }
      } : {};

      // 4a. Thử AND trước: tất cả từ chính phải match
      if (mainWords.length > 0) {
        const andConditions = mainWords.map(word => ({
          OR: [
            { name: { contains: word, mode: 'insensitive' as const } },
            { description: { contains: word, mode: 'insensitive' as const } }
          ]
        }));

        // Thêm context words vào AND nếu có
        if (contextWords.length > 0) {
          for (const cw of contextWords) {
            andConditions.push({
              OR: [
                { name: { contains: cw, mode: 'insensitive' as const } },
                { description: { contains: cw, mode: 'insensitive' as const } },
              ]
            });
          }
        }

        products = await prisma.product.findMany({
          where: {
            AND: andConditions,
            isDeleted: false,
            isActive: true,
            ...(categoryIds.length > 0 ? { categoryId: { in: categoryIds } } : categoryId ? { categoryId } : {}),
            ...basePriceFilter
          },
          include: {
            images: { orderBy: { isPrimary: 'desc' }, take: 1 },
            category: { select: { name: true } },
            variants: { orderBy: { price: 'asc' }, take: 1 },
            attributes: true
          },
          take: limit
        });

        if (products.length > 0) {
          console.log(`✅ AND word search found ${products.length} results`);
        }
      }

      // 4b. Nếu AND quá strict (0 kết quả), dùng OR nhưng ưu tiên match nhiều từ hơn
      if (products.length === 0 && mainWords.length > 0) {
        console.log('🔄 AND too strict, falling back to OR with relevance...');
        products = await prisma.product.findMany({
          where: {
            OR: mainWords.map(word => ({
              OR: [
                { name: { contains: word, mode: 'insensitive' as const } },
                { description: { contains: word, mode: 'insensitive' as const } }
              ]
            })),
            isDeleted: false,
            isActive: true,
            ...(categoryIds.length > 0 ? { categoryId: { in: categoryIds } } : categoryId ? { categoryId } : {}),
            ...basePriceFilter
          },
          include: {
            images: { orderBy: { isPrimary: 'desc' }, take: 1 },
            category: { select: { name: true } },
            variants: { orderBy: { price: 'asc' }, take: 1 },
            attributes: true
          },
          take: limit * 3 // Lấy nhiều hơn để scoring
        });

        // Relevance scoring: sản phẩm match nhiều từ hơn → điểm cao hơn
        if (products.length > 0) {
          const scoredProducts = products.map(p => {
            const nameL = (p.name || '').toLowerCase();
            const descL = (p.description || '').toLowerCase();
            let score = 0;
            for (const w of mainWords) {
              if (nameL.includes(w)) score += 10; // Match tên = ưu tiên cao
              if (descL.includes(w)) score += 3;
            }
            for (const w of contextWords) {
              if (nameL.includes(w)) score += 5;
              if (descL.includes(w)) score += 1;
            }
            return { product: p, score };
          });

          scoredProducts.sort((a, b) => b.score - a.score);
          products = scoredProducts.slice(0, limit).map(s => s.product);
          console.log(`✅ OR+Relevance search returned ${products.length} results (top scores: ${scoredProducts.slice(0, 3).map(s => s.score).join(', ')})`);
        }
      }
    }

    // 4.5 Fallback không giới hạn danh mục: Nếu vẫn không tìm được kết quả và có giới hạn danh mục, thử tìm kiếm lại mà không lọc danh mục.
    if (products.length === 0 && (categoryIds.length > 0 || categoryId)) {
      console.log('🔄 No products found with category filter, trying global search (relaxing category)...');

      const globalWhere: Prisma.ProductWhereInput = { isDeleted: false, isActive: true };

      // Thử tìm bằng CỤM TỪ nguyên vẹn trước (toàn cầu)
      const searchText = activeSearchQueryLower.split(/\s+/)
        .filter(w => w.length > 1 && !STOP_WORDS.includes(w))
        .join(' ');

      if (searchText) {
        const phraseWhere = { ...globalWhere };
        phraseWhere.OR = [
          { name: { contains: searchText, mode: 'insensitive' as const } },
          { description: { contains: searchText, mode: 'insensitive' as const } },
          { slug: { contains: searchText.replace(/\s+/g, '-'), mode: 'insensitive' as const } }
        ];

        products = await prisma.product.findMany({
          where: phraseWhere,
          include: {
            images: { orderBy: { isPrimary: 'desc' }, take: 1 },
            category: { select: { name: true } },
            variants: { orderBy: { price: 'asc' }, take: 1 },
            attributes: true
          },
          take: poolLimit
        });
      }

      // Nếu cụm từ toàn cầu không có kết quả, dùng broad search toàn cầu (AND/OR)
      if (products.length === 0) {
        const allWords = activeSearchQueryLower.split(/\s+/).filter(w => w.length > 1 && !STOP_WORDS.includes(w));
        const mainWords = allWords.filter(w => !GENDER_CONTEXT_WORDS.includes(w));
        const contextWords = allWords.filter(w => GENDER_CONTEXT_WORDS.includes(w));

        if (mainWords.length > 0) {
          const andConditions = mainWords.map(word => ({
            OR: [
              { name: { contains: word, mode: 'insensitive' as const } },
              { description: { contains: word, mode: 'insensitive' as const } }
            ]
          }));
          if (contextWords.length > 0) {
            for (const cw of contextWords) {
              andConditions.push({
                OR: [
                  { name: { contains: cw, mode: 'insensitive' as const } },
                  { description: { contains: cw, mode: 'insensitive' as const } }
                ]
              });
            }
          }

          const basePriceFilter = aiFilters?.priceMin || aiFilters?.priceMax ? {
            variants: {
              some: {
                AND: [
                  aiFilters.priceMin !== null ? { price: { gte: aiFilters.priceMin } } : {},
                  aiFilters.priceMax !== null ? { price: { lte: aiFilters.priceMax } } : {},
                ]
              }
            }
          } : {};

          products = await prisma.product.findMany({
            where: {
              AND: andConditions,
              isDeleted: false,
              isActive: true,
              ...basePriceFilter
            },
            include: {
              images: { orderBy: { isPrimary: 'desc' }, take: 1 },
              category: { select: { name: true } },
              variants: { orderBy: { price: 'asc' }, take: 1 },
              attributes: true
            },
            take: limit
          });
        }
      }
    }

    // 5. Bổ sung dữ liệu (Sold, Rating, Reviews)
    let enrichedProducts = await this.productService.enrichProductData(products);

    // 6. Lọc và Sắp xếp nâng cao
    if (aiFilters) {
      if (aiFilters.minRating) {
        enrichedProducts = enrichedProducts.filter(p => p.averageRating >= aiFilters.minRating);
      }
      if (aiFilters.minSold) {
        enrichedProducts = enrichedProducts.filter(p => p.soldCount >= aiFilters.minSold);
      }
      if (aiFilters.minReviews) {
        enrichedProducts = enrichedProducts.filter(p => p.totalReviews >= aiFilters.minReviews);
      }

      // 6.5 Lọc theo attributes (min/max range + exact)
      if (aiFilters.attributes && typeof aiFilters.attributes === 'object') {
        for (const [rawAttrKey, attrFilter] of Object.entries(aiFilters.attributes as Record<string, any>)) {
          if (!attrFilter) continue;

          // Chuẩn hóa key từ AI/LLM sang key trong Database (Vd: chip -> cpu)
          let attrKey = rawAttrKey;
          if (attrKey === 'chip') attrKey = 'cpu';

          const beforeCount = enrichedProducts.length;
          enrichedProducts = enrichedProducts.filter(p => {
            const attrs = (p as any).attributes;
            const attr = attrs && Array.isArray(attrs) ? attrs.find((a: any) => {
              if (attrKey === 'battery' || attrKey === 'battery_life') {
                return a.key === 'battery' || a.key === 'battery_life';
              }
              if (attrKey === 'storage' || attrKey === 'rom') {
                return a.key === 'storage' || a.key === 'rom';
              }
              if (attrKey === 'cpu' || attrKey === 'chip') {
                return a.key === 'cpu' || a.key === 'chip';
              }
              return a.key === attrKey;
            }) : null;

            // Lấy tất cả giá trị filter có thể có
            const filterExact = attrFilter.exact;
            const filterMin = attrFilter.min;
            const filterMax = attrFilter.max;

            let dbValStr = '';
            let numVal = NaN;
            let isDbValNumeric = false;

            if (attr) {
              dbValStr = attr.value.toLowerCase().trim();
              numVal = parseFloat(attr.value);
              isDbValNumeric = !isNaN(numVal);
            } else {
              // FALLBACK: Nếu sản phẩm không có thuộc tính này trong DB ProductAttribute
              const prodName = (p.name || '').toLowerCase();
              const prodDesc = (p.description || '').toLowerCase();

              if (attrKey === 'dimensions') {
                const textToSearch = `${prodName} ${prodDesc}`;
                const dimRegex = /(\d+m\d+|\d+(?:[.,]\d+)?m?)\s*[xX*×]\s*(\d+m\d+|\d+(?:[.,]\d+)?m?)/gi;
                const matches = textToSearch.match(dimRegex);
                if (matches) {
                  const normFilter = this.normalizeDimension((filterExact || '').toString());
                  if (normFilter) {
                    for (const match of matches) {
                      const normDb = this.normalizeDimension(match);
                      if (normDb && (normDb === normFilter || normDb.includes(normFilter) || normFilter.includes(normDb))) {
                        return true;
                      }
                    }
                  }
                }
                return false;
              }

              if (attrKey === 'material' || attrKey === 'color' || attrKey === 'style' || attrKey === 'brand') {
                const filterStr = (filterExact || filterMin || filterMax || '').toString().toLowerCase().trim();
                if (filterStr) {
                  return prodName.includes(filterStr) || prodDesc.includes(filterStr);
                }
              }

              return false;
            }

            // === DIMENSIONS: so sánh bằng normalization (1m8x2m == 1m8 x 2m == 1.8x2) ===
            if (attrKey === 'dimensions') {
              const normDb = this.normalizeDimension(dbValStr);
              const normFilter = this.normalizeDimension((filterExact || '').toString());
              if (normDb && normFilter) {
                return normDb === normFilter || normDb.includes(normFilter) || normFilter.includes(normDb);
              }
              return false;
            }

            // Xử lý thông minh cho các thuộc tính chữ (cpu, brand, material, color, style...) hoặc khi giá trị DB là chữ
            if (attrKey === 'cpu' || attrKey === 'chip' || attrKey === 'material' || attrKey === 'color' || attrKey === 'style' || !isDbValNumeric) {
              const filterStr = (filterExact || filterMin || filterMax || '').toString().toLowerCase().trim();
              if (filterStr) {
                return dbValStr.includes(filterStr) || filterStr.includes(dbValStr);
              }
              return true;
            }

            // Range filter (min/max) cho thuộc tính số (RAM, dung lượng, pin, công suất...)
            if (filterMin != null || filterMax != null) {
              const minVal = parseFloat(filterMin?.toString() || '');
              const maxVal = parseFloat(filterMax?.toString() || '');
              if (!isNaN(minVal) && numVal < minVal) return false;
              if (!isNaN(maxVal) && numVal > maxVal) return false;
              return true;
            }

            // Exact match cho thuộc tính số
            if (filterExact != null) {
              const exactNum = parseFloat(filterExact.toString());
              if (!isNaN(exactNum)) {
                return numVal === exactNum;
              }
              return dbValStr.includes(filterExact.toString().toLowerCase());
            }

            return true;
          });
          console.log(`   Attribute filter [${attrKey}]: ${beforeCount} → ${enrichedProducts.length} products`);
        }
      }

      if (aiFilters.sort) {
        switch (aiFilters.sort) {
          case 'best_selling':
            enrichedProducts.sort((a, b) => b.soldCount - a.soldCount);
            break;
          case 'top_rated':
            enrichedProducts.sort((a, b) => b.averageRating - a.averageRating || b.totalReviews - a.totalReviews);
            break;
          case 'most_reviewed':
            enrichedProducts.sort((a, b) => b.totalReviews - a.totalReviews);
            break;
          case 'price_asc':
            enrichedProducts.sort((a, b) => a.minPrice - b.minPrice);
            break;
          case 'price_desc':
            enrichedProducts.sort((a, b) => b.minPrice - a.minPrice);
            break;
        }
      }
    }

    // Nếu lọc xong mà không có sản phẩm nào, nhưng trước đó có lọc theo category, thử tìm kiếm lại trên phạm vi toàn cầu
    if (enrichedProducts.length === 0 && !skipCategoryDetection && (categoryIds.length > 0 || categoryId || aiFilters?.category)) {
      console.log('🔄 Relaxing category restriction completely as no products matched the attributes...');
      return this.intelligentSearch(query, limit, undefined, true);
    }

    return enrichedProducts.slice(0, limit).map(p => ({
      ...p,
      searchType: useSemanticSearch ? 'semantic' : 'keyword',
    }));
  }

  /**
   * Tìm kiếm Semantic (Vector) kết hợp lọc SQL
   */
  async searchSemantic(query: string, limit: number = 10, filters: any = null, categoryId?: string, categoryIds: string[] = []): Promise<any[]> {
    const queryVector = await embeddingHelper.generateEmbedding(query);
    const vectorString = `[${queryVector.join(',')}]`;

    // Chuẩn bị các bộ lọc SQL động để tránh lồng ghép ES6 template literal phức tạp
    let categoryFilter = Prisma.empty;
    if (categoryIds.length > 0) {
      categoryFilter = Prisma.sql`AND p."categoryId" IN (${Prisma.join(categoryIds)})`;
    } else if (filters?.category) {
      categoryFilter = Prisma.sql`AND c.name ILIKE ${'%' + filters.category + '%'}`;
    } else if (categoryId) {
      categoryFilter = Prisma.sql`AND p."categoryId" = ${categoryId}`;
    }

    const priceMinFilter = filters?.priceMin ? Prisma.sql`AND v.price >= ${filters.priceMin}` : Prisma.empty;
    const priceMaxFilter = filters?.priceMax ? Prisma.sql`AND v.price <= ${filters.priceMax}` : Prisma.empty;

    const minRatingFilter = filters?.minRating ? Prisma.sql`AND COALESCE(avg_rating.rating, 0) >= ${filters.minRating}` : Prisma.empty;
    const minSoldFilter = filters?.minSold ? Prisma.sql`AND COALESCE(sold_stats.sold, 0) >= ${filters.minSold}` : Prisma.empty;
    const minReviewsFilter = filters?.minReviews ? Prisma.sql`AND COALESCE(avg_rating.total_reviews, 0) >= ${filters.minReviews}` : Prisma.empty;

    const sortFilter = filters?.sort === 'best_selling'
      ? Prisma.sql`"soldCount" DESC,`
      : (filters?.sort === 'top_rated' ? Prisma.sql`"averageRating" DESC,` : Prisma.empty);

    const results = await prisma.$queryRaw<any[]>(Prisma.sql`
      SELECT p.id, p.name, p.slug, p.description,
             MIN(v.price) as "minPrice",
             p.embedding <=> ${vectorString}::vector AS distance,
             COALESCE(avg_rating.rating, 0) as "averageRating",
             COALESCE(sold_stats.sold, 0) as "soldCount",
             COALESCE(avg_rating.total_reviews, 0) as "totalReviews"
      FROM "Product" p
      JOIN "ProductVariant" v ON p.id = v."productId"
      JOIN "Category" c ON p."categoryId" = c.id
      LEFT JOIN (
          SELECT "productId", AVG(rating) as rating, COUNT(rating) as total_reviews
          FROM "Review"
          GROUP BY "productId"
      ) avg_rating ON p.id = avg_rating."productId"
      LEFT JOIN (
          SELECT oi."productId", SUM(oi.quantity) as sold
          FROM "OrderItem" oi
          JOIN "Order" o ON oi."orderId" = o.id
          WHERE o.status != 'CANCELLED'
          GROUP BY oi."productId"
      ) sold_stats ON p.id = sold_stats."productId"
      WHERE p."isDeleted" = false 
        AND p."isActive" = true
        AND p.embedding IS NOT NULL
        ${categoryFilter}
        ${priceMinFilter}
        ${priceMaxFilter}
      GROUP BY p.id, c.name, avg_rating.rating, avg_rating.total_reviews, sold_stats.sold
      HAVING 1=1
        ${minRatingFilter}
        ${minSoldFilter}
        ${minReviewsFilter}
      ORDER BY 
        ${sortFilter}
        distance ASC
      LIMIT ${limit}
    `);

    if (results.length === 0) return [];

    const productIds = results.map(r => r.id);
    const fullDetails = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        images: { orderBy: { isPrimary: 'desc' }, take: 1 },
        category: { select: { name: true } },
        variants: { orderBy: { price: 'asc' }, take: 1 },
        attributes: true
      }
    });

    return results.map(r => {
      const p = fullDetails.find(fd => fd.id === r.id);
      if (!p) return null;
      return {
        ...p,
        distance: r.distance,
        averageRating: Number(r.averageRating),
        soldCount: Number(r.soldCount),
        totalReviews: Number(r.totalReviews),
        minPrice: p.variants?.[0]?.price ? Number(p.variants[0].price) : 0,
        primaryImage: p.images?.[0]?.url || null,
        variants: p.variants.map(v => ({ ...v, price: Number(v.price) }))
      };
    }).filter(Boolean);
  }

  /**
   * Tóm tắt đánh giá sản phẩm bằng AI
   */
  async summarizeReviews(productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 50
        }
      }
    });

    if (!product || product.reviews.length === 0) {
      return {
        pros: [],
        cons: [],
        sentiment: "Chưa có dữ liệu",
        conclusion: "Sản phẩm chưa có đánh giá nào để tóm tắt."
      };
    }

    const reviewTexts = product.reviews.map(r => `- ${r.rating} sao: ${r.comment}`).join('\n');

    const systemPrompt = `
      Bạn là chuyên gia phân tích phản hồi khách hàng. 
      Nhiệm vụ: Tóm tắt các đánh giá của khách hàng về sản phẩm "${product.name}".
      Yêu cầu phản hồi bằng tiếng Việt, định dạng JSON:
      {
        "pros": ["ưu điểm 1", "ưu điểm 2"],
        "cons": ["nhược điểm 1", "nhược điểm 2"],
        "sentiment": "Tích cực/Tiêu cực/Trung lập",
        "conclusion": "Câu chốt tóm gọn về sản phẩm"
      }
      QUY TẮC: Trả về DUY NHẤT JSON. Không giải thích thêm.
    `;

    try {
      const response = await fetch(this.ollamaUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.modelName,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Danh sách đánh giá:\n${reviewTexts}` }
          ],
          stream: false,
          format: 'json',
          keep_alive: -1
        })
      });

      if (!response.ok) throw new Error('Ollama error');
      const data: any = await response.json();
      const content = data.message.content;
      return typeof content === 'string' ? JSON.parse(content) : content;
    } catch (error) {
      console.error('AI Review Summary Error:', error);
      return null;
    }
  }

  /**
   * Phân tích doanh thu và đưa ra nhận xét
   */
  async analyzeRevenue(revenueData: any[]) {
    const dataText = revenueData.map(d => `${d.date || d.month}: ${d.total.toLocaleString()}đ`).join('\n');

    const systemPrompt = `
      Bạn là chuyên gia phân tích tài chính và chiến lược kinh doanh. 
      Nhiệm vụ: Phân tích dữ liệu doanh thu của cửa hàng và đưa ra lời khuyên.
      Yêu cầu phản hồi bằng tiếng Việt, định dạng JSON:
      {
        "analysis": "Nhận xét về xu hướng tăng trưởng, các điểm biến động mạnh",
        "insights": ["insight 1", "insight 2"],
        "suggestions": ["đề xuất 1", "đề xuất 2"],
        "overallStatus": "Tốt/Ổn định/Cần cải thiện"
      }
      QUY TẮC: Trả về DUY NHẤT JSON. Không giải thích thêm.
    `;

    try {
      const response = await fetch(this.ollamaUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.modelName,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Dữ liệu doanh thu:\n${dataText}` }
          ],
          stream: false,
          format: 'json',
          keep_alive: -1
        })
      });

      if (!response.ok) throw new Error('Ollama error');
      const data: any = await response.json();
      const content = data.message.content;
      return typeof content === 'string' ? JSON.parse(content) : content;
    } catch (error) {
      console.error('AI Revenue Analysis Error:', error);
      return null;
    }
  }

  /**
   * Public method để generate embedding
   */
  async generateEmbedding(text: string): Promise<number[]> {
    return embeddingHelper.generateEmbedding(text);
  }
}
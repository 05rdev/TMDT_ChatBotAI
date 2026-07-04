import { prisma } from '../../../lib/prisma';
import { AIService } from './ai.service';

const aiService = new AIService();

type ChatIntent = {
  greeting: boolean;
  product: boolean;
  order: boolean;
  voucher: boolean;
  support: boolean;
  policy: boolean;
};

type SuggestedProduct = {
  id: string;
  name: string;
  slug: string;
  primaryImage: string | null;
  variants?: Array<{ id: string; name: string; price: any; stock: number }>;
  attributes?: Array<{ key: string; value: string; unit?: string | null }>;
  category?: { name: string } | null;
  minPrice?: number;
  soldCount?: number;
  averageRating?: number;
  totalReviews?: number;
};

export class ChatbotService {
  private ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434/api/chat';
  private modelName = process.env.OLLAMA_MODEL || 'qwen2.5:3b';

  private normalize(text: string) {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  private detectIntent(message: string): ChatIntent {
    const text = this.normalize(message);
    const productWords = ['san pham', 'mua', 'tim', 'goi y', 'tu van', 'laptop', 'dien thoai', 'man hinh', 'ssd', 'usb', 'chuot', 'ban phim', 'tai nghe', 'gaming', 'ram', 'cpu', 'vga', 'duoi', 'tam gia', 'gia'];
    const orderWords = ['don hang', 'ma don', 'order', 'van chuyen', 'giao hang', 'toi dau', 'huy don', 'doi tra'];
    const voucherWords = ['voucher', 'ma giam', 'khuyen mai', 'uu dai', 'giam gia'];
    const supportWords = ['nhan vien', 'admin', 'ho tro', 'khieu nai', 'bao hanh', 'loi', 'gap nguoi'];
    const policyWords = ['chinh sach', 'thanh toan', 'cod', 'doi tra', 'bao mat', 'bao hanh'];
    const greetingWords = ['hello', 'hi', 'xin chao', 'chao', 'alo', 'hey'];

    const greeting = greetingWords.some((word) => text.trim() === word || text.trim().startsWith(`${word} `));
    return {
      greeting,
      product: productWords.some((word) => text.includes(word)) || /\d+\s*(tr|trieu|k|000|vnd|đ|d)/.test(text),
      order: orderWords.some((word) => text.includes(word)),
      voucher: voucherWords.some((word) => text.includes(word)),
      support: supportWords.some((word) => text.includes(word)),
      policy: policyWords.some((word) => text.includes(word)),
    };
  }

  private formatMoney(value: any) {
    const amount = Number(value || 0);
    return amount > 0 ? `${amount.toLocaleString('vi-VN')} VND` : 'Chua co gia';
  }

  private totalStock(product: SuggestedProduct) {
    return (product.variants || []).reduce((sum, variant) => sum + (variant.stock || 0), 0);
  }

  private formatProduct(product: SuggestedProduct) {
    const prices = (product.variants || []).map((variant) => Number(variant.price)).filter(Number.isFinite);
    const minPrice = prices.length ? Math.min(...prices) : Number(product.minPrice || 0);
    const maxPrice = prices.length ? Math.max(...prices) : minPrice;
    const priceText = minPrice === maxPrice ? this.formatMoney(minPrice) : `${this.formatMoney(minPrice)} - ${this.formatMoney(maxPrice)}`;
    const stock = this.totalStock(product);
    const stockText = stock > 0 ? `Con ${stock} san pham` : 'Het hang';
    const attrs = (product.attributes || [])
      .filter((attr) => ['brand', 'cpu', 'gpu', 'ram_gb', 'storage_gb', 'capacity_gb', 'screen_size_inch', 'refresh_rate_hz', 'use_case', 'connection_type', 'dpi'].includes(attr.key))
      .slice(0, 8)
      .map((attr) => `${attr.key}: ${attr.value}${attr.unit ? ` ${attr.unit}` : ''}`)
      .join(', ');

    return [
      `- Ten: ${product.name}`,
      `  Danh muc: ${product.category?.name || 'Khac'}`,
      `  Gia: ${priceText}`,
      `  Ton kho: ${stockText}`,
      attrs ? `  Thuoc tinh: ${attrs}` : '',
      `  Link: /product/${product.slug}`,
    ].filter(Boolean).join('\n');
  }

  private async hydrateProducts(products: any[]): Promise<SuggestedProduct[]> {
    const ids = products.map((product) => product.id).filter(Boolean);
    if (!ids.length) return [];

    const fullProducts = await prisma.product.findMany({
      where: { id: { in: ids }, isDeleted: false, isActive: true },
      include: {
        images: { orderBy: { isPrimary: 'desc' }, take: 1 },
        variants: { orderBy: { price: 'asc' }, select: { id: true, name: true, price: true, stock: true } },
        attributes: true,
        category: { select: { name: true } },
      },
    });

    const productMap = new Map(fullProducts.map((product) => [product.id, product]));
    return ids
      .map((id) => productMap.get(id))
      .filter((product): product is NonNullable<typeof product> => Boolean(product))
      .map((product) => ({
        ...product,
        primaryImage: product.images?.[0]?.url || null,
        minPrice: product.variants?.[0]?.price ? Number(product.variants[0].price) : 0,
      }));
  }

  private async buildProductContext(message: string, intent: ChatIntent, history: any[]) {
    if (intent.greeting && !intent.product) {
      return { context: 'Khach chi dang chao hoi, chua can tim san pham.', products: [] as SuggestedProduct[] };
    }

    let contextCategoryId: string | undefined;
    const lastAssistant = [...history].reverse().find((item) => item.role === 'assistant' && Array.isArray(item.suggestedProducts) && item.suggestedProducts.length > 0);
    const firstPreviousProductId = lastAssistant?.suggestedProducts?.[0]?.id;
    if (firstPreviousProductId && this.normalize(message).match(/cai nay|san pham nay|mau nay|con hang|bao nhieu|chi tiet/)) {
      const previousProduct = await prisma.product.findUnique({ where: { id: firstPreviousProductId }, select: { categoryId: true } });
      contextCategoryId = previousProduct?.categoryId;
    }

    const searchResults = await aiService.intelligentSearch(message, 8, contextCategoryId);
    const products = await this.hydrateProducts(searchResults);
    const inStockProducts = products.filter((product) => this.totalStock(product) > 0).slice(0, 5);
    const outOfStockProducts = products.filter((product) => this.totalStock(product) <= 0).slice(0, 3);

    const contextParts = [
      inStockProducts.length
        ? `SAN PHAM PHU HOP CON HANG:\n${inStockProducts.map((product) => this.formatProduct(product)).join('\n')}`
        : 'SAN PHAM PHU HOP CON HANG: Khong tim thay san pham con hang dung yeu cau.',
      outOfStockProducts.length
        ? `SAN PHAM PHU HOP NHUNG HET HANG:\n${outOfStockProducts.map((product) => this.formatProduct(product)).join('\n')}`
        : '',
    ].filter(Boolean);

    return { context: contextParts.join('\n\n'), products: inStockProducts };
  }

  private async buildOrderContext(userId: string | null, message: string, intent: ChatIntent) {
    if (!intent.order) return '';
    if (!userId) return 'DON HANG: Khach chua dang nhap. Chi duoc huong dan khach dang nhap de xem don hang, khong duoc tra cuu don cua nguoi khac.';

    const orderIdFragment = message.match(/[a-f0-9-]{8,}/i)?.[0];
    const orders = await prisma.order.findMany({
      where: {
        userId,
        ...(orderIdFragment ? { id: { startsWith: orderIdFragment } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: orderIdFragment ? 1 : 5,
      include: {
        items: { include: { product: { select: { name: true } }, variant: { select: { name: true } } } },
        payment: { select: { method: true, status: true, amount: true } },
      },
    });

    if (!orders.length) return 'DON HANG: Khong tim thay don hang cua khach trong tai khoan hien tai.';

    return `DON HANG CUA KHACH:\n${orders.map((order) => [
      `- Ma: #${order.id.slice(0, 8)} | Trang thai: ${order.status} | Tong tien: ${this.formatMoney(order.totalAmount)} | Ngay dat: ${order.createdAt.toLocaleString('vi-VN')}`,
      `  Thanh toan: ${order.payment?.method || 'Chua co'} - ${order.payment?.status || 'Chua co'}`,
      `  San pham: ${order.items.map((item) => `${item.product.name} (${item.variant.name}) x${item.quantity}`).join('; ')}`,
    ].join('\n')).join('\n')}`;
  }

  private async buildVoucherContext(intent: ChatIntent) {
    if (!intent.voucher) return '';
    const now = new Date();
    const vouchers = await prisma.voucher.findMany({
      where: { isActive: true, startDate: { lte: now }, endDate: { gte: now } },
      orderBy: { endDate: 'asc' },
      take: 8,
    });

    if (!vouchers.length) return 'VOUCHER: Hien tai chua co ma giam gia dang hoat dong.';
    return `VOUCHER DANG HOAT DONG:\n${vouchers.map((voucher) => {
      const discount = voucher.discountType === 'PERCENT' ? `${Number(voucher.discountValue)}%` : this.formatMoney(voucher.discountValue);
      return `- ${voucher.code}: giam ${discount}, don toi thieu ${voucher.minOrderValue ? this.formatMoney(voucher.minOrderValue) : 'khong yeu cau'}, het han ${voucher.endDate.toLocaleDateString('vi-VN')}`;
    }).join('\n')}`;
  }

  private buildPolicyContext(intent: ChatIntent) {
    if (!intent.policy && !intent.support) return '';
    return [
      'CHINH SACH HO TRO CO BAN:',
      '- Thanh toan: ho tro COD va cac cong thanh toan duoc hien thi o trang checkout.',
      '- Don hang: khach dang nhap co the xem trang thai trong trang Ho so > Don hang.',
      '- Doi tra/bao hanh: neu san pham loi hoac can ho tro, huong dan khach tao ticket ho tro trong Ho so > Ho tro.',
      '- Bao mat: khong tiet lo thong tin don hang cua tai khoan khac; cau hoi ve don hang bat buoc can dang nhap.',
      '- Khi bot khong chac, de nghi chuyen cho nhan vien ho tro.',
    ].join('\n');
  }

  private async buildCategoryContext() {
    const categories = await prisma.category.findMany({
      where: { isDeleted: false },
      select: { name: true, _count: { select: { products: { where: { isDeleted: false, isActive: true } } } } },
      take: 20,
    });
    return `DANH MUC SAN PHAM:\n${categories.map((category) => `- ${category.name}: ${category._count.products} san pham`).join('\n')}`;
  }

  private fallbackAnswer(intent: ChatIntent, productContext: string, products: SuggestedProduct[], orderContext: string, voucherContext: string) {
    if (intent.greeting && !intent.product) {
      return 'Chao ban, minh la UltraShop Assistant. Minh co the tu van san pham, kiem tra ton kho, goi y theo ngan sach, hoac ho tro xem don hang khi ban da dang nhap.';
    }
    if (intent.order) {
      return orderContext || 'Ban vui long dang nhap de minh kiem tra don hang dung tai khoan nhe.';
    }
    if (intent.voucher) {
      return voucherContext || 'Hien tai minh chua thay voucher phu hop dang hoat dong.';
    }
    if (products.length) {
      return `Minh goi y cac san pham phu hop nhat:\n${products.slice(0, 3).map((product) => `- ${product.name}: tu ${this.formatMoney(product.minPrice)}. Link: /product/${product.slug}`).join('\n')}\nBan muon minh loc them theo ngan sach, hang, RAM/SSD hay nhu cau su dung khong?`;
    }
    return productContext.includes('Khong tim thay')
      ? 'Minh chua tim thay san pham dung yeu cau nay. Ban thu noi ro hon ve ngan sach, danh muc, hang, cau hinh hoac nhu cau su dung nhe.'
      : 'Minh co the ho tro tu van san pham, kiem tra don hang, voucher va chinh sach ho tro. Ban can minh tim gi?';
  }

  async askChatbot(userId: string | null, message: string) {
    const cleanMessage = String(message || '').trim();
    if (!cleanMessage) {
      return { message: 'Ban vui long nhap noi dung can ho tro nhe.', suggestedProducts: [] };
    }

    if (userId) {
      await prisma.chatMessage.create({ data: { userId, role: 'user', content: cleanMessage } });
    }

    const history = userId
      ? (await prisma.chatMessage.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 8 })).reverse()
      : [];

    const intent = this.detectIntent(cleanMessage);
    let relevantProducts: SuggestedProduct[] = [];
    let productContext = '';
    let orderContext = '';
    let voucherContext = '';
    let categoryContext = '';
    let policyContext = '';

    try {
      const [productData, orderData, voucherData, categoryData] = await Promise.all([
        this.buildProductContext(cleanMessage, intent, history),
        this.buildOrderContext(userId, cleanMessage, intent),
        this.buildVoucherContext(intent),
        this.buildCategoryContext(),
      ]);

      productContext = productData.context;
      relevantProducts = productData.products;
      orderContext = orderData;
      voucherContext = voucherData;
      categoryContext = categoryData;
      policyContext = this.buildPolicyContext(intent);
    } catch (error: any) {
      console.warn('Chatbot context error:', error.message);
    }

    const systemPrompt = `
Ban la UltraShop Assistant, tro ly mua sam AI cua shop dien tu/gaming UltraShop.

NGUYEN TAC BAT BUOC:
1. Tra loi bang tieng Viet tu nhien, ngan gon nhung huu ich. Khong tra loi hoi hot.
2. Chi dua gia, ton kho, thong so, voucher, don hang dua tren CONTEXT ben duoi. Khong bia.
3. Gia va ton kho la du lieu realtime tu database. Neu khong co du lieu, noi ro la chua co thong tin.
4. Khong tiet lo don hang cua tai khoan khac. Neu khach chua dang nhap, huong dan dang nhap.
5. Khi goi y san pham, moi san pham phai co ly do ngan va dong "Link: /product/slug".
6. Khong goi y mua san pham het hang; chi co the noi san pham do dang het hang.
7. Neu cau hoi mo ho, hoi lai 1 cau ngan de lay ngan sach/nhu cau.
8. Neu khach can nguoi that, huong dan tao ticket ho tro trong Ho so > Ho tro.

CONTEXT:
${categoryContext}

${productContext}

${orderContext}

${voucherContext}

${policyContext}
`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map((item) => ({ role: item.role, content: item.content })),
    ];

    if (!userId) messages.push({ role: 'user', content: cleanMessage });

    let aiResponse = '';
    try {
      const response = await fetch(this.ollamaUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.modelName,
          messages,
          stream: false,
          keep_alive: -1,
          options: { temperature: 0.2, num_gpu: 0 },
        }),
      });

      if (!response.ok) throw new Error(`Ollama service error: ${response.status}`);
      const data: any = await response.json();
      aiResponse = data.message?.content?.trim() || '';
    } catch (error: any) {
      console.error('Ollama Chatbot Error:', error.message);
    }

    if (!aiResponse) {
      aiResponse = this.fallbackAnswer(intent, productContext, relevantProducts, orderContext, voucherContext);
    }

    const mentionedSlugs = new Set<string>();
    const slugRegex = /\/product\/([a-zA-Z0-9-]+)/g;
    let match: RegExpExecArray | null;
    while ((match = slugRegex.exec(aiResponse)) !== null) mentionedSlugs.add(match[1]);

    const finalSuggestedProducts = mentionedSlugs.size
      ? relevantProducts.filter((product) => mentionedSlugs.has(product.slug))
      : relevantProducts.filter((product) => aiResponse.toLowerCase().includes(product.name.toLowerCase().slice(0, 24)));

    const productsData = finalSuggestedProducts.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      image: product.primaryImage,
    }));

    if (userId) {
      await prisma.chatMessage.create({
        data: {
          userId,
          role: 'assistant',
          content: aiResponse,
          suggestedProducts: productsData as any,
        },
      });
    }

    return { message: aiResponse, suggestedProducts: productsData };
  }

  async getHistory(userId: string) {
    return prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });
  }

  async clearHistory(userId: string) {
    return prisma.chatMessage.deleteMany({ where: { userId } });
  }
}

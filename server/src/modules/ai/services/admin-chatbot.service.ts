import { prisma } from '../../../lib/prisma';
import { cacheDelPattern } from '../../../lib/redis';
import { MaintenanceHelper } from '../../../utils/maintenance.helper';
import { OrderService } from '../../order/services/order.service';

const orderService = new OrderService();

type AdminIntent =
  | 'greeting'
  | 'overview'
  | 'revenue'
  | 'orders'
  | 'inventory'
  | 'products'
  | 'customers'
  | 'reviews'
  | 'vouchers'
  | 'support';

type ContextBlock = {
  title: string;
  content: string;
};

type AdminActionEntity =
  | 'order'
  | 'product'
  | 'category'
  | 'customer'
  | 'voucher'
  | 'banner'
  | 'support'
  | 'settings';

type AdminActionDraft = {
  entity?: AdminActionEntity | null;
  idPrefix?: string | null;
  sku?: string | null;
  code?: string | null;
  email?: string | null;
  status?: string | null;
  value?: number | null;
  text?: string | null;
  url?: string | null;
  active?: boolean | null;
  field?: string | null;
};

type AdminActionResponse = {
  mode: 'confirm' | 'execute';
  message: string;
  actionMessage?: string;
};

const ORDER_STATUS: Record<string, string> = {
  PENDING: 'Cho duyet',
  PROCESSING: 'Dang goi',
  SHIPPED: 'Dang giao',
  DELIVERED: 'Hoan tat',
  CANCELLED: 'Da huy',
};

const PAYMENT_STATUS: Record<string, string> = {
  PENDING: 'Cho thanh toan',
  SUCCESS: 'Da thanh toan',
  FAILED: 'That bai',
  REFUNDED: 'Da hoan tien',
};

const PAYMENT_METHOD: Record<string, string> = {
  COD: 'Thanh toan khi nhan hang',
  BANK_TRANSFER: 'Chuyen khoan',
  MOMO: 'MoMo',
  VNPAY: 'VNPay',
};

export class AdminChatbotService {
  private ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434/api/chat';
  private modelName = process.env.OLLAMA_MODEL || 'qwen2.5:3b';

  private normalize(text: string) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd');
  }

  private detectIntent(message: string): AdminIntent {
    const text = this.normalize(message);

    if (/^(hi|hello|alo|chao|xin chao|hey)\b/.test(text.trim())) return 'greeting';
    if (/(doanh thu|revenue|tien|thu nhap|hom nay ban duoc|thang nay|tuan nay|loi nhuan)/.test(text)) {
      return 'revenue';
    }
    if (/(don hang|order|cho duyet|dang goi|dang giao|giao hang|huy don|pending|processing|shipped)/.test(text)) {
      return 'orders';
    }
    if (/(kho|ton kho|het hang|sap het|stock|inventory|nhap hang|con hang)/.test(text)) {
      return 'inventory';
    }
    if (/(san pham|product|ban chay|top|hot|moi nhat|danh muc|category)/.test(text)) {
      return 'products';
    }
    if (/(khach hang|user|customer|tai khoan|nguoi dung)/.test(text)) return 'customers';
    if (/(danh gia|review|rating|sao|phan hoi)/.test(text)) return 'reviews';
    if (/(voucher|ma giam|khuyen mai|uu dai|coupon)/.test(text)) return 'vouchers';
    if (/(ticket|ho tro|khieu nai|support|lien he|can xu ly)/.test(text)) return 'support';

    return 'overview';
  }

  private formatMoney(value: unknown) {
    const amount = Number(value || 0);
    return `${amount.toLocaleString('vi-VN')}d`;
  }

  private formatDate(value: Date) {
    return new Date(value).toLocaleString('vi-VN');
  }

  private startOfToday() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  private daysAgo(days: number) {
    const date = this.startOfToday();
    date.setDate(date.getDate() - days);
    return date;
  }

  private startOfMonth() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  private sumValue(result: { _sum?: { totalAmount?: unknown } }) {
    return Number(result._sum?.totalAmount || 0);
  }

  private extractIdPrefix(message: string) {
    const hashMatch = message.match(/#([a-zA-Z0-9-]{6,36})/);
    if (hashMatch) return hashMatch[1].toLowerCase();

    const idMatch = this.normalize(message).match(/\bid\s*(?:la|=|:)?\s*([a-z0-9-]{6,36})/);
    if (idMatch) return idMatch[1].toLowerCase();

    const entityIdMatch = this.normalize(message).match(
      /(?:don hang|don|order|san pham|product|bien the|variant|danh muc|category|banner|ticket|ho tro|khach hang|user|voucher)\s+(?:co\s+)?(?:id\s+)?#?([a-z0-9-]{6,36})/
    );
    if (entityIdMatch) return entityIdMatch[1].toLowerCase();

    const bareIdMatch = this.normalize(message).match(/\b([a-z0-9]{8,36}(?:-[a-z0-9]{4,36})*)\b/);
    return bareIdMatch?.[1]?.toLowerCase() || null;
  }

  private extractEntityHint(message: string): AdminActionEntity | null {
    const text = this.normalize(message);
    if (/(don hang|\bdon\b|order)/.test(text)) return 'order';
    if (/(san pham|product|bien the|variant|sku|gia|ton kho|stock|so luong)/.test(text)) return 'product';
    if (/(danh muc|category)/.test(text)) return 'category';
    if (/(khach hang|customer|user|tai khoan|nguoi dung)/.test(text)) return 'customer';
    if (/(voucher|ma giam|coupon)/.test(text)) return 'voucher';
    if (/(banner)/.test(text)) return 'banner';
    if (/(ticket|ho tro|support)/.test(text)) return 'support';
    if (/(bao tri|maintenance|cai dat|setting)/.test(text)) return 'settings';
    return null;
  }

  private hasMutationIntent(message: string) {
    const text = this.normalize(message);
    return (
      /\b(doi|sua|cap nhat|thay doi|chuyen|khoa|mo|bat|tat|dong|tao|set|update|nhap|xoa|xoa)\b/.test(text) ||
      /\b(an|hien)\s+(san pham|banner|voucher|danh muc)\b/.test(text)
    );
  }

  private isAdminQuestion(message: string) {
    const text = this.normalize(message);
    if (this.hasMutationIntent(message)) return false;

    return (
      /\?/.test(message) ||
      /\b(vay|hien tai|he thong|co bao nhieu|bao nhieu|nhung .* nao|nao|gi|the nao|tai sao|vi sao|xem|cho xem|liet ke|danh sach|bao cao|thong ke|kiem tra)\b/.test(text)
    );
  }

  private extractContextFromHistory(history: Array<{ role: string; content: string }>) {
    for (const item of [...history].reverse()) {
      const idPrefix = this.extractIdPrefix(item.content);
      if (!idPrefix) continue;

      const entity = this.extractEntityHint(item.content);
      if (entity) return { entity, idPrefix };
    }

    return { entity: null as AdminActionEntity | null, idPrefix: null as string | null };
  }

  private extractContextualIdPrefix(message: string, history: Array<{ role: string; content: string }>) {
    const directPrefix = this.extractIdPrefix(message);
    if (directPrefix) return directPrefix;

    const text = this.normalize(message);
    if (/\b(no|nay|do|don do|san pham do|ticket do|banner do)\b/.test(text)) {
      return this.extractContextFromHistory(history).idPrefix;
    }

    return null;
  }

  private extractContextualEntity(message: string, history: Array<{ role: string; content: string }>, draft?: AdminActionDraft | null) {
    return draft?.entity || this.extractEntityHint(message) || this.extractContextFromHistory(history).entity;
  }

  private extractJsonObject(text: string) {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]) as AdminActionDraft;
    } catch {
      return null;
    }
  }

  private async extractActionDraftWithAI(message: string, history: Array<{ role: string; content: string }>) {
    const recentContext = history
      .slice(-6)
      .map((item) => `${item.role}: ${item.content}`)
      .join('\n');

    const prompt = [
      'Ban la bo tach y dinh quan tri he thong. Chi tra ve JSON hop le, khong giai thich.',
      'Neu cau noi la lenh sua database, tra ve cac truong co the xac dinh:',
      '{"entity":"order|product|category|customer|voucher|banner|support|settings","idPrefix":"...","sku":"...","code":"...","email":"...","status":"PENDING|PROCESSING|SHIPPED|DELIVERED|CANCELLED|OPEN|CLOSED","value":123,"text":"...","url":"https://...","active":true,"field":"price|stock|name|image|status|role|maintenance"}',
      'Quy doi trang thai don: "dang goi/dong goi/xu ly" = PROCESSING, "dang giao" = SHIPPED, "hoan tat/da giao" = DELIVERED, "huy" = CANCELLED.',
      'Neu cau dung dai tu nhu "no", lay doi tuong gan nhat trong lich su.',
      'Neu khong phai lenh sua DB, tra ve {"entity":null}.',
      '',
      'LICH SU GAN DAY:',
      recentContext || '(trong)',
      '',
      `LENH HIEN TAI: ${message}`,
    ].join('\n');

    try {
      const response = await fetch(this.ollamaUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.modelName,
          messages: [{ role: 'user', content: prompt }],
          stream: false,
          keep_alive: -1,
          options: {
            temperature: 0,
            num_gpu: 0,
          },
        }),
      });

      if (!response.ok) return null;
      const data: any = await response.json();
      return this.extractJsonObject(data?.message?.content || '');
    } catch {
      return null;
    }
  }

  private renderActionDraft(message: string, draft: AdminActionDraft | null) {
    if (!draft?.entity) return message;

    const id = draft.idPrefix ? ` #${draft.idPrefix}` : '';
    const parsedValue = this.parseLastNumber(message);
    const value = parsedValue ?? draft.value ?? null;
    const targetText = draft.text || this.parseTextAfterTarget(message);
    const targetUrl = draft.url || this.parseUrl(message);

    if (draft.entity === 'order' && draft.status) return `chuyen don${id} sang ${draft.status}`;
    if (draft.entity === 'support' && draft.status) return `${draft.status === 'CLOSED' ? 'dong' : 'mo'} ticket${id}`;
    if (draft.entity === 'settings' && typeof draft.active === 'boolean') return `${draft.active ? 'bat' : 'tat'} bao tri`;
    if (draft.entity === 'product') {
      if (draft.sku && draft.field === 'price' && value !== null) return `doi gia san pham sku ${draft.sku} thanh ${value}`;
      if (draft.sku && draft.field === 'stock' && value !== null) return `doi ton kho san pham sku ${draft.sku} thanh ${value}`;
      if (draft.field === 'price' && value !== null) return `doi gia san pham${id} thanh ${value}`;
      if (draft.field === 'stock' && value !== null) return `doi ton kho san pham${id} thanh ${value}`;
      if (draft.field === 'name' && targetText) return `doi ten san pham${id} thanh ${targetText}`;
      if (typeof draft.active === 'boolean') return `${draft.active ? 'hien' : 'an'} san pham${id}`;
    }
    if (draft.entity === 'category') {
      if (draft.field === 'image' && targetUrl) return `doi anh danh muc${id} thanh ${targetUrl}`;
      if (draft.field === 'name' && targetText) return `doi ten danh muc${id} thanh ${targetText}`;
    }
    if (draft.entity === 'customer') {
      if (typeof draft.active === 'boolean') return `${draft.active ? 'mo' : 'khoa'} khach hang ${draft.email || id}`;
      if (draft.field === 'role' && targetText) return `doi role khach hang ${draft.email || id} thanh ${targetText}`;
    }
    if (draft.entity === 'voucher') {
      const voucherTarget = draft.code ? ` ${draft.code}` : id;
      if (typeof draft.active === 'boolean') return `${draft.active ? 'mo' : 'khoa'} voucher${voucherTarget}`;
      if (value !== null) return `doi voucher${voucherTarget} giam thanh ${value}`;
    }
    if (draft.entity === 'banner') {
      if (typeof draft.active === 'boolean') return `${draft.active ? 'bat' : 'tat'} banner${id}`;
      if (draft.field === 'image' && targetUrl) return `doi anh banner${id} thanh ${targetUrl}`;
      if (draft.field === 'title' && targetText) return `doi tieu de banner${id} thanh ${targetText}`;
      if (draft.field === 'link' && (targetUrl || targetText)) return `doi link banner${id} thanh ${targetUrl || targetText}`;
      if (draft.field === 'order' && value !== null) return `doi thu tu banner${id} thanh ${value}`;
    }

    return message;
  }

  private parseLastNumber(message: string) {
    const normalized = this.normalize(message).replace(/#/g, ' ');
    const compactMillion = normalized.match(/\b([0-9]+)\s*tr\s*([0-9]+)\b/);
    if (compactMillion) {
      const millionPart = Number(compactMillion[1]);
      const decimalPart = Number(`0.${compactMillion[2]}`);
      if (Number.isFinite(millionPart) && Number.isFinite(decimalPart)) {
        return Math.round((millionPart + decimalPart) * 1_000_000);
      }
    }

    const matches = [...normalized.matchAll(/([0-9][0-9.,]*)\s*(trieu|tr|cu|nghin|k|vnd|d)?/g)];
    if (!matches.length) return null;

    const match = matches[matches.length - 1];
    const raw = match[1].replace(/[.,]/g, '');
    const value = Number(raw);
    if (!Number.isFinite(value)) return null;

    const unit = match[2] || '';
    if (unit === 'trieu' || unit === 'tr' || unit === 'cu') return value * 1_000_000;
    if (unit === 'nghin' || unit === 'k') return value * 1_000;
    return value;
  }

  private isConfirmMessage(message: string) {
    const text = this.normalize(message).trim();
    return /^(xac nhan|dong y|ok|oke|yes|co|chot|lam di|thuc hien|confirm)\b/.test(text);
  }

  private isCancelMessage(message: string) {
    const text = this.normalize(message).trim();
    return /^(huy|khong|dung|bo qua|cancel|thoi)\b/.test(text);
  }

  private getPendingAction(history: Array<{ role: string; content: string; suggestedProducts?: any }>) {
    for (const item of [...history].reverse()) {
      if (item.role !== 'assistant') continue;
      return item.suggestedProducts?.pendingAdminAction?.actionMessage as string | undefined;
    }

    return undefined;
  }

  private buildConfirmationMessage(actionMessage: string) {
    const value = this.parseLastNumber(actionMessage);
    const text = this.normalize(actionMessage);
    const valueLine = value !== null && /(gia|price|voucher|giam|ton kho|stock|so luong|thu tu)/.test(text)
      ? `\n- Gia tri moi: ${/(ton kho|stock|so luong|thu tu)/.test(text) ? Math.floor(value) : this.formatMoney(value)}`
      : '';

    return [
      'Em chua sua database ngay. Sep xac nhan giup em truoc khi thuc hien:',
      `- Lenh: ${actionMessage}${valueLine}`,
      '',
      'Neu dung, Sep nhan: "xac nhan".',
      'Neu khong dung, Sep nhan: "huy".',
    ].join('\n');
  }

  private parseUrl(message: string) {
    return message.match(/https?:\/\/\S+/i)?.[0]?.replace(/[)"']+$/, '') || null;
  }

  private parseTextAfterTarget(message: string) {
    const match = message.match(/(?:thanh|là|la|=|:)\s*["“']?(.+?)["”']?\s*$/i);
    return match?.[1]?.trim() || null;
  }

  private singleMatch<T extends { id: string }>(items: T[], label: string, prefix: string) {
    if (!items.length) {
      return { error: `Em khong tim thay ${label} co ID bat dau bang #${prefix}. Du lieu chua duoc thay doi.` };
    }
    if (items.length > 1) {
      return { error: `ID #${prefix} dang trung voi nhieu ${label}. Sep vui long nhap ID day du hon de em sua chinh xac.` };
    }
    return { item: items[0] };
  }

  private async findOrderByPrefix(prefix: string) {
    const matches = await prisma.order.findMany({
      where: { id: { startsWith: prefix } },
      take: 2,
      include: { user: { select: { name: true, email: true } } },
    });
    return this.singleMatch(matches, 'don hang', prefix);
  }

  private async findProductByPrefix(prefix: string) {
    const matches = await prisma.product.findMany({
      where: { id: { startsWith: prefix }, isDeleted: false },
      take: 2,
      include: { variants: { select: { id: true, sku: true, name: true, price: true, stock: true } } },
    });
    return this.singleMatch(matches, 'san pham', prefix);
  }

  private async findVariantByPrefix(prefix: string) {
    const matches = await prisma.productVariant.findMany({
      where: { id: { startsWith: prefix } },
      take: 2,
      include: { product: { select: { id: true, name: true } } },
    });
    return this.singleMatch(matches, 'bien the san pham', prefix);
  }

  private async findCategoryByPrefix(prefix: string) {
    const matches = await prisma.category.findMany({
      where: { id: { startsWith: prefix }, isDeleted: false },
      take: 2,
    });
    return this.singleMatch(matches, 'danh muc', prefix);
  }

  private async findUserByPrefixOrEmail(message: string, prefix: string | null) {
    const email = message.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0];
    const matches = await prisma.user.findMany({
      where: email ? { email } : { id: { startsWith: prefix || '' } },
      take: 2,
    });
    return this.singleMatch(matches, 'khach hang', email || prefix || '');
  }

  private async findVoucher(message: string, prefix: string | null) {
    const normalized = this.normalize(message);
    const codeMatch =
      message.match(/\b(?:voucher|code)\s+([A-Z0-9_-]{3,30})\b/i) ||
      message.match(/\bma\s+(?!giam\b|giảm\b)([A-Z0-9_-]{3,30})\b/i);
    const code = codeMatch?.[1]?.toUpperCase();
    const matches = await prisma.voucher.findMany({
      where: code ? { code } : { id: { startsWith: prefix || '' } },
      take: 2,
    });
    return this.singleMatch(matches, 'voucher', code || prefix || normalized);
  }

  private async findBannerByPrefix(prefix: string) {
    const matches = await prisma.banner.findMany({
      where: { id: { startsWith: prefix } },
      take: 2,
    });
    return this.singleMatch(matches, 'banner', prefix);
  }

  private async findTicketByPrefix(prefix: string) {
    const matches = await prisma.supportTicket.findMany({
      where: { id: { startsWith: prefix } },
      take: 2,
      include: { user: { select: { name: true, email: true } } },
    });
    return this.singleMatch(matches, 'ticket ho tro', prefix);
  }

  private parseOrderStatus(message: string) {
    const text = this.normalize(message);
    if (/(huy|cancel)/.test(text)) return 'CANCELLED';
    if (/(hoan tat|thanh cong|da giao|delivered)/.test(text)) return 'DELIVERED';
    if (/(dang giao|giao hang|shipped)/.test(text)) return 'SHIPPED';
    if (/(dang goi|dong goi|xu ly|processing|duyet don|duyet)/.test(text)) return 'PROCESSING';
    if (/(cho duyet|pending)/.test(text)) return 'PENDING';
    return null;
  }

  private mutationHelp() {
    return [
      'Em chua thuc hien thay doi vi cau lenh chua du ro hoac chua nam trong nhom thao tac an toan.',
      'Cac lenh em co the sua DB truc tiep:',
      '- San pham: "doi gia san pham #ID thanh 1000000", "doi ton kho san pham #ID thanh 20", "an/hien san pham #ID".',
      '- Don hang: "chuyen don #ID sang dang giao/hoan tat/huy".',
      '- Danh muc: "doi ten danh muc #ID thanh Laptop Gaming", "doi anh danh muc #ID thanh https://...".',
      '- Khach hang: "khoa/mo khach hang #ID hoac email".',
      '- Voucher/Banner/Ho tro/Cai dat: "khoa voucher CODE", "bat banner #ID", "dong ticket #ID", "bat bao tri".',
    ].join('\n');
  }

  private async handleProductAction(message: string, prefix: string) {
    const text = this.normalize(message);
    const sku = message.match(/\bsku\s*[:=]?\s*([A-Z0-9_-]{3,60})\b/i)?.[1];

    const variantBySku = sku
      ? await prisma.productVariant.findUnique({
          where: { sku },
          include: { product: { select: { id: true, name: true } } },
        })
      : null;

    const shouldUpdatePrice = /(gia|price)/.test(text);
    const shouldUpdateStock = /(ton kho|so luong|stock|nhap kho|nhap hang|con hang)/.test(text);
    const shouldUpdateActive = /(an|hien|bat|tat|khoa|mo|ngung ban|ban lai|kich hoat)/.test(text);
    const shouldUpdateName = /\bten\b/.test(text);

    if (shouldUpdatePrice || shouldUpdateStock) {
      const value = this.parseLastNumber(message);
      if (value === null || value < 0) return 'Em chua doc duoc gia/so luong moi hop le. Du lieu chua duoc thay doi.';

      const data = shouldUpdatePrice ? { price: value } : { stock: Math.floor(value) };
      const label = shouldUpdatePrice ? 'gia' : 'ton kho';

      if (variantBySku) {
        const oldValue = shouldUpdatePrice ? variantBySku.price : variantBySku.stock;
        const updated = await prisma.productVariant.update({ where: { id: variantBySku.id }, data });
        await cacheDelPattern('products:list:*');
        return `Da cap nhat ${label} bien the SKU ${updated.sku} cua "${variantBySku.product.name}" tu ${oldValue} thanh ${shouldUpdatePrice ? this.formatMoney(value) : Math.floor(value)}.`;
      }

      const variantResult = await this.findVariantByPrefix(prefix);
      if (variantResult.item) {
        const oldValue = shouldUpdatePrice ? variantResult.item.price : variantResult.item.stock;
        const updated = await prisma.productVariant.update({ where: { id: variantResult.item.id }, data });
        await cacheDelPattern('products:list:*');
        return `Da cap nhat ${label} bien the ${updated.name} (${updated.sku}) cua "${variantResult.item.product.name}" tu ${oldValue} thanh ${shouldUpdatePrice ? this.formatMoney(value) : Math.floor(value)}.`;
      }

      const productResult = await this.findProductByPrefix(prefix);
      if (!productResult.item) return variantResult.error || productResult.error || 'Em khong tim thay san pham can sua.';
      if (!productResult.item.variants.length) return `San pham "${productResult.item.name}" chua co bien the de cap nhat ${label}.`;

      await prisma.productVariant.updateMany({
        where: { productId: productResult.item.id },
        data,
      });
      await cacheDelPattern('products:list:*');
      return `Da cap nhat ${label} cho ${productResult.item.variants.length} bien the cua san pham "${productResult.item.name}" thanh ${shouldUpdatePrice ? this.formatMoney(value) : Math.floor(value)}.`;
    }

    if (shouldUpdateActive) {
      const productResult = await this.findProductByPrefix(prefix);
      if (!productResult.item) return productResult.error || 'Em khong tim thay san pham can sua.';
      const isActive = /(hien|bat|mo|ban lai|kich hoat)/.test(text);
      const updated = await prisma.product.update({ where: { id: productResult.item.id }, data: { isActive } });
      await cacheDelPattern('products:list:*');
      return `${isActive ? 'Da hien/bat ban lai' : 'Da an/tat ban'} san pham "${updated.name}".`;
    }

    if (shouldUpdateName) {
      const newName = this.parseTextAfterTarget(message);
      if (!newName) return 'Em chua doc duoc ten san pham moi. Du lieu chua duoc thay doi.';
      const productResult = await this.findProductByPrefix(prefix);
      if (!productResult.item) return productResult.error || 'Em khong tim thay san pham can sua.';
      const oldName = productResult.item.name;
      const updated = await prisma.product.update({ where: { id: productResult.item.id }, data: { name: newName } });
      await cacheDelPattern('products:list:*');
      return `Da doi ten san pham #${updated.id.slice(0, 8)} tu "${oldName}" thanh "${updated.name}".`;
    }

    return this.mutationHelp();
  }

  private async handleOrderAction(message: string, prefix: string) {
    const text = this.normalize(message);
    const orderResult = await this.findOrderByPrefix(prefix);
    if (!orderResult.item) return orderResult.error || 'Em khong tim thay don hang can sua.';

    if (/(ho tro|support|ticket|cskh)/.test(text) && /(chuyen|tao|gui)/.test(text)) {
      const ticket = await prisma.supportTicket.create({
        data: {
          userId: orderResult.item.userId,
          subject: `Ho tro don hang #${orderResult.item.id.slice(0, 8)}`,
          messages: {
            create: {
              senderId: orderResult.item.userId,
              content: `Admin yeu cau bo phan ho tro kiem tra don hang #${orderResult.item.id.slice(0, 8)}.`,
            },
          },
        },
      });
      return `Da tao ticket ho tro #${ticket.id.slice(0, 8)} cho don #${orderResult.item.id.slice(0, 8)} cua ${orderResult.item.user.name}.`;
    }

    const status = this.parseOrderStatus(message);
    if (!status) return 'Em chua doc duoc trang thai don hang moi. Vi du: "chuyen don #ID sang dang giao" hoac "huy don #ID".';

    const oldStatus = orderResult.item.status;
    const updated = await orderService.updateStatus(orderResult.item.id, status);
    return `Da cap nhat don #${updated.id.slice(0, 8)} cua ${orderResult.item.user.name} tu ${ORDER_STATUS[oldStatus] || oldStatus} sang ${ORDER_STATUS[updated.status] || updated.status}.`;
  }

  private async handleCategoryAction(message: string, prefix: string) {
    const text = this.normalize(message);
    const categoryResult = await this.findCategoryByPrefix(prefix);
    if (!categoryResult.item) return categoryResult.error || 'Em khong tim thay danh muc can sua.';

    const data: { name?: string; image?: string } = {};
    if (/(anh|image|hinh)/.test(text)) {
      const image = this.parseUrl(message);
      if (!image) return 'Em chua thay URL anh moi cho danh muc. Du lieu chua duoc thay doi.';
      data.image = image;
    } else if (/\bten\b/.test(text)) {
      const name = this.parseTextAfterTarget(message);
      if (!name) return 'Em chua doc duoc ten danh muc moi. Du lieu chua duoc thay doi.';
      data.name = name;
    } else {
      return this.mutationHelp();
    }

    const updated = await prisma.category.update({ where: { id: categoryResult.item.id }, data });
    await cacheDelPattern('products:list:*');
    return `Da cap nhat danh muc #${updated.id.slice(0, 8)}: ${updated.name}.`;
  }

  private async handleCustomerAction(message: string, prefix: string | null) {
    const text = this.normalize(message);
    const userResult = await this.findUserByPrefixOrEmail(message, prefix);
    if (!userResult.item) return userResult.error || 'Em khong tim thay khach hang can sua.';
    if (userResult.item.role === 'ADMIN' && /(khoa|tat|vo hieu)/.test(text)) {
      return 'Em khong khoa tai khoan ADMIN bang chatbot de tranh tu khoa quyen quan tri.';
    }

    if (/(khoa|tat|vo hieu)/.test(text) || /(mo|bat|kich hoat)/.test(text)) {
      const isActive = /(mo|bat|kich hoat)/.test(text);
      const updated = await prisma.user.update({
        where: { id: userResult.item.id },
        data: { isActive },
        select: { id: true, name: true, email: true, isActive: true },
      });
      return `${isActive ? 'Da mo/kich hoat' : 'Da khoa/vo hieu hoa'} khach hang ${updated.name} (${updated.email}).`;
    }

    if (/(role|vai tro|quyen)/.test(text)) {
      const role = /\badmin\b/.test(text) ? 'ADMIN' : /\buser\b|khach/.test(text) ? 'USER' : null;
      if (!role) return 'Em chua doc duoc role moi. Chi ho tro ADMIN hoac USER.';
      const updated = await prisma.user.update({
        where: { id: userResult.item.id },
        data: { role },
        select: { id: true, name: true, email: true, role: true },
      });
      return `Da cap nhat role cua ${updated.name} (${updated.email}) thanh ${updated.role}.`;
    }

    return this.mutationHelp();
  }

  private async handleVoucherAction(message: string, prefix: string | null) {
    const text = this.normalize(message);
    const voucherResult = await this.findVoucher(message, prefix);
    if (!voucherResult.item) return voucherResult.error || 'Em khong tim thay voucher can sua.';

    const data: { isActive?: boolean; discountValue?: number } = {};
    if (/(khoa|tat|vo hieu|ngung)/.test(text)) data.isActive = false;
    if (/(mo|bat|kich hoat)/.test(text)) data.isActive = true;
    if (/(giam|discount)/.test(text) && /(thanh|=|la)/.test(text)) {
      const value = this.parseLastNumber(message);
      if (value === null || value < 0) return 'Em chua doc duoc gia tri giam moi hop le.';
      data.discountValue = value;
    }
    if (!Object.keys(data).length) return this.mutationHelp();

    const updated = await prisma.voucher.update({ where: { id: voucherResult.item.id }, data });
    return `Da cap nhat voucher ${updated.code}: trang thai ${updated.isActive ? 'dang bat' : 'dang khoa'}, gia tri giam ${updated.discountValue}.`;
  }

  private async handleBannerAction(message: string, prefix: string) {
    const text = this.normalize(message);
    const bannerResult = await this.findBannerByPrefix(prefix);
    if (!bannerResult.item) return bannerResult.error || 'Em khong tim thay banner can sua.';

    const data: { title?: string; imageUrl?: string; link?: string; order?: number; isActive?: boolean } = {};
    if (/(khoa|tat|an|ngung)/.test(text)) data.isActive = false;
    if (/(mo|bat|hien|kich hoat)/.test(text)) data.isActive = true;
    if (/(anh|image|hinh)/.test(text)) {
      const imageUrl = this.parseUrl(message);
      if (!imageUrl) return 'Em chua thay URL anh moi cho banner.';
      data.imageUrl = imageUrl;
    }
    if (/(link|duong dan)/.test(text)) {
      const link = this.parseUrl(message) || this.parseTextAfterTarget(message);
      if (!link) return 'Em chua doc duoc link moi cho banner.';
      data.link = link;
    }
    if (/(thu tu|order|sap xep)/.test(text)) {
      const order = this.parseLastNumber(message);
      if (order === null) return 'Em chua doc duoc thu tu moi cho banner.';
      data.order = Math.floor(order);
    }
    if (/\btieu de\b|\btitle\b/.test(text)) {
      const title = this.parseTextAfterTarget(message);
      if (!title) return 'Em chua doc duoc tieu de moi cho banner.';
      data.title = title;
    }
    if (!Object.keys(data).length) return this.mutationHelp();

    const updated = await prisma.banner.update({ where: { id: bannerResult.item.id }, data });
    return `Da cap nhat banner #${updated.id.slice(0, 8)}: "${updated.title}", trang thai ${updated.isActive ? 'dang bat' : 'dang tat'}.`;
  }

  private async handleSupportAction(message: string, prefix: string) {
    const text = this.normalize(message);
    const ticketResult = await this.findTicketByPrefix(prefix);
    if (!ticketResult.item) return ticketResult.error || 'Em khong tim thay ticket can sua.';

    const status = /(dong|close|closed|xong)/.test(text) ? 'CLOSED' : /(mo|open|xu ly lai)/.test(text) ? 'OPEN' : null;
    if (!status) return 'Em chua doc duoc trang thai ticket moi. Vi du: "dong ticket #ID" hoac "mo ticket #ID".';

    const updated = await prisma.supportTicket.update({ where: { id: ticketResult.item.id }, data: { status } });
    return `Da cap nhat ticket #${updated.id.slice(0, 8)} cua ${ticketResult.item.user.name} sang ${updated.status}.`;
  }

  private async handleSettingsAction(message: string) {
    const text = this.normalize(message);
    if (!/(bao tri|maintenance)/.test(text)) return null;
    if (!/(bat|mo|tat|dong|khoa)/.test(text)) return 'Em chua doc duoc trang thai bao tri moi. Vi du: "bat bao tri" hoac "tat bao tri".';

    const enabled = /(bat|mo)/.test(text);
    MaintenanceHelper.setEnabled(enabled);
    return `${enabled ? 'Da bat' : 'Da tat'} che do bao tri he thong.`;
  }

  private async tryExecuteAdminAction(message: string, history: Array<{ role: string; content: string }> = [], confirmed = false): Promise<AdminActionResponse | null> {
    if (!confirmed && this.isAdminQuestion(message)) return null;

    const draft = await this.extractActionDraftWithAI(message, history);
    const actionMessage = this.renderActionDraft(message, draft);
    const text = this.normalize(actionMessage);
    if (!this.hasMutationIntent(actionMessage)) return null;

    const settingsResult = await this.handleSettingsAction(actionMessage);
    if (settingsResult) {
      if (!confirmed) {
        return { mode: 'confirm', message: this.buildConfirmationMessage(actionMessage), actionMessage };
      }
      return { mode: 'execute', message: settingsResult };
    }

    const prefix = this.extractContextualIdPrefix(actionMessage, history);
    const entity = this.extractContextualEntity(actionMessage, history, draft);

    try {
      if (entity === 'order' || /(don hang|\bdon\b|order)/.test(text)) {
        if (!prefix) return { mode: 'execute', message: 'Em can ID don hang, vi du: "chuyen don #a0fca7cb sang dang giao".' };
        if (!confirmed) return { mode: 'confirm', message: this.buildConfirmationMessage(actionMessage), actionMessage };
        return { mode: 'execute', message: await this.handleOrderAction(actionMessage, prefix) };
      }
      if (entity === 'product' || /(san pham|product|bien the|variant|sku|gia|ton kho|stock|so luong)/.test(text)) {
        if (!prefix && !/\bsku\b/i.test(actionMessage)) return { mode: 'execute', message: 'Em can ID san pham/bien the hoac SKU de sua chinh xac.' };
        if (!confirmed) return { mode: 'confirm', message: this.buildConfirmationMessage(actionMessage), actionMessage };
        return { mode: 'execute', message: await this.handleProductAction(actionMessage, prefix || '') };
      }
      if (entity === 'category' || /(danh muc|category)/.test(text)) {
        if (!prefix) return { mode: 'execute', message: 'Em can ID danh muc de sua chinh xac.' };
        if (!confirmed) return { mode: 'confirm', message: this.buildConfirmationMessage(actionMessage), actionMessage };
        return { mode: 'execute', message: await this.handleCategoryAction(actionMessage, prefix) };
      }
      if (entity === 'customer' || /(khach hang|customer|user|tai khoan|nguoi dung)/.test(text)) {
        if (!prefix && !actionMessage.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)) return { mode: 'execute', message: 'Em can ID hoac email khach hang de sua chinh xac.' };
        if (!confirmed) return { mode: 'confirm', message: this.buildConfirmationMessage(actionMessage), actionMessage };
        return { mode: 'execute', message: await this.handleCustomerAction(actionMessage, prefix) };
      }
      if (entity === 'voucher' || /(voucher|ma giam|coupon)/.test(text)) {
        if (!confirmed) return { mode: 'confirm', message: this.buildConfirmationMessage(actionMessage), actionMessage };
        return { mode: 'execute', message: await this.handleVoucherAction(actionMessage, prefix) };
      }
      if (entity === 'banner' || /(banner)/.test(text)) {
        if (!prefix) return { mode: 'execute', message: 'Em can ID banner de sua chinh xac.' };
        if (!confirmed) return { mode: 'confirm', message: this.buildConfirmationMessage(actionMessage), actionMessage };
        return { mode: 'execute', message: await this.handleBannerAction(actionMessage, prefix) };
      }
      if (entity === 'support' || /(ticket|ho tro|support)/.test(text)) {
        if (!prefix) return { mode: 'execute', message: 'Em can ID ticket de sua chinh xac.' };
        if (!confirmed) return { mode: 'confirm', message: this.buildConfirmationMessage(actionMessage), actionMessage };
        return { mode: 'execute', message: await this.handleSupportAction(actionMessage, prefix) };
      }
    } catch (error: any) {
      return { mode: 'execute', message: `Em khong thuc hien duoc thay doi nay: ${error?.message || 'loi khong xac dinh'}. Du lieu co the chua duoc cap nhat.` };
    }

    return { mode: 'execute', message: this.mutationHelp() };
  }

  private async buildOverviewContext(): Promise<ContextBlock> {
    const todayStart = this.startOfToday();
    const weekStart = this.daysAgo(7);
    const monthStart = this.startOfMonth();

    const [
      activeUsers,
      newUsersToday,
      newUsersThisWeek,
      products,
      activeProducts,
      ordersTotal,
      ordersToday,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredRevenue,
      todayRevenue,
      weekRevenue,
      monthRevenue,
      openTickets,
      reviewCount,
      avgRating,
    ] = await Promise.all([
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.user.count({ where: { createdAt: { gte: weekStart } } }),
      prisma.product.count({ where: { isDeleted: false } }),
      prisma.product.count({ where: { isDeleted: false, isActive: true } }),
      prisma.order.count(),
      prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'PROCESSING' } }),
      prisma.order.count({ where: { status: 'SHIPPED' } }),
      prisma.order.aggregate({ where: { status: 'DELIVERED' }, _sum: { totalAmount: true } }),
      prisma.order.aggregate({ where: { status: 'DELIVERED', createdAt: { gte: todayStart } }, _sum: { totalAmount: true } }),
      prisma.order.aggregate({ where: { status: 'DELIVERED', createdAt: { gte: weekStart } }, _sum: { totalAmount: true } }),
      prisma.order.aggregate({ where: { status: 'DELIVERED', createdAt: { gte: monthStart } }, _sum: { totalAmount: true } }),
      prisma.supportTicket.count({ where: { status: 'OPEN' } }),
      prisma.review.count(),
      prisma.review.aggregate({ _avg: { rating: true } }),
    ]);

    return {
      title: 'Tong quan he thong',
      content: [
        `Khach hang active: ${activeUsers}. Moi hom nay: ${newUsersToday}. Moi 7 ngay: ${newUsersThisWeek}.`,
        `San pham: ${products}. Dang ban: ${activeProducts}.`,
        `Don hang: tong ${ordersTotal}, hom nay ${ordersToday}. Dang can xu ly: cho duyet ${pendingOrders}, dang goi ${processingOrders}, dang giao ${shippedOrders}.`,
        `Doanh thu chi tinh don DELIVERED: tong ${this.formatMoney(this.sumValue(deliveredRevenue))}, hom nay ${this.formatMoney(this.sumValue(todayRevenue))}, 7 ngay ${this.formatMoney(this.sumValue(weekRevenue))}, thang nay ${this.formatMoney(this.sumValue(monthRevenue))}.`,
        `Ticket dang mo: ${openTickets}. Danh gia: ${reviewCount}, rating trung binh ${avgRating._avg.rating?.toFixed(1) || 'N/A'}/5.`,
      ].join('\n'),
    };
  }

  private async buildRevenueContext(): Promise<ContextBlock> {
    const todayStart = this.startOfToday();
    const weekStart = this.daysAgo(7);

    const [deliveredToday, recentDelivered, cancelledToday] = await Promise.all([
      prisma.order.findMany({
        where: { status: 'DELIVERED', createdAt: { gte: todayStart } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: { select: { name: true, email: true } },
          items: { include: { product: { select: { name: true } } } },
          payment: { select: { method: true, status: true } },
        },
      }),
      prisma.order.findMany({
        where: { status: 'DELIVERED', createdAt: { gte: weekStart } },
        orderBy: { createdAt: 'desc' },
        take: 15,
        select: { id: true, totalAmount: true, createdAt: true },
      }),
      prisma.order.count({ where: { status: 'CANCELLED', createdAt: { gte: todayStart } } }),
    ]);

    const todayLines = deliveredToday.length
      ? deliveredToday
          .map((order) => {
            const items = order.items.map((item) => `${item.product.name} x${item.quantity}`).join(', ');
            const payment = order.payment
              ? `${PAYMENT_METHOD[order.payment.method] || order.payment.method}/${PAYMENT_STATUS[order.payment.status] || order.payment.status}`
              : 'Chua co thanh toan';
            return `- #${order.id.slice(0, 8)} | ${order.user.name} | ${this.formatMoney(order.totalAmount)} | ${payment} | ${items}`;
          })
          .join('\n')
      : '- Hom nay chua co don DELIVERED.';

    const last7Revenue = recentDelivered.reduce((sum, order) => sum + Number(order.totalAmount), 0);

    return {
      title: 'Doanh thu va don da hoan tat',
      content: [
        `Doanh thu 7 ngay gan day tu don DELIVERED: ${this.formatMoney(last7Revenue)}.`,
        `Don bi huy hom nay: ${cancelledToday}.`,
        'Don DELIVERED hom nay:',
        todayLines,
      ].join('\n'),
    };
  }

  private async buildOrdersContext(): Promise<ContextBlock> {
    const todayStart = this.startOfToday();

    const [ordersToday, latestOrders, pendingOrders, processingOrders, shippedOrders] = await Promise.all([
      prisma.order.findMany({
        where: { createdAt: { gte: todayStart } },
        orderBy: { createdAt: 'desc' },
        take: 12,
        include: {
          user: { select: { name: true, email: true } },
          items: { include: { product: { select: { name: true } }, variant: { select: { name: true, sku: true } } } },
          payment: { select: { method: true, status: true } },
        },
      }),
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 12,
        include: {
          user: { select: { name: true, email: true } },
          items: { include: { product: { select: { name: true } }, variant: { select: { name: true, sku: true } } } },
          payment: { select: { method: true, status: true } },
        },
      }),
      prisma.order.findMany({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'asc' },
        take: 8,
        include: { user: { select: { name: true } }, items: { include: { product: { select: { name: true } } } } },
      }),
      prisma.order.findMany({
        where: { status: 'PROCESSING' },
        orderBy: { createdAt: 'asc' },
        take: 8,
        include: { user: { select: { name: true } }, items: { include: { product: { select: { name: true } } } } },
      }),
      prisma.order.findMany({
        where: { status: 'SHIPPED' },
        orderBy: { createdAt: 'asc' },
        take: 8,
        include: { user: { select: { name: true } }, items: { include: { product: { select: { name: true } } } } },
      }),
    ]);

    const formatFullOrder = (order: (typeof latestOrders)[number]) => {
      const items = order.items
        .map((item) => `${item.product.name} (${item.variant?.sku || item.variant?.name || 'mac dinh'}) x${item.quantity}`)
        .join(', ');
      const payment = order.payment
        ? `${PAYMENT_METHOD[order.payment.method] || order.payment.method}/${PAYMENT_STATUS[order.payment.status] || order.payment.status}`
        : 'Chua co thanh toan';
      return `- #${order.id.slice(0, 8)} | ${order.user.name} (${order.user.email}) | ${ORDER_STATUS[order.status] || order.status} | ${this.formatMoney(order.totalAmount)} | ${payment} | ${this.formatDate(order.createdAt)} | ${items}`;
    };

    const formatShortOrder = (order: (typeof pendingOrders)[number]) => {
      const items = order.items.map((item) => `${item.product.name} x${item.quantity}`).join(', ');
      return `- #${order.id.slice(0, 8)} | ${order.user.name} | Trang thai: ${ORDER_STATUS[order.status] || order.status} | ${this.formatMoney(order.totalAmount)} | ${items}`;
    };

    return {
      title: 'Don hang realtime',
      content: [
        'Don phat sinh hom nay:',
        ordersToday.length ? ordersToday.map(formatFullOrder).join('\n') : '- Chua co don moi hom nay.',
        'Don gan day:',
        latestOrders.length ? latestOrders.map(formatFullOrder).join('\n') : '- Chua co don hang.',
        'Can xu ly:',
        `Cho duyet:\n${pendingOrders.length ? pendingOrders.map(formatShortOrder).join('\n') : '- Khong co.'}`,
        `Dang goi:\n${processingOrders.length ? processingOrders.map(formatShortOrder).join('\n') : '- Khong co.'}`,
        `Dang giao:\n${shippedOrders.length ? shippedOrders.map(formatShortOrder).join('\n') : '- Khong co.'}`,
      ].join('\n'),
    };
  }

  private async answerOrderQuestion(message: string, history: Array<{ role: string; content: string }>) {
    const text = this.normalize(message);
    const previousText = this.normalize(history.map((item) => item.content).slice(-4).join('\n'));
    const asksOrderCount = /(hom nay|today).*(bao nhieu|may|tong).*(don hang|don\b)|(?:don hang|don\b).*(hom nay|today).*(bao nhieu|may|tong)/.test(text);
    const asksOrderDetail = /(chi tiet|liet ke|danh sach|cac don|nhung don|don hang do)/.test(text) && /(don hang|don\b|do|nay|truoc)/.test(text);

    if (!asksOrderCount && !(asksOrderDetail && /(hom nay|today|don hang)/.test(previousText))) return null;

    const todayStart = this.startOfToday();
    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: todayStart } },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { product: { select: { name: true } }, variant: { select: { name: true, sku: true } } } },
        payment: { select: { method: true, status: true } },
      },
    });

    const statusCounts = orders.reduce<Record<string, number>>((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    const summary = `Hom nay he thong co ${orders.length} don hang: ${ORDER_STATUS.PENDING} ${statusCounts.PENDING || 0}, ${ORDER_STATUS.PROCESSING} ${statusCounts.PROCESSING || 0}, ${ORDER_STATUS.SHIPPED} ${statusCounts.SHIPPED || 0}, ${ORDER_STATUS.DELIVERED} ${statusCounts.DELIVERED || 0}, ${ORDER_STATUS.CANCELLED} ${statusCounts.CANCELLED || 0}.`;
    if (asksOrderCount && !asksOrderDetail) return summary;

    if (!orders.length) return `${summary}\nChua co don nao de liet ke chi tiet.`;

    const lines = orders.map((order) => {
      const items = order.items
        .map((item) => `${item.product.name} (${item.variant?.sku || item.variant?.name || 'mac dinh'}) x${item.quantity}`)
        .join(', ');
      const payment = order.payment
        ? `${PAYMENT_METHOD[order.payment.method] || order.payment.method}/${PAYMENT_STATUS[order.payment.status] || order.payment.status}`
        : 'Chua co thanh toan';
      return `- #${order.id.slice(0, 8)} | ${order.user.name} | Trang thai: ${ORDER_STATUS[order.status] || order.status} | ${this.formatMoney(order.totalAmount)} | Thanh toan: ${payment} | ${items}`;
    });

    return [summary, 'Chi tiet:', ...lines].join('\n');
  }

  private async answerVoucherQuestion(message: string) {
    const text = this.normalize(message);
    if (!/(voucher|ma giam|coupon)/.test(text) || !/(hien tai|dang co|nhung|nao|liet ke|danh sach|xem)/.test(text)) return null;

    const now = new Date();
    const vouchers = await prisma.voucher.findMany({
      orderBy: [{ isActive: 'desc' }, { endDate: 'asc' }],
      take: 20,
    });

    if (!vouchers.length) return 'Hien tai he thong chua co voucher nao.';

    return [
      `Hien tai he thong co ${vouchers.length} voucher:`,
      ...vouchers.map((voucher) => {
        const discount = voucher.discountType === 'PERCENT' ? `${Number(voucher.discountValue)}%` : this.formatMoney(voucher.discountValue);
        const status = !voucher.isActive ? 'Dang khoa' : voucher.endDate < now ? 'Het han' : 'Dang hoat dong';
        return `- ${voucher.code} | ${discount} | ${status} | Da dung ${voucher.usedCount}/${voucher.usageLimit} | HSD ${voucher.endDate.toLocaleDateString('vi-VN')}`;
      }),
    ].join('\n');
  }

  private async answerCustomerQuestion(message: string) {
    const text = this.normalize(message);
    if (!/(khach|khach hang|user|nguoi dung|tai khoan)/.test(text) || !/(bao nhieu|tong|hien tai|co may)/.test(text)) return null;

    const [total, active, inactive, admins] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { isActive: false } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
    ]);

    return `Hien tai he thong co ${total} tai khoan: ${active} dang hoat dong, ${inactive} bi khoa/khong active, trong do co ${admins} tai khoan ADMIN.`;
  }

  private async answerDeterministicQuestion(message: string, history: Array<{ role: string; content: string }>) {
    if (!this.isAdminQuestion(message)) return null;
    return (
      (await this.answerOrderQuestion(message, history)) ||
      (await this.answerVoucherQuestion(message)) ||
      (await this.answerCustomerQuestion(message))
    );
  }

  private async buildInventoryContext(): Promise<ContextBlock> {
    const [lowStock, outOfStock, variantCount] = await Promise.all([
      prisma.productVariant.findMany({
        where: { stock: { gt: 0, lt: 10 }, product: { isDeleted: false, isActive: true } },
        orderBy: { stock: 'asc' },
        take: 15,
        include: { product: { select: { name: true, slug: true } } },
      }),
      prisma.productVariant.findMany({
        where: { stock: 0, product: { isDeleted: false, isActive: true } },
        orderBy: { product: { name: 'asc' } },
        take: 15,
        include: { product: { select: { name: true, slug: true } } },
      }),
      prisma.productVariant.count({ where: { product: { isDeleted: false, isActive: true } } }),
    ]);

    const lowStockLines = lowStock.length
      ? lowStock.map((variant) => `- ${variant.product.name} | ${variant.name} | SKU ${variant.sku} | con ${variant.stock}`).join('\n')
      : '- Khong co bien the sap het hang.';

    const outOfStockLines = outOfStock.length
      ? outOfStock.map((variant) => `- ${variant.product.name} | ${variant.name} | SKU ${variant.sku} | het hang`).join('\n')
      : '- Khong co bien the het hang.';

    return {
      title: 'Ton kho va canh bao',
      content: [
        `Tong bien the dang theo doi: ${variantCount}.`,
        'Bien the sap het hang (1-9):',
        lowStockLines,
        'Bien the het hang:',
        outOfStockLines,
      ].join('\n'),
    };
  }

  private async buildProductsContext(): Promise<ContextBlock> {
    const [topSold, newestProducts, categories] = await Promise.all([
      prisma.$queryRaw<Array<{ productId: string; totalSold: number }>>`
        SELECT "productId", CAST(SUM(quantity) AS INTEGER) AS "totalSold"
        FROM "OrderItem"
        GROUP BY "productId"
        ORDER BY "totalSold" DESC
        LIMIT 10
      `,
      prisma.product.findMany({
        where: { isDeleted: false },
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: {
          category: { select: { name: true } },
          variants: { select: { price: true, stock: true }, take: 3 },
        },
      }),
      prisma.category.findMany({
        where: { isDeleted: false },
        orderBy: { name: 'asc' },
        select: {
          name: true,
          slug: true,
          _count: { select: { products: { where: { isDeleted: false } } } },
        },
      }),
    ]);

    const topIds = topSold.map((item) => item.productId);
    const topProducts = topIds.length
      ? await prisma.product.findMany({
          where: { id: { in: topIds } },
          include: {
            category: { select: { name: true } },
            variants: { select: { price: true, stock: true }, take: 3 },
          },
        })
      : [];

    const productById = new Map(topProducts.map((product) => [product.id, product]));
    const topLines = topSold.length
      ? topSold
          .map((item, index) => {
            const product = productById.get(item.productId);
            if (!product) return `${index + 1}. San pham khong con ton tai | da ban ${item.totalSold}`;
            const minPrice = product.variants.length
              ? Math.min(...product.variants.map((variant) => Number(variant.price)))
              : 0;
            const stock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);
            return `${index + 1}. ${product.name} | ${product.category.name} | da ban ${item.totalSold} | gia tu ${this.formatMoney(minPrice)} | ton ${stock}`;
          })
          .join('\n')
      : '- Chua co du lieu ban chay.';

    const newestLines = newestProducts.length
      ? newestProducts
          .map((product) => {
            const minPrice = product.variants.length
              ? Math.min(...product.variants.map((variant) => Number(variant.price)))
              : 0;
            const stock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);
            return `- ${product.name} | ${product.category.name} | gia tu ${this.formatMoney(minPrice)} | ton ${stock}`;
          })
          .join('\n')
      : '- Chua co san pham.';

    const categoryLines = categories.length
      ? categories.map((category) => `- ${category.name} (${category.slug}): ${category._count.products} san pham`).join('\n')
      : '- Chua co danh muc.';

    return {
      title: 'San pham va danh muc',
      content: ['Top san pham ban chay:', topLines, 'San pham moi:', newestLines, 'Danh muc:', categoryLines].join('\n'),
    };
  }

  private async buildCustomersContext(): Promise<ContextBlock> {
    const weekStart = this.daysAgo(7);
    const [newUsers, topCustomers] = await Promise.all([
      prisma.user.findMany({
        where: { createdAt: { gte: weekStart } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { name: true, email: true, createdAt: true },
      }),
      prisma.order.groupBy({
        by: ['userId'],
        where: { status: { not: 'CANCELLED' } },
        _sum: { totalAmount: true },
        _count: { id: true },
        orderBy: { _sum: { totalAmount: 'desc' } },
        take: 8,
      }),
    ]);

    const users = await prisma.user.findMany({
      where: { id: { in: topCustomers.map((customer) => customer.userId) } },
      select: { id: true, name: true, email: true },
    });
    const userById = new Map(users.map((user) => [user.id, user]));

    return {
      title: 'Khach hang',
      content: [
        'Khach moi 7 ngay:',
        newUsers.length
          ? newUsers.map((user) => `- ${user.name} (${user.email}) | ${this.formatDate(user.createdAt)}`).join('\n')
          : '- Khong co khach moi trong 7 ngay.',
        'Khach co gia tri don hang cao:',
        topCustomers.length
          ? topCustomers
              .map((customer) => {
                const user = userById.get(customer.userId);
                return `- ${user?.name || customer.userId} (${user?.email || 'N/A'}) | ${customer._count.id} don | ${this.formatMoney(customer._sum.totalAmount)}`;
              })
              .join('\n')
          : '- Chua co du lieu khach hang mua hang.',
      ].join('\n'),
    };
  }

  private async buildReviewsContext(): Promise<ContextBlock> {
    const [avgRating, recentBadReviews, latestReviews] = await Promise.all([
      prisma.review.aggregate({ _avg: { rating: true }, _count: { id: true } }),
      prisma.review.findMany({
        where: { rating: { lte: 2 } },
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: { user: { select: { name: true } }, product: { select: { name: true } } },
      }),
      prisma.review.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: { user: { select: { name: true } }, product: { select: { name: true } } },
      }),
    ]);

    const badLines = recentBadReviews.length
      ? recentBadReviews
          .map((review) => `- ${review.product.name} | ${review.rating}/5 | ${review.user.name}: ${review.comment || 'Khong co binh luan'}`)
          .join('\n')
      : '- Khong co danh gia 1-2 sao gan day.';

    const latestLines = latestReviews.length
      ? latestReviews
          .map((review) => `- ${review.product.name} | ${review.rating}/5 | ${review.user.name}: ${review.comment || 'Khong co binh luan'}`)
          .join('\n')
      : '- Chua co danh gia.';

    return {
      title: 'Danh gia khach hang',
      content: [
        `Tong danh gia: ${avgRating._count.id}. Rating trung binh: ${avgRating._avg.rating?.toFixed(1) || 'N/A'}/5.`,
        'Danh gia thap can xu ly:',
        badLines,
        'Danh gia moi:',
        latestLines,
      ].join('\n'),
    };
  }

  private async buildVouchersContext(): Promise<ContextBlock> {
    const now = new Date();
    const vouchers = await prisma.voucher.findMany({
      where: { isActive: true },
      orderBy: { usedCount: 'desc' },
      take: 12,
    });

    const lines = vouchers.length
      ? vouchers
          .map((voucher) => {
            const discount =
              voucher.discountType === 'PERCENT'
                ? `${Number(voucher.discountValue)}%`
                : this.formatMoney(voucher.discountValue);
            const status = voucher.endDate < now ? 'het han' : 'dang hoat dong';
            const limit = voucher.usageLimit ? `${voucher.usedCount}/${voucher.usageLimit}` : `${voucher.usedCount}/khong gioi han`;
            return `- ${voucher.code} | ${discount} | da dung ${limit} | don toi thieu ${this.formatMoney(voucher.minOrderValue)} | HSD ${voucher.endDate.toLocaleDateString('vi-VN')} | ${status}`;
          })
          .join('\n')
      : '- Khong co voucher active.';

    return {
      title: 'Voucher va khuyen mai',
      content: lines,
    };
  }

  private async buildSupportContext(): Promise<ContextBlock> {
    const tickets = await prisma.supportTicket.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 10,
      include: {
        user: { select: { name: true, email: true } },
        _count: { select: { messages: true } },
      },
    });

    const lines = tickets.length
      ? tickets
          .map(
            (ticket) =>
              `- ${ticket.subject} | ${ticket.user.name} (${ticket.user.email}) | ${ticket.status} | ${ticket._count.messages} tin | cap nhat ${this.formatDate(ticket.updatedAt)}`
          )
          .join('\n')
      : '- Khong co ticket ho tro.';

    return {
      title: 'Ho tro khach hang',
      content: lines,
    };
  }

  private async buildContext(intent: AdminIntent) {
    const blocks: ContextBlock[] = [];

    const [overview, inventory] = await Promise.all([
      this.buildOverviewContext(),
      this.buildInventoryContext(),
    ]);
    blocks.push(overview, inventory);

    const builders: Array<Promise<ContextBlock>> = [];

    if (intent === 'greeting' || intent === 'overview') {
      builders.push(this.buildOrdersContext(), this.buildProductsContext(), this.buildSupportContext());
    }
    if (intent === 'revenue') builders.push(this.buildRevenueContext(), this.buildOrdersContext(), this.buildProductsContext());
    if (intent === 'orders') builders.push(this.buildOrdersContext());
    if (intent === 'inventory') builders.push(this.buildProductsContext());
    if (intent === 'products') builders.push(this.buildProductsContext(), this.buildReviewsContext());
    if (intent === 'customers') builders.push(this.buildCustomersContext(), this.buildOrdersContext());
    if (intent === 'reviews') builders.push(this.buildReviewsContext());
    if (intent === 'vouchers') builders.push(this.buildVouchersContext(), this.buildOrdersContext());
    if (intent === 'support') builders.push(this.buildSupportContext(), this.buildReviewsContext());

    blocks.push(...(await Promise.all(builders)));

    return blocks
      .map((block) => `## ${block.title}\n${block.content}`)
      .join('\n\n')
      .slice(0, 18000);
  }

  private fallbackAnswer(intent: AdminIntent, context: string) {
    if (intent === 'greeting') {
      return [
        'Da, em dang san sang ho tro Sep quan ly he thong.',
        'Em da nap nhanh so lieu tong quan, don hang, ton kho va ticket tu database. Sep co the hoi: doanh thu hom nay, don hang can xu ly, san pham sap het hang, top san pham ban chay, voucher hoac danh gia khach hang.',
      ].join('\n');
    }

    return [
      'Da thua Sep, hien Ollama chua phan hoi nen em tra ve bao cao nhanh tu database:',
      context
        .split('\n')
        .filter((line) => line.trim())
        .slice(0, 22)
        .join('\n'),
      'Goi y hanh dong: uu tien xu ly don dang cho, nhap them cac SKU sap het va kiem tra ticket dang mo.',
    ].join('\n');
  }

  async askAdminChatbot(adminId: string, message: string) {
    const cleanMessage = String(message || '').trim();
    if (!cleanMessage) {
      return 'Sep vui long nhap noi dung can em kiem tra.';
    }

    await prisma.chatMessage.create({
      data: {
        userId: adminId,
        role: 'user',
        content: cleanMessage,
        suggestedProducts: { isAdminChat: true } as any,
      },
    });

    const actionHistory = (
      await prisma.chatMessage.findMany({
        where: {
          userId: adminId,
          suggestedProducts: { path: ['isAdminChat'], equals: true },
        },
        orderBy: { createdAt: 'desc' },
        take: 8,
      })
    ).reverse();

    const pendingAction = this.getPendingAction(actionHistory);
    if (pendingAction && this.isCancelMessage(cleanMessage)) {
      const cancelMessage = 'Da huy lenh dang cho xac nhan. Database chua bi thay doi.';
      await prisma.chatMessage.create({
        data: {
          userId: adminId,
          role: 'assistant',
          content: cancelMessage,
          suggestedProducts: { isAdminChat: true } as any,
        },
      });

      return cancelMessage;
    }

    if (pendingAction && this.isConfirmMessage(cleanMessage)) {
      const confirmedResult = await this.tryExecuteAdminAction(pendingAction, actionHistory, true);
      const confirmedMessage = confirmedResult?.message || 'Em khong tim thay lenh dang cho xac nhan de thuc hien.';

      await prisma.chatMessage.create({
        data: {
          userId: adminId,
          role: 'assistant',
          content: confirmedMessage,
          suggestedProducts: { isAdminChat: true } as any,
        },
      });

      return confirmedMessage;
    }

    const actionResult = await this.tryExecuteAdminAction(cleanMessage, actionHistory);
    if (actionResult) {
      await prisma.chatMessage.create({
        data: {
          userId: adminId,
          role: 'assistant',
          content: actionResult.message,
          suggestedProducts: {
            isAdminChat: true,
            ...(actionResult.mode === 'confirm' && actionResult.actionMessage
              ? { pendingAdminAction: { actionMessage: actionResult.actionMessage, createdAt: new Date().toISOString() } }
              : {}),
          } as any,
        },
      });

      return actionResult.message;
    }

    const deterministicAnswer = await this.answerDeterministicQuestion(cleanMessage, actionHistory);
    if (deterministicAnswer) {
      await prisma.chatMessage.create({
        data: {
          userId: adminId,
          role: 'assistant',
          content: deterministicAnswer,
          suggestedProducts: { isAdminChat: true } as any,
        },
      });

      return deterministicAnswer;
    }

    const intent = this.detectIntent(cleanMessage);
    const [context, history] = await Promise.all([
      this.buildContext(intent),
      prisma.chatMessage.findMany({
        where: {
          userId: adminId,
          suggestedProducts: { path: ['isAdminChat'], equals: true },
        },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
    ]);

    const orderedHistory = history.reverse();
    const systemPrompt = [
      'Ban la Ultra Admin Assistant cua UltraShop.',
      'Tra loi bang tieng Viet, xung "em" va goi quan tri vien la "Sep".',
      'Chi dua tren du lieu realtime trong CONTEXT. Khong tu bia gia, doanh thu, ton kho, trang thai don hang hoac thong tin khach hang.',
      'Doanh thu chi duoc tinh tu so lieu da co trong context, uu tien don DELIVERED. Neu thieu du lieu, noi ro la he thong chua co du lieu.',
      'Khi noi ve don hang, phai giu dung ma don, ten khach, trang thai va gia tri don di kem nhau.',
      'Khi noi ve ton kho, neu co SKU sap het/het hang thi phai neu ro ten san pham, bien the, SKU va so luong.',
      'Cau tra loi nen co ket luan ngan, so lieu chinh, va 1-3 hanh dong uu tien.',
      '',
      'CONTEXT:',
      context,
    ].join('\n');

    try {
      const response = await fetch(this.ollamaUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.modelName,
          messages: [
            { role: 'system', content: systemPrompt },
            ...orderedHistory.map((item) => ({ role: item.role, content: item.content })),
          ],
          stream: false,
          keep_alive: -1,
          options: {
            temperature: 0.15,
            num_gpu: 0,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama service error: ${response.status}`);
      }

      const data: any = await response.json();
      const aiResponse = data?.message?.content?.trim() || this.fallbackAnswer(intent, context);

      await prisma.chatMessage.create({
        data: {
          userId: adminId,
          role: 'assistant',
          content: aiResponse,
          suggestedProducts: { isAdminChat: true } as any,
        },
      });

      return aiResponse;
    } catch (error) {
      console.error('Admin chatbot failed, using database fallback:', error);
      const fallback = this.fallbackAnswer(intent, context);

      await prisma.chatMessage.create({
        data: {
          userId: adminId,
          role: 'assistant',
          content: fallback,
          suggestedProducts: { isAdminChat: true } as any,
        },
      });

      return fallback;
    }
  }

  async getHistory(adminId: string) {
    return prisma.chatMessage.findMany({
      where: {
        userId: adminId,
        suggestedProducts: { path: ['isAdminChat'], equals: true },
      },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });
  }

  async clearHistory(adminId: string) {
    return prisma.chatMessage.deleteMany({
      where: {
        userId: adminId,
        suggestedProducts: { path: ['isAdminChat'], equals: true },
      },
    });
  }
}

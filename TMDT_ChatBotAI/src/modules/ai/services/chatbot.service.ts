import { prisma } from '../../../lib/prisma';
import { AIService } from './ai.service';
import { ProductService } from '../../product/services/product.service';

const aiService = new AIService();
const productService = new ProductService();

export class ChatbotService {
  private ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434/api/chat';
  private modelName = process.env.OLLAMA_MODEL || 'qwen2.5:3b';

  /**
   * Trò chuyện với khách hàng sử dụng Ollama và RAG toàn diện
   * Context sources: Products, Categories, Vouchers, Orders, Reviews, Payments, Support, Stock
   */
  async askChatbot(userId: string | null, message: string) {
    // 1. Lưu tin nhắn của User
    if (userId) {
      await prisma.chatMessage.create({
        data: { userId, role: 'user', content: message }
      });
    }

    const msgLower = message.toLowerCase();
    let productContext = 'Không có ngữ cảnh sản phẩm.';
    let relevantProducts: any[] = [];
    let categoryContext = '';
    let voucherContext = '';
    let orderContext = '';
    let reviewContext = '';
    let paymentContext = '';
    let supportContext = '';
    let stockContext = '';
    let history: any[] = [];
    try {
      // 2. Lấy lịch sử hội thoại sớm để xác định ngữ cảnh
      let contextCategoryId: string | undefined = undefined;

      if (userId) {
        history = await prisma.chatMessage.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 7
        });
        history.reverse();

        // Tìm danh mục gần nhất mà khách đang quan tâm từ gợi ý trước đó
        const lastAssistantMsg = [...history].reverse().find(h => h.role === 'assistant' && h.suggestedProducts && Array.isArray(h.suggestedProducts) && h.suggestedProducts.length > 0);
        if (lastAssistantMsg) {
          try {
            const firstProdId = (lastAssistantMsg.suggestedProducts as any)[0].id;
            const prod = await prisma.product.findUnique({ where: { id: firstProdId }, select: { categoryId: true } });
            if (prod) contextCategoryId = prod.categoryId;
          } catch (e) { }
        }
      }

      const nonProductKeywords = ['voucher', 'khuyến mãi', 'mã giảm', 'đơn hàng', 'hỗ trợ', 'ticket', 'thanh toán', 'mật khẩu', 'tài khoản'];
      const productKeywords = ['sản phẩm', 'mua', 'tìm', 'tivi', 'tủ lạnh', 'máy lạnh', 'máy giặt', 'máy lọc', 'bán chạy', 'hot', 'đánh giá', 'quạt', 'nồi', 'bếp', 'lọc'];

      const isAskingNonProduct = nonProductKeywords.some(k => msgLower.includes(k));
      const isAskingProduct = productKeywords.some(k => msgLower.includes(k));

      // 3. RAG: Lấy ngữ cảnh sản phẩm (Semantic Search)
      if (!isAskingNonProduct || isAskingProduct || msgLower.match(/\d+\s*(tr|triệu|k|đ)/)) {
        relevantProducts = await aiService.intelligentSearch(message, 10, contextCategoryId);

        if (relevantProducts.length > 0) {
          const topCategory = relevantProducts[0].categoryId;
          relevantProducts = relevantProducts
            .filter(p => p.categoryId === topCategory)
            .slice(0, 5);

          productContext = '--- DANH SÁCH SẢN PHẨM PHÙ HỢP TÌM KIẾM ---\n' + relevantProducts.map(p => {
            const minP = p.variants?.length > 0 ? Math.min(...p.variants.map((v: any) => Number(v.price))) : (Number(p.minPrice) || 0);
            const maxP = p.variants?.length > 0 ? Math.max(...p.variants.map((v: any) => Number(v.price))) : (Number(p.minPrice) || 0);
            const formattedPrice = minP === maxP
              ? `${minP.toLocaleString('vi-VN')} VNĐ (${(minP / 1000000).toFixed(2)} triệu)`
              : `${minP.toLocaleString('vi-VN')} - ${maxP.toLocaleString('vi-VN')} VNĐ (${(minP / 1000000).toFixed(2)} - ${(maxP / 1000000).toFixed(2)} triệu)`;

            const stockTotal = p.variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) || 0;
            const stockStatus = stockTotal > 20 ? 'Còn hàng' : stockTotal > 0 ? `Còn ${stockTotal} sản phẩm` : 'Hết hàng';

            // Format attributes
            const attrStr = p.attributes && Array.isArray(p.attributes) && p.attributes.length > 0
              ? ' | Thông số: ' + p.attributes.map((a: any) => `${a.key}: ${a.value}${a.unit ? a.unit : ''}`).join(', ')
              : '';

            return `- ${p.name} [Giá: ${formattedPrice}]: ${p.description?.substring(0, 100)}...${attrStr} | ${stockStatus} | Link: /product/${p.slug}`;
          }).join('\n');
        }
      }

      // 4. Context: Danh mục
      const allCategories = await prisma.category.findMany({
        where: { isDeleted: false },
        select: { name: true, _count: { select: { products: { where: { isDeleted: false } } } } }
      });
      categoryContext = '\n--- DANH MỤC SẢN PHẨM ---\n' + allCategories.map(c => `- ${c.name}: ${c._count.products} sản phẩm`).join('\n');

      // 5. Context: Bán chạy
      if (['bán chạy', 'hot', 'top'].some(k => msgLower.includes(k))) {
        const topProducts = await productService.getHotProducts(5);
        if (topProducts.length > 0) {
          productContext += '\n\n--- BÁN CHẠY ---\n' + topProducts.map(p => `${p.name} | Đã bán: ${p.soldCount}`).join('\n');
          relevantProducts = [...new Set([...topProducts, ...relevantProducts])].slice(0, 5);
        }
      }

      // 6. Context: Voucher
      if (['giảm giá', 'voucher', 'khuyến mãi'].some(k => msgLower.includes(k))) {
        const vouchers = await prisma.voucher.findMany({ where: { isActive: true, endDate: { gte: new Date() } }, take: 5 });
        voucherContext = vouchers.length > 0 ? '\n--- VOUCHER ---\n' + vouchers.map(v => `- ${v.code}: Giảm ${v.discountValue}`).join('\n') : '';
      }

      // 7. Context: Đơn hàng
      if (userId && ['đơn hàng', 'mua'].some(k => msgLower.includes(k))) {
        const orders = await prisma.order.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 3, include: { items: { include: { product: true } } } });
        orderContext = orders.length > 0 ? '\n--- ĐƠN HÀNG ---\n' + orders.map(o => `- #${o.id.slice(0, 8)}: ${o.status}`).join('\n') : '';
      }

    } catch (ragError: any) {
      console.warn('⚠️ RAG Error:', ragError.message);
    }

    // 10. Lịch sử hội thoại đã được lấy ở trên

    // 11. System Prompt toàn diện
    const systemPrompt = `
Bạn là "UltraShop Assistant" - Trợ lý mua sắm AI thông minh của cửa hàng UltraShop (E-commerce điện tử gia dụng).

DỮ LIỆU THỰC TẾ TỪ HỆ THỐNG:

${productContext}
${categoryContext}
${voucherContext}
${orderContext}
${reviewContext}
${paymentContext}
${supportContext}
${stockContext}

QUY TẮC BẮT BUỘC (QUAN TRỌNG):
1. Luôn trả lời bằng tiếng Việt, lịch sự, thân thiện.
2. KIỂM TRA KỸ DANH SÁCH SẢN PHẨM PHÙ HỢP BÊN DƯỚI. Bạn CHỈ ĐƯỢC PHÉP tư vấn các sản phẩm có trong danh sách này cho câu trả lời hiện tại. Tuyệt đối không lấy lại sản phẩm từ lịch sử nếu nó không xuất hiện trong danh sách mới (vì có thể nó không khớp với bộ lọc giá/tính năng mới của khách).
3. Nếu danh sách sản phẩm trống, hãy nói: "Dạ, hiện em chưa tìm thấy sản phẩm nào đúng yêu cầu này của Sếp, Sếp thử điều chỉnh lại tầm giá hoặc từ khóa xem sao ạ".
4. Khi giới thiệu sản phẩm, hãy nêu tên và giá (triệu đồng) để khách dễ nắm bắt.
5. ĐIỀU KIỆN BẮT BUỘC: Bạn PHẢI CHÈN text "Link: /product/[slug]" (với [slug] lấy từ dữ liệu) cho MỖI SẢN PHẨM KHUYÊN DÙNG. Nếu thiếu link, UI sẽ bị lỗi và không hiện sản phẩm cho khách! KHÔNG chèn link cho sản phẩm hết hàng hoặc bị loại trừ.
6. Nếu thực sự không có sản phẩm nào khớp, hãy gợi ý các sản phẩm cùng danh mục có giá gần nhất.
7. Trả lời ngắn gọn, dứt khoát. Sử dụng emoji thân thiện (😊, 🛒, ⭐).
8. Tuyệt đối không bịa đặt thông số hoặc giá sản phẩm không có trong dữ liệu.

VÍ DỤ TRẢ LỜI TỐT:
User: Tư vấn máy lạnh
AI: Dạ em gợi ý Sếp các mẫu máy lạnh này ạ:
- Máy lạnh Daikin Inverter 1 HP [Giá: 9.000.000 VNĐ]. Link: /product/may-lanh-daikin-1hp
- Máy lạnh Panasonic 1.5 HP [Giá: 12.000.000 VNĐ]. Link: /product/may-lanh-panasonic-1-5hp
User: Đơn hàng của tôi
AI: Dạ đơn hàng gần nhất của Sếp đang ở trạng thái PENDING ạ.
- Hỏi "sản phẩm A còn hàng không?": Cho biết chính xác số lượng tồn kho.
    `;

    const chatMessages = [
      { role: 'system', content: systemPrompt },
      ...history.map(h => ({ role: h.role, content: h.content }))
    ];

    if (!userId) {
      chatMessages.push({ role: 'user', content: message });
    }

    try {
      const response = await fetch(this.ollamaUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.modelName,
          messages: chatMessages,
          stream: false,
          keep_alive: -1
        })
      });

      if (!response.ok) throw new Error('Ollama service error');

      const data: any = await response.json();
      const aiResponse = data.message.content || 'Xin lỗi, tôi không thể trả lời lúc này.';

      // Lọc lại các sản phẩm thực sự được LLM gợi ý (có gắn link)
      const slugRegex = /\/product\/([a-zA-Z0-9-]+)/g;
      const mentionedSlugs = new Set<string>();
      let match;
      while ((match = slugRegex.exec(aiResponse)) !== null) {
        mentionedSlugs.add(match[1]);
      }

      const finalSuggestedProducts = mentionedSlugs.size > 0
        ? relevantProducts.filter(p => mentionedSlugs.has(p.slug))
        : relevantProducts.filter(p => {
          // Fallback nếu LLM quên chèn link: tìm theo tên sản phẩm (bỏ qua hậu tố dung lượng)
          const baseName = p.name.split(' (')[0].toLowerCase();
          return aiResponse.toLowerCase().includes(baseName);
        });

      // 12. Lưu phản hồi AI
      if (userId) {
        const productsData = finalSuggestedProducts.map(p => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          image: p.primaryImage
        }));

        await prisma.chatMessage.create({
          data: {
            userId,
            role: 'assistant',
            content: aiResponse,
            suggestedProducts: productsData as any
          }
        });
      }

      return {
        message: aiResponse,
        suggestedProducts: finalSuggestedProducts.map(p => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          image: p.primaryImage
        }))
      };
    } catch (error: any) {
      console.error('❌ Ollama Chatbot Error:', error);
      return {
        message: 'Dạ, hiện tại em (AI) đang bảo trì một chút ạ. Anh/chị cần hỗ trợ gì có thể nhắn trực tiếp cho Admin nhé!',
        suggestedProducts: relevantProducts.slice(0, 2)
      };
    }
  }

  /**
   * Lấy lịch sử trò chuyện của người dùng
   */
  async getHistory(userId: string) {
    return prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      take: 50
    });
  }

  /**
   * Làm trống lịch sử trò chuyện
   */
  async clearHistory(userId: string) {
    return prisma.chatMessage.deleteMany({
      where: { userId }
    });
  }
}

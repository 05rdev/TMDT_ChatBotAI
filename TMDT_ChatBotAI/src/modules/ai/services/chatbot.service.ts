import { prisma } from '../../../lib/prisma';
import { AIService } from './ai.service';

const aiService = new AIService();

export class ChatbotService {
  private ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434/api/chat';
  private modelName = process.env.OLLAMA_MODEL || 'qwen2.5:3b';

  /**
   * Trò chuyện với khách hàng sử dụng Ollama và RAG (Products, Vouchers, Orders)
   */
  async askChatbot(userId: string | null, message: string) {
    // 1. Lưu tin nhắn của User
    if (userId) {
      await prisma.chatMessage.create({
        data: { userId, role: 'user', content: message }
      });
    }

    let productContext = 'Không có ngữ cảnh sản phẩm.';
    let relevantProducts: any[] = [];
    let voucherContext = '';
    let orderContext = '';

    try {
      // 2. RAG: Lấy ngữ cảnh sản phẩm (Semantic Search)
      relevantProducts = await aiService.searchSemantic(message, 5);
      if (relevantProducts.length > 0) {
        productContext = relevantProducts.map(p =>
          `- ${p.name}: ${p.description?.substring(0, 100)}... (Giá từ: ${p.minPrice || 'Liên hệ'}). Link: /product/${p.slug}`
        ).join('\n');
      }

      // 3. RAG: Lấy ngữ cảnh Voucher (nếu hỏi về khuyến mãi/giảm giá)
      const voucherKeywords = ['giảm giá', 'voucher', 'khuyến mãi', 'mã giảm', 'code', 'ưu đãi'];
      if (voucherKeywords.some(k => message.toLowerCase().includes(k))) {
        const activeVouchers = await prisma.voucher.findMany({
          where: { isActive: true, endDate: { gte: new Date() } },
          take: 5
        });
        voucherContext = activeVouchers.length > 0
          ? '\n--- MÃ GIẢM GIÁ ĐANG CÓ ---\n' + activeVouchers.map((v: any) => 
              `- Mã: ${v.code} (${v.discountType === 'PERCENT' ? v.discountValue + '%' : Number(v.discountValue).toLocaleString() + 'đ'}). ĐK: Đơn từ ${Number(v.minOrderValue || 0).toLocaleString()}đ.`
            ).join('\n')
          : '\nHiện tại chưa có mã giảm giá mới.';
      }

      // 4. RAG: Lấy ngữ cảnh Đơn hàng (nếu hỏi về đơn của tôi)
      const orderKeywords = ['đơn hàng', 'mua', 'lịch sử', 'trạng thái đơn', 'vận chuyển'];
      if (userId && orderKeywords.some(k => message.toLowerCase().includes(k))) {
        const recentOrders = await prisma.order.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 3,
          include: { items: { include: { product: { select: { name: true } } } } }
        });
        orderContext = recentOrders.length > 0
          ? '\n--- ĐƠN HÀNG GẦN ĐÂY CỦA BẠN ---\n' + recentOrders.map((o: any) => 
              `- Đơn #${String(o.id).slice(0, 8)}: ${o.status}. Gồm: ${o.items.map((i: any) => i.product.name).join(', ')}. Tổng: ${Number(o.totalAmount).toLocaleString()}đ.`
            ).join('\n')
          : '\nBạn chưa có đơn hàng nào.';
      }
    } catch (ragError) {
      console.warn('⚠️ RAG Enhancement Failed, continuing with basic chat:', ragError);
    }

    // 5. Lấy lịch sử hội thoại
    let history: any[] = [];
    if (userId) {
      history = await prisma.chatMessage.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 6
      });
      history.reverse();
    }

    // 6. Gọi Ollama API
    const systemPrompt = `
      Bạn là "UltraShop Assistant" - Trợ lý mua sắm AI.
      Dưới đây là thông tin thực tế từ hệ thống:
      
      ${productContext}
      ${voucherContext}
      ${orderContext}

      QUY TẮC:
      - Luôn trả lời bằng tiếng Việt, lịch sự, thân thiện.
      - Tuyệt đối không tiết lộ thông tin của người dùng khác.
      - Nếu khách hỏi về đơn hàng hoặc voucher mà không có trong dữ liệu trên, hãy báo khách kiểm tra lại hoặc liên hệ admin.
      - Trả lời ngắn gọn, tập trung vào giải quyết vấn đề.
    `;

    const chatMessages = [
      { role: 'system', content: systemPrompt },
      ...history.map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: message }
    ];

    try {
      const response = await fetch(this.ollamaUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.modelName,
          messages: chatMessages,
          stream: false
        })
      });

      if (!response.ok) throw new Error('Ollama service error');

      const data: any = await response.json();
      const aiResponse = data.message.content || 'Xin lỗi, tôi không thể trả lời lúc này.';

      // 7. Lưu phản hồi của AI
      if (userId) {
        await prisma.chatMessage.create({
          data: { userId, role: 'assistant', content: aiResponse }
        });
      }

      return {
        message: aiResponse,
        suggestedProducts: relevantProducts.map(p => ({
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

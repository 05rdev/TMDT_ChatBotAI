import { prisma } from '../../../lib/prisma';
import { AIService } from './ai.service';
import OpenAI from 'openai';

const aiService = new AIService();

export class ChatbotService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Trò chuyện với khách hàng sử dụng cơ chế RAG chuyên sâu
   */
  async askChatbot(userId: string | null, message: string) {
    // 1. Lưu tin nhắn của User vào Database (nếu đã đăng nhập)
    if (userId) {
      await prisma.chatMessage.create({
        data: { userId, role: 'user', content: message }
      });
    }

    // 2. RAG Step 1: Retrieval sử dụng Semantic Search (Có khả năng hiểu giá)
    // Ví dụ: User hỏi "Tìm laptop dưới 10tr" -> searchSemantic sẽ xử lý chính xác
    const relevantProducts = await aiService.searchSemantic(message, 5);

    // Tạo ngữ cảnh sản phẩm chi tiết cho AI
    const productContext = relevantProducts.length > 0
      ? relevantProducts.map(p =>
        `- ${p.name}: ${p.description?.substring(0, 150)}... (Giá từ: ${p.minPrice || 'Liên hệ'}). Link chi tiết: /product/${p.slug}`
      ).join('\n')
      : 'Hiện tại chưa tìm thấy sản phẩm nào khớp hoàn toàn với yêu cầu của bạn trong kho.';

    // 3. RAG Step 2: Lấy lịch sử hội thoại gần nhất (Memory)
    let history: any[] = [];
    if (userId) {
      history = await prisma.chatMessage.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 6
      });
      history.reverse();
    }

    // 4. Generation: Sinh phản hồi với Persona "Shopping Assistant" chuyên nghiệp
    const systemPrompt = `
      Bạn là "UltraShop Assistant" - một chuyên gia tư vấn mua sắm thông minh, nhiệt tình và am hiểu sản phẩm.
      Nhiệm vụ của bạn là giúp khách hàng tìm được sản phẩm ưng ý nhất từ danh sách sản phẩm thực tế được cung cấp dưới đây.

      --- DANH SÁCH SẢN PHẨM TRONG KHO (Dữ liệu thực tế) ---
      ${productContext}
      --- HẾT DANH SÁCH ---

      QUY TẮC CỐT LÕI:
      1. THÁI ĐỘ: Luôn lịch sự, sử dụng các từ ngữ như "Dạ", "Vâng", "Chào bạn", "Chúc bạn một ngày tốt lành".
      2. TRUNG THỰC: Chỉ tư vấn dựa trên danh sách sản phẩm trên. Nếu sản phẩm khách hỏi không có, hãy khéo léo giới thiệu sản phẩm tương tự có sẵn.
      3. CHUYÊN NGHIỆP: Phân tích ngắn gọn ưu điểm của sản phẩm (ví dụ: "Sản phẩm này rất phù hợp với ngân sách của bạn").
      4. KÊU GỌI: Luôn kết thúc bằng một câu hỏi gợi mở hoặc hướng dẫn khách hàng xem chi tiết/thêm vào giỏ hàng.
      5. NGỮ CẢNH: Chú ý đến lịch sử hội thoại để trả lời các câu hỏi nối tiếp (VD: "Cái này" là sản phẩm vừa nhắc tới).
    `;

    const chatMessages: any[] = [
      { role: 'system', content: systemPrompt },
      ...history.map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: message }
    ];

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: chatMessages,
        temperature: 0.6,
        max_tokens: 800,
      });

      const aiResponse = completion.choices[0].message.content || 'Dạ, hiện tại hệ thống của em đang gặp chút trục trặc nhỏ, anh/chị vui lòng thử lại sau giây lát nhé!';

      // 5. Lưu phản hồi của AI vào Database
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
      console.error('❌ AI Chatbot Error:', error);
      throw new Error('Dịch vụ AI đang tạm thời gián đoạn. Vui lòng thử lại sau.');
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

import { prisma } from '../../../lib/prisma';
import { AIService } from './ai.service';

const aiService = new AIService();

// Tag đặc biệt để phân biệt tin nhắn admin vs user chatbot
// Vì schema ChatMessage không có field type, ta dùng prefix trong content khi query
const ADMIN_CHAT_PREFIX = '__ADMIN__';

export class AdminChatbotService {
  private ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434/api/chat';
  private modelName = process.env.OLLAMA_MODEL || 'qwen2.5:3b';

  /**
   * Trò chuyện với Admin (Hỗ trợ quản trị hệ thống)
   */
  async askAdminChatbot(adminId: string, message: string) {
    // 1. Lưu tin nhắn của Admin (với marker để phân biệt với chat user thông thường)
    await prisma.chatMessage.create({
      data: { 
        userId: adminId, 
        role: 'user', 
        content: message,
        // Dùng suggestedProducts field để đánh dấu đây là admin chat
        // (Cách tốt hơn là thêm column "chatType" vào schema)
        suggestedProducts: { isAdminChat: true } as any
      }
    });

    // 2. Lấy dữ liệu thống kê tổng quan
    const [userCount, productCount, orderCount, totalRevenue, latestOrders, lowStockProducts, pendingTickets] =
      await Promise.all([
        prisma.user.count({ where: { isActive: true } }),
        prisma.product.count({ where: { isDeleted: false } }),
        prisma.order.count(),
        prisma.order.aggregate({
          where: { status: 'DELIVERED' },
          _sum: { totalAmount: true }
        }),
        prisma.order.findMany({
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: { user: { select: { name: true } } }
        }),
        prisma.productVariant.findMany({
          where: { stock: { lt: 10 } },
          take: 5,
          include: { product: { select: { name: true } } }
        }),
        prisma.supportTicket.count({ where: { status: 'OPEN' } })
      ]);

    const revenueAmount = totalRevenue?._sum?.totalAmount ? Number(totalRevenue._sum.totalAmount) : 0;

    const adminContext = `
      THỐNG KÊ HỆ THỐNG:
      - Tổng khách hàng (Active): ${userCount}
      - Tổng sản phẩm: ${productCount}
      - Tổng đơn hàng: ${orderCount}
      - Doanh thu (Giao thành công): ${revenueAmount.toLocaleString()}đ
      - Ticket hỗ trợ đang chờ: ${pendingTickets}

      ĐƠN HÀNG MỚI NHẤT:
      ${latestOrders.map(o => `- Đơn #${o.id.slice(0, 8)}: ${o.user.name} (${Number(o.totalAmount).toLocaleString()}đ) - ${o.status}`).join('\n')}

      CẢNH BÁO KHO HÀNG (Sắp hết):
      ${lowStockProducts.length > 0 
        ? lowStockProducts.map(p => `- ${p.product.name} (${p.name}): Còn ${p.stock}`).join('\n')
        : '- Không có sản phẩm nào sắp hết hàng.'}
    `;

    const systemPrompt = `
      Bạn là "Ultra Admin Assistant" - Cố vấn quản trị hệ thống UltraShop.
      Bạn có quyền truy cập vào dữ liệu quản trị sau:
      
      ${adminContext}

      QUY TẮC:
      - Luôn trả lời bằng tiếng Việt, chuyên nghiệp, súc tích.
      - Hỗ trợ Admin phân tích dữ liệu, đưa ra cảnh báo hoặc gợi ý hành động (Vd: Nhập thêm hàng, phản hồi ticket).
      - Trả lời dựa trên số liệu thực tế được cung cấp.
    `;

    // 3. Lấy lịch sử hội thoại ADMIN (lọc theo marker isAdminChat)
    const history = await prisma.chatMessage.findMany({
      where: { 
        userId: adminId,
        // Chỉ lấy tin nhắn admin chat, không lẫn với chatbot user thông thường
        suggestedProducts: { path: ['isAdminChat'], equals: true }
      },
      orderBy: { createdAt: 'desc' },
      take: 7
    });
    history.reverse();

    try {
      const response = await fetch(this.ollamaUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.modelName,
          messages: [
            { role: 'system', content: systemPrompt },
            ...history.map(h => ({ role: h.role, content: h.content }))
          ],
          stream: false
        })
      });

      if (!response.ok) throw new Error('Ollama service error');

      const data: any = await response.json();
      const aiResponse = data.message.content;

      // 4. Lưu phản hồi của AI (cũng đánh dấu admin chat)
      await prisma.chatMessage.create({
        data: { 
          userId: adminId, 
          role: 'assistant', 
          content: aiResponse,
          suggestedProducts: { isAdminChat: true } as any
        }
      });

      return aiResponse;
    } catch (error) {
      console.error('❌ Admin Chatbot Error:', error);
      return 'Dạ, hiện tại em không thể truy xuất dữ liệu hệ thống. Anh/chị vui lòng kiểm tra lại kết nối Ollama.';
    }
  }

  /**
   * Lấy lịch sử trò chuyện của Admin (chỉ lấy admin chat, không lẫn user chatbot)
   */
  async getHistory(adminId: string) {
    return prisma.chatMessage.findMany({
      where: { 
        userId: adminId,
        suggestedProducts: { path: ['isAdminChat'], equals: true }
      },
      orderBy: { createdAt: 'asc' },
      take: 50
    });
  }

  /**
   * Làm trống lịch sử trò chuyện Admin
   */
  async clearHistory(adminId: string) {
    return prisma.chatMessage.deleteMany({
      where: { 
        userId: adminId,
        suggestedProducts: { path: ['isAdminChat'], equals: true }
      }
    });
  }
}
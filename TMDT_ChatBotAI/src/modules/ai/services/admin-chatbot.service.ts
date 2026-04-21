import { prisma } from '../../../lib/prisma';
import { AIService } from './ai.service';

const aiService = new AIService();

export class AdminChatbotService {
  private ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434/api/chat';
  private modelName = process.env.OLLAMA_MODEL || 'qwen2.5:3b';

  /**
   * Trò chuyện với Admin (Hỗ trợ quản trị hệ thống)
   */
  async askAdminChatbot(adminId: string, message: string) {
    // 1. Lưu tin nhắn của Admin
    await prisma.chatMessage.create({
      data: { userId: adminId, role: 'user', content: message }
    });

    // 2. Lấy dữ liệu thống kê tổng quan
    const userCount = await prisma.user.count({ where: { isActive: true } });
    const productCount = await prisma.product.count({ where: { isDeleted: false } });
    const orderCount = await prisma.order.count();
    const totalRevenue = await prisma.order.aggregate({
      where: { status: 'DELIVERED' }, // Prisma enum uses DELIVERED
      _sum: { totalAmount: true }
    });

    // 3. Lấy danh sách đơn hàng mới nhất
    const latestOrders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { user: { select: { name: true } } }
    });

    // 4. Lấy sản phẩm sắp hết hàng
    const lowStockProducts = await prisma.productVariant.findMany({
      where: { stock: { lt: 10 } },
      take: 5,
      include: { product: { select: { name: true } } }
    });

    // 5. Lấy Support Ticket đang chờ
    const pendingTickets = await prisma.supportTicket.count({ where: { status: 'OPEN' } });

    // 6. Ngữ cảnh Admin
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
      ${lowStockProducts.map(p => `- ${p.product.name} (${p.name}): Còn ${p.stock}`).join('\n')}
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

    // 7. Lấy lịch sử hội thoại
    const history = await prisma.chatMessage.findMany({
      where: { userId: adminId },
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

      // 8. Lưu phản hồi của AI
      await prisma.chatMessage.create({
        data: { userId: adminId, role: 'assistant', content: aiResponse }
      });

      return aiResponse;
    } catch (error) {
      console.error('❌ Admin Chatbot Error:', error);
      return 'Dạ, hiện tại em không thể truy xuất dữ liệu hệ thống. Anh/chị vui lòng kiểm tra lại kết nối Ollama.';
    }
  }

  /**
   * Lấy lịch sử trò chuyện của Admin
   */
  async getHistory(adminId: string) {
    return prisma.chatMessage.findMany({
      where: { userId: adminId },
      orderBy: { createdAt: 'asc' },
      take: 50
    });
  }

  /**
   * Làm trống lịch sử trò chuyện
   */
  async clearHistory(adminId: string) {
    return prisma.chatMessage.deleteMany({
      where: { userId: adminId }
    });
  }
}

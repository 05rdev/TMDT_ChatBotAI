import { prisma } from '../../../lib/prisma';
import { AIService } from './ai.service';
import { ProductService } from '../../product/services/product.service';
import { Prisma } from '@prisma/client';

const aiService = new AIService();
const productService = new ProductService();

export class AdminChatbotService {
  private ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434/api/chat';
  private modelName = process.env.OLLAMA_MODEL || 'qwen2.5:3b';

  /**
   * Trò chuyện với Admin - RAG toàn diện từ database
   * Context: Revenue, Orders, Products, Users, Reviews, Vouchers, Support, Behaviors
   */
  async askAdminChatbot(adminId: string, message: string) {
    // 1. Lưu tin nhắn Admin
    await prisma.chatMessage.create({
      data: {
        userId: adminId,
        role: 'user',
        content: message,
        suggestedProducts: { isAdminChat: true } as any
      }
    });

    const msgLower = message.toLowerCase();

    // 2. Xây dựng context toàn diện từ database
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // ====== THỐNG KÊ TỔNG QUAN ======
    const [
      userCount,
      newUsersToday,
      newUsersThisWeek,
      productCount,
      totalOrders,
      ordersToday,
      ordersPending,
      ordersProcessing,
      revenueTotal,
      revenueToday,
      revenueThisWeek,
      revenueThisMonth,
      pendingTickets,
      totalReviews,
    ] = await Promise.all([
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.user.count({ where: { createdAt: { gte: weekStart } } }),
      prisma.product.count({ where: { isDeleted: false } }),
      prisma.order.count(),
      prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'PROCESSING' } }),
      prisma.order.aggregate({ where: { status: 'DELIVERED' }, _sum: { totalAmount: true } }),
      prisma.order.aggregate({ where: { status: 'DELIVERED', createdAt: { gte: todayStart } }, _sum: { totalAmount: true } }),
      prisma.order.aggregate({ where: { status: 'DELIVERED', createdAt: { gte: weekStart } }, _sum: { totalAmount: true } }),
      prisma.order.aggregate({ where: { status: 'DELIVERED', createdAt: { gte: monthStart } }, _sum: { totalAmount: true } }),
      prisma.supportTicket.count({ where: { status: 'OPEN' } }),
      prisma.review.count(),
    ]);

    const fmt = (v: any) => v?._sum?.totalAmount ? Number(v._sum.totalAmount).toLocaleString() : '0';

    let overviewContext = `
📊 THỐNG KÊ TỔNG QUAN:
- Tổng khách hàng (active): ${userCount} | Mới hôm nay: ${newUsersToday} | Mới tuần này: ${newUsersThisWeek}
- Tổng sản phẩm (active): ${productCount}
- Tổng đơn hàng: ${totalOrders} | Hôm nay: ${ordersToday} | Chờ duyệt (PENDING): ${ordersPending} | Đang gói (PROCESSING): ${ordersProcessing}
- 💰 Doanh thu (giao thành công): Tổng: ${fmt(revenueTotal)}đ | Hôm nay: ${fmt(revenueToday)}đ | Tuần: ${fmt(revenueThisWeek)}đ | Tháng: ${fmt(revenueThisMonth)}đ
- Ticket hỗ trợ đang mở: ${pendingTickets}
- Tổng đánh giá: ${totalReviews}`;

    // ====== ĐƠN HÀNG CHI TIẾT (Lấy nhiều hơn để AI có context) ======
    const [latestOrders, pendingOrders, processingOrders] = await Promise.all([
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          user: { select: { name: true, email: true } },
          items: { include: { product: { select: { name: true } } } },
          payment: { select: { method: true, status: true } }
        }
      }),
      prisma.order.findMany({
        where: { status: 'PENDING' },
        take: 10,
        include: { user: { select: { name: true } }, items: { include: { product: { select: { name: true } } } } }
      }),
      prisma.order.findMany({
        where: { status: 'PROCESSING' },
        take: 10,
        include: { user: { select: { name: true } }, items: { include: { product: { select: { name: true } } } } }
      })
    ]);

    const { translateOrderStatus, translatePaymentStatus } = require('../../../utils/status-mapper');
    
    let ordersContext = '\n📦 DANH SÁCH ĐƠN HÀNG CHI TIẾT:\n' + latestOrders.map(o =>
      `- #${o.id.slice(0, 8)}: ${(o as any).user.name} | ${translateOrderStatus(o.status)} | ${Number(o.totalAmount).toLocaleString()}đ | SP: ${o.items.map((i: any) => i.product.name).join(', ')} | ${new Date(o.createdAt).toLocaleString('vi-VN')}`
    ).join('\n');

    if (pendingOrders.length > 0) {
      ordersContext += '\n\n🔍 CHI TIẾT ĐƠN CHỜ DUYỆT (PENDING):\n' + pendingOrders.map(o => 
        `- Đơn #${o.id.slice(0, 8)}: Khách ${o.user.name} | Tổng ${Number(o.totalAmount).toLocaleString()}đ | Sản phẩm: ${o.items.map((i: any) => i.product.name).join(', ')}`
      ).join('\n');
    }

    if (processingOrders.length > 0) {
      ordersContext += '\n\n🔍 CHI TIẾT ĐƠN ĐANG GÓI (PROCESSING):\n' + processingOrders.map(o => 
        `- Đơn #${o.id.slice(0, 8)}: Khách ${o.user.name} | Tổng ${Number(o.totalAmount).toLocaleString()}đ | Sản phẩm: ${o.items.map((i: any) => i.product.name).join(', ')}`
      ).join('\n');
    }

    // ====== CẢNH BÁO KHO HÀNG ======
    const lowStockProducts = await prisma.productVariant.findMany({
      where: { stock: { lt: 10 } },
      take: 10,
      include: { product: { select: { name: true } } },
      orderBy: { stock: 'asc' }
    });
    let stockContext = '\n⚠️ CẢNH BÁO KHO (Dưới 10 sản phẩm):\n' +
      (lowStockProducts.length > 0
        ? lowStockProducts.map(p => `- ${p.product.name} (${p.name}): Còn ${p.stock} | SKU: ${p.sku}`).join('\n')
        : '- ✅ Tất cả sản phẩm đều đủ hàng.');

    // ====== TOP SẢN PHẨM BÁN CHẠY ======
    let topProductsContext = '';
    const topProductKeywords = ['bán chạy', 'top', 'nổi bật', 'best seller', 'phổ biến', 'sản phẩm nào'];
    if (topProductKeywords.some(k => msgLower.includes(k)) || true) {
      const topProducts = await productService.getHotProducts(10);
      if (topProducts.length > 0) {
        topProductsContext = '\n🏆 TOP SẢN PHẨM BÁN CHẠY:\n' + topProducts.map((p: any, i: number) => {
          return `${i + 1}. ${p.name || 'N/A'}: ${p.soldCount || 0} sản phẩm đã bán`;
        }).join('\n');
      }
    }

    // ====== ĐÁNH GIÁ / REVIEWS ======
    let reviewsContext = '';
    const reviewKeywords = ['đánh giá', 'review', 'rating', 'phản hồi', 'sao', 'hài lòng'];
    if (reviewKeywords.some(k => msgLower.includes(k)) || true) {
      const avgRating = await prisma.review.aggregate({ _avg: { rating: true } });
      const recentBadReviews = await prisma.review.findMany({
        where: { rating: { lte: 2 } },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { user: { select: { name: true } }, product: { select: { name: true } } }
      });
      reviewsContext = `\n⭐ ĐÁNH GIÁ TỔNG QUAN:
- Tổng đánh giá: ${totalReviews} | Rating trung bình: ${avgRating._avg.rating ? avgRating._avg.rating.toFixed(1) : 'N/A'}/5`;
      if (recentBadReviews.length > 0) {
        reviewsContext += '\n- ⚠️ Đánh giá thấp gần đây:\n' + recentBadReviews.map(r =>
          `  + ${r.product.name}: ${r.rating}⭐ bởi ${r.user.name} - "${r.comment?.substring(0, 80) || 'Không comment'}"`
        ).join('\n');
      }
    }

    // ====== VOUCHER ANALYTICS ======
    let voucherContext = '';
    const voucherKeywords = ['voucher', 'mã giảm', 'khuyến mãi', 'ưu đãi', 'giảm giá'];
    if (voucherKeywords.some(k => msgLower.includes(k)) || true) {
      const activeVouchers = await prisma.voucher.findMany({
        where: { isActive: true },
        orderBy: { usedCount: 'desc' },
        take: 10
      });
      voucherContext = '\n🎟️ VOUCHER ĐANG HOẠT ĐỘNG:\n' +
        (activeVouchers.length > 0
          ? activeVouchers.map(v =>
              `- "${v.code}": Giảm ${v.discountType === 'PERCENT' ? v.discountValue + '%' : Number(v.discountValue).toLocaleString() + 'đ'} | Đã dùng: ${v.usedCount}/${v.usageLimit} lượt | HSD: ${new Date(v.endDate).toLocaleDateString('vi-VN')} | ${new Date(v.endDate) < now ? '⛔ Hết hạn' : '✅ Còn hiệu lực'}`
            ).join('\n')
          : '- Chưa có voucher nào đang hoạt động.');
    }

    // ====== DOANH THU THEO DANH MỤC ======
    let categoryRevenueContext = '';
    const catRevKeywords = ['danh mục', 'category', 'phân loại', 'ngành hàng'];
    if (catRevKeywords.some(k => msgLower.includes(k)) || true) {
      const categories = await prisma.category.findMany({
        where: { isDeleted: false },
        select: {
          name: true,
          _count: { select: { products: { where: { isDeleted: false } } } }
        }
      });
      categoryRevenueContext = '\n📂 SẢN PHẨM THEO DANH MỤC:\n' + categories.map(c =>
        `- ${c.name}: ${c._count.products} sản phẩm`
      ).join('\n');
    }

    // ====== SUPPORT TICKETS ======
    let supportContext = '';
    if (true) {
      const recentTickets = await prisma.supportTicket.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          user: { select: { name: true, email: true } },
          _count: { select: { messages: true } }
        }
      });
      supportContext = '\n🎫 TICKET HỖ TRỢ GẦN ĐÂY:\n' +
        (recentTickets.length > 0
          ? recentTickets.map(t =>
              `- "${t.subject}" bởi ${t.user.name} (${t.user.email}) | ${t.status === 'OPEN' ? '🟢 Đang mở' : '🔴 Đã đóng'} | ${t._count.messages} tin nhắn | ${new Date(t.createdAt).toLocaleDateString('vi-VN')}`
            ).join('\n')
          : '- Không có ticket nào.');
    }

    // 3. System Prompt
    const systemPrompt = `
Bạn là "Ultra Admin Assistant" - Cố vấn quản trị hệ thống UltraShop cấp cao.
Bạn có QUYỀN TRUY CẬP TOÀN BỘ dữ liệu quản trị sau:

${overviewContext}
${ordersContext}
${stockContext}
${topProductsContext}
${reviewsContext}
${voucherContext}
${categoryRevenueContext}
${supportContext}

QUY TẮC ADMIN ASSISTANT:
1. Luôn trả lời bằng tiếng Việt, chuyên nghiệp, súc tích. Xưng hô "Em" và gọi admin là "Sếp".
2. Trả lời DỰA TRÊN SỐ LIỆU THỰC TẾ TRONG NGỮ CẢNH HIỆN TẠI. Tuyệt đối không bịa đặt.
3. THỜI GIAN THỰC: Dữ liệu này vừa được truy xuất lúc ${now.toLocaleString('vi-VN')}. 
   => Nếu số liệu này khác với những gì đã nói ở tin nhắn trước, Sếp phải hiểu đây mới là số liệu mới nhất.
4. QUY ƯỚC TRẠNG THÁI ĐƠN HÀNG:
   - PENDING: Chờ duyệt
   - PROCESSING: Đang gói (Sếp thường gọi là "đang gói")
   - SHIPPED: Đang giao hàng
   - DELIVERED: Hoàn tất
   - CANCELLED: Đã hủy
   => Nếu khách hỏi "đang gói", hãy dùng số liệu của "Đang gói (PROCESSING)".
5. Khi được hỏi phân tích, hãy:
   - Chỉ ra xu hướng (tăng/giảm so với kỳ trước)
   - Đưa ra GỢI Ý HÀNH ĐỘNG cụ thể (VD: "Nên nhập thêm hàng cho SP X", "Cần phản hồi ticket")
   - Cảnh báo rủi ro nếu có
6. Format trả lời rõ ràng, dùng bullet points, emoji vừa phải.
7. Nếu được hỏi về thông tin không có trong dữ liệu, nói rõ "Dạ thưa Sếp, hiện em chưa thấy thông tin chi tiết về phần này trong hệ thống ạ".
8. Chủ động cảnh báo nếu phát hiện: Hàng sắp hết, đơn chờ xử lý nhiều, đánh giá thấp.

CÁC LOẠI CÂU HỎI THƯỜNG GẶP:
- "Doanh thu hôm nay?" → Báo cáo doanh thu chi tiết
- "Sản phẩm bán chạy?" → Liệt kê top sản phẩm + số lượng
- "Kiểm tra kho?" → Cảnh báo sản phẩm sắp hết
- "Báo cáo tổng quan?" → Tổng hợp toàn bộ số liệu
- "Đơn hàng chờ?" → Liệt kê đơn pending/processing
- "Đánh giá khách hàng?" → Rating trung bình + đánh giá thấp cần chú ý
    `;

    // 4. Lấy lịch sử admin chat
    const history = await prisma.chatMessage.findMany({
      where: {
        userId: adminId,
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

      // 5. Lưu phản hồi AI
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
      return 'Dạ, hiện tại em không thể truy xuất dữ liệu hệ thống. Sếp vui lòng kiểm tra lại kết nối Ollama.';
    }
  }

  /**
   * Lấy lịch sử trò chuyện Admin
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
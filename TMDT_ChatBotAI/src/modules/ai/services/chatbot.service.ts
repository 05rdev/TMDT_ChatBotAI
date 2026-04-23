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

    try {
      // 2. Xác định xem người dùng có đang hỏi các vấn đề không liên quan đến tìm sản phẩm hay không
      const nonProductKeywords = ['voucher', 'khuyến mãi', 'mã giảm', 'đơn hàng', 'hỗ trợ', 'ticket', 'thanh toán', 'mật khẩu', 'tài khoản'];
      const productKeywords = ['sản phẩm', 'mua', 'tìm', 'tivi', 'tủ lạnh', 'máy lạnh', 'máy giặt', 'máy lọc', 'bán chạy', 'hot', 'đánh giá'];
      
      const isAskingNonProduct = nonProductKeywords.some(k => msgLower.includes(k));
      const isAskingProduct = productKeywords.some(k => msgLower.includes(k));

      // 3. RAG: Lấy ngữ cảnh sản phẩm (Semantic Search) - Bỏ qua nếu chỉ hỏi voucher/đơn hàng
      if (!isAskingNonProduct || isAskingProduct) {
        relevantProducts = await aiService.intelligentSearch(message, 5);
        if (relevantProducts.length > 0) {
          productContext = '--- DANH SÁCH SẢN PHẨM PHÙ HỢP TÌM KIẾM ---\n' + relevantProducts.map(p => {
            const priceRange = p.variants?.length > 1
              ? `${Math.min(...p.variants.map((v: any) => Number(v.price))).toLocaleString('vi-VN')} - ${Math.max(...p.variants.map((v: any) => Number(v.price))).toLocaleString('vi-VN')} VNĐ`
              : `${(p.minPrice || 0).toLocaleString('vi-VN')} VNĐ`;
            const stockTotal = p.variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) || 0;
            const stockStatus = stockTotal > 20 ? 'Còn hàng' : stockTotal > 0 ? `Còn ${stockTotal} sản phẩm` : 'Hết hàng';
            return `- ${p.name}: ${p.description?.substring(0, 120)}... | Giá: ${priceRange} | ${stockStatus} | Đánh giá: ${p.averageRating || 'Chưa có'}⭐ (${p.totalReviews || 0} đánh giá) | Đã bán: ${p.soldCount || 0} | Link: /product/${p.slug}`;
          }).join('\n');
        }
      }

      // 3. Context: Danh mục sản phẩm - LUÔN CUNG CẤP
      const allCategories = await prisma.category.findMany({
        where: { isDeleted: false },
        select: { name: true, slug: true, _count: { select: { products: { where: { isDeleted: false } } } } }
      });
      categoryContext = '\n--- DANH MỤC SẢN PHẨM ---\n' + allCategories.map(c =>
        `- ${c.name}: ${c._count.products} sản phẩm (Xem: /shop?categoryId=...)`
      ).join('\n');

      // 3.5. Context: Sản phẩm bán chạy
      const trendingKeywords = ['bán chạy', 'hot', 'phổ biến', 'nhiều người mua', 'top', 'best seller'];
      if (trendingKeywords.some(k => msgLower.includes(k))) {
        const topProducts = await productService.getHotProducts(5);
        if (topProducts.length > 0) {
          productContext += '\n\n--- DANH SÁCH SẢN PHẨM BÁN CHẠY NHẤT HỆ THỐNG ---\n' + topProducts.map((p: any, idx: number) => {
             const priceRange = p.variants?.length > 1
              ? `${Math.min(...p.variants.map((v: any) => Number(v.price))).toLocaleString('vi-VN')} - ${Math.max(...p.variants.map((v: any) => Number(v.price))).toLocaleString('vi-VN')} VNĐ`
              : `${(p.minPrice || 0).toLocaleString('vi-VN')} VNĐ`;
             return `[TOP ${idx+1}] - ${p.name} | Giá: ${priceRange} | Đã bán: ${p.soldCount || 0} | Đánh giá: ${p.averageRating || 0}⭐ | Link: /product/${p.slug}`;
          }).join('\n');
          
          // Đưa sản phẩm bán chạy lên đầu mảng relevantProducts để hiển thị card trong UI
          for (let i = topProducts.length - 1; i >= 0; i--) {
             const tp = topProducts[i];
             // Loại bỏ nếu đã có trong mảng để đưa lên đầu
             relevantProducts = relevantProducts.filter(rp => rp.id !== tp.id);
             relevantProducts.unshift(tp);
          }
          relevantProducts = relevantProducts.slice(0, 5); // Giữ tối đa 5 thẻ
        }
      }

      // 3.6. Context: Sản phẩm đánh giá cao
      const topRatedKeywords = ['đánh giá cao', 'rating cao', 'tốt nhất', 'được yêu thích', 'nhiều sao', 'nhiều đánh giá'];
      if (topRatedKeywords.some(k => msgLower.includes(k))) {
        const topRatedProducts = await productService.getTopRatedProducts(5);
        if (topRatedProducts.length > 0) {
          productContext += '\n\n--- DANH SÁCH SẢN PHẨM ĐƯỢC ĐÁNH GIÁ CAO NHẤT ---\n' + topRatedProducts.map((p: any, idx: number) => {
             const priceRange = p.variants?.length > 1
              ? `${Math.min(...p.variants.map((v: any) => Number(v.price))).toLocaleString('vi-VN')} - ${Math.max(...p.variants.map((v: any) => Number(v.price))).toLocaleString('vi-VN')} VNĐ`
              : `${(p.minPrice || 0).toLocaleString('vi-VN')} VNĐ`;
             return `[ĐÁNH GIÁ CAO ${idx+1}] - ${p.name} | Giá: ${priceRange} | Đánh giá: ${p.averageRating || 0}⭐ (${p.totalReviews || 0} lượt) | Đã bán: ${p.soldCount || 0} | Link: /product/${p.slug}`;
          }).join('\n');
          
          // Đưa sản phẩm đánh giá cao lên đầu mảng relevantProducts để hiển thị card trong UI
          for (let i = topRatedProducts.length - 1; i >= 0; i--) {
             const tp = topRatedProducts[i];
             relevantProducts = relevantProducts.filter(rp => rp.id !== tp.id);
             relevantProducts.unshift(tp);
          }
          relevantProducts = relevantProducts.slice(0, 5);
        }
      }

      // 4. Context: Voucher / Khuyến mãi
      const voucherKeywords = ['giảm giá', 'voucher', 'khuyến mãi', 'mã giảm', 'code', 'ưu đãi', 'sale', 'coupon', 'mã', 'giá rẻ', 'tiết kiệm'];
      if (voucherKeywords.some(k => msgLower.includes(k))) {
        const activeVouchers = await prisma.voucher.findMany({
          where: { isActive: true, endDate: { gte: new Date() } },
          take: 10
        });
        voucherContext = activeVouchers.length > 0
          ? '\n--- MÃ GIẢM GIÁ ĐANG CÓ ---\n' + activeVouchers.map((v: any) =>
              `- Mã: "${v.code}" → Giảm ${v.discountType === 'PERCENT' ? v.discountValue + '%' : Number(v.discountValue).toLocaleString() + 'đ'} | Điều kiện: Đơn từ ${Number(v.minOrderValue || 0).toLocaleString()}đ | Giảm tối đa: ${v.maxDiscount ? Number(v.maxDiscount).toLocaleString() + 'đ' : 'Không giới hạn'} | Còn ${v.usageLimit - v.usedCount} lượt | HSD: ${new Date(v.endDate).toLocaleDateString('vi-VN')}`
            ).join('\n')
          : '\nHiện tại chưa có mã giảm giá mới. Bạn có thể theo dõi trang web để nhận ưu đãi sớm nhất!';
      }

      // 5. Context: Đơn hàng của khách
      const orderKeywords = ['đơn hàng', 'đơn', 'mua', 'lịch sử', 'trạng thái đơn', 'vận chuyển', 'giao hàng', 'theo dõi', 'đã đặt', 'order', 'hủy đơn', 'trả hàng'];
      if (userId && orderKeywords.some(k => msgLower.includes(k))) {
        const recentOrders = await prisma.order.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            items: { include: { product: { select: { name: true } }, variant: { select: { name: true } } } },
            payment: { select: { method: true, status: true } }
          }
        });
        const { translateOrderStatus, translatePaymentStatus } = require('../../../utils/status-mapper');
        orderContext = recentOrders.length > 0
          ? '\n--- ĐƠN HÀNG GẦN ĐÂY CỦA BẠN ---\n' + recentOrders.map((o: any) =>
              `- Đơn #${String(o.id).slice(0, 8)}: ${translateOrderStatus(o.status)} | Sản phẩm: ${o.items.map((i: any) => `${i.product.name} (${i.variant.name}) x${i.quantity}`).join(', ')} | Tổng: ${Number(o.totalAmount).toLocaleString()}đ | Thanh toán: ${o.payment ? `${o.payment.method} - ${translatePaymentStatus(o.payment.status)}` : 'Chưa thanh toán'} | Ngày đặt: ${new Date(o.createdAt).toLocaleDateString('vi-VN')}`
            ).join('\n')
          : '\nBạn chưa có đơn hàng nào. Hãy khám phá cửa hàng tại /shop!';
      }

      // 6. Context: Reviews / Đánh giá
      const reviewKeywords = ['đánh giá', 'review', 'nhận xét', 'feedback', 'rating', 'sao', 'chất lượng', 'tốt không', 'có nên mua'];
      if (reviewKeywords.some(k => msgLower.includes(k))) {
        // Get reviews for relevant products
        const productIds = relevantProducts.map(p => p.id);
        if (productIds.length > 0) {
          const reviews = await prisma.review.findMany({
            where: { productId: { in: productIds } },
            include: { user: { select: { name: true } }, product: { select: { name: true } } },
            orderBy: { createdAt: 'desc' },
            take: 8
          });
          if (reviews.length > 0) {
            reviewContext = '\n--- ĐÁNH GIÁ TỪ KHÁCH HÀNG ---\n' + reviews.map(r =>
              `- "${r.product.name}": ${r.rating}⭐ bởi ${r.user.name} - "${r.comment || 'Không có bình luận'}" (${new Date(r.createdAt).toLocaleDateString('vi-VN')})`
            ).join('\n');
          }
        }
      }

      // 7. Context: Thanh toán
      const paymentKeywords = ['thanh toán', 'payment', 'trả tiền', 'chuyển khoản', 'cod', 'momo', 'vnpay', 'visa', 'thẻ'];
      if (paymentKeywords.some(k => msgLower.includes(k))) {
        paymentContext = '\n--- PHƯƠNG THỨC THANH TOÁN ---\n' +
          '- COD (Thanh toán khi nhận hàng): Miễn phí, áp dụng toàn quốc\n' +
          '- Chuyển khoản ngân hàng: Xác nhận trong 5-15 phút\n' +
          '- Ví MoMo/VNPay: Thanh toán nhanh, xác nhận tức thì\n' +
          '- Thẻ VISA/Mastercard: Thanh toán quốc tế\n' +
          'Lưu ý: Tất cả giao dịch đều được mã hóa SSL và bảo mật tuyệt đối.';
      }

      // 8. Context: Hỗ trợ / Support tickets
      const supportKeywords = ['hỗ trợ', 'support', 'khiếu nại', 'phản ánh', 'ticket', 'liên hệ', 'giúp đỡ', 'vấn đề'];
      if (userId && supportKeywords.some(k => msgLower.includes(k))) {
        const tickets = await prisma.supportTicket.findMany({
          where: { userId },
          orderBy: { updatedAt: 'desc' },
          take: 3,
          include: { _count: { select: { messages: true } } }
        });
        supportContext = tickets.length > 0
          ? '\n--- TICKET HỖ TRỢ CỦA BẠN ---\n' + tickets.map(t =>
              `- Ticket "${t.subject}": Trạng thái ${t.status === 'OPEN' ? '🟢 Đang xử lý' : t.status === 'CLOSED' ? '🔴 Đã đóng' : '🟡 ' + t.status} | ${t._count.messages} tin nhắn | Cập nhật: ${new Date(t.updatedAt).toLocaleDateString('vi-VN')}`
            ).join('\n') +
            '\nĐể tạo ticket mới hoặc xem chi tiết, vui lòng truy cập /profile/support'
          : '\nBạn chưa có ticket hỗ trợ nào. Nếu cần giúp đỡ, hãy tạo ticket tại /profile/support hoặc hỏi trực tiếp em nhé!';
      }

      // 9. Context: Tồn kho (nếu hỏi về có hàng không)
      const stockKeywords = ['còn hàng', 'hết hàng', 'tồn kho', 'có hàng', 'stock', 'mua được không', 'đặt hàng được'];
      if (stockKeywords.some(k => msgLower.includes(k)) && relevantProducts.length > 0) {
        stockContext = '\n--- TÌNH TRẠNG KHO ---\n' + relevantProducts.map(p => {
          const variants = p.variants || [];
          return variants.map((v: any) =>
            `- ${p.name} (${v.name}): ${v.stock > 0 ? `Còn ${v.stock} sản phẩm` : '⛔ Hết hàng'} | Giá: ${Number(v.price).toLocaleString()}đ`
          ).join('\n');
        }).join('\n');
      }

    } catch (ragError) {
      console.warn('⚠️ RAG Enhancement Failed, continuing with basic chat:', ragError);
    }

    // 10. Lấy lịch sử hội thoại (7 tin nhắn gần nhất)
    let history: any[] = [];
    if (userId) {
      history = await prisma.chatMessage.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 7
      });
      history.reverse();
    }

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

QUY TẮC BẮT BUỘC:
1. Luôn trả lời bằng tiếng Việt, lịch sự, thân thiện, gần gũi như bạn bè.
2. Trả lời ngắn gọn, DỨT KHOÁT, tập trung vào vấn đề. Tránh lan man.
3. Khi giới thiệu sản phẩm, LUÔN kèm giá và link "/product/slug".
4. Khi có mã giảm giá phù hợp, GỢI Ý cho khách dùng.
5. Tuyệt đối KHÔNG tiết lộ thông tin đơn hàng/tài khoản của người khác.
6. Nếu khách hỏi ngoài phạm vi (tin tức, thời tiết...), lịch sự từ chối và hướng dẫn về mua sắm.
7. Nếu không tìm thấy sản phẩm phù hợp, gợi ý khách tìm kiếm tại /shop hoặc nhắn admin.
8. Sử dụng emoji vừa phải để tạo thân thiện (😊, 🛒, ⭐, 🔥).
9. Khi khách hỏi về đổi trả/bảo hành: Hướng dẫn liên hệ qua /profile/support.
10. Khi so sánh sản phẩm: So sánh dựa trên giá, đánh giá, lượt bán thực tế.

VÍ DỤ TRẢ LỜI TỐT:
- Hỏi "máy lạnh nào tốt?": Gợi ý 2-3 sản phẩm kèm giá, rating, link. So sánh ngắn gọn.
- Hỏi "có mã giảm giá không?": Liệt kê mã đang active kèm điều kiện sử dụng.
- Hỏi "đơn hàng của tôi?": Hiển thị trạng thái đơn gần nhất với chi tiết.
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
          stream: false
        })
      });

      if (!response.ok) throw new Error('Ollama service error');

      const data: any = await response.json();
      const aiResponse = data.message.content || 'Xin lỗi, tôi không thể trả lời lúc này.';

      // 12. Lưu phản hồi AI
      if (userId) {
        const productsData = relevantProducts.map(p => ({
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

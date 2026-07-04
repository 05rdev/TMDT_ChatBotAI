import axios from 'axios';
import { PaymentService } from './payment.service';

const paymentService = new PaymentService();
let isPolling = false;
let hasInitialized = false;
const seenTransactionIds = new Set<string>();

export function startSepayPolling(intervalMs: number = 10000) {
  let apiKey = process.env.SEPAY_WEBHOOK_API_KEY;
  if (apiKey) {
    apiKey = apiKey.replace(/^["']|["']$/g, ''); // Strip quotes if present
  }

  if (!apiKey) {
    console.warn('⚠️ [SePay Polling] SEPAY_WEBHOOK_API_KEY không được tìm thấy trong .env. Bỏ qua khởi động trình quét giao dịch tự động.');
    return;
  }

  console.log(`🚀 [SePay Polling] Đã kích hoạt trình quét giao dịch SePay tự động (Chu kỳ: ${intervalMs / 1000}s/lần)`);

  const poll = async () => {
    if (isPolling) return;
    isPolling = true;

    try {
      // Gọi API lấy danh sách 20 giao dịch gần nhất
      const response = await axios.get('https://my.sepay.vn/userapi/transactions/list?limit=20', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });

      const transactions = response.data?.transactions;
      if (Array.isArray(transactions) && transactions.length > 0) {
        if (!hasInitialized && process.env.SEPAY_PROCESS_EXISTING_ON_STARTUP !== 'true') {
          for (const tx of transactions) {
            if (tx.id) seenTransactionIds.add(String(tx.id));
          }
          hasInitialized = true;
          return;
        }

        hasInitialized = true;

        for (const tx of transactions) {
          const txId = tx.id ? String(tx.id) : `${tx.reference_number || ''}:${tx.transaction_content || ''}`;
          if (seenTransactionIds.has(txId)) continue;
          seenTransactionIds.add(txId);

          const amountIn = parseFloat(tx.amount_in || '0');
          if (amountIn <= 0) continue; // Bỏ qua giao dịch chi tiền ra

          const content = tx.transaction_content || '';
          if (!/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|[0-9a-f]{32}/i.test(content)) {
            continue;
          }

          const mappedTx = {
            id: tx.id,
            transferType: 'in',
            transferAmount: amountIn,
            transactionContent: content,
            referenceNumber: tx.reference_number
          };

          try {
            const result: any = await paymentService.processSepayWebhook(mappedTx);
            if (result.success && result.order) {
              console.log(`✅ [SePay Polling] Đã đối soát thành công đơn hàng #${result.order.id.slice(0, 8)} cho giao dịch ID ${tx.id}`);
            }
          } catch (processErr: any) {
            // Chỉ log nếu không phải là lỗi đơn hàng đã được xử lý trước đó để tránh loãng log
            if (!processErr.message?.includes('đã được thanh toán hoặc xử lý')) {
              // Im lặng bỏ qua các lỗi không khớp mã đơn để không log rác
            }
          }
        }
      }
    } catch (err: any) {
      console.error('❌ [SePay Polling] Lỗi khi quét danh sách giao dịch SePay:', err.message);
    } finally {
      isPolling = false;
    }
  };

  // Chạy ngay lập tức lần đầu tiên khi khởi động
  poll();

  // Thiết lập chu kỳ chạy lặp lại
  const timer = setInterval(poll, intervalMs);
  timer.unref?.();
}

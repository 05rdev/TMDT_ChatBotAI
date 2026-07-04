import axios from 'axios';
import { PaymentService } from './payment.service';

const paymentService = new PaymentService();
let isPolling = false;
let hasInitialized = false;
const seenTransactionIds = new Set<string>();

function getSepayApiToken() {
  const token = process.env.SEPAY_API_TOKEN || process.env.SEPAY_WEBHOOK_API_KEY;
  return token?.replace(/^["']|["']$/g, '');
}

function getSepayApiBaseUrl() {
  return (process.env.SEPAY_API_BASE_URL || 'https://userapi.sepay.vn/v2').replace(/\/$/, '');
}

function mapTransaction(tx: any) {
  return {
    id: tx.id,
    transferType: tx.transfer_type || tx.transferType || (Number(tx.amount_in || 0) > 0 ? 'in' : 'out'),
    transferAmount: tx.amount_in ?? tx.transferAmount ?? 0,
    transactionContent: tx.transaction_content || tx.content || tx.transactionContent || '',
    referenceNumber: tx.reference_number || tx.referenceCode || tx.referenceNumber || '',
  };
}

export function startSepayPolling(intervalMs: number = 10000) {
  const apiToken = getSepayApiToken();

  if (!apiToken) {
    console.warn('[SePay Polling] Missing SEPAY_API_TOKEN or SEPAY_WEBHOOK_API_KEY. Polling disabled.');
    return;
  }

  console.log(`[SePay Polling] Enabled. Interval: ${intervalMs / 1000}s`);

  const poll = async () => {
    if (isPolling) return;
    isPolling = true;

    try {
      const response = await axios.get(`${getSepayApiBaseUrl()}/transactions`, {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        params: {
          transfer_type: 'in',
          per_page: 50,
          transaction_date_sort: 'desc',
          timestamp_format: 'iso8601',
        },
        timeout: Number(process.env.SEPAY_API_TIMEOUT_MS || 10000),
      });

      const transactions = response.data?.data || response.data?.transactions || [];
      if (!Array.isArray(transactions) || transactions.length === 0) return;

      if (!hasInitialized && process.env.SEPAY_PROCESS_EXISTING_ON_STARTUP !== 'true') {
        for (const tx of transactions) {
          if (tx.id) seenTransactionIds.add(String(tx.id));
        }
        hasInitialized = true;
        return;
      }

      hasInitialized = true;

      for (const tx of [...transactions].reverse()) {
        const txId = tx.id ? String(tx.id) : `${tx.reference_number || ''}:${tx.transaction_content || ''}`;
        if (seenTransactionIds.has(txId)) continue;
        seenTransactionIds.add(txId);

        const mappedTx = mapTransaction(tx);
        if (mappedTx.transferType !== 'in' || Number(mappedTx.transferAmount || 0) <= 0) continue;

        try {
          const result: any = await paymentService.processSepayWebhook(mappedTx);
          if (result.success && result.order) {
            console.log(`[SePay Polling] Matched order #${result.order.id.slice(0, 8)} for transaction ${txId}`);
          }
        } catch (error: any) {
          if (!String(error?.message || '').includes('khong tim thay')) {
            console.warn('[SePay Polling] Could not process transaction:', error?.message || error);
          }
        }
      }
    } catch (error: any) {
      console.error('[SePay Polling] Failed to fetch transactions:', error?.response?.data || error.message);
    } finally {
      isPolling = false;
    }
  };

  poll();
  const timer = setInterval(poll, intervalMs);
  timer.unref?.();
}

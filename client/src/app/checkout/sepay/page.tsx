'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { QrCode, ShoppingBag, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

function SepayContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const qrCode = searchParams.get('qrCode');
  
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Parse VietQR details from the QR Code URL
  let amount = '';
  let addInfo = '';
  let accountName = '';
  let bankId = '';
  let accountNo = '';

  if (qrCode) {
    try {
      const decodedQr = decodeURIComponent(qrCode);
      const urlObj = new URL(decodedQr);
      amount = urlObj.searchParams.get('amount') || '';
      addInfo = urlObj.searchParams.get('addInfo') || '';
      accountName = urlObj.searchParams.get('accountName') || '';

      const pathParts = urlObj.pathname.split('/');
      const imgName = pathParts[pathParts.length - 1]; // e.g. MB-123115678-compact2.png
      const match = imgName.match(/^([^-]+)-([^-]+)-/);
      if (match) {
        bankId = match[1];
        accountNo = match[2];
      }
    } catch (e) {
      console.error('Lỗi phân tích VietQR URL:', e);
    }
  }

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('Đã sao chép vào bộ nhớ tạm!');
    setTimeout(() => setCopiedField(null), 2000);
  };

  useEffect(() => {
    if (!orderId) return;
    
    const interval = setInterval(async () => {
      try {
        const checkRes = await api.get(`/orders/sepay/check/${orderId}`);
        const checkData = checkRes.data?.data;
        const checkedOrder = checkData?.order;

        if (checkData?.paid || checkedOrder?.payment?.status === 'SUCCESS' || checkedOrder?.status === 'PROCESSING') {
          toast.success('Thanh toán thành công!');
          router.push(`/checkout/success?orderId=${orderId}`);
          return;
        }

        const res = await api.get(`/orders/${orderId}`);
        if (res.data.success) {
          const order = res.data.data;
          if (order.payment?.status === 'SUCCESS' || order.status === 'PROCESSING') {
            toast.success('Thanh toán thành công!');
            router.push(`/checkout/success?orderId=${orderId}`);
          }
        }
      } catch (err) {
        // ignore errors
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [orderId, router]);

  const formatCurrency = (val: string) => {
    const num = parseFloat(val);
    if (isNaN(num)) return val;
    return num.toLocaleString('vi-VN') + ' đ';
  };

  const getBankFullName = (id: string) => {
    const banks: Record<string, string> = {
      'MB': 'MB Bank (Ngân hàng Quân Đội)',
      'VCB': 'Vietcombank',
      'TCB': 'Techcombank',
      'ACB': 'ACB Bank',
      'BIDV': 'BIDV',
      'CTG': 'VietinBank'
    };
    return banks[id] || id;
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4 animate-fade-in-up">
      <div className="max-w-2xl w-full card-elevated p-8 sm:p-10 rounded-[var(--radius-xl)] text-center relative overflow-hidden bg-card border border-border">
        {/* Soft Background Decoration */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-6">
            <QrCode className="h-8 w-8 text-primary animate-pulse" />
          </div>
          
          <h2 className="font-heading text-2xl sm:text-3xl text-foreground font-bold">
            Thanh toán Chuyển khoản
          </h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Vui lòng mở ứng dụng ngân hàng của bạn để quét mã QR chuyển tiền tự động, hoặc sao chép thông tin chuyển khoản thủ công bên dưới.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 items-center text-left">
            {/* Cột 1: QR Code */}
            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
              {qrCode ? (
                <>
                  <img src={decodeURIComponent(qrCode)} alt="VietQR" className="w-56 h-56 object-contain" />
                  <span className="text-[11px] text-gray-400 font-medium mt-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                    Đang quét tìm giao dịch tự động...
                  </span>
                </>
              ) : (
                <div className="p-6 text-rose-500 flex flex-col items-center text-center">
                  <AlertCircle className="w-10 h-10 mb-2" />
                  <p className="text-sm font-medium">Không tìm thấy mã QR</p>
                </div>
              )}
            </div>

            {/* Cột 2: Thông tin chuyển khoản thủ công */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
                Thông tin chuyển khoản
              </h3>

              {bankId && (
                <div>
                  <span className="text-xs text-muted-foreground block">Ngân hàng</span>
                  <span className="text-sm font-semibold text-foreground">{getBankFullName(bankId)}</span>
                </div>
              )}

              {accountNo && (
                <div>
                  <span className="text-xs text-muted-foreground block">Số tài khoản</span>
                  <div className="flex items-center justify-between bg-secondary/30 p-2.5 rounded-[var(--radius-md)] border border-border mt-1">
                    <span className="text-sm font-mono font-bold text-foreground">{accountNo}</span>
                    <button 
                      onClick={() => handleCopy(accountNo, 'accountNo')}
                      className="text-xs text-primary hover:text-primary-dark font-medium flex items-center gap-1"
                    >
                      {copiedField === 'accountNo' ? 'Đã chép' : 'Sao chép'}
                    </button>
                  </div>
                </div>
              )}

              {accountName && (
                <div>
                  <span className="text-xs text-muted-foreground block">Chủ tài khoản</span>
                  <span className="text-sm font-semibold text-foreground uppercase">{accountName}</span>
                </div>
              )}

              {amount && (
                <div>
                  <span className="text-xs text-muted-foreground block">Số tiền</span>
                  <div className="flex items-center justify-between bg-secondary/30 p-2.5 rounded-[var(--radius-md)] border border-border mt-1">
                    <span className="text-sm font-bold text-rose-500">{formatCurrency(amount)}</span>
                    <button 
                      onClick={() => handleCopy(amount, 'amount')}
                      className="text-xs text-primary hover:text-primary-dark font-medium flex items-center gap-1"
                    >
                      {copiedField === 'amount' ? 'Đã chép' : 'Sao chép'}
                    </button>
                  </div>
                </div>
              )}

              {addInfo && (
                <div>
                  <span className="text-xs text-rose-500 font-bold block">Nội dung chuyển khoản (BẮT BUỘC)</span>
                  <div className="flex items-center justify-between bg-rose-500/5 p-2.5 rounded-[var(--radius-md)] border border-rose-500/20 mt-1">
                    <span className="text-sm font-mono font-bold text-rose-600">{addInfo}</span>
                    <button 
                      onClick={() => handleCopy(addInfo, 'addInfo')}
                      className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1"
                    >
                      {copiedField === 'addInfo' ? 'Đã chép' : 'Sao chép'}
                    </button>
                  </div>
                  <span className="text-[10px] text-rose-500 mt-1 block leading-normal">
                    ⚠️ Bạn phải sao chép chính xác 100% nội dung này thì hệ thống mới tự động kích hoạt đơn hàng.
                  </span>
                </div>
              )}
            </div>
          </div>

          {orderId && (
            <div className="mt-8 p-4 bg-secondary/30 rounded-[var(--radius-lg)] border border-border text-left">
              <p className="text-xs font-medium text-muted-foreground mb-1">Mã đơn hàng gốc</p>
              <p className="font-mono text-foreground font-semibold text-xs tracking-wide truncate">{orderId}</p>
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full">
                <ShoppingBag className="w-4.5 h-4.5 mr-2" /> Về trang chủ
              </Button>
            </Link>
            <Link href={`/profile/orders`} className="w-full sm:w-auto">
              <Button size="lg" className="w-full group">
                Kiểm tra đơn hàng
                <ArrowRight className="w-4 h-4 ml-2 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSepayPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>}>
      <SepayContent />
    </Suspense>
  );
}

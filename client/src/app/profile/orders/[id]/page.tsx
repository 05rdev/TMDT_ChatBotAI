'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft, 
  Truck, 
  MapPin, 
  CreditCard, 
  Phone, 
  Calendar,
  Loader2,
  ShieldCheck,
  Zap,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/useTranslation';
import type { Locale } from '@/i18n';

const detailText: Record<Locale, Record<string, string>> = {
  vi: {
    loading: 'Đang truy xuất thông tin đơn hàng...',
    notFound: 'Không tìm thấy đơn hàng',
    back: 'Quay lại lịch sử',
    title: 'Chi tiết đơn hàng',
    orderCode: 'Mã đơn',
    placedAt: 'Đặt lúc',
    exportPdf: 'Xuất hóa đơn (PDF)',
    cancelOrder: 'Hủy đơn hàng',
    returnOrder: 'Hoàn trả hàng',
    tracker: 'Trạng thái vận chuyển',
    placed: 'Đặt đơn',
    confirmed: 'Xác nhận',
    shipping: 'Giao hàng',
    completed: 'Hoàn tất',
    orderedTime: 'Thời gian đặt hàng',
    latestUpdate: 'Cập nhật gần nhất',
    products: 'Sản phẩm',
    quantity: 'Số lượng',
    reviewProduct: 'Đánh giá sản phẩm',
    subtotal: 'Tạm tính',
    shippingFee: 'Phí vận chuyển',
    free: 'Miễn phí',
    total: 'Tổng cộng',
    shippingInfo: 'Thông tin nhận hàng',
    edit: 'Chỉnh sửa',
    newAddress: 'Địa chỉ mới',
    newPhone: 'Số điện thoại mới',
    save: 'Lưu',
    cancel: 'Hủy',
    address: 'Địa chỉ giao hàng',
    phone: 'Số điện thoại',
    paymentMethod: 'Phương thức thanh toán',
    paid: 'Đã thanh toán',
    secure: 'Giao dịch được bảo mật bởi hệ thống UltraShop Security.',
    support: 'Yêu cầu hỗ trợ đơn hàng',
    close: 'Đóng',
    confirmCancel: 'Xác nhận hủy',
    reviewTitle: 'Đánh giá sản phẩm',
    reviewIntro: 'Chia sẻ trải nghiệm của bạn về',
    ratingQuestion: 'Bạn đánh giá mấy sao?',
    reviewComment: 'Bình luận của bạn',
    reviewPlaceholder: 'Sản phẩm dùng rất tốt, đóng gói cẩn thận...',
    submitReview: 'Gửi đánh giá',
    noTime: 'Chưa có thời gian',
    statusPending: 'Chờ xác nhận',
    statusProcessing: 'Đang xử lý',
    statusShipped: 'Đang giao hàng',
    statusDelivered: 'Hoàn tất',
    statusCancelled: 'Đã hủy',
    statusUnknown: 'Không rõ',
  },
  en: {
    loading: 'Retrieving order information...',
    notFound: 'Order not found',
    back: 'Back to order history',
    title: 'Order details',
    orderCode: 'Order ID',
    placedAt: 'Placed at',
    exportPdf: 'Export invoice (PDF)',
    cancelOrder: 'Cancel order',
    returnOrder: 'Return order',
    tracker: 'Shipping status',
    placed: 'Order placed',
    confirmed: 'Confirmed',
    shipping: 'Shipping',
    completed: 'Completed',
    orderedTime: 'Order time',
    latestUpdate: 'Latest update',
    products: 'Products',
    quantity: 'Quantity',
    reviewProduct: 'Review product',
    subtotal: 'Subtotal',
    shippingFee: 'Shipping fee',
    free: 'Free',
    total: 'Total',
    shippingInfo: 'Shipping information',
    edit: 'Edit',
    newAddress: 'New address',
    newPhone: 'New phone number',
    save: 'Save',
    cancel: 'Cancel',
    address: 'Shipping address',
    phone: 'Phone number',
    paymentMethod: 'Payment method',
    paid: 'Paid',
    secure: 'Transaction secured by UltraShop Security.',
    support: 'Request order support',
    close: 'Close',
    confirmCancel: 'Confirm cancellation',
    reviewTitle: 'Product review',
    reviewIntro: 'Share your experience with',
    ratingQuestion: 'How many stars would you rate?',
    reviewComment: 'Your review',
    reviewPlaceholder: 'The product works very well and was packed carefully...',
    submitReview: 'Submit review',
    noTime: 'No time available',
    statusPending: 'Pending confirmation',
    statusProcessing: 'Processing',
    statusShipped: 'Shipping',
    statusDelivered: 'Completed',
    statusCancelled: 'Cancelled',
    statusUnknown: 'Unknown',
  },
  ja: {
    loading: '注文情報を取得しています...',
    notFound: '注文が見つかりません',
    back: '注文履歴に戻る',
    title: '注文詳細',
    orderCode: '注文番号',
    placedAt: '注文日時',
    exportPdf: '請求書を出力（PDF）',
    cancelOrder: '注文をキャンセル',
    returnOrder: '返品する',
    tracker: '配送状況',
    placed: '注文済み',
    confirmed: '確認済み',
    shipping: '配送中',
    completed: '完了',
    orderedTime: '注文時間',
    latestUpdate: '最終更新',
    products: '商品',
    quantity: '数量',
    reviewProduct: '商品をレビュー',
    subtotal: '小計',
    shippingFee: '送料',
    free: '無料',
    total: '合計',
    shippingInfo: '配送先情報',
    edit: '編集',
    newAddress: '新しい住所',
    newPhone: '新しい電話番号',
    save: '保存',
    cancel: 'キャンセル',
    address: '配送先住所',
    phone: '電話番号',
    paymentMethod: '支払い方法',
    paid: '支払い済み',
    secure: '取引はUltraShop Securityによって保護されています。',
    support: '注文サポートを依頼',
    close: '閉じる',
    confirmCancel: 'キャンセルを確定',
    reviewTitle: '商品レビュー',
    reviewIntro: '体験を共有してください:',
    ratingQuestion: '星はいくつですか？',
    reviewComment: 'レビュー内容',
    reviewPlaceholder: '商品はとても良く、丁寧に梱包されていました...',
    submitReview: 'レビューを送信',
    noTime: '日時なし',
    statusPending: '確認待ち',
    statusProcessing: '処理中',
    statusShipped: '配送中',
    statusDelivered: '完了',
    statusCancelled: 'キャンセル済み',
    statusUnknown: '不明',
  },
  ko: {
    loading: '주문 정보를 불러오는 중...',
    notFound: '주문을 찾을 수 없습니다',
    back: '주문 내역으로 돌아가기',
    title: '주문 상세',
    orderCode: '주문 번호',
    placedAt: '주문 시간',
    exportPdf: '송장 내보내기 (PDF)',
    cancelOrder: '주문 취소',
    returnOrder: '반품 요청',
    tracker: '배송 상태',
    placed: '주문 완료',
    confirmed: '확인됨',
    shipping: '배송 중',
    completed: '완료',
    orderedTime: '주문 시간',
    latestUpdate: '최근 업데이트',
    products: '상품',
    quantity: '수량',
    reviewProduct: '상품 리뷰',
    subtotal: '소계',
    shippingFee: '배송비',
    free: '무료',
    total: '총계',
    shippingInfo: '배송 정보',
    edit: '수정',
    newAddress: '새 주소',
    newPhone: '새 전화번호',
    save: '저장',
    cancel: '취소',
    address: '배송 주소',
    phone: '전화번호',
    paymentMethod: '결제 방법',
    paid: '결제 완료',
    secure: '거래는 UltraShop Security로 보호됩니다.',
    support: '주문 지원 요청',
    close: '닫기',
    confirmCancel: '취소 확인',
    reviewTitle: '상품 리뷰',
    reviewIntro: '경험을 공유해 주세요:',
    ratingQuestion: '별점을 선택해 주세요',
    reviewComment: '리뷰 내용',
    reviewPlaceholder: '상품이 좋고 포장이 꼼꼼했습니다...',
    submitReview: '리뷰 보내기',
    noTime: '시간 정보 없음',
    statusPending: '확인 대기',
    statusProcessing: '처리 중',
    statusShipped: '배송 중',
    statusDelivered: '완료',
    statusCancelled: '취소됨',
    statusUnknown: '알 수 없음',
  },
};

interface OrderItem {
  id: string;
  price: number;
  quantity: number;
  product: {
    name: string;
    images: { url: string }[];
  };
  variant: {
    name: string;
  };
}

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  address: string;
  phone: string;
  createdAt: string;
  updatedAt?: string;
  items: OrderItem[];
  payment?: {
    method: string;
    status: string;
    amount: number;
  };
  cancelReason?: string;
  voucher?: {
    code: string;
    discountType: string;
    discountValue: number;
  };
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { locale } = useTranslation();
  const text = detailText[locale];
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newPhone, setNewPhone] = useState('');

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  useEffect(() => {
    if (order) {
      setNewAddress(order.address);
      setNewPhone(order.phone);
    }
  }, [order]);

  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/orders/${id}`);
      if (res.data.success) {
        setOrder(res.data.data);
      }
    } catch (error) {
      toast.error(text.notFound);
      router.push('/profile/orders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason) {
      toast.error('Vui lòng chọn hoặc nhập lý do hủy');
      return;
    }
    try {
      setIsUpdating(true);
      await api.patch(`/orders/${id}/cancel`, { reason: cancelReason });
      toast.success('Hủy đơn hàng thành công');
      setShowCancelModal(false);
      setCancelReason('');
      fetchOrderDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi hủy đơn hàng');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReturnOrder = async () => {
    if (!confirm('Bạn có chắc chắn muốn yêu cầu hoàn trả đơn hàng này?')) return;
    try {
      setIsUpdating(true);
      await api.patch(`/orders/${id}/return`);
      toast.success('Đã gửi yêu cầu hoàn trả');
      fetchOrderDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi gửi yêu cầu');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateInfo = async () => {
    try {
      setIsUpdating(true);
      await api.patch(`/orders/${id}/info`, { address: newAddress, phone: newPhone });
      toast.success('Cập nhật thông tin thành công');
      setIsEditing(false);
      fetchOrderDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật thông tin');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewComment.trim()) return toast.error('Vui lòng nhập bình luận');
    try {
      setIsUpdating(true);
      await api.post(`/products/${selectedProduct.id}/reviews`, {
        productId: selectedProduct.id,
        rating,
        comment: reviewComment
      });
      toast.success('Cảm ơn bạn đã đánh giá sản phẩm!');
      setShowReviewModal(false);
      setReviewComment('');
      setRating(5);
      fetchOrderDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi gửi đánh giá');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { icon: <Clock />, label: text.statusPending, color: 'bg-warning text-warning-foreground', border: 'border-warning/30', step: 1 };
      case 'PROCESSING':
        return { icon: <Zap />, label: text.statusProcessing, color: 'bg-accent text-accent-foreground', border: 'border-accent/30', step: 2 };
      case 'SHIPPED':
        return { icon: <Truck />, label: text.statusShipped, color: 'bg-primary text-primary-foreground', border: 'border-primary/30', step: 3 };
      case 'DELIVERED':
        return { icon: <CheckCircle2 />, label: text.statusDelivered, color: 'bg-success text-success-foreground', border: 'border-success/30', step: 4 };
      case 'CANCELLED':
        return { icon: <XCircle />, label: text.statusCancelled, color: 'bg-danger text-white', border: 'border-danger/30', step: 0 };
      default:
        return { icon: <Clock />, label: text.statusUnknown, color: 'bg-secondary text-foreground', border: 'border-border', step: 1 };
    }
  };

  const getImageUrl = (url?: string) => {
    if (!url) return 'https://via.placeholder.com/150';
    if (url.startsWith('http')) return url;
    return `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3002'}/${url}`;
  };

  const formatDateTime = (value?: string) => {
    if (!value) return text.noTime;
    return new Date(value).toLocaleString(locale === 'vi' ? 'vi-VN' : locale, {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (isLoading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
      <p className="text-sm font-medium text-muted-foreground animate-pulse">{text.loading}</p>
    </div>
  );

  if (!order) return null;

  const statusInfo = getStatusInfo(order.status);
  const orderCreatedAt = formatDateTime(order.createdAt);
  const orderUpdatedAt = formatDateTime(order.updatedAt || order.createdAt);
  const steps = [
    { label: text.placed, icon: Calendar },
    { label: text.confirmed, icon: ShieldCheck },
    { label: text.shipping, icon: Truck },
    { label: text.completed, icon: CheckCircle2 }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-border">
        <div className="space-y-3">
          <Link href="/profile/orders" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> {text.back}
          </Link>
          <h1 className="font-heading text-3xl sm:text-4xl text-foreground">
            {text.title}
          </h1>
          <div className="flex items-center flex-wrap gap-3">
             <span className="text-sm font-medium text-muted-foreground">{text.orderCode}: <strong className="text-foreground">#{order.id.toUpperCase()}</strong></span>
             <span className="inline-flex items-center text-sm font-medium text-muted-foreground">
               <Calendar className="w-4 h-4 mr-1.5 text-primary" />
               {text.placedAt}: <strong className="text-foreground ml-1">{orderCreatedAt}</strong>
             </span>
             <div className={`${statusInfo.color} px-3 py-1 rounded-full text-xs font-semibold shadow-sm`}>
                {statusInfo.label}
             </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="rounded-full shrink-0">
            {text.exportPdf}
          </Button>
          {(order.status === 'PENDING' || order.status === 'PROCESSING') && (
            <Button onClick={() => setShowCancelModal(true)} disabled={isUpdating} variant="destructive" className="rounded-full shrink-0">
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} {text.cancelOrder}
            </Button>
          )}
          {order.status === 'DELIVERED' && (
            <Button onClick={handleReturnOrder} disabled={isUpdating} className="rounded-full shrink-0 bg-orange-600 hover:bg-orange-700">
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} {text.returnOrder}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Order Tracker */}
          <div className="card-elevated bg-card border border-border p-8 sm:p-10 rounded-[var(--radius-xl)]">
            <h3 className="font-heading text-xl text-foreground mb-10 flex items-center">
              {text.tracker} <Truck className="ml-3 w-5 h-5 text-primary" />
            </h3>
            
            <div className="relative flex justify-between items-start max-w-lg mx-auto">
              {/* Progress Line */}
              <div className="absolute top-6 left-6 right-6 h-1 bg-secondary rounded-full z-0 overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-1000 rounded-full" 
                  style={{ width: `${order.status === 'CANCELLED' ? 0 : ((statusInfo.step - 1) / 3) * 100}%` }} 
                />
              </div>

              {steps.map((step, idx) => {
                const stepNum = idx + 1;
                const isActive = statusInfo.step >= stepNum && order.status !== 'CANCELLED';
                const Icon = step.icon;
                return (
                  <div key={idx} className="relative z-10 flex flex-col items-center text-center space-y-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 shadow-sm border-4 border-card ${isActive ? 'bg-primary text-primary-foreground scale-110' : 'bg-secondary text-muted-foreground'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-xs font-semibold ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {step.label}
                    </span>
                    {idx === 0 && (
                      <span className="text-[10px] leading-snug text-muted-foreground max-w-[92px]">
                        {orderCreatedAt}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-secondary/40 border border-border rounded-[var(--radius-md)] p-4">
                <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{text.orderedTime}</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{orderCreatedAt}</p>
              </div>
              <div className="bg-secondary/40 border border-border rounded-[var(--radius-md)] p-4">
                <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{text.latestUpdate}</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{orderUpdatedAt}</p>
              </div>
            </div>

            {order.status === 'CANCELLED' && (
              <div className="mt-10 p-4 bg-danger/10 border border-danger/20 rounded-[var(--radius-lg)] text-danger font-semibold text-center text-sm space-y-1">
                <p>Đơn hàng này đã bị hủy.</p>
                {order.cancelReason && <p className="text-xs opacity-80 font-medium italic">Lý do: {order.cancelReason}</p>}
              </div>
            )}
          </div>

          {/* Items */}
          <div className="card-elevated bg-card border border-border rounded-[var(--radius-xl)] overflow-hidden">
            <div className="p-6 border-b border-border bg-secondary/30">
              <h3 className="font-heading text-lg text-foreground">{text.products} ({order.items.length})</h3>
            </div>
            <div className="divide-y divide-border/50">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-6 flex items-center space-x-5">
                  <div className="w-20 h-20 rounded-[var(--radius-md)] border border-border overflow-hidden flex-shrink-0 bg-secondary">
                    <img src={getImageUrl(item.product.images[0]?.url)} alt={item.product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="font-semibold text-base text-foreground line-clamp-1">{item.product.name}</h4>
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-secondary text-xs font-medium text-muted-foreground">{item.variant.name}</span>
                    <p className="text-sm font-medium text-muted-foreground mt-1">{text.quantity}: {item.quantity}</p>
                  </div>
                  <div className="text-right shrink-0 space-y-2">
                    <p className="font-bold text-lg text-foreground">{Number(item.price).toLocaleString('vi-VN')}đ</p>
                    {order.status === 'DELIVERED' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="rounded-full text-xs h-8"
                        onClick={() => {
                          setSelectedProduct(item.product);
                          setShowReviewModal(true);
                        }}
                      >
                        {text.reviewProduct}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 sm:p-8 bg-secondary/10 border-t border-border space-y-3">
               <div className="flex justify-between items-center text-sm">
                 <span className="font-medium text-muted-foreground">{text.subtotal}:</span>
                 <span className="font-semibold text-foreground">
                   {order.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0).toLocaleString('vi-VN')}đ
                 </span>
               </div>
               {order.voucher && (
                 <div className="flex justify-between items-center text-sm text-success">
                   <span className="font-medium">Voucher giảm giá ({order.voucher.code}):</span>
                   <span className="font-semibold">
                     - {(order.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0) - Number(order.totalAmount)).toLocaleString('vi-VN')}đ
                   </span>
                 </div>
               )}
               <div className="flex justify-between items-center text-sm">
                 <span className="font-medium text-muted-foreground">{text.shippingFee}:</span>
                 <span className="font-semibold text-success">{text.free}</span>
               </div>
               <div className="flex justify-between items-center pt-4 border-t border-border/50">
                 <span className="text-base font-semibold text-foreground">{text.total}:</span>
                 <span className="text-3xl font-bold text-primary">{Number(order.totalAmount).toLocaleString('vi-VN')}đ</span>
               </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar Info */}
        <div className="space-y-6">
          {/* Address */}
          <div className="card-elevated bg-card border border-border p-6 rounded-[var(--radius-xl)]">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-base flex items-center text-foreground">
                <MapPin className="w-4.5 h-4.5 mr-2 text-primary" /> {text.shippingInfo}
              </h3>
              {(order.status === 'PENDING' || order.status === 'PROCESSING') && !isEditing && (
                <button onClick={() => setIsEditing(true)} className="text-xs text-primary font-semibold hover:underline">{text.edit}</button>
              )}
            </div>
            <div className="space-y-4">
              {isEditing ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">{text.newAddress}</label>
                    <textarea 
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      className="w-full bg-secondary/50 border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary min-h-[80px]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">{text.newPhone}</label>
                    <input 
                      type="text"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="w-full bg-secondary/50 border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleUpdateInfo} disabled={isUpdating} size="sm" className="flex-1 rounded-full text-xs">{text.save}</Button>
                    <Button onClick={() => { setIsEditing(false); setNewAddress(order.address); setNewPhone(order.phone); }} variant="outline" size="sm" className="flex-1 rounded-full text-xs">{text.cancel}</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{text.address}</p>
                    <p className="font-medium text-sm leading-relaxed text-foreground">{order.address}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{text.phone}</p>
                    <p className="font-medium text-sm flex items-center text-foreground"><Phone className="w-3.5 h-3.5 mr-2 text-muted-foreground" /> {order.phone}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Payment */}
          <div className="card-elevated bg-card border border-border p-6 rounded-[var(--radius-xl)]">
            <h3 className="font-semibold text-base mb-5 flex items-center text-foreground">
              <CreditCard className="w-4.5 h-4.5 mr-2 text-primary" /> {text.paymentMethod}
            </h3>
            <div className="space-y-4">
              <div className="bg-secondary/50 border border-border rounded-[var(--radius-md)] p-4 flex items-center justify-between">
                <span className="text-sm font-semibold">{order.payment?.method || 'VNPAY'}</span>
                <span className="px-2.5 py-1 bg-success/10 text-success rounded-full text-[11px] font-semibold">{text.paid}</span>
              </div>
              <div className="flex items-start bg-primary/5 p-3 rounded-[var(--radius-md)]">
                <ShieldCheck className="w-4 h-4 text-primary mr-2 shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                  {text.secure}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button onClick={() => router.push('/profile/support')} variant="outline" className="w-full">
              {text.support}
            </Button>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isUpdating && setShowCancelModal(false)} />
          <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border">
              <h3 className="text-xl font-heading text-foreground">{text.cancelOrder}</h3>
              <p className="text-xs text-muted-foreground mt-1">Vui lòng cho chúng tôi biết lý do bạn muốn hủy đơn hàng này.</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-2">
                {[
                  'Muốn đổi địa chỉ nhận hàng',
                  'Muốn đổi sản phẩm khác',
                  'Tìm thấy giá rẻ hơn ở nơi khác',
                  'Không còn nhu cầu mua nữa',
                  'Lý do khác'
                ].map((reason) => (
                  <button 
                    key={reason}
                    onClick={() => setCancelReason(reason)}
                    className={`text-left p-3 rounded-xl border text-sm transition-all ${cancelReason === reason ? 'bg-primary/10 border-primary text-primary font-semibold' : 'bg-secondary/30 border-border hover:bg-secondary/50 text-foreground'}`}
                  >
                    {reason}
                  </button>
                ))}
              </div>
              
              {cancelReason === 'Lý do khác' && (
                <textarea 
                  placeholder="Vui lòng nhập lý do cụ thể..."
                  className="w-full bg-secondary/50 border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary min-h-[80px] animate-in slide-in-from-top-2"
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              )}
            </div>
            <div className="p-6 bg-secondary/20 flex gap-3">
              <Button 
                onClick={handleCancelOrder} 
                disabled={isUpdating || !cancelReason} 
                className="flex-1 rounded-full"
              >
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} {text.confirmCancel}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowCancelModal(false)} 
                disabled={isUpdating}
                className="flex-1 rounded-full"
              >
                {text.close}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isUpdating && setShowReviewModal(false)} />
          <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border">
              <h3 className="text-xl font-heading text-foreground">{text.reviewTitle}</h3>
              <p className="text-xs text-muted-foreground mt-1">{text.reviewIntro} {selectedProduct.name}</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex flex-col items-center space-y-3">
                <p className="text-sm font-semibold text-muted-foreground">{text.ratingQuestion}</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button 
                      key={s} 
                      onClick={() => setRating(s)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${rating >= s ? 'bg-primary text-primary-foreground scale-110 shadow-lg' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'}`}
                    >
                      <Star className={`w-5 h-5 ${rating >= s ? 'fill-current' : ''}`} />
                    </button>
                  ))}
                </div>
                <p className="text-xs font-bold text-primary italic">
                  {rating === 5 ? 'Cực kỳ hài lòng' : rating === 4 ? 'Hài lòng' : rating === 3 ? 'Bình thường' : rating === 2 ? 'Không hài lòng' : 'Tệ'}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{text.reviewComment}</label>
                <textarea 
                  placeholder={text.reviewPlaceholder}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full bg-secondary/50 border border-border rounded-xl p-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary min-h-[120px] resize-none"
                />
              </div>
            </div>
            <div className="p-6 bg-secondary/20 flex gap-3">
              <Button 
                onClick={handleSubmitReview} 
                disabled={isUpdating} 
                className="flex-1 rounded-full"
              >
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} {text.submitReview}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowReviewModal(false)} 
                disabled={isUpdating}
                className="flex-1 rounded-full"
              >
                {text.cancel}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Clock, Loader2, Package, Search, User, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { getMediaUrl } from '@/lib/media';
import { useAuthStore } from '@/store/useAuthStore';
import { useTranslation } from '@/hooks/useTranslation';
import type { Locale } from '@/i18n';

const orderText: Record<Locale, {
  member: string;
  profile: string;
  notifications: string;
  supportCenter: string;
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  loading: string;
  emptyTitle: string;
  emptyDesc: string;
  shopNow: string;
  transactionId: string;
  orderDate: string;
  qty: string;
  total: string;
  details: string;
  buyAgain: string;
  noTime: string;
  statusPending: string;
  statusProcessing: string;
  statusShipped: string;
  statusDelivered: string;
  statusCancelled: string;
}> = {
  vi: {
    member: 'Hạng Vàng',
    profile: 'Hồ sơ tài khoản',
    notifications: 'Thông báo',
    supportCenter: 'Trung tâm hỗ trợ',
    title: 'Đơn hàng của tôi',
    subtitle: 'Theo dõi quá trình vận chuyển và giao dịch.',
    searchPlaceholder: 'Tìm mã đơn hàng...',
    loading: 'Đang tìm đơn hàng...',
    emptyTitle: 'Bạn chưa có đơn hàng nào',
    emptyDesc: 'Khám phá ngay bộ sưu tập công nghệ mới nhất tại cửa hàng của chúng tôi.',
    shopNow: 'Khám phá shop ngay',
    transactionId: 'Mã giao dịch',
    orderDate: 'Ngày đặt',
    qty: 'SL',
    total: 'Tổng cộng thanh toán',
    details: 'Chi tiết',
    buyAgain: 'Mua lại',
    noTime: 'Chưa có thời gian',
    statusPending: 'Chờ duyệt',
    statusProcessing: 'Đang xử lý',
    statusShipped: 'Đang giao',
    statusDelivered: 'Hoàn tất',
    statusCancelled: 'Đã hủy',
  },
  en: {
    member: 'Gold Member',
    profile: 'Account profile',
    notifications: 'Notifications',
    supportCenter: 'Support center',
    title: 'My orders',
    subtitle: 'Track shipping progress and transactions.',
    searchPlaceholder: 'Search order ID...',
    loading: 'Searching orders...',
    emptyTitle: 'You have no orders yet',
    emptyDesc: 'Explore our latest tech collection in the shop.',
    shopNow: 'Shop now',
    transactionId: 'Transaction ID',
    orderDate: 'Order date',
    qty: 'Qty',
    total: 'Total payment',
    details: 'Details',
    buyAgain: 'Buy again',
    noTime: 'No time available',
    statusPending: 'Pending',
    statusProcessing: 'Processing',
    statusShipped: 'Shipping',
    statusDelivered: 'Completed',
    statusCancelled: 'Cancelled',
  },
  ja: {
    member: 'ゴールド会員',
    profile: 'アカウント情報',
    notifications: '通知',
    supportCenter: 'サポートセンター',
    title: '注文履歴',
    subtitle: '配送状況と取引を確認できます。',
    searchPlaceholder: '注文番号を検索...',
    loading: '注文を検索中...',
    emptyTitle: '注文はまだありません',
    emptyDesc: 'ショップで最新のテック商品をご覧ください。',
    shopNow: 'ショップを見る',
    transactionId: '取引ID',
    orderDate: '注文日',
    qty: '数量',
    total: 'お支払い合計',
    details: '詳細',
    buyAgain: '再購入',
    noTime: '日時なし',
    statusPending: '承認待ち',
    statusProcessing: '処理中',
    statusShipped: '配送中',
    statusDelivered: '完了',
    statusCancelled: 'キャンセル済み',
  },
  ko: {
    member: '골드 회원',
    profile: '계정 프로필',
    notifications: '알림',
    supportCenter: '고객 지원 센터',
    title: '내 주문',
    subtitle: '배송 진행 상황과 거래 내역을 확인하세요.',
    searchPlaceholder: '주문 번호 검색...',
    loading: '주문을 검색 중...',
    emptyTitle: '아직 주문이 없습니다',
    emptyDesc: '스토어에서 최신 기술 상품을 둘러보세요.',
    shopNow: '쇼핑하러 가기',
    transactionId: '거래 ID',
    orderDate: '주문일',
    qty: '수량',
    total: '총 결제 금액',
    details: '상세',
    buyAgain: '다시 구매',
    noTime: '시간 정보 없음',
    statusPending: '대기 중',
    statusProcessing: '처리 중',
    statusShipped: '배송 중',
    statusDelivered: '완료',
    statusCancelled: '취소됨',
  },
};

export default function OrdersPage() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t, locale } = useTranslation();
  const text = orderText[locale];
  const avatarUrl = getMediaUrl(user?.avatar);

  useEffect(() => {
    void fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/orders');
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (error) {
      console.error('Failed to load orders', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-3 py-1 bg-warning/10 text-warning rounded-full font-semibold text-xs flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> {text.statusPending}</span>;
      case 'PROCESSING':
        return <span className="px-3 py-1 bg-accent/10 text-accent rounded-full font-semibold text-xs flex items-center"><Package className="w-3.5 h-3.5 mr-1" /> {text.statusProcessing}</span>;
      case 'SHIPPED':
      case 'DELIVERING':
        return <span className="px-3 py-1 bg-primary/10 text-primary rounded-full font-semibold text-xs flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> {text.statusShipped}</span>;
      case 'DELIVERED':
      case 'COMPLETED':
        return <span className="px-3 py-1 bg-success/10 text-success rounded-full font-semibold text-xs flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> {text.statusDelivered}</span>;
      case 'CANCELLED':
        return <span className="px-3 py-1 bg-danger/10 text-danger rounded-full font-semibold text-xs flex items-center"><XCircle className="w-3.5 h-3.5 mr-1" /> {text.statusCancelled}</span>;
      default:
        return null;
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in-up">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1 hidden lg:block space-y-6">
          <div className="card-elevated bg-card rounded-[var(--radius-xl)] p-6 text-center space-y-4">
            <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mx-auto overflow-hidden ring-4 ring-background shadow-sm">
              {avatarUrl ? (
                <img src={avatarUrl} alt={user?.name || 'Avatar'} className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-muted-foreground" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground">{user?.name || text.member}</h3>
              <p className="text-xs font-medium text-primary mt-1 bg-primary/10 px-3 py-1 rounded-full inline-block">{text.member}</p>
            </div>
          </div>

          <nav className="card-elevated bg-card rounded-[var(--radius-xl)] p-3 flex flex-col space-y-1.5">
            <Link href="/profile" className="px-4 py-3 rounded-[var(--radius-md)] text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">{text.profile}</Link>
            <Link href="/profile/orders" className="px-4 py-3 rounded-[var(--radius-md)] text-sm font-medium text-primary bg-primary/10 transition-colors">{t('profile.orderHistory')}</Link>
            <Link href="/profile/notifications" className="px-4 py-3 rounded-[var(--radius-md)] text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">{text.notifications}</Link>
            <Link href="/profile/support" className="px-4 py-3 rounded-[var(--radius-md)] text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">{text.supportCenter}</Link>
          </nav>
        </aside>

        <div className="lg:col-span-3 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-2">
            <div className="space-y-1.5">
              <h1 className="font-heading text-3xl text-foreground">{text.title}</h1>
              <p className="text-muted-foreground text-sm">{text.subtitle}</p>
            </div>

            <div className="relative bg-card border border-border rounded-[var(--radius-lg)] flex items-center min-w-[280px] shadow-sm">
              <Search className="w-4.5 h-4.5 text-muted-foreground ml-3.5" />
              <input
                type="text"
                placeholder={text.searchPlaceholder}
                className="w-full bg-transparent border-none focus:ring-0 text-sm px-3 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-6">
            {isLoading ? (
              <div className="flex flex-col justify-center items-center py-20 space-y-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-sm font-medium text-muted-foreground">{text.loading}</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="card-elevated bg-card rounded-[var(--radius-xl)] p-12 text-center space-y-6">
                <Package className="w-20 h-20 text-muted opacity-50 mx-auto" />
                <div className="space-y-2">
                  <h3 className="font-heading text-2xl text-foreground">{text.emptyTitle}</h3>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">{text.emptyDesc}</p>
                </div>
                <Link href="/shop" className="inline-block pt-4">
                  <Button size="lg" className="px-8">{text.shopNow}</Button>
                </Link>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="card-elevated bg-card border border-border rounded-[var(--radius-xl)] overflow-hidden hover:shadow-md transition-shadow">
                  <div className="px-6 py-4 bg-secondary/30 border-b border-border flex flex-wrap justify-between items-center gap-4">
                    <div>
                      <span className="text-xs text-muted-foreground font-medium block mb-0.5">{text.transactionId}</span>
                      <h4 className="font-semibold text-foreground text-sm uppercase tracking-wider">#{order.id.slice(0, 10)}...</h4>
                    </div>
                    <div className="hidden sm:block">
                      <span className="text-xs text-muted-foreground font-medium block mb-0.5">{text.orderDate}</span>
                      <p className="font-medium text-sm text-foreground">{formatDateTime(order.createdAt)}</p>
                    </div>
                    <div className="flex items-center">{getStatusBadge(order.status)}</div>
                  </div>

                  <div className="p-6">
                    <div className="space-y-5">
                      {order.items.map((item: any, index: number) => {
                        const image = getImageUrl(item.product.images?.[0]?.url);
                        return (
                          <div key={index} className="flex items-center space-x-4">
                            <div className="w-16 h-16 rounded-[var(--radius-md)] bg-secondary overflow-hidden flex-shrink-0 border border-border">
                              <img src={image} alt={item.product.name} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-semibold text-foreground text-sm line-clamp-1">{item.product.name}</h5>
                              <div className="flex items-center space-x-3 mt-1.5">
                                <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{item.variant.name}</span>
                                <span className="text-xs text-muted-foreground">{text.qty}: {item.quantity}</span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="font-semibold text-base text-foreground">{Number(item.price).toLocaleString('vi-VN')}đ</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-6 pt-5 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-5">
                      <div>
                        <span className="text-xs text-muted-foreground font-medium block mb-1">{text.total}</span>
                        <strong className="text-xl font-bold text-primary">{Number(order.totalAmount).toLocaleString('vi-VN')}đ</strong>
                      </div>
                      <div className="flex gap-3 w-full sm:w-auto">
                        <Link href={`/profile/orders/${order.id}`} className="flex-1 sm:flex-none">
                          <Button variant="outline" className="w-full">{text.details}</Button>
                        </Link>
                        <Button className="flex-1 sm:flex-none">
                          {text.buyAgain} <ArrowRight className="w-4 h-4 ml-2 opacity-70" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, AlertCircle, Clock, Loader2, MessageSquare, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';
import { useTranslation } from '@/hooks/useTranslation';
import type { Locale } from '@/i18n';

interface Ticket {
  id: string;
  subject: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  updatedAt: string;
  messages: unknown[];
}

const supportText: Record<Locale, {
  loadFailed: string;
  required: string;
  createSuccess: string;
  createFailed: string;
  subjectLabel: string;
  subjectPlaceholder: string;
  messageLabel: string;
  messagePlaceholder: string;
  submit: string;
  statusOpen: string;
  statusProgress: string;
  statusResolved: string;
  statusClosed: string;
}> = {
  vi: {
    loadFailed: 'Không thể tải danh sách yêu cầu hỗ trợ',
    required: 'Vui lòng điền đủ thông tin',
    createSuccess: 'Gửi yêu cầu hỗ trợ thành công',
    createFailed: 'Gửi yêu cầu thất bại',
    subjectLabel: 'Chủ đề cần hỗ trợ',
    subjectPlaceholder: 'Ví dụ: Lỗi đơn hàng #123, Tư vấn sản phẩm...',
    messageLabel: 'Nội dung chi tiết',
    messagePlaceholder: 'Vui lòng mô tả chi tiết vấn đề bạn đang gặp phải...',
    submit: 'Gửi yêu cầu hỗ trợ',
    statusOpen: 'Mới',
    statusProgress: 'Đang xử lý',
    statusResolved: 'Đã giải quyết',
    statusClosed: 'Đã đóng',
  },
  en: {
    loadFailed: 'Could not load support requests',
    required: 'Please fill in all required information',
    createSuccess: 'Support request sent successfully',
    createFailed: 'Failed to send support request',
    subjectLabel: 'Support subject',
    subjectPlaceholder: 'Example: Order #123 issue, product consultation...',
    messageLabel: 'Detailed message',
    messagePlaceholder: 'Please describe the issue you are experiencing...',
    submit: 'Send support request',
    statusOpen: 'New',
    statusProgress: 'In progress',
    statusResolved: 'Resolved',
    statusClosed: 'Closed',
  },
  ja: {
    loadFailed: 'サポート依頼を読み込めませんでした',
    required: '必要な情報をすべて入力してください',
    createSuccess: 'サポート依頼を送信しました',
    createFailed: 'サポート依頼の送信に失敗しました',
    subjectLabel: 'サポート件名',
    subjectPlaceholder: '例：注文 #123 の問題、商品相談...',
    messageLabel: '詳細内容',
    messagePlaceholder: '発生している問題を詳しく入力してください...',
    submit: 'サポート依頼を送信',
    statusOpen: '新規',
    statusProgress: '対応中',
    statusResolved: '解決済み',
    statusClosed: '終了',
  },
  ko: {
    loadFailed: '지원 요청 목록을 불러올 수 없습니다',
    required: '필수 정보를 모두 입력해 주세요',
    createSuccess: '지원 요청이 전송되었습니다',
    createFailed: '지원 요청 전송에 실패했습니다',
    subjectLabel: '지원 제목',
    subjectPlaceholder: '예: 주문 #123 오류, 상품 상담...',
    messageLabel: '상세 내용',
    messagePlaceholder: '겪고 있는 문제를 자세히 설명해 주세요...',
    submit: '지원 요청 보내기',
    statusOpen: '신규',
    statusProgress: '처리 중',
    statusResolved: '해결됨',
    statusClosed: '종료됨',
  },
};

export default function SupportTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t, locale } = useTranslation();
  const text = supportText[locale];

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/support/my');
      if (res.data.success) {
        setTickets(res.data.data);
      }
    } catch {
      toast.error(text.loadFailed);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicket.subject || !newTicket.message) {
      toast.error(text.required);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/support', newTicket);
      if (res.data.success) {
        toast.success(text.createSuccess);
        setShowCreate(false);
        setNewTicket({ subject: '', message: '' });
        void fetchTickets();
      }
    } catch {
      toast.error(text.createFailed);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <span className="bg-warning/10 text-warning px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center w-fit"><AlertCircle className="w-3.5 h-3.5 mr-1" /> {text.statusOpen}</span>;
      case 'IN_PROGRESS':
        return <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center w-fit"><Clock className="w-3.5 h-3.5 mr-1" /> {text.statusProgress}</span>;
      case 'RESOLVED':
        return <span className="bg-success/10 text-success px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center w-fit"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> {text.statusResolved}</span>;
      default:
        return <span className="bg-secondary text-muted-foreground px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center w-fit"><MessageSquare className="w-3.5 h-3.5 mr-1" /> {text.statusClosed}</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-2">
          <Link href="/profile" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors group mb-2">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> {t('support.backToProfile')}
          </Link>
          <h1 className="font-heading text-3xl sm:text-4xl text-foreground">{t('support.title')}</h1>
          <p className="text-muted-foreground text-sm">{t('support.desc')}</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)} className="rounded-full shadow-md hover:shadow-lg">
          {showCreate ? <><ArrowLeft className="w-4 h-4 mr-2" /> {t('common.cancel')}</> : <><Plus className="w-4 h-4 mr-2" /> {t('support.createNew')}</>}
        </Button>
      </div>

      {showCreate ? (
        <div className="card-elevated bg-card p-8 rounded-[var(--radius-xl)] max-w-2xl mx-auto border border-border">
          <form onSubmit={handleCreate} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{text.subjectLabel}</label>
              <Input
                placeholder={text.subjectPlaceholder}
                value={newTicket.subject}
                onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{text.messageLabel}</label>
              <textarea
                rows={5}
                placeholder={text.messagePlaceholder}
                value={newTicket.message}
                onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                className="w-full bg-background border border-border p-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none rounded-[var(--radius-md)]"
              />
            </div>
            <Button type="submit" isLoading={isSubmitting} className="w-full h-12">
              {text.submit} <MessageSquare className="ml-2 w-4 h-4" />
            </Button>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-sm font-medium text-muted-foreground">{t('common.loading')}</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="card-elevated bg-card rounded-[var(--radius-xl)] p-16 text-center space-y-5 border border-border">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto ring-4 ring-background shadow-sm">
                <MessageSquare className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="font-heading text-2xl text-foreground">{t('support.noRequests')}</h3>
                <p className="text-sm text-muted-foreground">{t('support.noRequestsDesc')}</p>
              </div>
              <Button onClick={() => setShowCreate(true)} variant="outline" className="mt-2">{t('support.createFirst')}</Button>
            </div>
          ) : (
            tickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/profile/support/${ticket.id}`}
                className="card-elevated bg-card rounded-[var(--radius-lg)] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 group hover:shadow-md transition-all border border-border"
              >
                <div className="flex items-start sm:items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${ticket.status === 'RESOLVED' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}>
                    {ticket.status === 'RESOLVED' ? <CheckCircle2 className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">{ticket.subject}</h3>
                    <div className="flex items-center space-x-2 text-xs font-medium text-muted-foreground">
                      <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> {new Date(ticket.updatedAt).toLocaleDateString(locale === 'vi' ? 'vi-VN' : locale)}</span>
                      <span>•</span>
                      <span>ID: #{ticket.id.slice(0, 8)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0">
                  {getStatusBadge(ticket.status)}
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}

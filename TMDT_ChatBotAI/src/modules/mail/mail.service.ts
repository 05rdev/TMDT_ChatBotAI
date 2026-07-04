import nodemailer from 'nodemailer';

type MailOrder = {
  id: string;
  status: string;
  totalAmount: unknown;
  address?: string | null;
  phone?: string | null;
  createdAt: Date;
  updatedAt?: Date;
  cancelReason?: string | null;
  user: { name: string; email: string };
  items: Array<{
    quantity: number;
    price: unknown;
    product: { name: string };
    variant: { name: string };
  }>;
  payment?: { method: string; status: string; amount: unknown } | null;
  voucher?: { code: string; discountType: string; discountValue: unknown } | null;
};

type MailTicket = {
  id: string;
  subject: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  user: { name: string; email: string };
};

const ORDER_STATUS: Record<string, string> = {
  PENDING: 'Cho duyet',
  PROCESSING: 'Dang goi',
  SHIPPED: 'Dang giao',
  DELIVERED: 'Hoan tat',
  CANCELLED: 'Da huy',
};

const PAYMENT_STATUS: Record<string, string> = {
  PENDING: 'Cho thanh toan',
  SUCCESS: 'Thanh cong',
  FAILED: 'That bai',
  REFUNDED: 'Da hoan tien',
};

const PAYMENT_METHOD: Record<string, string> = {
  COD: 'Thanh toan khi nhan hang',
  VNPAY: 'VNPay',
  MOMO: 'MoMo',
  STRIPE: 'Stripe',
  SEPAY: 'Chuyen khoan ngan hang',
};

class MailService {
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  private from = `"${process.env.SMTP_FROM_NAME || 'V.DinhCMS.GMGear Shop'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`;

  private isEnabled() {
    return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
  }

  private formatDate(date: Date) {
    return new Date(date).toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  private formatMoney(value: unknown) {
    return `${Number(value || 0).toLocaleString('vi-VN')}d`;
  }

  private escape(value: unknown) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private htmlLayout(title: string, body: string) {
    return `
      <div style="font-family:Arial,sans-serif;background:#f6f7f9;padding:24px;color:#1f2937">
        <div style="max-width:720px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
          <div style="background:#ea7a33;color:#fff;padding:18px 24px">
            <h2 style="margin:0;font-size:22px">${this.escape(title)}</h2>
            <p style="margin:6px 0 0">V.DinhCMS.GMGear Shop</p>
          </div>
          <div style="padding:24px;line-height:1.6">${body}</div>
          <div style="padding:16px 24px;background:#f9fafb;color:#6b7280;font-size:13px">
            Email nay duoc gui tu he thong vao ${this.formatDate(new Date())}. Vui long khong chia se cac duong link bao mat cho nguoi khac.
          </div>
        </div>
      </div>
    `;
  }

  private async send(to: string, subject: string, html: string, text?: string) {
    if (!this.isEnabled()) {
      console.warn('Email is disabled: SMTP_USER/SMTP_PASS is missing');
      return;
    }

    await this.transporter.sendMail({
      from: this.from,
      to,
      subject,
      html,
      text,
    });
  }

  private orderRows(order: MailOrder) {
    return order.items
      .map((item) => {
        const lineTotal = Number(item.price || 0) * item.quantity;
        return `
          <tr>
            <td style="padding:10px;border-bottom:1px solid #e5e7eb">${this.escape(item.product.name)}</td>
            <td style="padding:10px;border-bottom:1px solid #e5e7eb">${this.escape(item.variant.name)}</td>
            <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:center">${item.quantity}</td>
            <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right">${this.formatMoney(item.price)}</td>
            <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right">${this.formatMoney(lineTotal)}</td>
          </tr>
        `;
      })
      .join('');
  }

  private orderDetails(order: MailOrder, extraRows = '') {
    return `
      <p>Xin chao <strong>${this.escape(order.user.name)}</strong>,</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:6px 0"><strong>Ma don:</strong></td><td>#${order.id.slice(0, 8)}</td></tr>
        <tr><td style="padding:6px 0"><strong>Trang thai:</strong></td><td>${ORDER_STATUS[order.status] || order.status}</td></tr>
        <tr><td style="padding:6px 0"><strong>Thoi gian dat:</strong></td><td>${this.formatDate(order.createdAt)}</td></tr>
        ${order.updatedAt ? `<tr><td style="padding:6px 0"><strong>Cap nhat gan nhat:</strong></td><td>${this.formatDate(order.updatedAt)}</td></tr>` : ''}
        <tr><td style="padding:6px 0"><strong>Nguoi nhan/SĐT:</strong></td><td>${this.escape(order.user.name)} - ${this.escape(order.phone || 'Chua cap nhat')}</td></tr>
        <tr><td style="padding:6px 0"><strong>Dia chi giao hang:</strong></td><td>${this.escape(order.address || 'Chua cap nhat')}</td></tr>
        <tr><td style="padding:6px 0"><strong>Thanh toan:</strong></td><td>${PAYMENT_METHOD[order.payment?.method || ''] || order.payment?.method || 'Chua co'} - ${PAYMENT_STATUS[order.payment?.status || ''] || order.payment?.status || 'Chua co'}</td></tr>
        ${order.voucher ? `<tr><td style="padding:6px 0"><strong>Voucher:</strong></td><td>${this.escape(order.voucher.code)}</td></tr>` : ''}
        ${order.cancelReason ? `<tr><td style="padding:6px 0"><strong>Ly do huy:</strong></td><td>${this.escape(order.cancelReason)}</td></tr>` : ''}
        ${extraRows}
      </table>
      <h3>Chi tiet san pham</h3>
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="background:#f3f4f6">
            <th style="padding:10px;text-align:left">San pham</th>
            <th style="padding:10px;text-align:left">Phien ban</th>
            <th style="padding:10px;text-align:center">SL</th>
            <th style="padding:10px;text-align:right">Don gia</th>
            <th style="padding:10px;text-align:right">Thanh tien</th>
          </tr>
        </thead>
        <tbody>${this.orderRows(order)}</tbody>
      </table>
      <p style="font-size:18px;text-align:right"><strong>Tong thanh toan: ${this.formatMoney(order.totalAmount)}</strong></p>
    `;
  }

  async sendPasswordReset(user: { name: string; email: string }, resetUrl: string, expiresMinutes: number) {
    const body = `
      <p>Xin chao <strong>${this.escape(user.name)}</strong>,</p>
      <p>He thong vua nhan yeu cau dat lai mat khau cho tai khoan ${this.escape(user.email)}.</p>
      <p>Thoi gian yeu cau: <strong>${this.formatDate(new Date())}</strong></p>
      <p>Link co hieu luc trong <strong>${expiresMinutes} phut</strong>:</p>
      <p><a href="${this.escape(resetUrl)}" style="display:inline-block;background:#ea7a33;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none">Dat lai mat khau</a></p>
      <p>Neu ban khong yeu cau thao tac nay, hay bo qua email nay va doi mat khau neu can.</p>
    `;

    await this.send(user.email, 'Dat lai mat khau V.DinhCMS.GMGear Shop', this.htmlLayout('Dat lai mat khau', body));
  }

  async sendOrderCreated(order: MailOrder) {
    const body = this.orderDetails(order);
    await this.send(order.user.email, `Xac nhan don hang #${order.id.slice(0, 8)}`, this.htmlLayout('Don hang da duoc tao', body));
  }

  async sendOrderStatusChanged(order: MailOrder, previousStatus: string) {
    const extraRows = `<tr><td style="padding:6px 0"><strong>Trang thai truoc:</strong></td><td>${ORDER_STATUS[previousStatus] || previousStatus}</td></tr>`;
    const body = `
      <p>Don hang cua ban vua duoc cap nhat trang thai.</p>
      ${this.orderDetails(order, extraRows)}
    `;

    await this.send(
      order.user.email,
      `Cap nhat trang thai don hang #${order.id.slice(0, 8)}: ${ORDER_STATUS[order.status] || order.status}`,
      this.htmlLayout('Cap nhat don hang', body)
    );
  }

  async sendSupportCreated(ticket: MailTicket, message: string) {
    const body = `
      <p>Xin chao <strong>${this.escape(ticket.user.name)}</strong>,</p>
      <p>He thong da ghi nhan yeu cau ho tro cua ban.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td><strong>Ma ticket:</strong></td><td>#${ticket.id.slice(0, 8)}</td></tr>
        <tr><td><strong>Tieu de:</strong></td><td>${this.escape(ticket.subject)}</td></tr>
        <tr><td><strong>Trang thai:</strong></td><td>${this.escape(ticket.status)}</td></tr>
        <tr><td><strong>Thoi gian gui:</strong></td><td>${this.formatDate(ticket.createdAt)}</td></tr>
      </table>
      <p><strong>Noi dung:</strong></p>
      <div style="white-space:pre-wrap;background:#f9fafb;padding:12px;border-radius:8px">${this.escape(message)}</div>
    `;

    await this.send(ticket.user.email, `Da nhan yeu cau ho tro #${ticket.id.slice(0, 8)}`, this.htmlLayout('Yeu cau ho tro da duoc ghi nhan', body));
  }

  async sendSupportReply(ticket: MailTicket, reply: { content: string; createdAt: Date; sender: { name: string; role: string } }) {
    const body = `
      <p>Xin chao <strong>${this.escape(ticket.user.name)}</strong>,</p>
      <p>Yeu cau ho tro cua ban vua co phan hoi moi.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td><strong>Ma ticket:</strong></td><td>#${ticket.id.slice(0, 8)}</td></tr>
        <tr><td><strong>Tieu de:</strong></td><td>${this.escape(ticket.subject)}</td></tr>
        <tr><td><strong>Trang thai:</strong></td><td>${this.escape(ticket.status)}</td></tr>
        <tr><td><strong>Nguoi phan hoi:</strong></td><td>${this.escape(reply.sender.name)} (${this.escape(reply.sender.role)})</td></tr>
        <tr><td><strong>Thoi gian phan hoi:</strong></td><td>${this.formatDate(reply.createdAt)}</td></tr>
      </table>
      <p><strong>Noi dung phan hoi:</strong></p>
      <div style="white-space:pre-wrap;background:#f9fafb;padding:12px;border-radius:8px">${this.escape(reply.content)}</div>
    `;

    await this.send(ticket.user.email, `Phan hoi ho tro #${ticket.id.slice(0, 8)}`, this.htmlLayout('Ho tro da phan hoi', body));
  }
}

export const mailService = new MailService();

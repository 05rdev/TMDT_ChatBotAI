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

type LayoutOptions = {
  title: string;
  preheader: string;
  badge?: string;
  body: string;
  cta?: { label: string; url: string };
};

const BRAND_NAME = 'UltraShop';
const BRAND_COLOR = '#ea7a33';
const DARK_TEXT = '#111827';
const MUTED_TEXT = '#6b7280';
const BORDER = '#e5e7eb';

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

  private frontendUrl() {
    return (process.env.FRONTEND_URL || process.env.CORS_ORIGIN || 'http://localhost:3000').replace(/\/$/, '');
  }

  private orderUrl(orderId: string) {
    return `${this.frontendUrl()}/profile/orders/${orderId}`;
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

  private field(label: string, value: unknown) {
    return `
      <tr>
        <td style="padding:10px 0;color:${MUTED_TEXT};font-size:13px;border-bottom:1px solid ${BORDER};">${this.escape(label)}</td>
        <td align="right" style="padding:10px 0;color:${DARK_TEXT};font-size:13px;font-weight:700;border-bottom:1px solid ${BORDER};">${this.escape(value)}</td>
      </tr>
    `;
  }

  private ctaButton(label: string, url: string) {
    return `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:28px auto 8px;">
        <tr>
          <td bgcolor="${BRAND_COLOR}" style="border-radius:10px;">
            <a href="${this.escape(url)}" target="_blank" style="display:inline-block;padding:14px 24px;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;text-decoration:none;border-radius:10px;">
              ${this.escape(label)}
            </a>
          </td>
        </tr>
      </table>
    `;
  }

  private layout(options: LayoutOptions) {
    const cta = options.cta ? this.ctaButton(options.cta.label, options.cta.url) : '';
    return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light dark">
    <meta name="supported-color-schemes" content="light dark">
    <title>${this.escape(options.title)}</title>
    <style>
      @media only screen and (max-width: 640px) {
        .container { width: 100% !important; }
        .content { padding: 22px !important; }
        .stack { display: block !important; width: 100% !important; }
        .center-mobile { text-align: center !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,Helvetica,sans-serif;color:${DARK_TEXT};">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${this.escape(options.preheader)}</div>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#f4f5f7">
      <tr>
        <td align="center" style="padding:28px 12px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="container" style="width:600px;max-width:600px;background:#ffffff;border:1px solid ${BORDER};border-radius:16px;overflow:hidden;">
            <tr>
              <td bgcolor="#ffffff" style="padding:26px 28px 18px;border-bottom:1px solid ${BORDER};">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td class="center-mobile" style="font-size:22px;line-height:28px;font-weight:800;color:${DARK_TEXT};">
                      <span style="display:inline-block;width:34px;height:34px;line-height:34px;text-align:center;background:${BRAND_COLOR};color:#ffffff;border-radius:9px;margin-right:8px;font-size:17px;">U</span>
                      ${BRAND_NAME}
                    </td>
                    <td align="right" class="center-mobile" style="font-size:12px;color:${MUTED_TEXT};font-weight:700;text-transform:uppercase;letter-spacing:.08em;">
                      Transactional Email
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td class="content" style="padding:30px 34px 34px;">
                ${options.badge ? `<div style="display:inline-block;background:#fff3eb;color:${BRAND_COLOR};border:1px solid #ffd8c2;border-radius:999px;padding:7px 12px;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;">${this.escape(options.badge)}</div>` : ''}
                <h1 style="margin:16px 0 10px;color:${DARK_TEXT};font-size:28px;line-height:36px;font-weight:800;">${this.escape(options.title)}</h1>
                ${options.body}
                ${cta}
              </td>
            </tr>
            <tr>
              <td bgcolor="#111827" style="padding:22px 28px;color:#d1d5db;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td class="stack" style="font-size:13px;line-height:20px;">
                      <strong style="color:#ffffff;">${BRAND_NAME}</strong><br>
                      Email tu dong duoc gui luc ${this.formatDate(new Date())}.<br>
                      Can ho tro? Phan hoi email nay hoac lien he bo phan cham soc khach hang.
                    </td>
                    <td class="stack center-mobile" align="right" style="padding-top:6px;font-size:12px;line-height:20px;">
                      <a href="${this.frontendUrl()}" style="color:#ffffff;text-decoration:none;">Website</a>
                      <span style="color:#6b7280;"> | </span>
                      <a href="${this.frontendUrl()}/profile/support" style="color:#ffffff;text-decoration:none;">Ho tro</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
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
            <td style="padding:12px 10px;border-bottom:1px solid ${BORDER};font-size:13px;color:${DARK_TEXT};font-weight:700;">${this.escape(item.product.name)}<br><span style="font-size:12px;color:${MUTED_TEXT};font-weight:400;">${this.escape(item.variant.name)}</span></td>
            <td align="center" style="padding:12px 10px;border-bottom:1px solid ${BORDER};font-size:13px;color:${DARK_TEXT};">${item.quantity}</td>
            <td align="right" style="padding:12px 10px;border-bottom:1px solid ${BORDER};font-size:13px;color:${DARK_TEXT};">${this.formatMoney(item.price)}</td>
            <td align="right" style="padding:12px 10px;border-bottom:1px solid ${BORDER};font-size:13px;color:${DARK_TEXT};font-weight:800;">${this.formatMoney(lineTotal)}</td>
          </tr>
        `;
      })
      .join('');
  }

  private orderSummary(order: MailOrder, extraRows = '') {
    return `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:22px 0;border:1px solid ${BORDER};border-radius:12px;border-collapse:separate;">
        <tr>
          <td style="padding:18px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              ${this.field('Ma don hang', `#${order.id.slice(0, 8)}`)}
              ${this.field('Trang thai', ORDER_STATUS[order.status] || order.status)}
              ${this.field('Ngay dat', this.formatDate(order.createdAt))}
              ${order.updatedAt ? this.field('Cap nhat gan nhat', this.formatDate(order.updatedAt)) : ''}
              ${this.field('Nguoi nhan', `${order.user.name} - ${order.phone || 'Chua cap nhat'}`)}
              ${this.field('Dia chi giao hang', order.address || 'Chua cap nhat')}
              ${this.field('Thanh toan', `${PAYMENT_METHOD[order.payment?.method || ''] || order.payment?.method || 'Chua co'} - ${PAYMENT_STATUS[order.payment?.status || ''] || order.payment?.status || 'Chua co'}`)}
              ${order.voucher ? this.field('Voucher', order.voucher.code) : ''}
              ${order.cancelReason ? this.field('Ly do huy', order.cancelReason) : ''}
              ${extraRows}
            </table>
          </td>
        </tr>
      </table>
    `;
  }

  private orderItemsTable(order: MailOrder) {
    return `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border:1px solid ${BORDER};border-radius:12px;border-collapse:separate;overflow:hidden;">
        <tr bgcolor="#f9fafb">
          <th align="left" style="padding:12px 10px;font-size:12px;color:${MUTED_TEXT};text-transform:uppercase;">San pham</th>
          <th align="center" style="padding:12px 10px;font-size:12px;color:${MUTED_TEXT};text-transform:uppercase;">SL</th>
          <th align="right" style="padding:12px 10px;font-size:12px;color:${MUTED_TEXT};text-transform:uppercase;">Don gia</th>
          <th align="right" style="padding:12px 10px;font-size:12px;color:${MUTED_TEXT};text-transform:uppercase;">Thanh tien</th>
        </tr>
        ${this.orderRows(order)}
        <tr>
          <td colspan="3" align="right" style="padding:16px 10px;font-size:14px;color:${DARK_TEXT};font-weight:800;">Tong thanh toan</td>
          <td align="right" style="padding:16px 10px;font-size:18px;color:${BRAND_COLOR};font-weight:900;">${this.formatMoney(order.totalAmount)}</td>
        </tr>
      </table>
    `;
  }

  private statusTimeline(currentStatus: string) {
    const steps = [
      { key: 'PENDING', label: 'Da xac nhan' },
      { key: 'PROCESSING', label: 'Dang goi' },
      { key: 'SHIPPED', label: 'Dang giao' },
      { key: 'DELIVERED', label: 'Da giao' },
    ];
    const index = Math.max(0, steps.findIndex((step) => step.key === currentStatus));

    if (currentStatus === 'CANCELLED') {
      return `<div style="margin:20px 0;padding:16px;border:1px solid #fecaca;background:#fff1f2;border-radius:12px;color:#991b1b;font-size:14px;font-weight:700;">Don hang da duoc huy. Neu ban can ho tro them, vui long lien he bo phan cham soc khach hang.</div>`;
    }

    return `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:20px 0;">
        <tr>
          ${steps
            .map((step, stepIndex) => {
              const active = stepIndex <= index;
              return `
                <td align="center" width="25%" style="padding:4px;">
                  <div style="width:28px;height:28px;line-height:28px;border-radius:999px;background:${active ? BRAND_COLOR : '#e5e7eb'};color:${active ? '#ffffff' : MUTED_TEXT};font-size:13px;font-weight:800;margin:0 auto;">${active ? '&#10003;' : stepIndex + 1}</div>
                  <div style="padding-top:8px;font-size:12px;color:${active ? DARK_TEXT : MUTED_TEXT};font-weight:${active ? 800 : 500};">${step.label}</div>
                </td>
              `;
            })
            .join('')}
        </tr>
      </table>
    `;
  }

  async sendPasswordReset(user: { name: string; email: string }, resetUrl: string, expiresMinutes: number) {
    const body = `
      <p style="margin:0 0 14px;color:${MUTED_TEXT};font-size:15px;line-height:24px;">Xin chao <strong style="color:${DARK_TEXT};">${this.escape(user.name)}</strong>, chung toi vua nhan yeu cau dat lai mat khau cho tai khoan ${this.escape(user.email)}.</p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#fff7ed" style="border:1px solid #fed7aa;border-radius:12px;margin:18px 0;">
        <tr>
          <td style="padding:16px;color:#9a3412;font-size:14px;line-height:22px;">
            Link dat lai mat khau co hieu luc trong <strong>${expiresMinutes} phut</strong>. Neu khong phai ban yeu cau, hay bo qua email nay.
          </td>
        </tr>
      </table>
      <p style="margin:18px 0 8px;color:${MUTED_TEXT};font-size:13px;line-height:20px;">Neu nut khong hoat dong, sao chep lien ket sau vao trinh duyet:</p>
      <p style="margin:0;word-break:break-all;color:${BRAND_COLOR};font-size:12px;line-height:18px;">${this.escape(resetUrl)}</p>
    `;

    await this.send(
      user.email,
      'Dat lai mat khau cua ban',
      this.layout({
        title: 'Dat lai mat khau cua ban',
        preheader: `Lien ket dat lai mat khau co hieu luc trong ${expiresMinutes} phut.`,
        badge: 'Bao mat tai khoan',
        body,
        cta: { label: 'Dat lai mat khau', url: resetUrl },
      })
    );
  }

  async sendVerificationOtp(user: { name: string; email: string }, otp: string, expiresMinutes: number) {
    const body = `
      <p style="margin:0 0 14px;color:${MUTED_TEXT};font-size:15px;line-height:24px;">Xin chao <strong style="color:${DARK_TEXT};">${this.escape(user.name)}</strong>, day la ma xac thuc tai khoan cua ban.</p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#f9fafb" style="border:1px solid ${BORDER};border-radius:12px;margin:20px 0;">
        <tr>
          <td align="center" style="padding:24px 16px;">
            <div style="font-family:'Courier New',monospace;font-size:34px;line-height:42px;letter-spacing:8px;color:${DARK_TEXT};font-weight:900;">${this.escape(otp)}</div>
          </td>
        </tr>
      </table>
      <p style="margin:0;color:${MUTED_TEXT};font-size:14px;line-height:22px;">Ma het han sau <strong>${expiresMinutes} phut</strong>. Khong chia se ma nay voi bat ky ai.</p>
    `;

    await this.send(
      user.email,
      'Ma xac thuc tai khoan',
      this.layout({
        title: 'Ma xac thuc OTP',
        preheader: `Ma OTP cua ban het han sau ${expiresMinutes} phut.`,
        badge: 'Xac thuc',
        body,
      })
    );
  }

  async sendOrderCreated(order: MailOrder) {
    const body = `
      <p style="margin:0 0 14px;color:${MUTED_TEXT};font-size:15px;line-height:24px;">Cam on <strong style="color:${DARK_TEXT};">${this.escape(order.user.name)}</strong>. Don hang cua ban da duoc ghi nhan va dang cho xu ly.</p>
      ${this.orderSummary(order)}
      ${this.orderItemsTable(order)}
    `;

    await this.send(
      order.user.email,
      `Dat hang thanh cong #${order.id.slice(0, 8)}`,
      this.layout({
        title: 'Dat hang thanh cong!',
        preheader: `Don hang #${order.id.slice(0, 8)} da duoc ghi nhan voi tong tien ${this.formatMoney(order.totalAmount)}.`,
        badge: 'Xac nhan don hang',
        body,
        cta: { label: 'Theo doi don hang', url: this.orderUrl(order.id) },
      })
    );
  }

  async sendOrderStatusChanged(order: MailOrder, previousStatus: string) {
    const extraRows = this.field('Trang thai truoc', ORDER_STATUS[previousStatus] || previousStatus);
    const body = `
      <p style="margin:0 0 14px;color:${MUTED_TEXT};font-size:15px;line-height:24px;">Don hang <strong style="color:${DARK_TEXT};">#${order.id.slice(0, 8)}</strong> vua duoc cap nhat sang <strong style="color:${BRAND_COLOR};">${ORDER_STATUS[order.status] || order.status}</strong>.</p>
      ${this.statusTimeline(order.status)}
      ${this.orderSummary(order, extraRows)}
      ${this.orderItemsTable(order)}
    `;

    await this.send(
      order.user.email,
      `Cap nhat don hang #${order.id.slice(0, 8)}: ${ORDER_STATUS[order.status] || order.status}`,
      this.layout({
        title: 'Cap nhat trang thai don hang',
        preheader: `Don hang #${order.id.slice(0, 8)} hien dang o trang thai ${ORDER_STATUS[order.status] || order.status}.`,
        badge: 'Trang thai giao hang',
        body,
        cta: { label: 'Xem chi tiet don hang', url: this.orderUrl(order.id) },
      })
    );
  }

  async sendSupportCreated(ticket: MailTicket, message: string) {
    const body = `
      <p style="margin:0 0 14px;color:${MUTED_TEXT};font-size:15px;line-height:24px;">Xin chao <strong style="color:${DARK_TEXT};">${this.escape(ticket.user.name)}</strong>, chung toi da ghi nhan yeu cau ho tro cua ban.</p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:20px 0;border:1px solid ${BORDER};border-radius:12px;border-collapse:separate;">
        <tr><td style="padding:18px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          ${this.field('Ma ticket', `#${ticket.id.slice(0, 8)}`)}
          ${this.field('Tieu de', ticket.subject)}
          ${this.field('Trang thai', ticket.status)}
          ${this.field('Thoi gian gui', this.formatDate(ticket.createdAt))}
        </table></td></tr>
      </table>
      <div style="white-space:pre-wrap;background:#f9fafb;border:1px solid ${BORDER};padding:16px;border-radius:12px;color:${DARK_TEXT};font-size:14px;line-height:22px;">${this.escape(message)}</div>
    `;

    await this.send(
      ticket.user.email,
      `Da nhan yeu cau ho tro #${ticket.id.slice(0, 8)}`,
      this.layout({
        title: 'Yeu cau ho tro da duoc ghi nhan',
        preheader: `Ticket #${ticket.id.slice(0, 8)} da duoc tao thanh cong.`,
        badge: 'Ho tro khach hang',
        body,
        cta: { label: 'Xem yeu cau ho tro', url: `${this.frontendUrl()}/profile/support/${ticket.id}` },
      })
    );
  }

  async sendSupportReply(ticket: MailTicket, reply: { content: string; createdAt: Date; sender: { name: string; role: string } }) {
    const body = `
      <p style="margin:0 0 14px;color:${MUTED_TEXT};font-size:15px;line-height:24px;">Yeu cau ho tro <strong style="color:${DARK_TEXT};">#${ticket.id.slice(0, 8)}</strong> vua co phan hoi moi.</p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:20px 0;border:1px solid ${BORDER};border-radius:12px;border-collapse:separate;">
        <tr><td style="padding:18px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          ${this.field('Tieu de', ticket.subject)}
          ${this.field('Nguoi phan hoi', `${reply.sender.name} (${reply.sender.role})`)}
          ${this.field('Thoi gian phan hoi', this.formatDate(reply.createdAt))}
        </table></td></tr>
      </table>
      <div style="white-space:pre-wrap;background:#f9fafb;border:1px solid ${BORDER};padding:16px;border-radius:12px;color:${DARK_TEXT};font-size:14px;line-height:22px;">${this.escape(reply.content)}</div>
    `;

    await this.send(
      ticket.user.email,
      `Phan hoi ho tro #${ticket.id.slice(0, 8)}`,
      this.layout({
        title: 'Ho tro da phan hoi',
        preheader: `Ticket #${ticket.id.slice(0, 8)} vua co phan hoi moi.`,
        badge: 'Ho tro khach hang',
        body,
        cta: { label: 'Xem phan hoi', url: `${this.frontendUrl()}/profile/support/${ticket.id}` },
      })
    );
  }
}

export const mailService = new MailService();

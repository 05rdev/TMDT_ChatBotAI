# Xây dựng hệ thống bán đồ công nghệ tích hợp AI phân tích hành vi và gợi ý sản phẩm cá nhân hóa

![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-4.x-000000?logo=express&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16.x-000000?logo=next.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL%20%2B%20pgvector-15-4169E1?logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-5.x-2D3748?logo=prisma&logoColor=white)
![License](https://img.shields.io/badge/License-Educational-lightgrey)

## Mục lục

- [1. Tổng quan dự án](#1-tổng-quan-dự-án)
- [2. Tính năng chính](#2-tính-năng-chính)
- [3. Công nghệ sử dụng](#3-công-nghệ-sử-dụng)
- [4. Kiến trúc hệ thống](#4-kiến-trúc-hệ-thống)
- [5. Backend](#5-backend)
- [6. Frontend](#6-frontend)
- [7. Database](#7-database)
- [8. Tích hợp bên thứ ba](#8-tích-hợp-bên-thứ-ba)
- [9. Biến môi trường](#9-biến-môi-trường)
- [10. Cài đặt và chạy dự án](#10-cài-đặt-và-chạy-dự-án)
- [11. Testing API](#11-testing-api)
- [12. Build và deployment](#12-build-và-deployment)
- [13. Troubleshooting / FAQ](#13-troubleshooting--faq)
- [14. Liên hệ](#14-liên-hệ)

## 1. Tổng quan dự án

**Tên dự án:** Xây dựng hệ thống bán đồ công nghệ tích hợp AI phân tích hành vi và gợi ý sản phẩm cá nhân hóa.

Dự án là một hệ thống thương mại điện tử cho cửa hàng đồ công nghệ/gaming như laptop, màn hình, thiết bị lưu trữ, điện thoại, đồng hồ thông minh, gaming gear và phụ kiện. Hệ thống phục vụ hai nhóm người dùng chính:

- **Khách hàng:** tìm kiếm sản phẩm, nhận gợi ý cá nhân hóa, trò chuyện với AI assistant, quản lý giỏ hàng, đặt hàng, thanh toán, theo dõi đơn hàng và gửi hỗ trợ.
- **Quản trị viên:** quản lý sản phẩm, danh mục, đơn hàng, khách hàng, voucher, banner, thông báo, hỗ trợ và dùng AI admin assistant để truy vấn/chỉnh sửa dữ liệu vận hành có xác nhận.

Dự án được tổ chức dạng **monorepo tách frontend/backend**:

- `server`: backend API, database, AI services, payment, mail.
- `client`: frontend web app Next.js.

## 2. Tính năng chính

- Đăng ký, đăng nhập, refresh token, đổi mật khẩu, quên mật khẩu qua email.
- Trang chủ, cửa hàng, chi tiết sản phẩm, tìm kiếm, lọc và xem thuộc tính sản phẩm.
- Giỏ hàng, đặt hàng, hủy đơn, cập nhật thông tin giao hàng, theo dõi trạng thái.
- Thanh toán COD, VNPay mô phỏng/redirect và SePay chuyển khoản ngân hàng.
- SePay webhook và polling lịch sử giao dịch qua API v2 để xác nhận thanh toán tự động.
- Email transactional: xác nhận đơn hàng, cập nhật trạng thái, quên mật khẩu, phản hồi hỗ trợ, OTP template.
- AI search, gợi ý sản phẩm tương tự/cá nhân hóa, chatbot người dùng.
- AI admin assistant hỗ trợ truy vấn thống kê và thao tác dữ liệu có bước xác nhận.
- Admin dashboard: sản phẩm, danh mục, đơn hàng, khách hàng, voucher, banner, cài đặt, hỗ trợ.
- Notification center và popup thông báo.
- Hệ thống support ticket giữa khách hàng và admin.
- Swagger UI cho tài liệu API.

## 3. Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Backend | Node.js, Express.js, TypeScript |
| ORM | Prisma |
| Database | PostgreSQL 15 + pgvector |
| Cache/session phụ trợ | Redis |
| Frontend | Next.js 16 App Router, React 19, TypeScript |
| UI | Tailwind CSS 4, lucide-react, sonner, framer-motion |
| State management | Zustand, localStorage |
| Authentication | JWT access token + refresh token lưu Redis |
| AI | OpenAI API, Ollama local, embedding vector, CLIP service tùy chọn |
| Payment | SePay, VNPay mock/redirect, COD |
| Email | Nodemailer + Gmail SMTP hoặc SMTP provider tương thích |
| Docs | Swagger UI / OpenAPI annotations |
| DevOps local | Docker Compose cho PostgreSQL + Redis |

## 4. Kiến trúc hệ thống

### 4.1. Kiến trúc tổng thể

Dự án hiện là kiến trúc **modular monolith**:

- Backend Express được chia theo module nghiệp vụ: `auth`, `product`, `order`, `ai`, `cart`, `support`, `notification`, `voucher`, `banner`, `user`.
- Frontend Next.js dùng App Router, mỗi route nằm trong `src/app`.
- Database tập trung PostgreSQL, mở rộng pgvector để lưu embedding phục vụ semantic search/gợi ý.
- Redis dùng cho refresh token, token reset mật khẩu và dữ liệu ngắn hạn.
- Dịch vụ ngoài như SePay, SMTP, OpenAI/Ollama được gọi từ backend.

### 4.2. Luồng dữ liệu cơ bản

```mermaid
flowchart LR
  U["User/Admin Browser"] --> FE["Next.js Frontend :3000"]
  FE --> API["Express API :3002"]
  API --> DB[("PostgreSQL + pgvector")]
  API --> REDIS[("Redis")]
  API --> AI["OpenAI / Ollama / CLIP"]
  API --> PAY["SePay / VNPay"]
  API --> SMTP["SMTP Email"]
  PAY --> API2["Webhook / Polling API"]
```

### 4.3. Cấu trúc thư mục root

```text
D:\TTTN
├── client/              # Frontend Next.js
├── server/      # Backend Express + Prisma
├── .gitignore
└── README.md
```

## 5. Backend

### 5.1. Framework và ngôn ngữ

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **ORM:** Prisma Client
- **Entry point:** `server/src/server.ts`

### 5.2. Cấu trúc thư mục backend

```text
server/
├── prisma/
│   ├── schema.prisma          # Schema database
│   ├── seed.ts                # Seed dữ liệu demo
│   └── migrations/            # Prisma migrations
├── src/
│   ├── config/                # Logger, Swagger, maintenance config
│   ├── lib/                   # Prisma, Redis, Cloudinary client
│   ├── middlewares/           # Auth, authorize, error handler, rate limit helpers
│   ├── modules/
│   │   ├── ai/                # AI search, chatbot, recommendation, admin assistant
│   │   ├── auth/              # Auth controller/service/router
│   │   ├── banner/            # Banner management
│   │   ├── cart/              # Cart APIs
│   │   ├── mail/              # Transactional email templates/service
│   │   ├── notification/      # User/global notifications
│   │   ├── order/             # Order/payment/SePay/VNPay
│   │   ├── product/           # Product/category/review/attributes
│   │   ├── support/           # Support tickets
│   │   ├── user/              # User/admin dashboard
│   │   └── voucher/           # Promotion vouchers
│   ├── scripts/               # Embedding scripts
│   ├── utils/                 # JWT, status mapper, helpers
│   └── server.ts
├── docker-compose.yml         # PostgreSQL + Redis local
├── package.json
└── .env.example
```

### 5.3. API chính

Base URL mặc định:

```text
http://localhost:3002/api
```

Swagger UI:

```text
http://localhost:3002/api/docs
```

#### Auth

| Method | Endpoint | Mô tả | Auth required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Đăng ký tài khoản | No |
| `POST` | `/api/auth/login` | Đăng nhập, trả accessToken/refreshToken | No |
| `POST` | `/api/auth/refresh-token` | Làm mới access token | No |
| `POST` | `/api/auth/forgot-password` | Gửi email đặt lại mật khẩu | No |
| `POST` | `/api/auth/reset-password` | Đặt lại mật khẩu bằng token | No |
| `GET` | `/api/auth/profile` | Lấy hồ sơ hiện tại | Yes |
| `PUT` | `/api/auth/profile` | Cập nhật hồ sơ | Yes |
| `PUT` | `/api/auth/change-password` | Đổi mật khẩu | Yes |
| `POST` | `/api/auth/logout` | Đăng xuất, xóa refresh token | Yes |

#### Product & Category

| Method | Endpoint | Mô tả | Auth required |
|---|---|---|---|
| `GET` | `/api/products` | Danh sách sản phẩm | No |
| `GET` | `/api/products/hot` | Sản phẩm nổi bật/hot | No |
| `GET` | `/api/products/new` | Sản phẩm mới | No |
| `GET` | `/api/products/slug/:slug` | Chi tiết sản phẩm theo slug | No |
| `GET` | `/api/products/:id` | Chi tiết sản phẩm theo ID | No |
| `POST` | `/api/products` | Tạo sản phẩm | Admin |
| `PUT/PATCH` | `/api/products/:id` | Cập nhật sản phẩm | Admin |
| `DELETE` | `/api/products/:id` | Xóa mềm sản phẩm | Admin |
| `GET` | `/api/categories` | Danh sách danh mục | No |
| `POST` | `/api/categories` | Tạo danh mục | Admin |
| `PUT` | `/api/categories/:id` | Cập nhật danh mục | Admin |
| `DELETE` | `/api/categories/:id` | Xóa danh mục | Admin |

#### Cart & Order

| Method | Endpoint | Mô tả | Auth required |
|---|---|---|---|
| `GET` | `/api/cart` | Lấy giỏ hàng | Yes |
| `POST` | `/api/cart` | Thêm sản phẩm vào giỏ | Yes |
| `PUT` | `/api/cart/:productVariantId` | Cập nhật số lượng | Yes |
| `DELETE` | `/api/cart/:productVariantId` | Xóa một sản phẩm khỏi giỏ | Yes |
| `DELETE` | `/api/cart` | Xóa toàn bộ giỏ | Yes |
| `POST` | `/api/orders` | Tạo đơn hàng | Yes |
| `GET` | `/api/orders` | Lịch sử đơn của user | Yes |
| `GET` | `/api/orders/:id` | Chi tiết đơn hàng | Yes |
| `PATCH` | `/api/orders/:id/cancel` | Hủy đơn hàng | Yes |
| `PATCH` | `/api/orders/:id/info` | Cập nhật địa chỉ/SĐT | Yes |
| `PATCH` | `/api/orders/:id/return` | Yêu cầu hoàn trả | Yes |
| `PATCH` | `/api/orders/:id/status` | Admin cập nhật trạng thái | Admin |

#### Payment

| Method | Endpoint | Mô tả | Auth required |
|---|---|---|---|
| `POST` | `/api/orders/checkout` | Khởi tạo thanh toán VNPay/SePay | Yes |
| `GET` | `/api/orders/vnpay-return` | Xử lý redirect VNPay | No |
| `POST` | `/api/orders/sepay-webhook` | Webhook nhận giao dịch SePay | No, kiểm tra API key |
| `GET` | `/api/orders/sepay/check/:orderId` | Chủ động kiểm tra lịch sử giao dịch SePay | Yes |
| `POST` | `/api/orders/webhook` | Webhook mô phỏng thanh toán | Yes |

#### AI

| Method | Endpoint | Mô tả | Auth required |
|---|---|---|---|
| `GET` | `/api/ai/search` | AI/semantic search sản phẩm | Optional |
| `POST` | `/api/ai/visual-search` | Tìm kiếm bằng hình ảnh | No |
| `POST` | `/api/ai/voice-assistant` | Tìm kiếm/assistant bằng giọng nói | No |
| `GET` | `/api/ai/similar/:id` | Gợi ý sản phẩm tương tự | No |
| `GET` | `/api/ai/recommendations` | Gợi ý cá nhân hóa | Yes |
| `POST` | `/api/ai/chatbot` | Chatbot người dùng | Optional |
| `GET` | `/api/ai/chatbot/history` | Lịch sử chatbot | Yes |
| `DELETE` | `/api/ai/chatbot/history` | Xóa lịch sử chatbot | Yes |
| `POST` | `/api/ai/admin/chatbot` | Admin AI assistant | Admin login |
| `GET` | `/api/ai/admin/summarize-reviews/:productId` | Tóm tắt đánh giá | Admin |
| `POST` | `/api/ai/admin/analyze-revenue` | Phân tích doanh thu | Admin |

#### Admin, voucher, notification, support

| Method | Endpoint | Mô tả | Auth required |
|---|---|---|---|
| `GET` | `/api/admin/stats/overview` | Thống kê tổng quan | Admin |
| `GET` | `/api/admin/stats/top-products` | Top sản phẩm | Admin |
| `GET` | `/api/admin/stats/category` | Thống kê danh mục | Admin |
| `GET` | `/api/admin/stats/revenue-trend` | Xu hướng doanh thu | Admin |
| `GET` | `/api/admin/orders` | Danh sách đơn hàng admin | Admin |
| `GET` | `/api/admin/users` | Danh sách người dùng | Admin |
| `PATCH` | `/api/admin/users/:id/status` | Khóa/mở user | Admin |
| `PATCH` | `/api/admin/users/:id/role` | Đổi role user | Admin |
| `GET` | `/api/vouchers/active` | Voucher đang hoạt động | No |
| `POST` | `/api/vouchers/check` | Kiểm tra voucher | Yes |
| `GET/POST/PUT/DELETE` | `/api/vouchers` | CRUD voucher | Admin nên được bảo vệ |
| `GET` | `/api/notifications` | Thông báo của user | Yes |
| `POST` | `/api/notifications/send` | Gửi thông báo tới user | Admin |
| `POST` | `/api/notifications/broadcast` | Broadcast thông báo | Admin |
| `POST` | `/api/support` | Tạo ticket hỗ trợ | Yes |
| `GET` | `/api/support/my` | Ticket của tôi | Yes |
| `POST` | `/api/support/:id/reply` | Phản hồi ticket | Yes |
| `GET` | `/api/support` | Danh sách ticket | Admin |

### 5.4. Authentication / Authorization

Hệ thống dùng **JWT access token + refresh token**:

- `accessToken`: gửi qua header `Authorization: Bearer <token>`.
- `refreshToken`: lưu ở Redis theo key `refresh_token:<userId>`.
- Middleware `authenticate` xác thực JWT.
- Middleware `authorize` kiểm tra role, ví dụ `ADMIN`.
- Khi đổi mật khẩu hoặc reset mật khẩu, refresh token cũ bị xóa để buộc đăng nhập lại.

## 6. Frontend

### 6.1. Framework

- **Next.js 16 App Router**
- **React 19**
- **TypeScript**
- **Tailwind CSS 4**
- **Zustand** cho state auth/cart/language.

### 6.2. Cấu trúc thư mục frontend

```text
client/
├── public/                       # Static assets
├── src/
│   ├── app/                      # App Router pages
│   │   ├── admin/                # Dashboard admin
│   │   ├── cart/                 # Giỏ hàng
│   │   ├── chatbot/              # Chatbot người dùng
│   │   ├── checkout/             # Checkout, SePay, success/failed
│   │   ├── forgot-password/      # Quên mật khẩu
│   │   ├── login/                # Đăng nhập
│   │   ├── product/[slug]/       # Chi tiết sản phẩm
│   │   ├── profile/              # Hồ sơ, đơn hàng, support
│   │   ├── register/             # Đăng ký
│   │   ├── reset-password/       # Đặt lại mật khẩu
│   │   └── shop/                 # Cửa hàng
│   ├── components/               # Navbar, Footer, UI components
│   ├── hooks/                    # Custom hooks
│   ├── i18n/                     # Dictionary đa ngôn ngữ
│   ├── lib/                      # Axios client, helpers
│   ├── store/                    # Zustand stores
│   └── types/                    # TypeScript types
├── package.json
└── .env
```

### 6.3. Kết nối backend

Frontend dùng Axios instance trong `client/src/lib/api.ts`.

Biến môi trường:

```env
NEXT_PUBLIC_API_URL=http://localhost:3002/api
```

Nếu để trống, frontend fallback về:

```text
http://localhost:3002/api
```

## 7. Database

### 7.1. Loại database

- PostgreSQL 15
- Extension `vector` từ pgvector
- Prisma ORM

### 7.2. Các bảng chính

| Model | Mục đích | Quan hệ chính |
|---|---|---|
| `User` | Người dùng/admin | Có orders, cart, reviews, notifications, support tickets |
| `RefreshToken` | Refresh token DB model dự phòng | Thuộc user |
| `Category` | Danh mục sản phẩm | Self-relation parent/children, có products |
| `Product` | Sản phẩm | Thuộc category, có variants/images/reviews/attributes/behaviors |
| `ProductVariant` | Phiên bản sản phẩm | Thuộc product, có price/stock/SKU |
| `ProductImage` | Ảnh sản phẩm | Thuộc product |
| `ProductAttribute` | Thuộc tính chuẩn hóa cho AI/search | Thuộc product, unique productId + key |
| `Cart` | Giỏ hàng | Thuộc user, product, variant |
| `Order` | Đơn hàng | Thuộc user, có items/payment/voucher |
| `OrderItem` | Dòng sản phẩm trong đơn | Thuộc order, product, variant |
| `Payment` | Thanh toán | One-to-one với order |
| `Review` | Đánh giá sản phẩm | Thuộc user và product |
| `UserBehavior` | Hành vi VIEW/CART/SEARCH/PURCHASE | Dùng cho AI recommendation |
| `ChatMessage` | Lịch sử chatbot | Thuộc user tùy chọn |
| `Notification` | Thông báo cá nhân | Thuộc user |
| `GlobalNotification` | Thông báo toàn hệ thống | Admin quản lý |
| `SupportTicket` | Ticket hỗ trợ | Thuộc user |
| `TicketMessage` | Tin nhắn trong ticket | Thuộc ticket và sender |
| `Voucher` | Mã khuyến mãi | Có thể gắn với đơn hàng |
| `Banner` | Banner trang chủ | Admin quản lý |
| `ActivityLog` | Audit/user activity | Ghi nhận hành động quan trọng |

### 7.3. ERD rút gọn dạng text

```text
User 1--n Order 1--n OrderItem n--1 Product
                         |
                         n--1 ProductVariant

Order 1--1 Payment
Order n--0..1 Voucher

User 1--n Cart n--1 ProductVariant
Product 1--n ProductImage
Product 1--n ProductAttribute
Product 1--n ProductVariant
Category 1--n Product

User 1--n Review n--1 Product
User 1--n UserBehavior n--1 Product
User 1--n SupportTicket 1--n TicketMessage
User 1--n Notification
```

### 7.4. Migrate và seed

```bash
cd server
npm run prisma:generate
npm run prisma:migrate
npx prisma db seed
```

Hoặc đẩy schema trực tiếp khi phát triển nhanh:

```bash
cd server
npm run prisma:push
```

Tài khoản seed mặc định hiện thấy trong `prisma/seed.ts`:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@ultrashop.com` | `admin123` |
| User demo | `<email sinh bởi faker>` | `user123` |

## 8. Tích hợp bên thứ ba

### 8.1. SePay

SePay được dùng cho luồng thanh toán chuyển khoản ngân hàng:

1. Người dùng chọn phương thức `SEPAY` khi checkout.
2. Backend tạo VietQR chứa số tiền và nội dung chuyển khoản dạng `US<orderId-khong-co-dau-gach-ngang>`.
3. Người dùng chuyển khoản qua app ngân hàng.
4. Backend xác nhận thanh toán bằng một trong hai cách:
   - `POST /api/orders/sepay-webhook`: nhận webhook từ SePay.
   - `GET /api/orders/sepay/check/:orderId`: frontend chủ động gọi, backend query lịch sử giao dịch SePay API v2.
5. Nếu tìm thấy giao dịch khớp nội dung + số tiền:
   - Payment chuyển `SUCCESS`.
   - Order chuyển `PROCESSING`.
   - Tạo notification.
   - Gửi email cập nhật đơn hàng.

Biến môi trường quan trọng:

```env
SEPAY_BANK_ID=MB
SEPAY_ACCOUNT_NO=your-bank-account-number
SEPAY_ACCOUNT_NAME="YOUR BANK ACCOUNT NAME"
SEPAY_API_BASE_URL=https://userapi.sepay.vn/v2
SEPAY_API_TOKEN=your-sepay-api-token
SEPAY_WEBHOOK_API_KEY=your-sepay-webhook-api-key
SEPAY_POLLING_ENABLED=true
SEPAY_POLLING_INTERVAL_MS=10000
```

> Lưu ý: Khi chạy localhost, SePay không thể gọi webhook vào máy local nếu không dùng public URL/ngrok. Vì vậy hệ thống có thêm polling/API check giao dịch để phát triển local thuận tiện hơn.

### 8.2. SMTP Email

Email được gửi qua Nodemailer và SMTP provider. Cấu hình hiện hỗ trợ Gmail SMTP.

Các loại email hệ thống:

- Đặt lại mật khẩu.
- Xác nhận đơn hàng.
- Cập nhật trạng thái đơn hàng.
- Tạo yêu cầu hỗ trợ.
- Admin phản hồi hỗ trợ.
- OTP template đã có sẵn trong mail service để tích hợp xác thực tài khoản.

Biến môi trường:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_FROM_NAME=Ultra Shop
```

Preview template HTML nằm tại:

```text
server/email-templates/
```

### 8.3. AI / Embedding

Hệ thống có các module AI:

- Semantic search sản phẩm.
- Vector embedding cho text/image.
- Recommendation dựa trên hành vi user.
- Chatbot người dùng.
- Admin AI assistant.
- Tùy chọn local model qua Ollama.
- Tùy chọn CLIP service qua `CLIP_SERVICE_URL`.

Script liên quan:

```bash
cd server
npm run ai:attributes
npm run ai:attributes:reindex
npm run ai:reindex
```

## 9. Biến môi trường

### 9.1. Backend `.env`

Tạo file:

```bash
cd server
copy .env.example .env
```

| Tên biến | Mô tả | Ví dụ |
|---|---|---|
| `NODE_ENV` | Môi trường chạy | `development` |
| `PORT` | Port backend | `3002` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:password@localhost:5432/tmdt_ai?schema=public` |
| `DB_USER` | User PostgreSQL Docker | `postgres` |
| `DB_PASSWORD` | Password PostgreSQL Docker | `password` |
| `DB_NAME` | Tên database Docker | `tmdt_ai` |
| `DB_PORT` | Port PostgreSQL host | `5432` |
| `DB_HOST` | Host database nếu dùng config rời | `localhost` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `REDIS_PASSWORD` | Redis password nếu có | `<empty>` |
| `REDIS_DB` | Redis DB index nếu có | `0` |
| `JWT_SECRET` | Secret ký access token | `super-secret-key-change-me` |
| `JWT_EXPIRES_IN` / `JWT_EXPIRE` | Thời hạn access token | `15m` hoặc `1d` |
| `JWT_REFRESH_SECRET` | Secret ký refresh token | `refresh-secret` |
| `JWT_REFRESH_EXPIRES_IN` / `JWT_REFRESH_EXPIRE` | Thời hạn refresh token | `7d` |
| `OPENAI_API_KEY` | API key OpenAI | `sk-...` |
| `OPENAI_EMBEDDING_MODEL` | Model embedding | `text-embedding-3-small` |
| `OPENAI_CHAT_MODEL` | Model chat | `gpt-4o-mini` |
| `OLLAMA_URL` | Ollama chat endpoint | `http://localhost:11434/api/chat` |
| `OLLAMA_MODEL` | Model Ollama chat | `qwen2.5:3b` |
| `OLLAMA_EMBED_MODEL` | Model Ollama embedding | `nomic-embed-text` |
| `CLIP_SERVICE_URL` | Service tìm kiếm ảnh/CLIP | `http://localhost:5005` |
| `UPLOAD_DIR` | Thư mục upload | `uploads` |
| `MAX_FILE_SIZE_MB` | Dung lượng upload tối đa | `10` |
| `CORS_ORIGIN` | Origin frontend | `http://localhost:3000` |
| `FRONTEND_URL` | URL frontend dùng trong email/redirect | `http://localhost:3000` |
| `RATE_LIMIT_WINDOW_MS` | Cửa sổ rate limit | `60000` |
| `RATE_LIMIT_MAX` | Số request tối đa/window | `1000` |
| `LOG_LEVEL` | Mức log | `debug` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `<your-cloud>` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `<your-key>` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `<your-secret>` |
| `VNP_TMN_CODE` | VNPay terminal code | `<your-code>` |
| `VNP_HASH_SECRET` | VNPay hash secret | `<your-secret>` |
| `VNP_URL` | VNPay payment URL | `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html` |
| `VNP_API` | VNPay API URL | `https://sandbox.vnpayment.vn/merchant_webapi/api/transaction` |
| `VNP_RETURN_URL` | URL redirect sau VNPay | `http://localhost:3002/api/orders/vnpay-return` |
| `SEPAY_BANK_ID` | Mã ngân hàng SePay/VietQR | `MB` |
| `SEPAY_ACCOUNT_NO` | Số tài khoản nhận tiền | `<account-number>` |
| `SEPAY_ACCOUNT_NAME` | Tên chủ tài khoản | `"YOUR NAME"` |
| `SEPAY_API_BASE_URL` | SePay API v2 base URL | `https://userapi.sepay.vn/v2` |
| `SEPAY_API_TOKEN` | Bearer token SePay user API | `<sepay-token>` |
| `SEPAY_API_TIMEOUT_MS` | Timeout gọi SePay API | `10000` |
| `SEPAY_POLLING_ENABLED` | Bật polling lịch sử giao dịch | `true` |
| `SEPAY_POLLING_INTERVAL_MS` | Chu kỳ polling | `10000` |
| `SEPAY_PROCESS_EXISTING_ON_STARTUP` | Có xử lý giao dịch cũ khi start không | `false` |
| `SEPAY_WEBHOOK_API_KEY` | API key xác thực webhook | `<webhook-key>` |
| `SMTP_HOST` | SMTP host | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_SECURE` | Dùng TLS trực tiếp | `false` |
| `SMTP_USER` | SMTP username | `your-email@gmail.com` |
| `SMTP_PASS` | SMTP app password | `<app-password>` |
| `SMTP_FROM_EMAIL` | Email gửi đi | `your-email@gmail.com` |
| `SMTP_FROM_NAME` | Tên người gửi | `Ultra Shop` |

### 9.2. Frontend `.env`

```env
NEXT_PUBLIC_API_URL=http://localhost:3002/api
```

## 10. Cài đặt và chạy dự án

### 10.1. Yêu cầu hệ thống

- Node.js 20+ hoặc 22.x khuyến nghị.
- npm 10+.
- Docker Desktop nếu muốn chạy PostgreSQL/Redis bằng Docker Compose.
- PostgreSQL 15 có pgvector nếu không dùng Docker.
- Redis 7 nếu không dùng Docker.
- Ollama nếu dùng local AI model.
- Tài khoản SMTP và SePay nếu test đầy đủ mail/thanh toán.

### 10.2. Clone repository

```bash
git clone <repository-url>
cd TTTN
```

### 10.3. Chạy hạ tầng database/cache bằng Docker

```bash
cd server
docker compose up -d
```

Kiểm tra container:

```bash
docker compose ps
```

### 10.4. Cài dependencies backend

```bash
cd server
npm install
```

### 10.5. Cấu hình backend env

```bash
cd server
copy .env.example .env
```

Sau đó cập nhật `.env` theo môi trường local của bạn.

### 10.6. Migrate và seed database

```bash
cd server
npm run prisma:generate
npm run prisma:migrate
npx prisma db seed
```

Mở Prisma Studio nếu cần kiểm tra dữ liệu:

```bash
cd server
npm run prisma:studio
```

### 10.7. Chạy backend dev server

```bash
cd server
npm run dev
```

Backend mặc định chạy tại:

```text
http://localhost:3002
```

### 10.8. Cài dependencies frontend

Mở terminal mới:

```bash
cd client
npm install
```

### 10.9. Cấu hình frontend env

```bash
cd client
echo NEXT_PUBLIC_API_URL=http://localhost:3002/api > .env
```

### 10.10. Chạy frontend dev server

```bash
cd client
npm run dev
```

Frontend chạy tại:

```text
http://localhost:3000
```

Nếu muốn chạy Next với Turbopack:

```bash
cd client
npm run dev:turbo
```

## 11. Testing API

### 11.1. Công cụ đề xuất

- Swagger UI: `http://localhost:3002/api/docs`
- Postman hoặc Insomnia.
- `curl` cho test nhanh.
- Prisma Studio để kiểm tra dữ liệu.

Hiện chưa thấy test tự động Jest/Vitest được cấu hình trong `package.json`. Placeholder:

```bash
# <bổ sung khi dự án có test runner>
npm test
```

### 11.2. Request mẫu với curl

Đăng nhập:

```bash
curl -X POST http://localhost:3002/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@ultrashop.com\",\"password\":\"admin123\"}"
```

Lấy danh sách sản phẩm:

```bash
curl http://localhost:3002/api/products
```

Tạo đơn hàng, cần thay `<ACCESS_TOKEN>`:

```bash
curl -X POST http://localhost:3002/api/orders ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer <ACCESS_TOKEN>" ^
  -d "{\"address\":\"Ha Noi\",\"phone\":\"0900000000\",\"paymentMethod\":\"COD\"}"
```

Kiểm tra thanh toán SePay cho đơn:

```bash
curl http://localhost:3002/api/orders/sepay/check/<ORDER_ID> ^
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

## 12. Build và deployment

### 12.1. Build backend

```bash
cd server
npm run build
npm start
```

### 12.2. Build frontend

```bash
cd client
npm run build
npm start
```

### 12.3. Gợi ý triển khai production

#### Phương án VPS

1. Cài Node.js, Docker, Nginx.
2. Chạy PostgreSQL + Redis bằng Docker Compose hoặc dùng managed database.
3. Build backend:

```bash
cd server
npm ci
npm run build
npm start
```

4. Build frontend:

```bash
cd client
npm ci
npm run build
npm start
```

5. Dùng PM2 để giữ process:

```bash
npm install -g pm2
pm2 start server/dist/server.js --name ultrashop-api
pm2 start "npm start" --name ultrashop-web --cwd client
pm2 save
```

6. Cấu hình Nginx reverse proxy:

```nginx
server {
    server_name example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3002/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### Phương án Vercel + Render/Railway

- Deploy `client` lên Vercel.
- Deploy `server` lên Render/Railway/Fly.io/VPS.
- Dùng PostgreSQL managed có hỗ trợ pgvector.
- Dùng Redis managed.
- Set `NEXT_PUBLIC_API_URL=https://<api-domain>/api`.
- Set `FRONTEND_URL=https://<frontend-domain>`.
- Với SePay webhook, cần backend có public HTTPS URL.

### 12.4. Lưu ý production

- Không commit `.env` thật.
- Dùng secret đủ mạnh cho JWT.
- Tắt hoặc giới hạn Swagger nếu API public.
- Cấu hình CORS đúng domain frontend.
- Dùng HTTPS cho webhook/payment/email link.
- Không bật `SEPAY_PROCESS_EXISTING_ON_STARTUP=true` nếu không chắc chắn.
- Backup database định kỳ.

## 13. Troubleshooting / FAQ

### 13.1. Frontend không gọi được backend

Kiểm tra `client/.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3002/api
```

Restart frontend sau khi đổi env:

```bash
cd client
npm run dev
```

### 13.2. Prisma không kết nối được database

Kiểm tra Docker:

```bash
cd server
docker compose ps
```

Kiểm tra `DATABASE_URL`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/tmdt_ai?schema=public"
```

Chạy lại generate/migrate:

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 13.3. Lỗi pgvector / vector extension

Hãy dùng image Docker:

```yaml
pgvector/pgvector:pg15
```

Nếu dùng PostgreSQL tự cài, cần cài extension pgvector và đảm bảo database cho phép:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 13.4. SePay thanh toán thành công nhưng web không tự báo thành công

Kiểm tra:

- `SEPAY_API_TOKEN` đúng chưa.
- `SEPAY_API_BASE_URL=https://userapi.sepay.vn/v2`.
- Nội dung chuyển khoản có đúng dạng `US<orderId-khong-dau-gach>` không.
- Số tiền chuyển có khớp tổng đơn không.
- Backend có chạy không.
- Nếu dùng webhook thật, backend phải có public HTTPS URL.

Test endpoint check:

```bash
curl http://localhost:3002/api/orders/sepay/check/<ORDER_ID> ^
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### 13.5. Không gửi được email

Kiểm tra:

- `SMTP_USER`, `SMTP_PASS` đã đúng.
- Gmail cần **App Password**, không dùng mật khẩu đăng nhập thường.
- `SMTP_PORT=587`, `SMTP_SECURE=false`.
- Backend đã restart sau khi đổi `.env`.

### 13.6. Token hết hạn / bị đăng xuất

- Kiểm tra Redis đang chạy.
- Kiểm tra `JWT_REFRESH_SECRET` không thay đổi giữa các lần restart.
- Xóa localStorage frontend và đăng nhập lại nếu token cũ sai.

### 13.7. AI không phản hồi hoặc phản hồi chậm

- Kiểm tra `OPENAI_API_KEY` nếu dùng OpenAI.
- Kiểm tra Ollama đang chạy nếu dùng local model:

```bash
ollama list
ollama serve
```

- Backend có warm-up Ollama khi start; lần đầu có thể chậm.

### 13.8. Next.js dev server tăng RAM

Script hiện dùng webpack để ổn định hơn:

```bash
cd client
npm run dev
```

Nếu muốn thử Turbopack:

```bash
npm run dev:turbo
```

## 14. Đóng góp và liên hệ

### 14.1. Quy trình đóng góp đề xuất

1. Tạo branch mới:

```bash
git checkout -b feature/<ten-tinh-nang>
```

2. Cài dependencies và chạy build trước khi gửi PR:

```bash
cd server
npm run build

cd ..\client
npm run build
```

3. Mô tả rõ thay đổi, ảnh chụp UI nếu có, endpoint/API nếu thay đổi backend.

### 14.2. Tác giả / liên hệ

- Tác giả: `Văn Định`
- Email: `vandinh.aidev@gmail.com`
- Repository: `https://github.com/vandinh-hkl/TMDT_ChatBotAI.git`


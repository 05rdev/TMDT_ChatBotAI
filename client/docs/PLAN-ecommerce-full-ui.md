# Dự án Khách hàng: Hoàn thiện toàn bộ UI/UX cho UltraShop

**Mục tiêu**: Xây dựng đầy đủ hệ thống giao diện Frontend (Client & Admin) cho hệ thống Thương mại điện tử UltraShop, tích hợp hệ thống phản hồi UX (Toast notifications) cho mọi tương tác tĩnh/động. Triển khai theo tiêu chuẩn [Web Interface Guidelines của Vercel].

---

## Phân rã Công việc (Task Breakdown)

### Phase 1: Global UI & UX Feedback (Hệ thống cốt lõi)
- [ ] **Hệ thống Toast Notification**: Tích hợp và custom thư viện Toast (như `sonner` hoặc `react-hot-toast`) để chuẩn hóa thông báo (Thành công, Lỗi, Cảnh báo, Info). Áp dụng thiết kế Glassmorphism hoặc tối giản phù hợp theme.
- [ ] **Loading States & Skeletons**: Chuẩn hóa màn hình chờ và Skeleton loading cho mọi Data Fetching.
- [ ] **Error Boundaries & 404/500 Pages**: Cập nhật trang `/not-found` và trang báo lỗi server chuyên nghiệp.

### Phase 2: Client UI (Giao diện Khách hàng)
- [ ] **Trang chủ (`/`)**: Hero section, Danh mục nổi bật, Sản phẩm bán chạy, Testimonials.
- [ ] **Auth (`/login`, `/register`)**: Form đăng nhập/đăng ký có validate phía client (hiển thị inline errors) và tích hợp Toast cho thao tác API.
- [ ] **Giỏ hàng (`/cart`)**: Danh sách sản phẩm trong giỏ, cập nhật số lượng trực tiếp, tính tổng bill.
- [ ] **Thanh toán (`/checkout`)**: Form điền thông tin giao hàng, chọn phương thức thanh toán, tóm tắt đơn hàng. Tích hợp chuyển hướng sau khi mua thành công.
- [ ] **Tài khoản cá nhân (`/profile`)**: Quản lý thông tin user.
- [ ] **Lịch sử đơn hàng (`/profile/orders`)**: Theo dõi trạng thái tracking đơn hàng (Pending, Delivering, Completed).

### Phase 3: Admin UI (Trang quản trị toàn diện)
- [ ] **Layout Admin (`/admin/layout.tsx`)**: Sidebar cố định, Topbar với Breadcrumb, Dark/Light mode và Auth bảo vệ route.
- [ ] **Dashboard (`/admin`)**: Thống kê tổng quan (Doanh thu, Người dùng, Đơn hàng) bằng các chỉ số (Metrics).
- [ ] **Quản lý Sản phẩm (`/admin/products`)**: Table hiển thị sản phẩm, Drawer/Modal để Thêm/Sửa/Xóa. Giao diện upload nhiều ảnh.
- [ ] **Quản lý Danh mục (`/admin/categories`)**: Cây danh mục, CRUD danh mục.
- [ ] **Quản lý Đơn hàng (`/admin/orders`)**: Xem chi tiết đơn hàng, cập nhật trạng thái đơn (sang Đã giao, Hủy,...).
- [ ] **Quản lý Người dùng (`/admin/users`)**: Phân quyền (Role), chặn/khóa tài khoản.

### Phase 4: Audit & Đánh giá (Tiêu chuẩn Web-Design-Guidelines)
- [ ] Quét lại CSS, độ tương phản (Contrast Ratios), Responsive Mobile-first.
- [ ] Kiểm tra khả năng truy cập (A11y/Aria labels).

---

## Phân bổ Nguồn lực (Agent Assignments)
- **`frontend-specialist`**: Phụ trách viết components, tích hợp Zustand, TailwindCSS v4, xây layout.
- **`backend-specialist`**: Tạo mock, hoặc điều chỉnh các APIs hiện có nếu UI cần cấu trúc dữ liệu mới.
- **`web-design-guidelines` (Automated)**: Quét file bằng công cụ `checklist.py`/`ux_audit.py` ở cuối giai đoạn.

---

## Yêu cầu xem xét từ người dùng
Vui lòng giải quyết các câu hỏi Socratic Gate bên dưới để bắt đầu triển khai Phase 1.

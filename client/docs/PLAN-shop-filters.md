# PLAN: Shop Filters Redesign & API Integration

## 1. Goal
- Di chuyển bộ lọc (Danh mục, Khoảng giá) từ Sidebar (bên trái) lên phía trên cùng (Top Filter).
- Xóa bỏ giao diện cũ.
- Thiết kế lại theo phong cách Neo-Brutalism (Nút bấm sắc cạnh, Card viền đậm).
- Chuyển từ việc lọc tĩnh (demo) sang gọi API động (`/products?categoryId=...&minPrice=...&maxPrice=...`).

## 2. UI/UX Design (Neo-Brutalist)
- **Top Filter Layout**: Sử dụng cấu trúc Flexbox/Grid xếp ngang ở phía trên danh sách sản phẩm.
- **Categories**: Sử dụng dạng "Pills/Chips" (Thẻ bấm). Bấm vào sẽ thay đổi trạng thái active với viền dày và đổ bóng `box-shadow: 2px 2px 0px 0px var(--foreground)`.
- **Price Range**: Sử dụng 2 ô Input (`minPrice`, `maxPrice`) kèm một nút "Lọc" (hoặc tự động debounce) để kích hoạt tìm kiếm.

## 3. Implementation Steps

### Phase 1: Cập nhật Frontend (`d:\TTTN\client\src\app\shop\page.tsx`)
- Xóa `<aside>` chứa bộ lọc bên trái.
- Mở rộng vùng hiển thị sản phẩm (`lg:col-span-3` -> `lg:col-span-4` hoặc bỏ grid cột).
- Thêm section `Top Filters` ngay bên dưới ô tìm kiếm:
  - Component chọn Category: Lấy dữ liệu từ `/categories`.
  - Component nhập giá: 2 Input cho `minPrice` và `maxPrice`.
- Cập nhật hàm `fetchInitialData` và `handleSearch`:
  - Gom chung thành 1 hàm `fetchProducts(params)`.
  - Hỗ trợ truyền `categoryId`, `minPrice`, `maxPrice`, `search` vào API query.

### Phase 2: Tích hợp State Management & Debounce
- Tạo các state: `selectedCategory`, `minPrice`, `maxPrice`.
- Dùng `useEffect` kết hợp debounce (nếu lọc tự động) hoặc dùng Nút "Áp dụng lọc". (Sẽ chọn cách có nút "Áp dụng" cho khoảng giá để tối ưu call API).

### Phase 3: Kiểm thử
- Xác nhận các Query Params có được truyền đúng vào API `GET /products` hay không.
- Test UI trên các thiết bị.

## 4. Agents Assigned
- `project-planner`: Lập kế hoạch.
- `frontend-specialist`: Xử lý giao diện và logic gọi API trên client.

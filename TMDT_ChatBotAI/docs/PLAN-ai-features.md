# Kế hoạch triển khai tính năng AI (Smart Search, Recommendations, Visual Search)

Hệ thống sẽ tích hợp bộ 3 tính năng AI cao cấp dựa trên hạ tầng **Node.js/Express**, **Prisma**, **PostgreSQL/PGVector** và chạy local với **Ollama** để đảm bảo tốc độ và bảo mật dữ liệu.

---

## 🏗️ 1. Giai đoạn 1: Chuẩn bị Hạ tầng & Dữ liệu (Infrastructure & Data)

### 1.1 Cấu hình Ollama local
- Cài đặt Ollama trên server/local.
- Pull các model cần thiết:
    - `nomic-embed-text`: Tạo text embedding (768 dims).
    - `llama3`: Phân tích ý định người dùng (Intent Parsing).
- Kiểm tra kết nối API Ollama từ Backend.

### 1.2 Cập nhật Database Schema (Prisma)
- Thêm cột `imageEmbedding` vào bảng `Product` (Type: `Unsupported("vector(512)")` cho CLIP).
- Chạy migration để cập nhật database.
- *Lưu ý:* Bảng `Product` đã có `embedding` (768 dims) cho text.

### 1.3 Batch Processing (Re-indexing)
- Viết script quét toàn bộ `Product` hiện có:
    - Tạo text embedding từ `name` + `description` + `category`.
    - Tạo image embedding từ `ProductImage` (Primary image) sử dụng model CLIP.
- Lưu trữ vào PostgreSQL.

---

## 🔍 2. Giai đoạn 2: Tìm kiếm thông minh (Smart Search)

### 2.1 Logic xử lý (Ollama local)
- **Step 1 (Intent Parsing):** Dùng `llama3` để parse query người dùng.
    - Input: "quà tặng mẹ dưới 500k"
    - Output (JSON): `{ "target": "mẹ", "max_price": 500000, "category": "quà tặng" }`
- **Step 2 (Vector Search):** Tạo embedding cho query gốc bằng `nomic-embed-text`.
- **Step 3 (Hybrid Query):** Sử dụng Prisma `$queryRaw` để kết hợp:
    - So sánh vector (Cosine Similarity) với `Product.embedding`.
    - Filter cứng theo `max_price` và `category` (nếu có).

### 2.2 API Endpoint
- `GET /api/search/smart?q=...`
- Trả về danh sách sản phẩm kèm theo `score` độ tương đồng.

---

## 📸 3. Giai đoạn 3: Nhận diện hình ảnh (Visual Search)

### 3.1 Tích hợp CLIP Model
- Sử dụng thư viện (như `transformers.js` hoặc một sidecar service Python nhẹ) để chạy model `openai/clip-vit-base-patch32`.
- Quy trình: Khách upload ảnh -> Backend tạo vector (512 dims) -> Query PGVector.

### 3.2 API Endpoint
- `POST /api/search/visual` (Multipart/form-data).
- Trả về danh sách sản phẩm có hình ảnh tương đồng nhất.

---

## 🎯 4. Giai đoạn 4: Gợi ý cá nhân hóa (Hybrid Recommendations)

### 4.1 Thuật toán Hybrid Scoring
Kết hợp 3 trọng số dựa trên bảng `UserBehavior`:
1. **Content-based (40%):** Dựa trên similarity giữa sản phẩm đang xem và các sản phẩm khác (Vector search).
2. **Collaborative (40%):** Dựa trên hành vi của người dùng khác (Người mua X cũng mua Y).
3. **Recency (20%):** Ưu tiên các sản phẩm mới hoặc hành vi trong 7 ngày gần nhất.

### 4.2 Query Optimization
- Viết SQL function hoặc query phức tạp để tính toán `final_score` ngay trong DB để tối ưu tốc độ.

---

## 🎨 5. Giai đoạn 5: Tích hợp Frontend

### 5.1 Giao diện Tìm kiếm
- Nâng cấp Search Bar: Thêm icon "Chụp ảnh" (Visual Search).
- Hiển thị kết quả tìm kiếm với các badge gợi ý (ví dụ: "Phù hợp nhất với ý định của bạn").

### 5.2 Widget Gợi ý
- Thêm section "Dành riêng cho bạn" tại Trang chủ và Trang chi tiết sản phẩm.
- Hiển thị danh sách "Sản phẩm tương tự" dựa trên Visual/Content similarity.

---

## ✅ Tiêu chí nghiệm thu (Verification)
- [ ] Smart Search hiểu được ý định mua sắm phức tạp.
- [ ] Visual Search trả về sản phẩm đúng kiểu dáng/màu sắc từ ảnh upload.
- [ ] Tốc độ phản hồi API AI < 500ms (sau khi đã cache/index).
- [ ] Toàn bộ pipeline chạy local không phụ thuộc API trả phí bên ngoài.

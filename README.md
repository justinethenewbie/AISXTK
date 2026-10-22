# EDT - Ứng Dụng Học Tập & Gia Sư AI Xác Suất Thống Kê Đại Học 🎓⚡

> **Phiên bản:** v2.5 PRO • Phát triển với Google Gemini & Vite React TypeScript  
> **Tác giả:** Justine Dev (EDT Lead)

---

## 🌟 1. Giới Thiệu Tổng Quan

**EDT** là nền tảng học tập thông minh toàn diện dành riêng cho môn **Xác Suất Thống Kê (XSTK)** cấp Đại Học / Cao Đẳng, tích hợp:
1. **Lý Thuyết 5 Bước Feynman:** Đặt vấn đề thực tế -> Bản chất khái niệm -> Công thức KaTeX -> Ví dụ mẫu giáo viên -> Thử sức tại lớp.
2. **Bộ Vi Xử Lý Tích Phân & 4 Bước:** Tự động giải các bài toán biến ngẫu nhiên liên tục, tìm hằng số $k$, kỳ vọng $E(X)$, phương sai $Var(X)$, và mẹo bấm máy Casio fx-580VN X trong phòng thi.
3. **Máy Tính Casio fx-580VN X Ảo:** Bàn phím ký hiệu giải tích, tổ hợp, phân phối chuẩn Laplace, bảng tần số thống kê mẫu.
4. **Trình Tạo Đề Thi Trắc Nghiệm & Tự Luận AI:** Tùy chọn 5 - 20 câu, phân hóa độ khó, xuất trực tiếp ra file **Word (.doc)** và **PDF in ấn A4**.
5. **Phòng Vấn Đáp AI Giám Khảo:** Khảo sát sinh viên hai chiều, nhận dạng chữ viết tay hoặc câu hỏi qua bảng iPad.
6. **Hỏi Đáp Giọng Nói AI (Voice Interaction):** Trò chuyện trực tiếp bằng lời nói tiếng Việt, tự động trình chiếu sơ đồ giải toán lên bảng iPad.
7. **Bản Đồ Tư Duy (Mindmap) 7 Chương & Nhật Ký Lỗi Sai (Mistake Analytics):** Lưu trữ và phân tích nguyên nhân gốc rễ sai sót.
8. **Kho Dữ Liệu Nhà Phát Triển (Developer Vault):** Quản trị danh sách người dùng, GPA, cấp độ EXP và chuỗi học tập.

---

## 🚀 2. Hướng Dẫn Cài Đặt & Chạy Trên Máy Tính (Dành Cho Người Mới Bắt Đầu)

### Bước 1: Cài đặt Node.js (Nếu máy chưa có)
- Tải bản **Node.js LTS (Khuyên dùng)** tại: [https://nodejs.org/](https://nodejs.org/)
- Bấm Next -> Next để hoàn tất cài đặt.

### Bước 2: Mở Terminal tại thư mục ứng dụng và cài đặt thư viện
```bash
npm install
```

### Bước 3: Khởi chạy ứng dụng
```bash
npm run dev
```
Trình duyệt sẽ tự động mở ứng dụng tại địa chỉ: `http://localhost:3000` (hoặc `http://localhost:5173`).

---

## 🔑 3. Cách Kích Hoạt AI Thông Minh (Lấy Gemini API Key Miễn Phí 100%)

Ứng dụng EDT kết nối trực tiếp với **Google Gemini AI**. Để AI có thể tự động tạo đề thi mới, trả lời thắc mắc và chấm bài theo thời gian thực:

1. Truy cập trang: [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Đăng nhập tài khoản Google của bạn.
3. Bấm **Create API Key** (Tạo khóa API) -> Sao chép khóa (chuỗi bắt đầu bằng `AIzaSy...`).
4. **Nhập vào ứng dụng bằng 1 trong 2 cách sau:**
   - **Cách 1 (Dễ nhất):** Mở ứng dụng EDT trên trình duyệt -> Bấm vào nút **"Cấu Hình AI Key"** trên thanh Menu trên cùng (hoặc biểu tượng Bánh Răng Cài Đặt) -> Dán key vào ô nhập -> Bấm **"Kiểm Tra Kết Nối AI Ngay"** -> Bấm **"Lưu Cài Đặt"**.
   - **Cách 2:** Mở file `.env` trong thư mục code, dán key vào dòng:
     ```env
     GEMINI_API_KEY="AIzaSy...your-key-here..."
     ```

---

## 🛠️ 4. Bảng Sửa Lỗi & Cải Tiến Kỹ Thuật (Changelog v2.5 PRO)

| Vấn đề trước đây | Nguyên nhân gốc rễ | Cách đã khắc phục |
|---|---|---|
| AI không tương tác, không tạo đề thi mới | Chưa có API Key, code chạy fallback mock data cố định | Thêm giao diện cấu hình API Key trong Settings, tự động lưu LocalStorage, gửi qua header `x-gemini-api-key` |
| Sai tên Model (`gemini-3.8-flash`) | Public API chỉ hỗ trợ `gemini-2.5-flash`, `gemini-2.0-flash`, `gemini-1.5-flash` | Cập nhật toàn bộ model chuẩn `gemini-2.5-flash` (ưu tiên) |
| Lỗi Vấn đáp AI không chấm điểm học sinh | Gửi nhầm `mode: examiner_ask` và thiếu `studentAnswer` | Sửa lại gửi đúng `mode: submit_answer`, gửi `studentAnswer` và đọc đúng điểm `result.score` |
| Bảng iPad vẽ tay không chấm được | Endpoint `/api/tutor/evaluate-handwriting` thiếu trên server | Thêm endpoint `/api/tutor/evaluate-handwriting` hỗ trợ nhận ảnh Base64 và chấm barem 10 điểm |
| Lỗi parse JSON khi sinh danh sách bài tập dài | Code chỉ dùng `JSON.parse` thô, dễ lỗi khi có markdown fence | Bổ sung hàm tiện ích `cleanAndParseJson()` bóc tách fence an toàn |

---

## 💡 5. Giải Thích: Prompt Có Ảnh Hưởng Tới Code Như Thế Nào?

- **Khi bạn đang ở trong Google AI Studio:** Mọi prompt bạn gõ vào ô chat của Studio sẽ ra lệnh cho AI Studio viết hoặc chỉnh sửa code.
- **Khi bạn đã tải code về máy tính:** Ứng dụng đã trở thành phần mềm độc lập. Lúc này:
  - Các prompt nằm trong file `server.ts` sẽ được gửi tới Google Gemini mỗi khi người dùng bấm các nút chức năng trên giao diện.
  - Bạn có thể tùy biến các câu lệnh prompt này trong `server.ts` để thay đổi phong cách giảng dạy, độ khó bài toán hoặc barem chấm điểm của Cú EDT!

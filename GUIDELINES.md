# CẨM NANG VẬN HÀNH WEBSITE MỘC TÂM ĐƯỜNG massage

Chào anh Thỏ, tài liệu này chứa toàn bộ thông tin quan trọng về hệ thống tài nguyên, quy trình cài đặt/vận hành, và hướng dẫn khắc phục các lỗi thường gặp trong quá trình chạy website.

---

## 1. BẢNG DANH MỤC TÀI NGUYÊN (STT | Tên | Phiên bản | Relative Path | Tác dụng | Lệnh tải bù)

| STT | Tên Tài Nguyên | Phiên Bản | Relative Path | Tác Dụng | Lệnh tải bù / Cách phục hồi |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `index.html` | v4.0-debug-01 | `./index.html` | File cấu trúc chính của website lật sách. | Tải lại từ repo gốc. |
| 2 | `index.css` | v4.0-debug-01 | `./index.css` | Giao diện, phong cách, hiệu ứng bóng mượt và chống zoom. | Tải lại từ repo gốc. |
| 3 | `main.js` | v4.0-debug-01 | `./main.js` | Xử lý logic lật sách StPageFlip, co giãn màn hình và khóa cử chỉ zoom. | Tải lại từ repo gốc. |
| 4 | `data-manager.js` | v4.0-debug-01 | `./data-manager.js` | Quản lý đồng bộ Firebase/GitHub & so sánh cache/cookie. | Tải lại từ repo gốc. |
| 5 | `server.js` | v4.0-debug-01 | `./server.js` | Backend quét ảnh, watch thư mục, cập nhật data tự động. | Chạy lại lệnh tạo file. |
| 6 | `start_project.bat` | v1.0 | `./start_project.bat` | File shortcut khởi chạy dự án tự động. | Chạy lại lệnh tạo file. |
| 7 | `stop_project.bat` | v1.0 | `./stop_project.bat` | File shortcut dừng dự án an toàn. | Chạy lại lệnh tạo file. |
| 8 | `menu_data.json` | Tự động | `./menu_data.json` | Lưu trữ cấu trúc các trang thực đơn động. | Tự động sinh ra khi chạy `server.js`. |

---

## 2. LOGIC CÀI ĐẶT & VẬN HÀNH

- **Bước 1 (Chuẩn bị thư mục):** Mở terminal và di chuyển đến thư mục dự án của anh.
  - Lệnh tạo thư mục nếu chưa có:
    ```bash
    mkdir -p c:\Users\Ok_duoc\Desktop\menumoctamduong02.io-main
    ```
  - Lệnh chuyển vào thư mục:
    ```bash
    cd /d c:\Users\Ok_duoc\Desktop\menumoctamduong02.io-main
    ```
- **Bước 2 (Kiểm tra Node.js):** Đảm bảo máy trạm `RABBIT` của anh đã cài đặt Node.js bằng cách chạy:
  ```bash
  node -v
  ```
- **Bước 3 (Khởi động Server):** Kích đúp vào file `start_project.bat` hoặc chạy lệnh sau trong cmd:
  ```bash
  node server.js
  ```
- **Bước 4 (Truy cập):** Mở trình duyệt web của anh và truy cập đường dẫn:
  ```
  http://localhost:3000
  ```
- **Bước 5 (Tắt Server):** Khi muốn tạm ngưng dịch vụ, kích đúp vào file `stop_project.bat` để dừng an toàn tất cả tiến trình.

---

## 3. CẨM NANG CHẨN ĐOÁN LỖI

### Lỗi 1: Cổng 3000 bị chiếm dụng (Port already in use)
- **Nguyên nhân:** Có một tiến trình hoặc server khác đang chạy và sử dụng cổng `3000` trên máy trạm của anh.
- **Giải pháp tránh xung đột:**
  1. Kích đúp vào file `stop_project.bat` để tắt toàn bộ dịch vụ Node đang chạy ngầm.
  2. Hoặc mở file `server.js` và đổi giá trị `PORT = 3000` sang một cổng khác như `8080`, `3001`.

### Lỗi 2: Trình duyệt không cập nhật ảnh mới sau khi Thỏ đổi/thêm ảnh
- **Nguyên nhân:** Bộ nhớ đệm (Browser Cache) hoặc cookie của trình duyệt trên thiết bị của khách vẫn lưu phiên bản cũ và chưa đồng bộ kịp.
- **Giải pháp tránh xung đột:**
  - Nhấn tổ hợp phím `Ctrl + F5` trên máy tính để xóa cache cưỡng bức.
  - Trên thiết bị di động, cơ chế version hash trong `data-manager.js` v4.0 của chúng ta sẽ tự động phát hiện lệch hash và tự làm mới sau 300ms. Hãy đợi trang web tự tải lại một lần.

### Lỗi 3: Lỗi Execution Policy khi chạy NPM trên PowerShell
- **Nguyên nhân:** Hệ điều hành Windows mặc định tắt quyền chạy các tệp kịch bản `.ps1` chưa xác thực.
- **Giải pháp tránh xung đột:**
  - Sử dụng Command Prompt (CMD) thay thế cho PowerShell để chạy lệnh.
  - Hoặc nếu dùng PowerShell, chạy kèm cờ bypass:
    ```powershell
    powershell -ExecutionPolicy Bypass -Command "npm -v"
    ```

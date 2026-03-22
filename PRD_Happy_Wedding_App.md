# PRD - Happy Wedding App (Admin + Landing Page Thiệp Cưới)

**Phiên bản:** v1.0 (MVP)  
**Ngày:** 20/03/2026  
**Trạng thái:** Draft  
**Sản phẩm:** Happy Wedding

## 1) Tổng quan

Happy Wedding là nền tảng tạo thiệp cưới online gồm:
- **Landing page mời cưới** cho khách mời (trải nghiệm đẹp, mobile-first, dễ chia sẻ).
- **Trang quản trị** cho cô dâu/chú rể hoặc studio để cấu hình nội dung, quản lý khách mời, theo dõi RSVP.

Tham chiếu phong cách trải nghiệm: tương tự trang thiệp cưới mẫu bạn cung cấp, nhưng có thêm quản trị dữ liệu và phân tích RSVP.

## 2) Mục tiêu sản phẩm

- Cho phép tạo 1 website thiệp cưới hoàn chỉnh trong < 30 phút.
- Tăng tỷ lệ khách xác nhận RSVP lên > 60%.
- Quản lý tập trung khách mời, trạng thái tham dự, số lượng dự kiến.
- Chia sẻ link mời nhanh qua Zalo/Facebook/SMS.

## 3) Non-goals (MVP chưa làm)

- Không xây hệ thống thanh toán phức tạp.
- Không làm app mobile native (chỉ web responsive).
- Không làm marketplace template công khai ở giai đoạn đầu.
- Không tích hợp in thiệp giấy.

## 4) Đối tượng người dùng

- **Couple (cô dâu/chú rể):** tạo và quản lý thiệp cưới.
- **Wedding studio/staff:** hỗ trợ nhiều đám cưới, quản lý nhiều sự kiện.
- **Guest (khách mời):** xem thiệp, xác nhận RSVP, gửi lời chúc.

## 5) User stories chính

### Couple/Admin

- Tôi muốn tạo landing page thiệp cưới từ mẫu có sẵn để dùng ngay.
- Tôi muốn thêm/sửa thông tin sự kiện, địa chỉ, bản đồ, album ảnh.
- Tôi muốn import danh sách khách mời từ Excel/CSV.
- Tôi muốn xem ai đã xác nhận tham dự và số lượng đi kèm.

### Guest

- Tôi muốn xem thiệp mượt trên điện thoại.
- Tôi muốn bấm "Chỉ đường" nhanh tới địa điểm cưới.
- Tôi muốn xác nhận tham dự trong 1 phút.
- Tôi muốn gửi lời chúc cho cặp đôi.

## 6) Phạm vi tính năng MVP

### 6.1 Landing page thiệp cưới

- Hero: tên cô dâu/chú rể, ngày giờ, ảnh cover, countdown.
- Câu chuyện tình yêu (timeline ngắn).
- Thông tin sự kiện (lễ cưới/tiệc cưới, địa chỉ, thời gian).
- Google Maps + nút "Chỉ đường".
- Album ảnh (10-50 ảnh).
- Form RSVP:
  - Tên khách
  - SĐT (optional)
  - Trạng thái tham dự (Có/Không)
  - Số người đi cùng
  - Lời nhắn
- Guestbook (lời chúc).
- Thông tin mừng cưới (QR ảnh + số TK + chủ TK).
- Nhạc nền bật/tắt.
- SEO cơ bản + Open Graph khi chia sẻ link.

### 6.2 Trang quản trị

- Đăng nhập/đăng xuất.
- Quản lý hồ sơ đám cưới:
  - thông tin cặp đôi
  - ngày giờ sự kiện
  - địa điểm
  - nội dung câu chuyện
- Quản lý giao diện:
  - chọn template
  - màu chủ đạo
  - font chữ
  - ảnh banner
- Quản lý khách mời:
  - thêm/sửa/xóa
  - import CSV/XLSX
  - phân nhóm
- Quản lý RSVP:
  - danh sách phản hồi
  - bộ lọc theo trạng thái
  - thống kê tổng hợp
- Quản lý lời chúc (ẩn/xóa nếu spam).
- Xuất báo cáo CSV (khách mời + RSVP).

## 7) Yêu cầu phi chức năng

- **Hiệu năng:** LCP mobile < 3s với mạng 4G trung bình.
- **Tương thích:** Chrome/Safari/Edge mobile & desktop 2 version gần nhất.
- **Bảo mật:** mã hóa mật khẩu, chống spam form cơ bản (rate-limit/captcha nhẹ).
- **Độ sẵn sàng:** uptime mục tiêu 99.5% (MVP).
- **Khả năng mở rộng:** hỗ trợ tối thiểu 1.000 wedding site hoạt động đồng thời.

## 8) Kiến trúc đề xuất (MVP)

- **Frontend:** Next.js (landing + admin trong cùng codebase).
- **Backend/API:** Next.js API routes hoặc NestJS.
- **DB:** PostgreSQL.
- **Storage ảnh:** S3-compatible (Cloudflare R2/S3).
- **Auth:** JWT + refresh token (hoặc NextAuth).
- **Deploy:** Vercel (FE) + Render/Railway/Fly.io (API/DB).

## 9) Mô hình dữ liệu mức cao

- `users` (admin/staff)
- `weddings` (1 wedding site)
- `events` (lễ cưới, tiệc cưới)
- `guests` (danh sách khách mời)
- `rsvps` (phản hồi)
- `wishes` (lời chúc)
- `media` (ảnh/video)
- `themes` (cấu hình template/màu/font)

## 10) KPI đo lường

- Time-to-publish: thời gian từ tạo mới tới publish.
- RSVP conversion rate = số phản hồi / tổng khách mời.
- Tỷ lệ truy cập mobile.
- Số lượt click "Chỉ đường".
- Tỷ lệ chia sẻ link thành công (open graph preview hiển thị đúng).

## 11) Milestones triển khai

- **Sprint 1 (2 tuần):** Auth, wedding profile, landing cơ bản, publish link.
- **Sprint 2 (2 tuần):** Guest management + RSVP + dashboard thống kê.
- **Sprint 3 (2 tuần):** Theme customization + guestbook + export CSV.
- **Sprint 4 (1-2 tuần):** tối ưu hiệu năng, bảo mật, QA, go-live.

## 12) Rủi ro & giảm thiểu

- Ảnh nặng làm chậm trang -> auto compress + lazy load.
- Spam RSVP/guestbook -> rate-limit + captcha.
- Dữ liệu import lỗi -> template CSV chuẩn + validate trước khi lưu.
- Người dùng không rành kỹ thuật -> onboarding 3 bước + preset mặc định.

## 13) Tiêu chí nghiệm thu MVP

- Có thể tạo mới 1 wedding site và publish công khai.
- Landing hiển thị đầy đủ: hero, sự kiện, map, album, RSVP, guestbook.
- Admin import danh sách khách mời và theo dõi RSVP.
- Dữ liệu thống kê cơ bản chính xác.
- Hoạt động tốt trên mobile.

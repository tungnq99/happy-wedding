# Landing Page Storytelling Redesign (Happy Wedding)

## 1. Mục tiêu
- Nâng landing page thiệp cưới theo hướng storytelling, cảm xúc đi từ “nhận thiệp” -> “xem câu chuyện” -> “xác nhận tham dự/gửi lời chúc”.
- Giữ tinh thần tham chiếu từ mẫu Huy Thanh (nhịp kể chuyện theo section, cảm giác trang trọng, giàu chuyển động) nhưng có cá tính riêng cho Happy Wedding.
- Đảm bảo trải nghiệm nhất quán trên 3 màn: desktop, laptop, mobile.

## 2. Nguồn cảm hứng
- Mẫu tham chiếu: https://thiepcuoionline.huythanhjewelry.vn/a-b-05032026-1555/moi-cuoi
- Điểm học từ mẫu:
  - Hero giàu cảm xúc, ngôn ngữ thị giác “Save the Date”.
  - Section flow rõ (album -> sự kiện -> lời chúc/RSVP).
  - Hiệu ứng nhẹ và lớp trang trí giúp trang có chiều sâu.

## 3. Ý tưởng tổng thể (Story Arc)
- Chương 0: Khách nhận thiệp và tự điền tên để “mở thiệp”.
- Chương 1: Khoảnh khắc mở màn với ảnh cặp đôi + countdown (đưa nội dung countdown lên sớm để tạo nhịp cảm xúc ngay từ đầu).
- Chương 2: Lời mời chính thức + tên cô dâu chú rể + ảnh hero + ngày cưới.
- Chương 3: Những khoảnh khắc đẹp (gallery).
- Chương 4: Lịch trình ngày cưới + bản đồ.
- Chương 5: Câu chuyện tình yêu.
- Chương 6: Mừng cưới bằng QR chuyển khoản.
- Chương 7: Hành động của khách mời (RSVP + sổ lưu bút).
- Chương 8: Kết thư (footer cảm ơn).

## 4. Luồng mới bắt buộc: Màn mở đầu “Thiệp mời”

### 4.1 Mục tiêu màn mở đầu
- Tạo nghi thức vào trang (ceremony moment), thay vì vào thẳng nội dung.
- Cá nhân hóa bằng tên khách mời.

### 4.2 Thành phần UI
- Background ảnh cưới blur nhẹ + overlay màu theme.
- Card thiệp ở giữa màn hình:
  - Heading: “Thiệp mời đám cưới”.
  - Sub: “Trân trọng kính mời”.
  - Input: “Nhập tên của bạn”.
  - CTA chính: “Mở thiệp cưới”.
  - CTA phụ (text-link): “Vào với tư cách khách vãng lai”.

### 4.3 Hành vi
- Khi bấm “Mở thiệp cưới”:
  - Validate tên không rỗng (>= 2 ký tự).
  - Lưu localStorage key `guestName` theo `weddingId`.
  - Animate card mở (fade + scale) rồi reveal landing chính.
- Nếu vào với khách vãng lai:
  - Set `guestName = "Khách mời"`.
- Trên landing chính:
  - Dòng chào cá nhân hóa: “Chào [Tên khách], cảm ơn bạn đã mở thiệp.”

## 5. Kiến trúc nội dung landing sau khi mở thiệp
1. Opening Moment: ảnh cặp đôi toàn khung + countdown nổi bật.
2. Hero Invitation Card: tên cặp đôi + lời mời chính thức + ngày cưới + CTA nhanh.
3. Gallery Moments (lưới ảnh có lightbox).
4. Wedding Events (timeline card + map link).
5. Love Story (text kể chuyện + quote layout).
6. Gift Section: QR chuyển khoản + thông tin ngân hàng.
7. RSVP Form.
8. Wishes Wall + Wish Form.
9. Footer cảm ơn.

## 6. Responsive spec cho 3 màn

### 6.1 Desktop (>= 1280px)
- Gate card rộng ~560-640px, input và CTA trên 1 cột centered.
- Opening Moment dùng ảnh full-width có lớp overlay, countdown đặt giữa hoặc bottom-center.
- Hero dùng split 2 cột rõ ràng:
  - Trái: ảnh hoặc visual Save the Date.
  - Phải: nội dung mời cưới + tên cặp đôi + CTA.
- Gallery 3 cột (ảnh giữa cao hơn).
- Events chia 2 cột (trái nội dung, phải ảnh nền).
- Section QR chia 2 cột:
  - Cột trái: mã QR lớn.
  - Cột phải: tên ngân hàng, số tài khoản, chủ tài khoản, nút copy.
- Floating actions nằm góc phải dưới.

### 6.2 Laptop (1024px - 1279px)
- Gate card ~500-560px, giữ bố cục desktop nhưng thu hẹp khoảng trắng.
- Opening Moment giữ ảnh lớn + countdown, giảm 1 bậc typo.
- Hero vẫn split 2 cột, giảm kích thước chữ heading 1 bậc.
- Gallery vẫn 3 cột nhưng giảm chiều cao card ảnh.
- Events giữ 2 cột nếu đủ rộng, fallback 1 cột ở ngưỡng thấp.
- QR có thể giữ 2 cột hoặc chuyển 1 cột tùy chiều rộng thực tế.

### 6.3 Mobile (<= 767px)
- Gate card full width trừ padding ngang 16px.
- Input cao >= 48px, CTA cao >= 48px (touch target tốt).
- Opening Moment ưu tiên ảnh dọc + countdown dạng compact 2 hàng.
- Hero chuyển stack dọc:
  - Dải “Save the Date” ở trên.
  - Khối tên + ảnh + CTA ở dưới.
- Gallery 2 cột hoặc 1 cột (ưu tiên 2 cột cho nhịp ảnh).
- Events 1 cột hoàn toàn, map CTA full-width.
- QR 1 cột: ảnh QR full-width card, thông tin ngân hàng ở dưới, nút copy số tài khoản full-width.
- Floating actions tối giản, tránh che nội dung/keyboard.

## 7. Visual direction (đề xuất)

### 7.1 Màu sắc
- Dùng `theme.primaryColor` làm màu chủ đạo.
- Thêm 2 tông trung tính:
  - Nền sáng 1: `#FEFCFB`
  - Nền sáng 2: `#F7F3F0`
- Màu text body: xám đậm đủ tương phản.

### 7.2 Typography
- Heading: serif lãng mạn (ví dụ Playfair Display/Prata).
- Body: sans rõ ràng (ví dụ Be Vietnam Pro/Inter).
- Trên mobile: body tối thiểu 16px, line-height >= 1.45.

### 7.3 Motion
- Gate mở thiệp: 500-700ms, ease-out.
- Section reveal khi scroll: stagger nhẹ 60-120ms.
- Hạn chế animation “nặng”, ưu tiên opacity/transform.

## 8. Mapping dữ liệu với code hiện tại
- `guestName` mới: lấy từ input gate, lưu localStorage và đưa vào state client.
- Dữ liệu sẵn có vẫn giữ nguyên từ `InvitationData`:
  - Opening + Hero: `groomName`, `brideName`, `eventDate`, `heroSubtitle`, `coverImageUrl`.
  - Gallery: `media[]`.
  - Events: `events[]`.
  - Story: `story`.
  - Countdown: `eventDate`.
  - QR mừng cưới (đã có trong schema): `bankQrImageUrl`, `bankAccountName`, `bankAccountNumber`, `bankName`.
  - RSVP/Wishes: `id`, `wishes[]`.

## 9. Đề xuất cập nhật file (khi implement)
- `web/app/components/invitation-page.tsx`
  - Thêm state gate: `isOpened`, `guestName`.
  - Thêm component con `InvitationGate`.
  - Chèn Opening Moment (ảnh + countdown) trước Hero Invitation.
  - Chèn greeting block cá nhân hóa ở đầu phần nội dung.
  - Thêm Gift QR section (hiển thị QR + thông tin ngân hàng).
- `web/app/[slug]/page.tsx`
  - Bổ sung select các field ngân hàng/QR để truyền đủ dữ liệu xuống client component.
- `web/app/admin/[weddingId]/page.tsx`
  - Bổ sung form input phần “Mừng cưới”: QR URL, tên ngân hàng, số tài khoản, chủ tài khoản.
- `web/app/admin/actions.ts`
  - Mở rộng `updateWeddingAction` để lưu 4 field ngân hàng/QR.
- (Tuỳ chọn) Tách ra file mới:
  - `web/app/components/invitation-gate.tsx` để dễ maintain.
  - `web/app/components/gift-qr-section.tsx` để tách logic copy/hiển thị QR.

## 10. Tiêu chí nghiệm thu (Acceptance Criteria)
- Có màn mở đầu yêu cầu nhập tên + nút mở thiệp.
- Sau khi mở thiệp, tên khách xuất hiện ít nhất 1 vị trí chào mừng.
- Countdown xuất hiện ở đầu hành trình sau gate và có ảnh đi kèm.
- Hero mời cưới có cả tên cặp đôi và ảnh (không chỉ text).
- Có section QR mừng cưới hiển thị đầy đủ mã QR + thông tin tài khoản.
- Admin có thể cấu hình QR + thông tin ngân hàng và lưu thành công.
- Trải nghiệm tốt ở desktop/laptop/mobile, không vỡ layout.
- Input/CTA mobile đạt touch target tối thiểu 44-48px.
- Không có horizontal scroll ngoài ý muốn.
- Core sections vẫn đầy đủ: Opening+Countdown, Hero, Gallery, Events, Story, QR Gift, RSVP, Wishes.

## 11. Gợi ý triển khai theo pha
1. Pha 1: Thêm gate + localStorage + greeting + đổi thứ tự section (đưa opening countdown lên đầu).
2. Pha 2: Thêm section QR mừng cưới ở landing.
3. Pha 3: Mở rộng admin form + server action để quản lý QR/ngân hàng.
4. Pha 4: Tinh chỉnh responsive cho 3 màn + motion + accessibility + hiệu năng ảnh.

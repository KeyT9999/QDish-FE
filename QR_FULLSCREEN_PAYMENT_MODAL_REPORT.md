# QR Fullscreen Payment Modal Report

## File đã sửa

- `src/components/dashboard/restaurant/modals/BillPaymentModal.tsx`
- `src/components/ui/dialog.tsx`
- `tests/bill-payment-qr-fullscreen.spec.ts`
- `QR_FULLSCREEN_PAYMENT_MODAL_REPORT.md`

## Component đã thêm

- `QrPreviewCard`: hiển thị QR preview, overlay "Nhấn để phóng to", nút phụ "Phóng to QR".
- `QrFullscreenModal`: dialog QR lớn với backdrop đen mờ, nút X, nút Đóng, nút Đã nhận tiền và thông tin chuyển khoản.

## UX đã thay đổi

- Khi chọn `Chuyển khoản / QR`, QR preview vẫn hiển thị trong modal thanh toán bill như trước.
- QR preview có cursor pointer và có overlay "Nhấn để phóng to".
- Nút phụ "Phóng to QR" mở QR lightbox lớn.
- Click vào ảnh QR preview cũng mở QR lightbox lớn.
- Lightbox QR dùng backdrop `black/60` kèm blur nhẹ, nằm giữa màn hình.
- Lightbox hiển thị:
  - Chủ tài khoản
  - Ngân hàng
  - Số tài khoản
  - Tổng bill cần chuyển
- Đóng QR lightbox bằng X, nút Đóng, ESC hoặc backdrop không đóng `BillPaymentModal` chính.
- Nút xác nhận thanh toán bill hiện tại vẫn giữ nguyên, trong QR lightbox có thêm nút `Đã nhận tiền` để dùng nhanh khi phù hợp.

## Responsive test

- Desktop viewport `1440x900`: QR lightbox mở giữa màn hình, QR lớn, thông tin chuyển khoản nằm cạnh QR.
- Mobile viewport `390x844`: QR lightbox chiếm gần full width, QR fit trong màn hình, nút dễ bấm, ESC đóng QR lightbox và modal thanh toán chính vẫn còn.
- Playwright test đã kiểm tra:
  - Mở bill payment modal.
  - Chọn `Chuyển khoản / QR`.
  - Click nút `Phóng to QR`.
  - Click QR preview trên mobile.
  - QR lớn hiển thị.
  - Đóng QR lớn không đóng modal thanh toán bill.
  - Nút `Xác nhận đã nhận tiền` vẫn còn trong modal chính.

## Build result

- `npm run build`: pass.
- `npx playwright test tests/bill-payment-qr-fullscreen.spec.ts --reporter=line`: pass, 2 tests passed.

## Lỗi còn lại nếu có

- Không có lỗi chức năng còn lại trong phạm vi QR fullscreen payment modal.
- Build còn cảnh báo Vite chunk size lớn hơn `500 kB` ở một số bundle hiện hữu. Cảnh báo này không chặn build và không phát sinh từ flow QR fullscreen.

# ENCODING_FIX_REPORT.md

Ngày sửa: 2026-05-24

## 1. Nguyên nhân tìm được

Lỗi không đến từ `index.html` hoặc Vite. `index.html` đã có `<meta charset="UTF-8" />`.

Nguyên nhân chính là một phần source dashboard đã bị lưu dưới dạng mojibake: text UTF-8 tiếng Việt từng bị decode nhầm theo Windows-1252/Latin-1 rồi lưu lại vào source. Khi React render các literal này, browser hiển thị đúng y nguyên chuỗi sai encoding.

Backend cũng có một vài message mới trong `orderRoutes.ts` và `restaurantRoutes.ts` bị lưu cùng kiểu lỗi. Express response hiện trả JSON với `Content-Type: application/json; charset=utf-8`, nên không phải lỗi header charset.

MongoDB đã được kiểm tra với các collection liên quan dashboard/menu/category/restaurant. Không phát hiện dữ liệu mojibake trong DB.

## 2. File đã sửa

Frontend:

- `src/pages/Dashboard.tsx`
- `src/hooks/useAuth.ts`
- `src/components/ui/dropdown-menu.tsx`
- `scripts/check-encoding.mjs`
- `tests/encoding-dashboard.spec.ts`
- `package.json`
- `package-lock.json`

Backend:

- `../QR_FOOD_ORDER_BE/src/routes/orderRoutes.ts`
- `../QR_FOOD_ORDER_BE/src/routes/restaurantRoutes.ts`
- `../QR_FOOD_ORDER_BE/src/routes/authRoutes.ts`
- `../QR_FOOD_ORDER_BE/src/middleware/auth.ts`

## 3. Text đã sửa

Các nhóm text dashboard đã được decode/sửa về tiếng Việt UTF-8 chuẩn:

- Header: `Bảng điều khiển`, `Chào mừng quay lại`
- Overview: `Số liệu kinh doanh`, `Doanh thu tích lũy`, `Đơn hàng trung bình`, `Món bán chạy nhất`
- Orders: `Danh sách đơn hàng hiện tại`, `Mã đơn`, `Bàn`, `Khách hàng`, `Chi tiết món`, `Thời gian`, `Tổng tiền`, `Trạng thái`, `Thao tác`, `Chưa có đơn hàng nào`
- Menu: `Quản lý Món ăn`, `Thêm món mới`, `Tên món`, `Giá`, `Danh mục`, `Chỉ số QDish`, `Chưa có món ăn nào`
- Categories: `Quản lý Danh mục món ăn`, `Thêm danh mục`, `Chưa có danh mục nào`
- Tables: `Đồng bộ bàn ăn & Sinh mã QR`, `Danh sách bàn & Preview mã QR dẫn bàn`, `Chưa có bàn ăn nào được lưu`
- Staff: `Quản lý Nhân viên`, `Thêm nhân viên mới`, `Trạng thái hoạt động`
- Settings/dialogs/toasts/forms: tên nhà hàng, địa chỉ, ngân hàng, OTP, lưu cấu hình, xác nhận thanh toán, hủy, lưu thay đổi

## 4. FE/BE/DB kết luận

Frontend:

- `Dashboard.tsx` là nguồn lỗi chính.
- Đã thêm script `check:encoding` để fail nếu source FE/BE còn marker mojibake.
- Đã thêm Playwright E2E test mở đủ 7 tab dashboard và kiểm tra body text không còn mojibake.

Backend:

- Một số message API trong route mới bị lỗi encoding, đã sửa.
- Không thấy encode/decode thủ công sai như `Buffer.from(..., 'latin1')`.
- API JSON đang trả charset UTF-8.

Database:

- Đã kiểm tra `restaurants`, `menuItems`, `categories`.
- Không phát hiện field tên nhà hàng, tên món, mô tả món, danh mục bị mojibake.
- Không cần chạy migration dữ liệu.

## 5. Guard chống tái lỗi

Đã thêm:

```bash
npm run check:encoding
```

Script scan:

- `QR_FOOD_ORDER_FE/src`
- `QR_FOOD_ORDER_FE/index.html`
- `QR_FOOD_ORDER_BE/src`

Nếu còn marker mojibake trong source, command sẽ exit code `1`.

Đã thêm:

```bash
npm run test:e2e:encoding
```

Test mở đủ:

- `/dashboard?tab=overview`
- `/dashboard?tab=orders`
- `/dashboard?tab=menu`
- `/dashboard?tab=categories`
- `/dashboard?tab=tables`
- `/dashboard?tab=staff`
- `/dashboard?tab=settings`

## 6. Cách test lại

Backend và frontend cần đang chạy ở:

- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5173`

Chạy:

```bash
npm run check:encoding
npm run build
npm run test:e2e:encoding
```

Trong lần test hiện tại, Playwright dùng token test `RESTAURANT_ADMIN` và restaurant hiện có trong MongoDB để mở dashboard.

## 7. Kết quả build/test

Đã chạy:

- `npm run check:encoding`: pass
- `npm run build` ở frontend: pass
- `npm run build` ở backend: pass
- API header `GET /api/health`: `Content-Type: application/json; charset=utf-8`
- MongoDB scan: pass, không có dữ liệu mojibake trong `restaurants`, `menuItems`, `categories`
- `npm run test:e2e:encoding`: pass 7/7 dashboard tabs


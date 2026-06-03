# SUPER_ADMIN_MOBILE_UI_REPORT.md

## 1. Các file đã sửa đổi
- `src/pages/SuperAdmin.tsx`
- `src/components/dashboard/super-admin/OwnersTab.tsx`
- `src/components/dashboard/super-admin/PlansTab.tsx`
- `src/components/dashboard/super-admin/RestaurantsTab.tsx`
- `src/components/dashboard/super-admin/SuperAdminIngredientsTab.tsx`
- `src/components/dashboard/super-admin/charts/SubscriptionTransactionsTable.tsx`
- `src/components/dashboard/super-admin/modals/OwnerModal.tsx`
- `src/components/dashboard/super-admin/modals/RestaurantModal.tsx`
- `src/components/dashboard/super-admin/modals/ResetPasswordModal.tsx`
- `src/components/dashboard/super-admin/modals/OwnerPlanOverrideModal.tsx`
- `src/components/dashboard/super-admin/modals/PlanModal.tsx`

## 2. Các thay đổi và Component Mobile đã thêm
- **Header & Title:** Sửa tiêu đề `Quản trị hệ thống SaaS` tự động co giãn font-size phù hợp mobile.
- **Tab Navigation:** Chuyển đổi thanh điều hướng Tab gốc bị xuống hàng lộn xộn thành thanh trượt ngang mượt mà (`overflow-x-auto whitespace-nowrap scrollbar-none`) trên mobile, giữ nguyên dạng tab desktop ở màn hình lớn.
- **Owners Tab:**
  - Toolbar lọc trạng thái, tìm kiếm và nút tạo mới được chuyển sang chế độ tự động xếp chồng (stack) dọc trên mobile và nút to hơn (`h-11`) để tiện nhấn.
  - Bảng dữ liệu Owners ẩn đi trên mobile, thay vào đó hiển thị danh sách dạng Card (Owner Card) trực quan, hiển thị đầy đủ tên, username, thông tin liên lạc, trạng thái, gói dịch vụ hiện tại, số lượng chi nhánh quản lý và các nút thao tác nhanh (Đổi gói, Sửa, Reset) có touch target từ `40px` trở lên.
- **Plans Tab:**
  - Chuyển sang hiển thị dạng Plan Card trên mobile.
  - Các thông tin giới hạn (Limits) tài nguyên được bố trí gọn trong grid 2 cột. Các gói không giới hạn (giới hạn = `-1`) được tự động đổi sang nhãn chữ *"Không giới hạn"* thay vì hiện `-1` như cũ.
- **Restaurants Tab:**
  - Chuyển sang dạng Restaurant Card hiển thị đầy đủ chi tiết chi nhánh, trạng thái hoạt động (Switch) và thao tác sửa/reset mật khẩu.
- **Subscription Transactions:**
  - Bảng giao dịch được thay thế bằng dạng thẻ giao dịch nhỏ gọn hiển thị orderCode, tên chủ nhà hàng, số tiền, trạng thái giao dịch và thời gian thực hiện.
- **Ingredients Database:**
  - Nút thêm mới hiển thị full-width trên điện thoại.
  - Chiều cao các nút chi tiết/sửa/xóa trên Card được tăng lên `h-10` giúp người dùng dễ dàng bấm.
- **Modals:**
  - Tất cả dialog modals (Owner, Restaurant, ResetPassword, OverridePlan, Plan) được tối ưu độ rộng tối đa `w-[95vw]` và thêm thuộc tính `max-h-[90vh] overflow-y-auto` để đảm bảo có thể cuộn dọc bên trong modal nếu giao diện điện thoại quá ngắn hoặc khi bàn phím ảo hiển thị lên.

## 3. Breakpoint & Thiết bị đã test
- Mobile: `< 640px` (iPhone SE, iPhone 13/14/15, Android devices).
- Tablet/Desktop: `>= 768px` (iPad, Laptops).

## 4. Kết quả build hệ thống
- Chạy lệnh `npm run build` thành công, không phát hiện lỗi kiểu dữ liệu (TypeScript) hay đóng gói (Vite):
```text
vite v5.4.11 building for production...
✓ 1358 modules transformed.
dist/index.html                                                  0.75 kB
dist/assets/index-D7b3-F9w.css                                 228.34 kB
dist/assets/index-D66-3QYF.js                                 1439.38 kB
...
✓ built in 11.23s
```
- Không còn bất kỳ hiện tượng vỡ khung, tràn chiều ngang (horizontal scroll) ở màn hình mobile.

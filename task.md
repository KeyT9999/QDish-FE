# Kế hoạch triển khai & Checklist chi tiết (task.md)

Tài liệu này theo dõi tiến độ thực hiện các đầu việc nhằm hoàn thiện hệ thống kết nối dữ liệu thật và các chức năng còn thiếu của **QDish**.

---

## TIẾN ĐỘ TỔNG THỂ
- `[x]` **Giai đoạn 1: Chuẩn bị & Nâng cấp Backend** (5/5)
- `[x]` **Giai đoạn 2: Sửa đổi API Services ở Frontend** (5/5)
- `[x]` **Giai đoạn 3: Hoàn thiện Giao diện B B2C (Customer Menu)** (5/5)
- `[x]` **Giai đoạn 4: Hoàn thiện Restaurant Dashboard** (7/7)
- `[x]` **Giai đoạn 5: Hoàn thiện Staff Dashboard & Super Admin** (3/3)
- `[x]` **Giai đoạn 6: Kiểm thử E2E & Dọn dẹp mã nguồn** (4/4)

---

## CHI TIẾT TỪNG TASK

### Giai đoạn 1: Chuẩn bị & Nâng cấp Backend

- `[x]` **Task 1.1: MongoDB & Connection**
  *   Kiểm tra file `.env` của backend, đảm bảo `MONGODB_URI` trỏ tới cơ sở dữ liệu thật.
  *   Xác minh kết nối MongoDB thành công khi server BE khởi chạy.

- `[x]` **Task 1.2: Cập nhật Schema MenuItem (Dish)**
  *   Mở file `src/models/MenuItem.ts` trên BE.
  *   Bổ sung các trường dinh dưỡng: `calories`, `protein`, `carbs`, `fat`.
  *   Bổ sung các trường dị ứng & nhãn sức khỏe: `allergens`, `healthTags`, `healthLabels`.
  *   Bổ sung các trường dinh dưỡng nâng cao: `fiber`, `sugar`, `sodium`, `nutritionScore`.
  *   Bổ sung trường `categoryId` (Schema.Types.ObjectId, ref: "Category").

- `[x]` **Task 1.3: Sửa Route menu & category trên BE**
  *   Cập nhật `src/routes/menuRoutes.ts` để lưu và trả về các trường QDish mới trong API `POST /api/menu` và `PATCH /api/menu/:id`.
  *   Cập nhật `src/routes/categoryRoutes.ts` phần sửa danh mục (`PATCH /api/categories/:id`): Khi đổi tên danh mục, tự động tìm và cập nhật trường `category` (string) trong tất cả `MenuItem` có `categoryId` tương ứng để giữ tính đồng bộ.

- `[x]` **Task 1.4: Gỡ bỏ chặn gọi thêm món ở Route Order**
  *   Mở file `src/routes/orderRoutes.ts` trên BE.
  *   Tìm phần check `activeOrders.length > 0` (dòng 27-44).
  *   Xóa hoặc comment logic chặn đặt món của bàn đang hoạt động để cho phép đặt nhiều đợt món liên tiếp.

- `[x]` **Task 1.5: Seed dữ liệu thật QDish mẫu**
  *   Tạo file script seed dữ liệu (hoặc cập nhật database qua MongoDB shell/Compass) để có ít nhất 1 nhà hàng mẫu, 3 danh mục mẫu và 8-10 món ăn thực tế có đầy đủ calo, dinh dưỡng, nhãn dị ứng và chỉ số xanh để phục vụ test.

---

### Giai đoạn 2: Sửa đổi API Services ở Frontend

- `[x]` **Task 2.1: Sửa API Auth Service**
  *   Mở `src/services/authService.ts`.
  *   Mở lại/bổ sung hàm request OTP reset password: `requestPasswordReset` gọi `POST /api/auth/request-password-reset`.
  *   Bổ sung hàm đổi mật khẩu: `changePassword` gọi `POST /api/auth/change-password` (kèm JWT).

- `[x]` **Task 2.2: Sửa API Menu Service**
  *   Mở `src/services/menuService.ts`.
  *   Sửa `getPublicMenu`: Đổi endpoint từ `/api/menu/public/${restaurantId}` thành `/api/menu?restaurantId=${restaurantId}`.

- `[x]` **Task 2.3: Sửa API Order Service**
  *   Mở `src/services/orderService.ts`.
  *   Sửa `createOrder`: Đổi endpoint từ `/api/orders/public/${restaurantId}` thành `/api/orders` (Body chứa `restaurantId` và `tableNumber`).
  *   Sửa `getOrdersByTable`: Đổi endpoint từ `/api/orders/public/${restaurantId}/table/${tableNumber}` thành `/api/orders?restaurantId=${restaurantId}&tableNumber=${tableNumber}`.

- `[x]` **Task 2.4: Sửa API Restaurant Service**
  *   Mở `src/services/restaurantService.ts`.
  *   Sửa đổi toàn bộ các endpoint superadmin: Thay `/api/superadmin/restaurants...` thành `/api/restaurants...`
  *   Sửa `getOverviewStats`: Thay `/api/superadmin/stats/overview` thành `/api/restaurants/stats/overview`.
  *   Sửa `getRevenueStats`: Thay `/api/superadmin/stats/restaurant/${id}` thành `/api/restaurants/${id}/stats/revenue`.
  *   Sửa `getSettings`: Thay `/api/restaurants/settings` thành `/api/restaurants/me`.
  *   Sửa `updateSettings`: Thay `/api/restaurants/settings` thành `/api/restaurants/me` (method PATCH).
  *   Bổ sung hàm yêu cầu OTP đổi email: `requestEmailChangeOtp` gọi `POST /api/restaurants/me/request-email-change`.
  *   Bổ sung hàm yêu cầu OTP đổi bank: `requestBankChangeOtp` gọi `POST /api/restaurants/me/request-bank-change`.

- `[x]` **Task 2.5: Sửa API Category Service**
  *   Tạo/cập nhật `src/services/categoryService.ts` chứa các hàm CRUD danh mục: `getAll`, `create`, `update`, `delete` gọi đến `/api/categories`.

---

### Giai đoạn 3: Hoàn thiện Customer Menu (B2C View)

- `[x]` **Task 3.1: Gọi API thật trong CustomerMenu.tsx**
  *   Mở `src/pages/CustomerMenu.tsx`.
  *   Thay thế mock data bằng việc gọi `menuService.getPublicMenu` và lấy thông tin nhà hàng qua API (hoặc từ danh sách nhà hàng thật).
  *   Gọi API danh mục thật: `GET /api/categories?restaurantId=...`
  *   Hiển thị Loading Skeleton khi tải menu, hiển thị Empty State khi chưa có món, hiển thị Error State khi lỗi kết nối.

- `[x]` **Task 3.2: Tích hợp Hồ sơ Sức khỏe & Cảnh báo Dị ứng**
  *   Tạo/hoàn thiện Dialog/Sheet **Hồ sơ sức khỏe** cho khách hàng quét mã (lưu LocalStorage).
  *   Viết logic lọc món:
      *   Cảnh báo đỏ và **khóa nút** "Thêm vào giỏ" đối với các món ăn chứa thành phần dị ứng của khách hàng.
      *   Gợi ý nhãn "QDish Recommended" cho món ăn phù hợp với mục tiêu calo/chế độ ăn của khách.

- `[x]` **Task 3.3: Gọi API đặt món thật**
  *   Mở `src/pages/CustomerMenu.tsx` -> Hàm `handleSubmitOrder`.
  *   Mở lại và sửa gọi API thật: `orderService.createOrder`.
  *   Đảm bảo Toast thông báo thành công hiển thị và giỏ hàng được xóa sau khi đặt món thành công.

- `[x]` **Task 3.4: Xem Lịch sử Đơn & Theo dõi đơn hàng tại bàn**
  *   Thêm nút **"Xem đơn đã gọi"** trên giao diện Customer Menu.
  *   Khi click mở Drawer hiển thị danh sách các món ăn đã gọi của bàn ăn từ database (`orderService.getOrdersByTable`).
  *   Hiển thị trạng thái đơn hàng (PENDING, CONFIRMED, SERVED, COMPLETED) dưới dạng Stepper hoặc timeline.
  *   Tích hợp polling 5-10 giây tự động tải lại đơn hàng để cập nhật trạng thái từ bếp.

- `[x]` **Task 3.5: Tạo nút Yêu cầu thanh toán và Invoice VietQR**
  *   Bổ sung nút **"Thanh toán tại bàn"** trong Drawer lịch sử đơn.
  *   Khi bấm, hiển thị Modal hóa đơn tổng tiền thực tế của bàn ăn.
  *   Tạo mã QR VietQR động (gọi API sinh mã VietQR của nhà hàng với số tiền chính xác và nội dung chuyển khoản: Bàn X).

---

### Giai đoạn 4: Hoàn thiện Restaurant Dashboard

- `[x]` **Task 4.1: Xây dựng Khung Dashboard & Routing**
  *   Nâng cấp `src/pages/Dashboard.tsx` từ shell rỗng thành một Dashboard hoàn chỉnh.
  *   Sử dụng Shadcn `Tabs` để phân chia các màn hình con (Thống kê, Món ăn, Danh mục, Đơn hàng, Bàn & QR, Nhân viên, Profile).
  *   Tích hợp middleware / hook `useAuth` để bảo vệ trang, đảm bảo chỉ `RESTAURANT_ADMIN` được truy cập.

- `[x]` **Task 4.2: Tab 1 - Tổng quan & Thống kê Recharts**
  *   Gọi API `restaurantService.getSettings` để lấy thông tin nhà hàng và `restaurantService.getMeStats` (hoặc `/api/restaurants/me/stats`) để lấy thống kê.
  *   Thiết kế các thẻ KPI hiển thị Doanh thu, Đơn hàng, Giá trị trung bình đơn.
  *   Sử dụng `recharts` vẽ:
      *   Biểu đồ vùng (AreaChart) hiển thị doanh thu theo ngày.
      *   Biểu đồ cột (BarChart) hiển thị doanh thu theo giờ cao điểm.
      *   Biểu đồ tròn (PieChart) hiển thị cơ cấu danh mục bán chạy.
      *   Bảng xếp hạng Top 10 món ăn bán chạy nhất.

- `[x]` **Task 4.3: Tab 2 - Quản lý Món ăn (Menu Item CRUD)**
  *   Hiển thị bảng danh sách món ăn của nhà hàng.
  *   Thêm nút **"Thêm món ăn"**, click mở Dialog chứa Form.
  *   Thêm nút **"Sửa món ăn"** ở từng dòng, click mở Dialog điền sẵn thông tin.
  *   Thêm nút **"Xóa món ăn"**, click hiển thị Confirm Modal.
  *   Thêm nút **"Bật/Tắt món"** (Switch toggle active) cập nhật nhanh trạng thái khả dụng.
  *   Form Thêm/Sửa phải bao gồm validation đầy đủ và các trường:
      *   Cơ bản: Tên, Giá (>0), Danh mục (Select dropdown), Mô tả, ImageUrl.
      *   QDish: Calories, Protein, Carbs, Fat, Fiber, Sugar, Sodium, Nutrition Score, Allergens (Multi-select).

- `[x]` **Task 4.4: Tab 3 - Quản lý Danh mục (Category CRUD)**
  *   Hiển thị bảng danh mục của nhà hàng.
  *   Thêm nút **"Thêm danh mục"**, **"Sửa danh mục"**, **"Xóa danh mục"** (Confirm Dialog).

- `[x]` **Task 4.5: Tab 4 - Quản lý Bàn ăn & In ấn QR Code**
  *   Thiết kế giao diện quản lý bàn ăn: Nhập tổng số bàn ăn, bấm "Đồng bộ" gửi danh sách bàn lên database (`POST /api/tables`).
  *   Hiển thị danh sách bàn ăn.
  *   Bên cạnh mỗi bàn ăn có nút **"Tạo mã QR"**.
  *   Khi click mở Dialog sinh ảnh mã QR chứa URL đặt món động (`http://localhost:5173/order?r={rId}&t={tableNumber}`).
  *   Hỗ trợ nút **"In mã QR"** / **"Tải xuống QR"** đẹp mắt.

- `[x]` **Task 4.6: Tab 5 - Quản lý Đơn hàng (Order Queue)**
  *   Hiển thị danh sách đơn hàng hiện tại của nhà hàng.
  *   Hỗ trợ lọc đơn theo trạng thái (Pending, Confirmed, Served, Completed, Cancelled).
  *   Thêm các nút thao tác trên từng đơn:
      *   Nút **"Xác nhận đơn"** (chuyển PENDING -> CONFIRMED).
      *   Nút **"Ra món"** (chuyển CONFIRMED -> SERVED).
      *   Nút **"Hoàn thành đơn"** (chuyển SERVED -> COMPLETED), click mở Dialog lựa chọn phương thức thanh toán (CASH / BANK_TRANSFER).
      *   Nút **"Hủy đơn"** (Confirm Dialog).

- `[x]` **Task 4.7: Tab 6 & 7 - Nhân viên & Cài đặt Profile**
  *   **Quản lý Nhân viên:** Bảng danh sách staff. Các nút: **"Thêm nhân viên"** (Username, Password, Name), **"Sửa nhân viên"**, **"Khóa/Mở khóa"** (toggle active).
  *   **Cấu hình Profile:** Form xem/sửa thông tin nhà hàng (Name, Owner, Phone, Address, Bank Name, Bank Account).
  *   Tích hợp các nút **"Yêu cầu OTP đổi Email"** và **"Yêu cầu OTP đổi Bank"**. Khi click, gọi API gửi mã OTP về email, hiển thị input nhập OTP 6 số để xác thực khi bấm Save profile.

---

### Giai đoạn 5: Hoàn thiện Staff Dashboard & Super Admin

- `[x]` **Task 5.1: Hoàn thiện Staff Dashboard (/staff)**
  *   Nâng cấp `src/pages/StaffDashboard.tsx` từ shell rỗng.
  *   Thiết kế giao diện Grid chia làm 3 cột rõ rệt: Đang chờ (PENDING), Đã xác nhận (CONFIRMED), Đã ra món (SERVED).
  *   Tải danh sách đơn hàng của nhà hàng qua API thật (`orderService.getStaffOrders`).
  *   Tích hợp polling 5 giây tự động tải lại đơn.
  *   Thêm các nút thao tác nhanh trên card đơn hàng: **"Xác nhận đơn"**, **"Ra món"** gọi API cập nhật trạng thái đơn hàng.

- `[x]` **Task 5.2: Hoàn thiện Super Admin Dashboard (/super-admin)**
  *   Nâng cấp `src/pages/SuperAdmin.tsx` từ shell rỗng.
  *   **Tab Thống kê:** Hiển thị số nhà hàng Active/Inactive, vẽ biểu đồ Top 5 doanh thu.
  *   **Tab Quản lý nhà hàng:** Bảng hiển thị thông tin các nhà hàng trên hệ thống.
  *   Thêm nút **"Thêm nhà hàng mới"**, click mở Dialog chứa Form (Name, Username, Owner, Email, Address, Phone, Status).
  *   Thêm nút **"Sửa nhà hàng"**.
  *   Thêm nút **"Khóa/Mở khóa"** (toggle active nhà hàng).
  *   Thêm nút **"Đặt lại mật khẩu"** admin nhà hàng bất kỳ.

- `[x]` **Task 5.3: Tích hợp login thật trong Login.tsx và ResetPassword.tsx**
  *   Mở `src/pages/Login.tsx`, mở comment gọi API `authService.login`.
  *   Giải mã JWT token lấy role, lưu token vào LocalStorage và redirect chính xác.
  *   Mở `src/pages/ResetPassword.tsx`, mở comment gọi API `authService.resetPassword`.

---

### Giai đoạn 6: Kiểm thử E2E & Dọn dẹp mã nguồn

- `[x]` **Task 6.1: Test Luồng Authentication**
  *   Test đăng nhập thành công & chuyển hướng đúng trang cho Super Admin, Restaurant Admin, Staff.
  *   Kiểm tra chặn truy cập chéo (Staff không được vào `/dashboard`, v.v.).
  *   Test quên mật khẩu: gửi OTP về email thật và đặt lại mật khẩu thành công.

- `[x]` **Task 6.2: Test Luồng Khách hàng đặt món E2E**
  *   Mở trình duyệt ở trang `/order?r={rId}&t={tableNumber}`.
  *   Kiểm tra tải menu và danh mục thật thành công.
  *   Test tạo Hồ sơ sức khỏe: chọn dị ứng Sữa -> kiểm tra xem món có dị ứng bị khóa đặt món và viền đỏ hay không.
  *   Thêm các món an toàn vào giỏ, đặt món thành công.
  *   Kiểm tra Drawer lịch sử đơn: hiển thị đúng danh sách món, giá tiền và trạng thái PENDING.
  *   Bếp (`/staff` hoặc `/dashboard`) nhận đơn hàng thật, bấm xác nhận đơn -> kiểm tra polling phía khách hàng hiển thị cập nhật trạng thái CONFIRMED.
  *   Gọi thêm món đợt 2 tại bàn thành công.
  *   Yêu cầu thanh toán VietQR động hiển thị đúng số tiền gộp các đợt.

- `[x]` **Task 6.3: Test Luồng CRUD Dashboard**
  *   Test CRUD món ăn có dinh dưỡng/allergen/chỉ số dinh dưỡng.
  *   Test CRUD danh mục.
  *   Test sinh mã QR bàn và in/tải ảnh QR bàn ăn.
  *   Test thêm nhân viên và khóa nhân viên.
  *   Test đổi thông tin email/bank yêu cầu OTP.
  *   Test Super Admin CRUD nhà hàng.

- `[x]` **Task 6.4: Sửa lỗi build TypeScript & Dọn dẹp**
  *   Chạy build dự án FE (`npm run build`) và sửa toàn bộ lỗi TypeScript/Linter nếu có.
  *   Xóa file mock data `src/lib/mockData.ts`.
  *   Xóa các console.log dư thừa, code comment cũ và dead code.
  *   Đảm bảo cả BE và FE chạy mượt mà không có lỗi runtime.

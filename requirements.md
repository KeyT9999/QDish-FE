# Yêu cầu Nghiệp vụ & Kỹ thuật (Requirements.md)

Tài liệu này xác định các yêu cầu nghiệp vụ, API, dữ liệu MongoDB, phân quyền, validation, xử lý lỗi và điều kiện nghiệm thu để hoàn thiện hệ sinh thái **QDish**.

---

## 1. Chức năng cần hoàn thiện

### 1.1. Loại bỏ Mock Data và Simulation
*   **Mục tiêu:** Không còn sử dụng dữ liệu giả lập trong toàn bộ Frontend.
*   **Yêu cầu:**
    *   Xóa/thay thế tất cả các import từ `src/lib/mockData.ts`.
    *   Hủy bỏ các hàm `setTimeout` mô phỏng độ trễ mạng trong các service/component.
    *   Thay thế fake login, fake reset password, fake order placement bằng các API call thực tế đến backend.
    *   Xóa file `src/lib/mockData.ts` sau khi hoàn thành.

### 1.2. Kết nối API đúng Backend
*   **Mục tiêu:** Sửa các API endpoint gọi sai đường dẫn trong các file service FE.
*   **Chi tiết điều chỉnh:**
    *   `getPublicMenu`: Sửa từ `/api/menu/public/:restaurantId` -> `/api/menu?restaurantId=...`
    *   `createOrder`: Sửa từ `/api/orders/public/:restaurantId` -> `/api/orders`
    *   `getOrdersByTable`: Sửa từ `/api/orders/public/:rId/table/:tId` -> `/api/orders?restaurantId=...&tableNumber=...`
    *   `getAllRestaurants` / `createRestaurant` / `updateRestaurant`: Sửa từ `/api/superadmin/restaurants` -> `/api/restaurants`

### 1.3. Khách hàng (Customer Menu & Order Flow)
*   **Màn hình chính:** Truy cập qua URL `/order?r={restaurantId}&t={tableNumber}`.
*   **Hành động:**
    *   Tải thông tin nhà hàng và thực đơn thực tế qua API.
    *   Lọc món ăn theo danh mục lấy từ API thật.
    *   Tìm kiếm và lọc món ăn theo chỉ số dinh dưỡng.
    *   Thêm món vào giỏ hàng (chỉ cho phép khi món có trạng thái `available: true`).
    *   Đặt món: Gửi thông tin giỏ hàng lên database thông qua API thật. Sau khi đặt thành công, hiển thị thông báo và cho phép theo dõi đơn.

### 1.4. Hồ sơ Sức khỏe Khách hàng (Health Profile)
*   **Thiết lập:** Nút "Hồ sơ sức khỏe" mở Sheet nhập thông tin:
    *   **Mục tiêu:** Giảm cân, Tăng cơ, Ăn uống lành mạnh.
    *   **Dị ứng:** Gluten, Sữa (Dairy), Hạt (Nuts), Giáp xác (Shellfish), Đậu nành (Soy), Trứng (Eggs), Cá (Fish).
    *   **Chế độ ăn:** Vegan, Vegetarian, Keto, Low Carb, Low Fat, Sugar Free.
*   **Áp dụng:**
    *   Lưu thông tin hồ sơ sức khỏe trong `LocalStorage`.
    *   **Cảnh báo dị ứng:** Món ăn chứa thành phần gây dị ứng đã khai báo của khách sẽ hiển thị viền đỏ cảnh báo và bị khóa nút "Thêm vào giỏ hàng" để bảo vệ an toàn.
    *   **Gợi ý món ăn:** Món ăn phù hợp với mục tiêu/chế độ ăn của khách sẽ được hiển thị nhãn nổi bật "QDish Recommended".

### 1.5. Xem Đơn đã gọi & Polling trạng thái
*   **Xem đơn:** Nút "Xem đơn đã gọi" mở Drawer hiển thị lịch sử các đơn hàng đã đặt của bàn ăn tại nhà hàng hiện tại (`GET /api/orders?restaurantId=...&tableNumber=...`).
*   **Polling:** Cứ sau mỗi 5 - 10 giây sẽ tự động gọi API để cập nhật trạng thái đơn (PENDING -> CONFIRMED -> SERVED -> COMPLETED / CANCELLED).
*   **Gọi món thêm:** Khách có thể chọn món thêm và đặt tiếp đợt 2, đợt 3. Backend không được chặn việc này.

### 1.6. Restaurant Dashboard (Chủ quán)
*   **Giao diện:** Màn hình `/dashboard` hoàn thiện sử dụng dữ liệu MongoDB thật qua các Tab:
    1.  **Tổng quan (Stats):** Doanh thu, số đơn hàng, giá trị đơn hàng trung bình, biểu đồ doanh số theo ngày/giờ, cơ cấu doanh thu theo danh mục, top món bán chạy (gọi `GET /api/restaurants/me/stats`).
    2.  **Quản lý Món ăn (Menu):** Bảng danh sách món ăn. Cho phép Thêm, Sửa, Xóa món, và Toggle trạng thái khả dụng (`available`). Form Thêm/Sửa bắt buộc có các trường: Tên, Giá, Mô tả, Danh mục, ImageUrl, Calo, Carb, Protein, Fat, Allergen, Chất xơ (Fiber), Đường (Sugar), Sodium, Nutrition Score.
    3.  **Quản lý Danh mục (Category):** Thêm, sửa, xóa danh mục.
    4.  **Quản lý Bàn & QR Code:** Đồng bộ số lượng bàn ăn. Tạo mã QR chứa link đặt món (`http://domain/order?r={rId}&t={table}`), preview và hỗ trợ in/tải ảnh QR bàn ăn.
    5.  **Quản lý Đơn hàng (Orders):** Bảng hiển thị đơn hàng hiện tại, lọc theo trạng thái, cập nhật trạng thái đơn hàng (Confirmed -> Served -> Completed), chọn hình thức thanh toán khi hoàn thành đơn (CASH / BANK_TRANSFER).
    6.  **Quản lý Nhân viên (Staff):** Xem danh sách staff, tạo tài khoản staff, toggle khóa/mở khóa hoạt động của staff.
    7.  **Cài đặt nhà hàng (Profile):** Đổi email và đổi tài khoản ngân hàng nhận tiền chuyển khoản (Yêu cầu gửi OTP về email xác minh trước khi thay đổi).

### 1.7. Staff Dashboard (Nhân viên/Bếp)
*   **Giao diện:** Màn hình `/staff` lấy đơn hàng thật (`GET /api/staff/orders`), polling 5 giây tự động tải lại đơn.
*   **Phân cột:** Chia làm 3 cột PENDING, CONFIRMED, SERVED.
*   **Hành động:** Nhân viên bếp/chạy bàn bấm nút cập nhật trạng thái:
    *   Xác nhận đơn (`PENDING` -> `CONFIRMED`).
    *   Ra món (`CONFIRMED` -> `SERVED`).
    *   Hoàn thành đơn (`SERVED` -> `COMPLETED` - Chỉ hiển thị cho Admin nhà hàng hoặc nhân viên được cấp quyền).

### 1.8. Super Admin Dashboard (Quản lý SaaS)
*   **Giao diện:** Màn hình `/super-admin` lấy dữ liệu thật qua các API:
    *   **Thống kê:** Tổng số nhà hàng hoạt động/tạm dừng, Top 5 nhà hàng doanh thu cao nhất.
    *   **Quản lý Nhà hàng:** Bảng danh sách các nhà hàng, thêm nhà hàng mới (tự động sinh mật khẩu tạm gửi qua email), sửa nhà hàng, khóa/mở khóa nhà hàng, đặt lại mật khẩu admin nhà hàng bất kỳ.

---

## 2. API Cần Dùng & Data Mapping

Chi tiết API Backend (`QR_FOOD_ORDER_BE`) được ánh xạ với Frontend Service (`QR_FOOD_ORDER_FE`):

### 2.1. Authentication
*   `POST /api/auth/login`: Đăng nhập, nhận token JWT.
*   `POST /api/auth/request-password-reset`: Yêu cầu OTP reset password qua email.
*   `POST /api/auth/reset-password`: Đặt lại mật khẩu mới với OTP.
*   `POST /api/auth/change-password` (Yêu cầu JWT): Đổi mật khẩu trong Profile nhà hàng.

### 2.2. Menu & Categories
*   `GET /api/menu?restaurantId=...&includeUnavailable=true`: Lấy menu nhà hàng.
*   `POST /api/menu` (Yêu cầu JWT): Tạo món ăn mới.
*   `PATCH /api/menu/:id` (Yêu cầu JWT): Cập nhật thông tin món ăn.
*   `DELETE /api/menu/:id` (Yêu cầu JWT): Xóa món ăn.
*   `GET /api/categories?restaurantId=...`: Lấy danh mục nhà hàng.
*   `POST /api/categories` (Yêu cầu JWT): Tạo danh mục mới.
*   `PATCH /api/categories/:id` (Yêu cầu JWT): Cập nhật danh mục.
*   `DELETE /api/categories/:id` (Yêu cầu JWT): Xóa danh mục.

### 2.3. Orders
*   `POST /api/orders`: Đặt món từ bàn (Guest).
*   `GET /api/orders?restaurantId=...&tableNumber=...`: Lấy lịch sử đơn tại bàn.
*   `GET /api/staff/orders` (Yêu cầu JWT): Nhân viên/Admin lấy đơn hàng hiện tại.
*   `PATCH /api/staff/orders/:id` (Yêu cầu JWT): Cập nhật trạng thái đơn hàng.

### 2.4. Restaurant
*   `GET /api/restaurants` (Yêu cầu JWT): Super Admin xem danh sách nhà hàng.
*   `POST /api/restaurants` (Yêu cầu JWT): Super Admin tạo nhà hàng mới.
*   `PATCH /api/restaurants/:id` (Yêu cầu JWT): Super Admin cập nhật nhà hàng / toggle active.
*   `POST /api/restaurants/:id/reset-password` (Yêu cầu JWT): Super Admin reset password nhà hàng.
*   `GET /api/restaurants/stats/overview` (Yêu cầu JWT): Super Admin xem stats tổng thể.
*   `GET /api/restaurants/:id/stats/revenue` (Yêu cầu JWT): Super Admin xem stats doanh thu nhà hàng.
*   `GET /api/restaurants/me/stats` (Yêu cầu JWT): Admin nhà hàng xem stats chi tiết.
*   `PATCH /api/restaurants/me` (Yêu cầu JWT): Admin nhà hàng cập nhật profile.
*   `POST /api/restaurants/me/request-email-change` (Yêu cầu JWT): Yêu cầu OTP đổi email.
*   `POST /api/restaurants/me/request-bank-change` (Yêu cầu JWT): Yêu cầu OTP đổi tài khoản bank.
*   `POST /api/restaurants/generate-qr`: Tạo ảnh mã QR VietQR thanh toán.

### 2.5. Staff & Tables
*   `GET /api/staff` (Yêu cầu JWT): Admin lấy danh sách staff.
*   `POST /api/staff` (Yêu cầu JWT): Admin tạo staff mới.
*   `PATCH /api/staff/:id` (Yêu cầu JWT): Admin cập nhật staff.
*   `PATCH /api/staff/:id/toggle-active` (Yêu cầu JWT): Admin toggle active staff.
*   `GET /api/tables?restaurantId=...`: Lấy danh sách bàn.
*   `POST /api/tables` (Yêu cầu JWT): Admin lưu số bàn.

---

## 3. Dữ liệu cần lưu trong MongoDB

### 3.1. User Model
*   `username` (String, unique): Tên đăng nhập.
*   `password` (String): Mật khẩu đã hash.
*   `role` (Enum: SUPER_ADMIN, RESTAURANT_ADMIN, STAFF).
*   `restaurantId` (ObjectId, ref: Restaurant): Tham chiếu đến nhà hàng sở hữu (đối với RESTAURANT_ADMIN và STAFF).
*   `name` (String): Tên hiển thị.
*   `isActive` (Boolean): Trạng thái hoạt động.

### 3.2. Restaurant Model
*   `name` (String), `username` (String), `ownerName` (String), `email` (String), `address` (String), `phone` (String), `status` (Enum: ACTIVE, INACTIVE), `bankAccount` (String), `bankName` (String).

### 3.3. MenuItem Model (QDish fields cần bổ sung)
*   **Dữ liệu cũ:** `restaurantId`, `name`, `description`, `price`, `category` (String), `imageUrl`, `available`.
*   **QDish fields bổ sung:**
    *   `categoryId` (ObjectId, ref: Category, optional): Tách biệt tham chiếu danh mục.
    *   `calories` (Number): Kcal của món ăn.
    *   `protein` (Number), `carbs` (Number), `fat` (Number): Hàm lượng dinh dưỡng (g).
    *   `fiber` (Number), `sugar` (Number), `sodium` (Number): Chất xơ, đường, muối.
    *   `nutritionScore` (Number): Điểm số dinh dưỡng (0-100).
    *   `allergens` (Array String): Danh sách chất gây dị ứng.
    *   `healthTags` (Array String) & `healthLabels` (Array String): Nhãn healthy.

### 3.4. Order Model
*   `restaurantId`, `tableNumber`, `items` (Array { menuItemId, name, price, quantity }), `totalAmount`, `status` (Enum: PENDING, CONFIRMED, SERVED, COMPLETED, CANCELLED), `note` (customer note), `customerName`, `paymentMethod` (Enum: CASH, BANK_TRANSFER), `confirmedBy`, `confirmedByName`, `updatedBy`, `updatedByName`.

---

## 4. Role-based Authorization

Hệ thống phân quyền truy cập thông qua mã JWT được phân rã ở FE:
*   **Khách hàng (GUEST):** Không cần đăng nhập. Chỉ truy cập trang `/order` công khai. Có quyền Xem menu, đặt món, cấu hình Hồ sơ sức khỏe (lưu LocalStorage), Xem lịch sử đơn của bàn ăn tại bàn đó, Yêu cầu thanh toán.
*   **Staff (STAFF):** Đăng nhập bằng tài khoản nhân viên. Chỉ truy cập `/staff`. Quyền xem danh sách đơn hàng real-time, xác nhận đơn (`CONFIRMED`), cập nhật ra món (`SERVED`). Không được truy cập `/dashboard` hay `/super-admin`.
*   **Restaurant Admin (RESTAURANT_ADMIN):** Đăng nhập bằng tài khoản admin nhà hàng. Truy cập `/dashboard` và `/staff`. Có toàn quyền quản lý menu, danh mục, bàn ăn, nhân viên, cấu hình thông tin nhà hàng, xem thống kê doanh thu và hoàn thành/hủy đơn hàng.
*   **Super Admin (SUPER_ADMIN):** Đăng nhập bằng tài khoản hệ thống. Truy cập `/super-admin`. Có toàn quyền quản lý SaaS (thêm/sửa/khóa nhà hàng, reset mật khẩu nhà hàng, xem thống kê doanh thu toàn hệ thống).

---

## 5. Validation & Xử lý lỗi

### 5.1. Validation phía Client (Forms)
*   **Menu Form:**
    *   Tên món: Không bỏ trống, trim khoảng trắng thừa.
    *   Giá món: Bắt buộc là số, lớn hơn 0.
    *   Danh mục: Bắt buộc chọn.
    *   Calories, Protein, Carbs, Fat, Fiber, Sugar, Sodium, Nutrition Score: Bắt buộc lớn hơn hoặc bằng 0.
*   **Đặt món Form:**
    *   Tên khách hàng: Không bỏ trống, từ 2 ký tự trở lên.
    *   Giỏ hàng: Không được rỗng.
    *   Cảnh báo dị ứng: Khóa đặt món nếu món ăn chứa chất gây dị ứng nguy hiểm đã khai báo trong Hồ sơ sức khỏe của khách.
*   **Restaurant & Staff Form:**
    *   Username: Không rỗng, viết liền không dấu, không ký tự đặc biệt.
    *   Email: Đúng định dạng email.
    *   Số điện thoại: Đúng định dạng số điện thoại Việt Nam (10 số).
    *   Mật khẩu: Tối thiểu 6 ký tự.

### 5.2. UI State & Xử lý lỗi API
*   **Loading State:** Hiển thị Spinner hoặc Skeleton khi đang fetch API hoặc đang submit form. Vô hiệu hóa nút bấm gửi form để tránh submit trùng lặp.
*   **Error State:** Nếu API lỗi, hiển thị thông báo lỗi chi tiết bằng Toast (Sonner) hoặc Alert Dialog. Cung cấp nút "Thử lại" (Retry) đối với các lỗi tải trang.
*   **Empty State:** Hiển thị hình ảnh minh họa và thông điệp trực quan khi trang không có dữ liệu (không có món, không có bàn, không có đơn hàng).
*   **Confirm Modal:** Các hành động nguy hiểm như Xóa món, Hủy đơn, Khóa tài khoản nhân viên bắt buộc phải hiển thị Dialog xác nhận trước khi thực hiện.

---

## 6. Điều kiện Nghiệm thu (UAT)

1.  **100% Loại bỏ Mock Data:** Không còn bất kỳ component hay page nào import từ `mockData.ts`. FE chạy hoàn toàn bằng việc gọi API thật.
2.  **Đặt món nhiều đợt thành công:** Khách hàng dán QR bàn ăn vào trang `/order?r=...&t=...`, thực hiện đặt món đợt 1 -> Bếp nhận đơn. Khách tiếp tục đặt thêm đợt 2 thành công mà không bị backend chặn bàn.
3.  **Xem lịch sử bàn ăn đồng bộ:** Khách hàng refresh lại trình duyệt thì trang `/order` vẫn tải lại đúng các món ăn đã gọi và hiển thị trạng thái chuẩn xác từ database.
4.  **Cảnh báo dị ứng hoạt động:** Khi khai báo dị ứng Sữa trong Hồ sơ sức khỏe, các món ăn chứa Sữa lập tức hiển thị cảnh báo đỏ và nút "Thêm vào giỏ" bị vô hiệu hóa.
5.  **Dashboard hiển thị dữ liệu thật:** Đồ thị doanh thu và KPI trong `/dashboard` hiển thị đúng số liệu thực tế được cộng dồn từ các đơn hàng `COMPLETED` trong database.
6.  **Xử lý đơn bếp đồng bộ:** Khi staff bấm "Xác nhận đơn" hoặc "Ra món" ở trang `/staff`, giao diện theo dõi của khách lập tức chuyển trạng thái tương ứng sau khi polling.
7.  **Build thành công:** Dự án build thành công (`npm run build`) không có lỗi TypeScript hay linter.

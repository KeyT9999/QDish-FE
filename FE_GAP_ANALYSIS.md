# BÁO CÁO PHÂN TÍCH CHÊNH LỆCH FRONTEND & KẾT NỐI API BACKEND (FE GAP ANALYSIS)

Báo cáo này tập trung vào việc đối chiếu chi tiết giữa **Backend đã phân tích (`BE_ANALYSIS.md`)** và **mã nguồn Frontend hiện tại của dự án (`QR_FOOD_ORDER_FE`)**. Mục tiêu là xác định rõ các điểm thiếu hụt (Gaps) về màn hình, nút bấm, form nhập liệu, các dịch vụ API bị lệch đường dẫn, và các luồng xử lý chưa được tích hợp thực tế (vẫn đang chạy mock data).

---

## 1. Tổng quan FE hiện tại

### Công nghệ sử dụng
*   **Core:** React (v19.2.6) kết hợp với Vite (v8.0.12).
*   **Routing:** React Router DOM (v7.15.1) hỗ trợ phân luồng Layout và Route bảo vệ (`ProtectedRoute` dựa trên phân giải JWT Token).
*   **Styling & UI Components:**
    *   **Tailwind CSS (v4.3.0)** kết hợp với plugin `@tailwindcss/vite` hiện đại, giúp build CSS cực nhanh và hỗ trợ cấu hình theme trực tiếp qua CSS variables.
    *   **Shadcn UI / Radix Primitives:** Một bộ UI component cực kỳ hoàn thiện nằm trong thư mục `src/components/ui/` (bao gồm tabs, dialog, scroll-area, sheet, progress, table, select, dropdown-menu...).
    *   **Lucide React:** Bộ thư viện icon trực quan.
*   **State Management & Utilities:**
    *   `sonner`: Quản lý Toast notification hiện đại, hiển thị ở góc trên trung tâm.
    *   `recharts`: Vẽ biểu đồ thống kê doanh số.
    *   `qrcode.react`: Hỗ trợ sinh mã QR động.
    *   `framer-motion`: Hỗ trợ hiệu ứng micro-animations mượt mà.

### Cấu trúc thư mục hiện tại
```text
QR_FOOD_ORDER_FE/
├── src/
│   ├── assets/                 # Logo và hình ảnh tĩnh
│   ├── components/
│   │   ├── cart/               # Giỏ hàng: CartDrawer.tsx, CartItem.tsx
│   │   ├── layout/             # Layouts: AuthLayout.tsx, CustomerLayout.tsx, DashboardLayout.tsx
│   │   ├── menu/               # Các component menu: AllergenWarning.tsx, CategoryFilter.tsx, EcoScore.tsx, MenuItemCard.tsx, MenuItemDetail.tsx, NutritionBadge.tsx, RestaurantHeader.tsx
│   │   ├── shared/             # Badge trạng thái: HealthLabelBadge.tsx, OrderStatusBadge.tsx, QDishLogo.tsx
│   │   └── ui/                 # Shadcn Components (button, dialog, input, select, table...)
│   ├── hooks/
│   │   ├── useApi.ts           # Hook gọi API hỗ trợ state loading/error
│   │   ├── useAuth.ts          # Hook quản lý session đăng nhập và giải mã JWT
│   │   ├── useCart.ts          # Hook quản lý giỏ hàng lưu vào LocalStorage theo restaurantId
│   │   └── useHealthProfile.ts # Hook quản lý hồ sơ sức khỏe lưu vào LocalStorage
│   ├── lib/
│   │   ├── mockData.ts         # Mock data phục vụ hiển thị demo
│   │   └── utils.ts            # Hòm công cụ tiện ích (format tiền tệ, cn...)
│   ├── pages/
│   │   ├── CustomerMenu.tsx    # Trang thực đơn công khai cho khách hàng quét mã QR
│   │   ├── Login.tsx           # Trang đăng nhập cho quản trị viên và nhân viên
│   │   ├── ResetPassword.tsx   # Trang nhập email và OTP để reset mật khẩu
│   │   ├── Dashboard.tsx       # Trang Restaurant Admin Dashboard (ĐANG LÀ SHELL RỖNG)
│   │   ├── StaffDashboard.tsx  # Trang Staff Dashboard (ĐANG LÀ SHELL RỖNG)
│   │   └── SuperAdmin.tsx      # Trang Super Admin (ĐANG LÀ SHELL RỖNG)
│   ├── services/
│   │   ├── api.ts              # Cấu hình fetch client dùng chung, gắn token tự động
│   │   ├── authService.ts      # Chứa các hàm API đăng nhập, reset mật khẩu
│   │   ├── menuService.ts      # Chứa các hàm API CRUD món ăn
│   │   ├── orderService.ts     # Chứa các hàm API đặt món và cập nhật đơn hàng
│   │   └── restaurantService.ts# Chứa các hàm API CRUD nhà hàng và thống kê
│   ├── types/
│   │   └── index.ts            # Định nghĩa Interface TypeScript (có đầy đủ định dạng QDish Dinh Dưỡng/Xanh)
│   ├── App.css
│   ├── App.tsx                 # Quản lý Routing và phân luồng truy cập ProtectedRoute
│   ├── index.css               # Định nghĩa các layer và CSS variables cho Tailwind V4
│   └── main.tsx                # Khởi tạo React App
├── index.html
├── package.json
└── tsconfig.json
```

### Các Route / Page hiện có
1.  `GET /login` -> Trang đăng nhập (Tích hợp mock login, **chưa kết nối API thật**).
2.  `GET /reset-password` -> Trang đặt lại mật khẩu với OTP (Tích hợp mock reset, **chưa kết nối API thật**).
3.  `GET /order?r={restaurantId}&t={tableNumber}` -> Trang thực đơn công khai cho khách (Giao diện hoàn hảo, nhưng **chỉ hiển thị Mock Data và comment out API thật**).
4.  `GET /dashboard` -> Trang quản lý của chủ quán (Tài khoản RESTAURANT_ADMIN) -> **Đang bỏ trống hoàn toàn**.
5.  `GET /staff` -> Giao diện chuẩn bị đơn hàng của nhân viên (Tài khoản STAFF) -> **Đang bỏ trống hoàn toàn**.
6.  `GET /super-admin` -> Giao diện quản lý SaaS của Super Admin (Tài khoản SUPER_ADMIN) -> **Đang bỏ trống hoàn toàn**.

### Những flow đã làm được (Ở mức giao diện & Mock Data)
*   Khách quét QR vào xem Menu, lọc theo danh mục, click xem chi tiết món ăn (có hiển thị đầy đủ Calo, chỉ số Macro, nhãn thân thiện môi trường EcoScore và cảnh báo dị ứng từ mock data).
*   Khách thêm món vào giỏ hàng, mở Drawer giỏ hàng, điền tên và ghi chú bếp, bấm xác nhận đặt món (Có Toast thông báo đặt thành công và tự động xóa giỏ hàng từ mock simulation).
*   Đăng nhập hệ thống phân tách phân quyền tự động, lưu Token JWT vào LocalStorage và tự động chuyển hướng về trang tương ứng.

---

## 2. Đối chiếu BE với FE (Kiểm tra kết nối API & Màn hình)

Dưới đây là bảng đối chiếu toàn diện giữa các API có sẵn của Backend (`QR_FOOD_ORDER_BE`) và mức độ sẵn sàng của Frontend hiện tại (`QR_FOOD_ORDER_FE`):

| Chức năng BE đã có | API Endpoint thực tế ở BE | Có Page FE chưa | Có Nút FE chưa | Có Form FE chưa | Đã gọi API chưa | Trạng thái tích hợp | Ghi chú |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Đăng nhập** | `POST /api/auth/login` | Có | Có | Có | **Chưa** (Mock) | **Thiếu một phần** | Cần uncomment phần gọi `authService.ts` trong `Login.tsx` |
| **Reset mật khẩu** | `POST /api/auth/reset-password` | Có | Có | Có | **Chưa** (Mock) | **Thiếu một phần** | Cần uncomment phần gọi `authService.ts` trong `ResetPassword.tsx` |
| **Đổi mật khẩu** | `POST /api/auth/change-password` | Chưa | Chưa | Chưa | Chưa | **Chưa có FE** | Thiếu form đổi mật khẩu trong mục Profile của chủ quán |
| **Yêu cầu reset OTP** | `POST /api/auth/request-password-reset` | Có | Có | Có | Chưa | **Thiếu một phần** | Chưa tích hợp nút "Gửi mã" thực tế trong form đăng nhập |
| **Lấy menu công khai** | `GET /api/menu?restaurantId=...` | Có | - | - | **Chưa** (Mock) | **Thiếu một phần** | FE đang định nghĩa **sai** endpoint thành `/api/menu/public/:id` và đang bị comment out |
| **Thêm món ăn** | `POST /api/menu` | Chưa | Chưa | Chưa | Chưa | **Chưa có FE** | Thiếu toàn bộ trang Dashboard Quản lý món ăn của Restaurant Admin |
| **Sửa món ăn** | `PATCH /api/menu/:id` | Chưa | Chưa | Chưa | Chưa | **Chưa có FE** | Thiếu form chỉnh sửa món ăn (đặc biệt là thiếu các trường Dinh dưỡng/Carbon) |
| **Xóa món ăn** | `DELETE /api/menu/:id` | Chưa | Chưa | Chưa | Chưa | **Chưa có FE** | Thiếu nút xóa món ăn trong quản lý thực đơn |
| **Lấy danh mục** | `GET /api/categories?restaurantId=...`| Có | - | - | **Chưa** (Mock) | **Thiếu một phần** | Giao diện đã có bộ lọc danh mục nhưng lấy từ mock dữ liệu |
| **CRUD danh mục** | Các API CRUD `/api/categories` | Chưa | Chưa | Chưa | Chưa | **Chưa có FE** | Thiếu giao diện quản lý danh mục (Category Management) |
| **Đặt món (Customer)**| `POST /api/orders` | Có | Có | Có | **Chưa** (Mock) | **Thiếu một phần** | FE đang định nghĩa **sai** endpoint thành `/api/orders/public/:id` và đang comment out |
| **Xem lịch sử bàn ăn**| `GET /api/orders?restaurantId=...` | Chưa | Chưa | - | Chưa | **Chưa có FE** | BE có API cho khách xem đơn cũ của bàn nhưng FE chưa làm nút xem |
| **Thống kê SaaS** | `GET /api/restaurants/stats/overview`| Chưa | - | - | Chưa | **Chưa có FE** | Trang `SuperAdmin.tsx` đang trống trơn, chưa gọi API thống kê này |
| **Thống kê doanh thu**| `GET /api/restaurants/:id/stats/revenue`| Chưa| - | - | Chưa | **Chưa có FE** | Chưa có màn hình Super Admin vẽ biểu đồ thống kê doanh số nhà hàng |
| **CRUD Nhà hàng** | Các API CRUD `/api/restaurants` | Chưa | Chưa | Chưa | Chưa | **Chưa có FE** | Chưa có giao diện quản lý danh sách nhà hàng của Super Admin |
| **Thống kê chủ quán** | `GET /api/restaurants/me/stats` | Chưa | - | - | Chưa | **Chưa có FE** | Màn hình Dashboard chủ quán trống, chưa vẽ Recharts thống kê |
| **Yêu cầu đổi email** | `POST /api/restaurants/me/request-email-change`| Chưa| Chưa | Chưa | Chưa | **Chưa có FE** | Thiếu nút "Đổi email" và form nhận OTP email trong Dashboard |
| **Yêu cầu đổi bank** | `POST /api/restaurants/me/request-bank-change` | Chưa | Chưa | Chưa | Chưa | **Chưa có FE** | Thiếu nút "Đổi tài khoản nhận tiền" và form OTP bank trong Dashboard |
| **Tạo VietQR thanh toán**| `POST /api/restaurants/generate-qr`| Chưa | Có | - | Chưa | **Chưa có FE** | Khách hàng chưa thể quét mã QR thanh toán chuyển khoản động tại bàn |
| **CRUD Nhân viên** | Các API CRUD `/api/staff` | Chưa | Chưa | Chưa | Chưa | **Chưa có FE** | Chưa có giao diện Admin quản lý nhân viên |
| **Nhân viên xử lý đơn**| `GET /api/staff/orders` & `PATCH /api/staff/orders/:id`| Chưa | Chưa | - | Chưa | **Chưa có FE** | Trang `StaffDashboard.tsx` rỗng, chưa hiển thị danh sách đơn hàng |
| **Đồng bộ bàn ăn** | `POST /api/tables` & `GET /api/tables`| Chưa | Chưa | Chưa | Chưa | **Chưa có FE** | Thiếu giao diện quản lý bàn ăn tĩnh và tính năng sinh mã QR bàn |

---

## 3. Danh sách chức năng BE có nhưng FE chưa làm

Dưới đây là mô tả chi tiết khoảng trống (Gap) chức năng và hành động cần thiết để hoàn thiện Frontend:

### 3.1. Super Admin Dashboard (Trang SaaS)
*   **BE đã hỗ trợ:** Đầy đủ API lấy danh sách nhà hàng, CRUD thông tin, khóa tài khoản nhà hàng, đặt lại mật khẩu và lấy thống kê doanh thu tổng.
*   **FE đang thiếu:** Toàn bộ giao diện `SuperAdmin.tsx`.
*   **Hành động cần thiết:**
    *   Tạo trang quản lý nhà hàng hiển thị bảng danh sách (`Table` component của Shadcn).
    *   Thêm nút "Thêm nhà hàng mới", click mở `Dialog` chứa form nhập liệu (tên, username, password, email, address, phone).
    *   Thêm nút "Đặt lại mật khẩu", mở Dialog đặt mật khẩu mới cho nhà hàng.
    *   Thêm công tắc Toggle để khóa/mở khóa nhà hàng (`toggleActive`).
    *   Tích hợp Recharts vẽ biểu đồ hình cột thống kê Top 5 nhà hàng có doanh thu cao nhất.
*   **Mức độ ưu tiên:** **Medium** (Tập trung hoàn thiện Core Menu trước).

### 3.2. Restaurant Admin Dashboard (Bảng điều khiển chủ quán)
*   **BE đã hỗ trợ:** Toàn bộ API thống kê chi tiết theo chu kỳ, lấy thực đơn, danh mục, quản lý bàn ăn, nhân viên, thay đổi email/ngân hàng xác thực OTP.
*   **FE đang thiếu:** Toàn bộ giao diện `Dashboard.tsx`.
*   **Hành động cần thiết:**
    *   Thiết kế bố cục Sidebar định tuyến giữa các Tab quản lý bằng `Tabs` của Shadcn.
    *   **Tab Thống kê:** Vẽ biểu đồ doanh thu theo ngày (AreaChart), doanh thu theo giờ (BarChart), phân bố danh mục (PieChart) và bảng Top 10 món chạy nhất.
    *   **Tab Thực đơn:** Hiển thị danh sách món ăn. Có nút "Thêm món", "Sửa", "Xóa". Khi bấm Thêm/Sửa mở Dialog chứa form nhập liệu chi tiết (bao gồm cả nhập **Calories, Protein, Carbs, Fat** và lựa chọn **Allergens** dị ứng).
    *   **Tab Danh mục:** Quản lý CRUD các thẻ danh mục món ăn.
    *   **Tab Bàn ăn & QR:** Nhập số bàn, nhấn "Lưu bàn" sẽ gọi API đồng bộ lên BE. Có nút "Tạo mã QR", sinh mã QR chứa link đặt món thực tế (sử dụng thư viện `qrcode.react`) và hiển thị nút "In mã QR" đẹp mắt.
    *   **Tab Nhân viên:** Xem danh sách nhân viên, có nút "Thêm nhân viên", nút khóa tài khoản nhân viên.
    *   **Tab Cấu hình:** Hiển thị thông tin nhà hàng, có các nút yêu cầu gửi OTP qua email để đổi Email nhà hàng và đổi Tài khoản ngân hàng.
*   **Mức độ ưu tiên:** **High** (Trọng tâm trải nghiệm quản lý của nhà hàng).

### 3.3. Staff Dashboard (Màn hình xử lý của bếp/nhân viên)
*   **BE đã hỗ trợ:** API lấy các đơn hàng đang hoạt động của nhà hàng và API cập nhật trạng thái đơn.
*   **FE đang thiếu:** Toàn bộ giao diện `StaffDashboard.tsx`.
*   **Hành động cần thiết:**
    *   Tạo danh sách các đơn hàng dạng Grid/Cards chia theo trạng thái: Đang chờ (`PENDING`), Đã xác nhận (`CONFIRMED`), Đã ra món (`SERVED`).
    *   Thực hiện cơ chế **Polling (tự động fetch đơn hàng sau mỗi 5 giây)** để đồng bộ đơn hàng real-time.
    *   Thêm nút "Xác nhận đơn" (chuyển PENDING -> CONFIRMED).
    *   Thêm nút "Hoàn thành đơn" (chuyển SERVED -> COMPLETED - chỉ dành cho Admin hoặc khi xác nhận thanh toán).
*   **Mức độ ưu tiên:** **High** (Quyết định luồng vận hành chế biến của bếp).

### 3.4. Tích hợp API thật cho Customer View (Menu công khai)
*   **BE đã hỗ trợ:** API lấy menu hoạt động (`available: true`), API đặt món `POST /api/orders` tự động tính tiền và gửi email thông báo.
*   **FE đang thiếu:** Màn hình `CustomerMenu.tsx` đang chạy 100% dữ liệu mock.
*   **Hành động cần thiết:**
    *   Sửa lại `menuService.ts` và `orderService.ts` đúng endpoint backend.
    *   Uncomment và tích hợp hàm gọi API lấy thông tin nhà hàng và thực đơn thực tế.
    *   Uncomment phần gọi API đặt món khi khách hàng click xác nhận đặt giỏ hàng.
*   **Mức độ ưu tiên:** **High** (Trực tiếp phục vụ khách hàng ăn uống).

### 3.5. Dữ liệu Dinh dưỡng (Calories/Macro), Chỉ số Xanh (Eco Score) & Cảnh báo dị ứng
*   **BE đã hỗ trợ:** Định nghĩa kiểu dữ liệu trong `types/index.ts` nhưng database BE chưa lưu.
*   **FE đang thiếu:**
    *   Form quản lý món ăn của chủ quán chưa có ô nhập Calories, Carb, Protein, Fat, Carbon Footprint, Eco Friendly, Organic Certified, Allergen.
    *   Giao diện bộ lọc món ăn theo hồ sơ sức khỏe và cảnh báo dị ứng trực tiếp khi khách xem món.
*   **Hành động cần thiết:**
    *   Thêm các trường nhập liệu này vào Form Add/Edit món ăn ở Dashboard chủ quán.
    *   Tạo màn hình thiết lập **Hồ sơ sức khỏe (Health Profile)** cho khách hàng (cho phép khách tự nhập cân nặng, chiều cao, mục tiêu calo, đánh dấu nguyên liệu bị dị ứng).
    *   Xây dựng bộ lọc thông minh trên `CustomerMenu.tsx`: Tự động ẩn hoặc hiển thị cảnh báo viền đỏ nguy hiểm đối với món chứa chất gây dị ứng của khách. Hiển thị nhãn đề xuất "QDish Recommended" cho món phù hợp với mục tiêu giảm cân/tăng cơ.
*   **Mức độ ưu tiên:** **High** (Đây là giá trị cốt lõi làm nên thương hiệu QDish khác biệt với menu điện tử thường).

---

## 4. Danh sách nút đang thiếu trong Frontend

Bảng thống kê các nút bấm tương tác nghiệp vụ cần phải bổ sung vào giao diện Frontend hiện tại:

| Vị trí Màn hình / Component | Nút cần thêm | Chức năng chi tiết | API sẽ gọi khi bấm nút | Giao diện mở ra khi bấm | Độ ưu tiên |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **Super Admin Dashboard** | `Thêm nhà hàng` | Mở form đăng ký nhà hàng mới hệ thống | `POST /api/restaurants` | Dialog chứa Form đăng ký | High |
| **Super Admin Dashboard** | `Đặt lại mật khẩu` | Cấp lại mật khẩu tạm cho nhà hàng bất kỳ | `POST /api/restaurants/:id/reset-password` | Dialog nhập mật khẩu mới | Medium |
| **Super Admin Dashboard** | `Khóa / Mở khóa` | Bật tắt trạng thái hoạt động của nhà hàng | `PATCH /api/restaurants/:id` | Confirm Alert Dialog | High |
| **Restaurant Dashboard** | `Thêm món ăn` | Mở form thêm món mới (có Calo/Eco) | `POST /api/menu` | Dialog chứa Form món ăn | High |
| **Restaurant Dashboard** | `Sửa món ăn` | Mở form cập nhật thông tin món ăn | `PATCH /api/menu/:id` | Dialog chứa Form điền sẵn | High |
| **Restaurant Dashboard** | `Xóa món ăn` | Xóa vĩnh viễn món ăn khỏi thực đơn | `DELETE /api/menu/:id` | Confirm Alert Dialog | High |
| **Restaurant Dashboard** | `Thêm danh mục` | Tạo nhãn danh mục mới cho nhà hàng | `POST /api/categories` | Dialog nhập tên danh mục | High |
| **Restaurant Dashboard** | `Đồng bộ bàn ăn` | Lưu danh sách số lượng bàn ăn hoạt động | `POST /api/tables` | Form nhập danh sách bàn | High |
| **Restaurant Dashboard** | `Tạo mã QR bàn` | Sinh mã QR chứa link đặt món của bàn ăn | - (Dùng library client) | Dialog hiển thị ảnh QR in ấn | High |
| **Restaurant Dashboard** | `Thêm nhân viên` | Tạo tài khoản đăng nhập cho nhân viên | `POST /api/staff` | Dialog chứa Form nhân viên | Medium |
| **Restaurant Dashboard** | `Khóa nhân viên` | Vô hiệu hóa tài khoản nhân viên | `PATCH /api/staff/:id/toggle-active` | Confirm Alert Dialog | Medium |
| **Restaurant Dashboard** | `Yêu cầu OTP Email` | Gửi OTP về email cũ để xác thực đổi email | `POST /api/restaurants/me/request-email-change` | - | High |
| **Restaurant Dashboard** | `Yêu cầu OTP Bank` | Gửi OTP về email để xác thực đổi số thẻ nhận tiền| `POST /api/restaurants/me/request-bank-change` | - | High |
| **Restaurant Dashboard** | `Xác nhận Đơn` | Chuyển đơn sang trạng thái Confirmed (Bếp nhận)| `PATCH /api/staff/orders/:id` | - | High |
| **Restaurant Dashboard** | `Hoàn thành đơn` | Chuyển trạng thái đơn sang Completed & chọn thanh toán| `PATCH /api/staff/orders/:id` | Dialog chọn CASH/BANK_TRANSFER | High |
| **Staff Dashboard** | `Xác nhận đơn` | Báo bếp đã tiếp nhận chế biến đơn | `PATCH /api/staff/orders/:id` | - | High |
| **Staff Dashboard** | `Ra món` | Báo đơn hàng đã được phục vụ lên bàn | `PATCH /api/staff/orders/:id` | - | High |
| **Customer Menu** | `Xem đơn hàng cũ` | Khách xem lại danh sách món đã đặt của bàn mình | `GET /api/orders?r=...&t=...`| Drawer hiển thị lịch sử đơn | High |
| **Customer Menu** | `Hồ sơ sức khỏe` | Mở form khai báo thể trạng và dị ứng | - (Lưu LocalStorage) | Sheet chứa Form trắc nghiệm | High |

---

## 5. Giao diện trang/màn hình đang thiếu cần xây dựng mới

Dưới đây là danh sách chi tiết các trang cần bổ sung mã nguồn thiết kế giao diện (đang là shell rỗng):

| Tên Trang | Đường dẫn Route | Mục đích sử dụng | Component chính | API chính sử dụng | Độ ưu tiên |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **Super Admin Panel** | `/super-admin` | Quản lý SaaS hệ thống nhà hàng | Restaurant Table, Stats Cards, Top Revenue Charts | `GET /api/restaurants`, `/stats/overview` | Medium |
| **Restaurant Dashboard** | `/dashboard` | Trung tâm điều hành của chủ nhà hàng (Menu, Đơn, Bàn, Thống kê, Profile) | Sidebar Tabs Navigation, Recharts Container, Menu Grid, Order Queue, QR Builder | `/api/restaurants/me/stats`, `/api/menu`, `/api/staff/orders` | **High** |
| **Staff Kitchen Panel** | `/staff` | Màn hình dành cho nhân viên chạy bàn và đầu bếp | Real-time active orders columns (Pending, Confirmed, Served) | `GET /api/staff/orders`, `PATCH /api/staff/orders/:id` | **High** |
| **Customer Order History**| `/order/history` (hoặc tích hợp dạng Drawer) | Khách hàng theo dõi trạng thái đơn hàng của mình tại bàn ăn | Order Status Stepper (Đang chuẩn bị -> Đã ra món -> Đã thanh toán) | `GET /api/orders?r=...&t=...` | **High** |
| **Health Profile Sheet** | Tích hợp trong Menu | Khách hàng khai báo chỉ số để nhận gợi ý món ăn thông minh | Goals Checkbox, Allergy Select, Nutrition target input | - (LocalStorage client-side) | **High** |

---

## 6. Danh sách Form/Modal đang thiếu cần thiết kế

Các form nhập liệu và hộp thoại tương tác cực kỳ quan trọng cần được xây dựng:

1.  **Form Thêm/Sửa Món ăn (Restaurant Admin):**
    *   *Nghiệp vụ:* Tạo mới hoặc cập nhật thực đơn.
    *   *Các trường bắt buộc:* Tên món, Mô tả, Giá tiền, Hình ảnh, Danh mục.
    *   *Các trường Dinh dưỡng (QDish):* **Calories (kcal), Protein (g), Carbs (g), Fat (g)**.
    *   *Các trường Chỉ số Xanh (QDish):* **Carbon Footprint (kg CO2), Eco Friendly (Checkbox), Organic Certified (Checkbox)**.
    *   *Danh sách Dị ứng (QDish):* **Mảng lựa chọn các Allergens (Gluten, Dairy, Nuts, Shellfish, Soy, Eggs, Fish)**.
    *   *Độ ưu tiên:* **High**
2.  **Form Đổi Email Nhà hàng (Restaurant Admin):**
    *   *Nghiệp vụ:* Bảo mật thông tin liên hệ của nhà hàng.
    *   *Các trường:* Email mới, Mã OTP xác thực (6 chữ số).
    *   *Độ ưu tiên:* **High**
3.  **Form Đổi Tài khoản Ngân hàng (Restaurant Admin):**
    *   *Nghiệp vụ:* Cấu hình thông tin nhận tiền chuyển khoản thanh toán từ khách.
    *   *Các trường:* Tên ngân hàng (Select dropdown), Số tài khoản ngân hàng, Mã OTP xác thực gửi qua Email.
    *   *Độ ưu tiên:* **High**
4.  **Form Đăng ký Nhà hàng mới (Super Admin):**
    *   *Nghiệp vụ:* Super Admin mở tài khoản cho chi nhánh/nhà hàng mới đăng ký SaaS.
    *   *Các trường:* Tên nhà hàng, Username admin, Mật khẩu khởi tạo, Tên chủ sở hữu, Email liên hệ, Số điện thoại, Địa chỉ, Trạng thái (Active/Inactive).
    *   *Độ ưu tiên:* **Medium**
5.  **Form Thiết lập Hồ sơ sức khỏe Khách hàng (Customer View):**
    *   *Nghiệp vụ:* Khách hàng khai báo thể chất để lọc món ăn thông minh.
    *   *Các trường:*
        *   Mục tiêu sức khỏe: Giảm cân (Weight Loss), Tăng cơ (Muscle Gain), Ăn uống lành mạnh (General Health).
        *   Chất gây dị ứng: Đậu nành, Sữa, Hải sản, Đậu phộng, Trứng...
        *   Chế độ ăn kiêng ưu tiên: Vegan, Vegetarian, Keto, Low Carb...
    *   *Độ ưu tiên:* **High**

---

## 7. Danh sách API chưa được Frontend gọi hoặc gọi sai đường dẫn

Dưới đây là bảng thống kê lỗi kỹ thuật nghiêm trọng trong file API services hiện tại của Frontend cần được sửa lại đường dẫn để kết nối thành công với Backend thực tế:

| API Endpoint thực tế ở BE | Method | File Service FE hiện tại | Tên Hàm ở FE | Trạng thái lỗi đường dẫn ở FE | Giải pháp sửa lỗi đường dẫn |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/menu?restaurantId=...` | `GET` | `menuService.ts` | `getPublicMenu` | **Sai đường dẫn** thành `/api/menu/public/${restaurantId}` | Đổi thành `/api/menu?restaurantId=${restaurantId}` |
| `/api/menu` | `POST` | `menuService.ts` | `create` | Đúng, nhưng chưa được component nào sử dụng | Gọi trong Form Thêm món ăn |
| `/api/orders` | `POST` | `orderService.ts` | `createOrder` | **Sai đường dẫn** thành `/api/orders/public/${restaurantId}` | Đổi thành `/api/orders` (Body chứa restaurantId) |
| `/api/orders?restaurantId=...`| `GET` | `orderService.ts` | `getOrdersByTable`| **Sai đường dẫn** thành `/api/orders/public/${rId}/table/${tId}`| Đổi thành `/api/orders?restaurantId=${rId}&tableNumber=${tId}` |
| `/api/restaurants` | `GET` | `restaurantService.ts`| `getAll` | **Sai đường dẫn** thành `/api/superadmin/restaurants` | Đổi thành `/api/restaurants` |
| `/api/restaurants` | `POST` | `restaurantService.ts`| `create` | **Sai đường dẫn** thành `/api/superadmin/restaurants` | Đổi thành `/api/restaurants` |
| `/api/restaurants/:id` | `PATCH`| `restaurantService.ts`| `update` / `toggleActive` | **Sai đường dẫn** thành `/api/superadmin/restaurants/${id}` | Đổi thành `/api/restaurants/${id}` |
| `/api/restaurants/:id/reset-password`| `POST`| `restaurantService.ts`| `resetPassword` | **Sai đường dẫn** thành `/api/superadmin/restaurants/${id}/reset-password`| Đổi thành `/api/restaurants/${id}/reset-password` |
| `/api/restaurants/stats/overview`| `GET` | `restaurantService.ts`| `getOverviewStats`| **Sai đường dẫn** thành `/api/superadmin/stats/overview` | Đổi thành `/api/restaurants/stats/overview` |
| `/api/restaurants/:id/stats/revenue`| `GET` | `restaurantService.ts`| `getRevenueStats` | **Sai đường dẫn** thành `/api/superadmin/stats/restaurant/${id}` | Đổi thành `/api/restaurants/${id}/stats/revenue` |
| `/api/restaurants/me` | `PATCH`| `restaurantService.ts`| `updateSettings` | **Sai đường dẫn** thành `/api/restaurants/settings` | Đổi thành `/api/restaurants/me` |

---

## 8. Luồng (Flow) trải nghiệm người dùng còn thiếu cần tích hợp

### Luồng 1: Khách hàng quét QR & Tích hợp Hồ sơ Dinh dưỡng Cá nhân hóa
*   *FE hiện tại:* Chỉ hiển thị Menu tĩnh, chọn món, điền tên và đặt món (dữ liệu mock).
*   *Thiếu bước:*
    1.  Khách hàng click vào biểu tượng **"Sức khỏe của bạn"** trên góc màn hình Menu, Sheet mở ra cho phép điền **Hồ sơ sức khỏe**.
    2.  Sau khi lưu, hệ thống lập tức tính toán: quét qua toàn bộ thực đơn trên màn hình. Món nào chứa chất gây dị ứng của khách sẽ bị làm mờ, hiển thị viền cam cảnh báo nguy hiểm và ẩn nút "Thêm vào giỏ". Món nào khớp với mục tiêu dinh dưỡng (ví dụ: món giàu protein cho khách muốn tăng cơ) sẽ hiển thị thêm nhãn xanh lá cây nổi bật **"Gợi ý cho bạn" (Recommended)**.
    3.  Tích hợp API thật để lấy thực đơn và gửi đơn hàng.

### Luồng 2: Phiên phục vụ khách tại bàn & Thanh toán VietQR động
*   *FE hiện tại:* Khách chỉ bấm đặt món lần một.
*   *Thiếu bước:*
    1.  Sau khi đặt món thành công đợt 1, hệ thống hiển thị nút **"Theo dõi đơn hàng & Gọi thêm"**.
    2.  Khi click vào, khách xem được trạng thái thời gian thực của đơn hàng (Đầu bếp đang nấu -> Đã phục vụ). Khách có thể tiếp tục chọn món đợt 2 và gửi đặt thêm một cách dễ dàng (BE đã được tối ưu hóa cho phép gộp đơn/không chặn đơn).
    3.  Khi muốn thanh toán, khách nhấn nút **"Thanh toán tại bàn"**. Màn hình Invoice hiện ra, tự động gọi API `/api/restaurants/generate-qr` truyền số tiền thực tế của bàn ăn để tạo ra ảnh mã QR động theo VietQR (chuyển khoản ghi rõ nội dung chuyển tiền bàn số... nhà hàng...).

### Luồng 3: Xử lý vận hành Nhà bếp (Staff Flow)
*   *FE hiện tại:* Shell trống.
*   *Thiếu bước:*
    1.  Nhân viên Bếp đăng nhập bằng tài khoản role `STAFF`. Hệ thống tự động chuyển hướng đến màn hình Bếp (`/staff`).
    2.  Hệ thống thực hiện Polling gọi API fetch danh sách đơn sau mỗi 5 giây.
    3.  Khi có đơn mới, loa điện thoại phát âm thanh cảnh báo "🔔 Có đơn hàng mới ở bàn X!".
    4.  Đầu bếp chuẩn bị món xong, nhấn nút "Xác nhận ra món" để chuyển trạng thái của bàn ăn, thông báo real-time tới điện thoại của khách hàng.

---

## 9. Lộ trình (Roadmap) hoàn thiện Frontend

Lộ trình tích hợp và hoàn thiện giao diện Frontend được tối ưu hóa theo 6 giai đoạn phát triển:

### Phase 1: Sửa đổi và Kết nối toàn diện API Services (Ưu tiên số 1)
*   Sửa đổi toàn bộ các file dịch vụ API trong thư mục `src/services/` (`authService.ts`, `menuService.ts`, `orderService.ts`, `restaurantService.ts`) để khớp chính xác 100% với các đường dẫn endpoint thật của Backend.
*   Uncomment và tích hợp API thật cho màn hình đăng nhập `Login.tsx` và đặt lại mật khẩu `ResetPassword.tsx`.
*   Tích hợp API thật cho trang đặt món của khách `CustomerMenu.tsx` (Bao gồm fetch thông tin nhà hàng, fetch menu thực tế và gọi API đặt món thật).

### Phase 2: Di cư & Module hóa màn hình Quản trị SaaS (Super Admin)
*   Xây dựng hoàn thiện màn hình `/super-admin`.
*   Thiết kế bảng danh sách nhà hàng có tìm kiếm và phân trang.
*   Tích hợp Dialog đăng ký nhà hàng, Toggle khóa tài khoản nhà hàng hoạt động qua API.
*   Vẽ biểu đồ thống kê hệ thống Recharts (Overview Stats & Revenue Stats) kết nối API thật.

### Phase 3: Phát triển trung tâm quản lý Nhà hàng (Restaurant Dashboard - Phần lớn nhất)
*   Xây dựng hoàn thiện màn hình `/dashboard` chia làm các tab nghiệp vụ rõ ràng:
    *   **Tab Thống kê:** Kết nối API `/api/restaurants/me/stats`, vẽ hệ thống 4 biểu đồ doanh số Recharts mượt mà.
    *   **Tab Thực đơn & Danh mục:** Thiết kế form thêm/sửa món ăn đầy đủ các trường Calo, Macro, nhãn xanh Eco và allergens dị ứng.
    *   **Tab Bàn ăn & QR Code:** Đồng bộ số bàn ăn lên BE và tích hợp thư viện hiển thị in ấn mã QR động tại bàn cho chủ quán.
    *   **Tab Quản lý nhân viên:** CRUD nhân viên, toggle khóa tài khoản nhân viên.

### Phase 4: Thiết lập vận hành Bếp & Theo dõi đơn hàng Real-time
*   Xây dựng màn hình xử lý đơn hàng Bếp `/staff` hỗ trợ Polling 5s tự động cập nhật đơn hàng.
*   Xây dựng Drawer lịch sử đơn hàng và Stepper theo dõi trạng thái món ăn real-time phía khách hàng.
*   Tích hợp tính năng Invoice gọi API VietQR sinh ảnh QR thanh toán tự động theo tổng tiền thực tế.

### Phase 5: Trí tuệ Dinh dưỡng & Cá nhân hóa QDish
*   Thiết kế giao diện Sheet khai báo **Hồ sơ sức khỏe** của khách hàng (lưu cục bộ an toàn ở LocalStorage).
*   Viết thuật toán khớp nối dinh dưỡng: Tự động gắn nhãn đề xuất "QDish Recommended" cho các món ăn phù hợp với chỉ số Calo/Macro mục tiêu của khách.
*   Tích hợp cảnh báo dị ứng trực quan: Làm mờ và khóa nút đặt đối với các món ăn chứa thành phần dị ứng của khách hàng, đảm bảo an toàn tuyệt đối.

### Phase 6: Đánh bóng UI/UX & Responsive Thiết bị di động
*   Tối ưu hóa hiển thị di động (Mobile-first) cho tất cả giao diện, đặc biệt là các bảng dữ liệu thống kê của chủ quán.
*   Thiết kế màn hình chờ tải dữ liệu (Skeleton / Loader) chuyên nghiệp.
*   Thiết kế màn hình rỗng (Empty State) bắt mắt khi chưa có dữ liệu món ăn, bàn ăn hay đơn hàng.
*   Tối ưu hóa các hộp thoại xác nhận (Confirm Modals) ngăn chặn hành động click nhầm của Admin.

---

## 10. Checklist nghiệm thu Frontend hoàn chỉnh

Dưới đây là các tiêu chuẩn bắt buộc phải đạt được sau khi hoàn thành kết nối Frontend:

- [ ] **Kết nối API thật:** Toàn bộ dữ liệu Mock trong `mockData.ts` phải được thay thế hoàn toàn bằng các hàm gọi API thông qua `useApi` hook kết nối trực tiếp với MongoDB. Không còn bất kỳ comment-out API nào trong mã nguồn.
- [ ] **Đăng nhập & Bảo mật:** Đăng nhập thành công, giải mã JWT lưu vào state của React, chuyển hướng người dùng chính xác theo vai trò, không cho phép truy cập trái phép vào các trang Dashboard admin.
- [ ] **Giao diện Super Admin hoạt động:** CRUD nhà hàng ổn định, gửi email mật khẩu tạm thành công, vẽ biểu đồ doanh thu nhà hàng chuẩn xác.
- [ ] **Giao diện Restaurant Admin hoạt động:**
    *   Biểu đồ thống kê doanh số Recharts hiển thị đầy đủ, chính xác dữ liệu tăng trưởng.
    *   CRUD món ăn thành công, lưu trữ đầy đủ Calo, Macro, Allergen, nhãn Eco vào Database thật.
    *   Đồng bộ số bàn ăn thành công, in mã QR bàn ăn hoạt động tốt.
    *   CRUD nhân viên, khóa tài khoản nhân viên thành công.
    *   Yêu cầu OTP đổi Email/Ngân hàng nhận tiền gửi mã về email thực tế và xác thực thành công.
- [ ] **Giao diện bếp Staff hoạt động:** Đơn hàng hiển thị real-time (Polling 5s), xác nhận đơn thành công, bếp chuyển trạng thái món ăn mượt mà.
- [ ] **Trải nghiệm Khách hàng trọn vẹn:**
    *   Xem thực đơn, lọc danh mục hoạt động tốt qua API thật.
    *   Gọi món thành công, bàn ăn không bị khóa khi khách hàng có nhu cầu gọi thêm món đợt 2.
    *   Theo dõi trạng thái đơn hàng thời gian thực mượt mà.
    *   Hộp thoại thanh toán VietQR động sinh ảnh QR chuẩn số tiền bàn ăn.
- [ ] **Cá nhân hóa Dinh dưỡng QDish hoạt động:**
    *   Khách hàng lưu hồ sơ sức khỏe thành công.
    *   Tự động phát hiện và cảnh báo đỏ/khóa nút món ăn có chất gây dị ứng.
    *   Tự động gắn nhãn gợi ý món ăn khớp với mục tiêu dinh dưỡng của khách hàng.
- [ ] **Đánh bóng UI/UX:** Responsive 100% trên các thiết bị di động, tốc độ tải trang nhanh, thông báo Toast trực quan sinh động, không còn nút chết không có tác dụng.

---
*Báo cáo được thực hiện và lưu trữ dưới dạng tài liệu chênh lệch kỹ thuật của dự án QDish FE.*

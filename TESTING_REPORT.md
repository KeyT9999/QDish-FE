# TESTING_REPORT.md

Ngày kiểm tra: 2026-05-23

Trạng thái tài liệu: Bản 2 - có baseline trước sửa và cập nhật sau sửa.

Phạm vi kiểm tra:
- Frontend: `F:\LEARN KÌ 7\QR_FOOD_ORDER\QR_FOOD_ORDER_FE`
- Backend: `F:\LEARN KÌ 7\QR_FOOD_ORDER\QR_FOOD_ORDER_BE`
- Tài liệu đối chiếu: `requirements.md`, `design.md`, `task.md`

## 1. Tổng quan task đã được yêu cầu

Antigravity được yêu cầu hoàn thiện FE từ trạng thái còn mock/demo sang hệ thống gọi API thật của backend, dùng MongoDB thật, và đủ các flow chính:

- Auth: login theo 3 role `SUPER_ADMIN`, `RESTAURANT_ADMIN`, `STAFF`; lưu token; redirect đúng role; protected route; logout.
- Customer QR Menu: mở `/order?r=<restaurantId>&t=<tableNumber>`, load menu/category thật, lọc món, xem chi tiết, giỏ hàng, đặt món bằng `POST /api/orders`, xem lịch sử đơn và polling trạng thái.
- Health Profile: form/sheet hồ sơ sức khỏe, lưu localStorage hoặc API, cảnh báo dị ứng, khóa nút thêm giỏ với món nguy hiểm, gợi ý món phù hợp.
- Restaurant Dashboard: tổng quan, biểu đồ, CRUD menu/category/table/staff, tạo QR bàn, quản lý đơn, cập nhật trạng thái, cấu hình nhà hàng, dữ liệu thật.
- Staff Dashboard: load đơn thật, polling 5 giây, chia theo trạng thái, xác nhận/ra món/hoàn thành theo quyền, không dùng mock order.
- Super Admin: danh sách nhà hàng thật, thêm/sửa/khóa/mở khóa/reset password/thống kê, không dùng fake data.

Yêu cầu bắt buộc về dữ liệu:

- Xóa hoàn toàn `src/lib/mockData.ts`.
- Không còn import mock data, fake login/reset/order/dashboard/menu/category/order/stats.
- Không dùng `setTimeout` để mô phỏng API.
- FE phải gọi endpoint thật theo backend.
- Backend phải dùng `MONGODB_URI` và model MongoDB, không dùng in-memory array.

Kết luận tổng quan hiện trạng: task chưa đạt nghiệm thu. Mock API data gần như đã được gỡ, nhưng một số flow quan trọng chưa gọi đúng backend hoặc gửi sai schema, đặc biệt customer order, restaurant dashboard menu/order, staff/admin status update, và QDish nutrition/eco fields.

## 2. Checklist kiểm tra mock data

| Hạng mục | Kết quả | File/dòng | Cần sửa |
|---|---|---:|---|
| `src/lib/mockData.ts` | Đã xóa file | `src/lib/mockData.ts` không tồn tại | Không cần |
| Import `mockData` | Không tìm thấy import | Không có match `mockData` trong `src` | Không cần |
| Từ khóa `mock/fake/demo/sample` | Còn 1 comment, không phải dữ liệu mock | `src/types/index.ts:145` comment `Mock initial data structure` | Đổi comment để tránh hiểu nhầm |
| Fake login | Không thấy fake login; FE gọi API thật | `src/services/authService.ts:4`, `src/pages/Login.tsx:25` | Không cần cho mock, nhưng cần test credential thật |
| Fake reset password | Không thấy fake reset; FE gọi API thật | `src/services/authService.ts:10`, `src/services/authService.ts:16` | Không cần |
| Fake order success | Không thấy fake success; FE gọi `POST /api/orders` | `src/pages/CustomerMenu.tsx:164`, `src/services/orderService.ts:6` | Cần sửa schema item id trước khi order thật chạy được |
| Fake dashboard data | Không thấy dữ liệu fake dashboard | `src/pages/Dashboard.tsx` gọi service thật | Cần sửa endpoint sai làm dashboard rỗng/lỗi |
| Fake menu/category/order/stats | Không thấy mock service | `menuService.ts`, `categoryService.ts`, `orderService.ts`, `restaurantService.ts` | Cần sửa endpoint/schema sai |
| `setTimeout` mô phỏng API | Không thấy mô phỏng API | `src/pages/ResetPassword.tsx:59` chỉ redirect sau reset; không phải mock API | Không cần |
| `setInterval` polling | Có polling thật | `src/pages/StaffDashboard.tsx:31`; `OrderHistoryDrawer.tsx:65` | Hợp lệ |
| Hard-code data trong page/component | Có constants UI/bank map/fallback image, không phải API mock | `OrderHistoryDrawer.tsx:95`, health profile options, fallback image | Có thể giữ; không phải dữ liệu API |

Kết luận mock data: dữ liệu mock API đã được gỡ phần lớn. Chưa đạt 100% sạch vì còn comment `Mock initial data structure`, và quan trọng hơn là nhiều API thật đang gọi sai nên chưa thể xem là hoàn thiện thay thế mock.

## 3. Checklist kiểm tra API service

| API yêu cầu | FE service/page | Endpoint/method FE | Khớp backend? | Token | Body/query | Xử lý lỗi | Có dùng trong page? | Ghi chú |
|---|---|---|---|---|---|---|---|---|
| `POST /api/auth/login` | `authService.ts:4` | Đúng POST `/api/auth/login` | Đúng | Không cần token | `{ username, password }` | Có throw từ `apiFetch` | `Login.tsx:25` | Chưa test credential thật vì không có account |
| `POST /api/auth/request-password-reset` | `authService.ts:16` | Đúng | Đúng | Không | Payload passthrough | Có | Reset password page | Đúng endpoint |
| `POST /api/auth/reset-password` | `authService.ts:10` | Đúng | Đúng | Không | Payload passthrough | Có | Reset password page | Đúng endpoint |
| `GET /api/menu?restaurantId=...` | `menuService.ts:6` | Đúng với customer | Đúng | Không | `restaurantId` query | Có | `CustomerMenu.tsx:60` | Data backend flat cần normalize sang FE |
| `GET /api/menu?restaurantId=...` cho dashboard | `menuService.ts:9`, `Dashboard.tsx:169` | Sai: `GET /api/menu` không query | Sai | Có token | Thiếu `restaurantId` | Có nhưng flow lỗi | Dashboard | Backend trả `400 Thiếu restaurantId` |
| `GET /api/categories?restaurantId=...` | `categoryService.ts:12` | Đúng | Đúng | Không rõ: default token nếu có | Có `restaurantId` | Có | Customer và dashboard | Endpoint đúng |
| `POST /api/orders` | `orderService.ts:6` | Đúng method/path | Đúng path | Không | Body có `restaurantId` | Có | `CustomerMenu.tsx:164` | Sai `menuItemId` do FE dùng `item.id` trong khi backend trả `_id` |
| `GET /api/orders?restaurantId=...&tableNumber=...` | `orderService.ts:16` | Đúng | Đúng | Không | Query đúng | Có | `OrderHistoryDrawer` | Chưa test có data vì DB trống |
| `GET /api/orders` dashboard | `orderService.ts:28`, `Dashboard.tsx:193` | Sai với backend hiện tại | Sai | Có token | Thiếu query; backend route public chỉ phục vụ customer table history | Có nhưng flow lỗi | Dashboard | Nên dùng `GET /api/staff/orders` hoặc thêm API admin orders |
| `PATCH /api/orders/:id` dashboard | `orderService.ts:35`, `Dashboard.tsx:504`, `Dashboard.tsx:520` | Sai với backend hiện tại | Sai | Có token | `{ status }` | Có | Dashboard | Backend chỉ có `PATCH /api/staff/orders/:id` |
| `GET /api/restaurants` | `restaurantService.ts:13` | Đúng path | Backend có | FE gắn token mặc định | Query optional | Có | Customer/Super Admin | Backend đang public; trái yêu cầu bảo vệ Super Admin |
| `POST /api/restaurants` | `restaurantService.ts:16` | Đúng path/method | Backend có | FE gắn token | Body create | Có | Super Admin | Backend đang public nếu body hợp lệ; thiếu `requireAuth` |
| `PATCH /api/restaurants/:id` | `restaurantService.ts:21`, `toggleActive:26` | Đúng path/method | Backend có | FE gắn token | Body update/active | Có | Super Admin | Backend đang public; thiếu `requireAuth` |
| `GET /api/restaurants/me/stats` | `restaurantService.ts:62` | Đúng | Đúng | Có token | Query date optional | Có | Dashboard overview | Cần credential admin để test live |
| `GET /api/staff/orders` | `orderService.ts:42` | Đúng | Đúng | Có token | Không | Có | Staff dashboard | Dashboard restaurant chưa dùng endpoint này |
| `PATCH /api/staff/orders/:id` | `orderService.ts:43` | Đúng | Đúng | Có token | `{ status }` | Có | Staff dashboard | Admin dashboard đang gọi sai endpoint khác |
| `GET /api/tables` | Không có `tableService`; dashboard fetch trực tiếp | `Dashboard.tsx` dùng direct fetch/logic | Backend có | Public/optional token | Query restaurantId | Một phần | Dashboard | Nên gom service để nhất quán |
| `POST /api/tables` | Không có `tableService`; dashboard fetch trực tiếp | `Dashboard.tsx:426` | Backend có | Có token thủ công | Body table | Thiếu check `res.ok` từng request | Dashboard | Có thể báo success dù tạo bàn fail |

Kết luận API service: endpoint auth/customer categories/order history khá đúng, nhưng dashboard menu/order/status sai endpoint hoặc thiếu query. Schema menu QDish giữa FE và BE không khớp.

## 4. Testing từng flow

### Flow 1: Auth

| Hạng mục | Kết quả |
|---|---|
| Login Super Admin | Chưa test live vì không có credential; seed script yêu cầu truyền username/password, không có default |
| Login Restaurant Admin | Chưa test live vì DB hiện không có restaurant |
| Login Staff | Chưa test live vì DB hiện không có staff |
| Token lưu đúng chưa | Code có lưu `qr_food_order_token` ở `src/services/api.ts:2-6` |
| Redirect đúng role | Code redirect đúng role ở `src/pages/Login.tsx:29-34` |
| ProtectedRoute hoạt động | Có kiểm tra role ở `src/App.tsx:21-28` |
| Logout hoạt động | Có xóa token và navigate `/login` ở `DashboardLayout.tsx:14-15` |
| Vấn đề phát hiện | `/staff` chỉ cho `STAFF`, không cho `RESTAURANT_ADMIN` dù backend cho admin cập nhật order ở staff route (`src/App.tsx:67`) |
| Vấn đề UI | `Login.tsx` có chữ tiếng Việt bị mojibake/encoding lỗi |

### Flow 2: Customer QR Menu

| Hạng mục | Kết quả |
|---|---|
| Mở `/order?r=<restaurantId>&t=<tableNumber>` | Route có ở `App.tsx`; chưa test live vì DB trống không có restaurant |
| Load menu từ API thật | Có gọi `menuService.getPublicMenu(restaurantId)` ở `CustomerMenu.tsx:60` |
| Load category từ API thật | Có gọi `categoryService.getAll(restaurantId)` ở `CustomerMenu.tsx:63` |
| Không còn mock data | Không thấy mock data |
| Lọc món | Có logic lọc/search/category trong `CustomerMenu.tsx` |
| Xem chi tiết món | Có `MenuItemDetail` |
| Thêm giỏ hàng | Có `useCart`, nhưng lỗi nghiêm trọng: dùng `item.id` trong khi backend trả `_id` (`useCart.ts:21`, `useCart.ts:30`) |
| Đặt món gọi `POST /api/orders` | Có gọi ở `CustomerMenu.tsx:164` |
| Order lưu MongoDB | Backend dùng `Order.create`, nhưng FE hiện có nguy cơ gửi `menuItemId: undefined` nên chưa đạt |
| Loading/error/empty state | Có một số state; chưa đủ chứng minh live do DB trống |
| Vấn đề lớn | Nutrition/eco UI đọc `item.nutrition`/`item.ecoInfo`, backend trả flat fields nên khuyến nghị sức khỏe và hiển thị dinh dưỡng sai |

### Flow 3: Health Profile

| Hạng mục | Kết quả |
|---|---|
| Có nút hồ sơ sức khỏe | Có trong customer flow |
| Có form/sheet nhập thông tin | Có component health profile |
| Lưu localStorage/API | Theo code dùng localStorage; phù hợp design với key local |
| Dị ứng cảnh báo món nguy hiểm | Có logic kiểm `item.allergens` |
| Món allergen bị khóa nút thêm giỏ | Có logic `isDangerous`/disable trong item card/detail |
| Gợi ý món phù hợp | Có logic nhưng phụ thuộc `item.nutrition`; backend trả flat fields nên hiện không ổn định |

### Flow 4: Order History

| Hạng mục | Kết quả |
|---|---|
| Có nút xem đơn đã gọi | Có drawer lịch sử đơn |
| Gọi đúng API | Có `GET /api/orders?restaurantId=...&tableNumber=...` qua `orderService.ts:16` |
| Hiển thị trạng thái đơn | Có UI status |
| Có polling | Có `setInterval` 6 giây ở `OrderHistoryDrawer.tsx:65` |
| Vấn đề | QR thanh toán tự build URL `img.vietqr.io`, chưa dùng service `POST /api/restaurants/generate-qr` (`OrderHistoryDrawer.tsx:120`, `restaurantService.ts:76`) |

### Flow 5: Restaurant Dashboard

| Hạng mục | Kết quả |
|---|---|
| Dashboard không còn rỗng | Chưa đạt chắc chắn; DB trống và một số API sai |
| Tab tổng quan gọi API thật | Có dùng `GET /api/restaurants/me/stats` |
| Biểu đồ dùng data thật | Có dùng stats thật nếu login admin hợp lệ |
| CRUD món ăn | Chưa đạt: list gọi sai `/api/menu` thiếu `restaurantId`; payload create/update gửi nested `nutrition`/`ecoInfo` sai backend |
| Form món có calories/protein/carbs/fat/allergens/eco/carbon | Có form, nhưng gửi sai schema |
| CRUD category | Có gọi API đúng |
| CRUD bàn | Có direct fetch, nhưng thiếu service và thiếu check lỗi từng response |
| Tạo QR bàn | Có QR table UI |
| Quản lý đơn hàng | Chưa đạt: gọi sai `GET /api/orders` |
| Cập nhật trạng thái đơn | Chưa đạt: gọi sai `PATCH /api/orders/:id`; backend dùng `/api/staff/orders/:id` |
| Quản lý nhân viên | Có gọi `staffService` đúng path chính |
| Cấu hình nhà hàng | Có gọi `/api/restaurants/me` và OTP routes |

### Flow 6: Staff Dashboard

| Hạng mục | Kết quả |
|---|---|
| Load đơn thật từ API | Có `orderService.getStaffOrders()` ở `StaffDashboard.tsx:19` |
| Polling 5 giây | Có `setInterval` ở `StaffDashboard.tsx:31` |
| Chia đơn theo trạng thái | Có các cột theo trạng thái |
| Nút xác nhận đơn | Có PENDING -> CONFIRMED |
| Nút ra món | Có CONFIRMED -> SERVED |
| Nút hoàn thành đơn | Chưa có cho admin trong staff page; backend chỉ cho admin complete |
| Không dùng mock order | Không thấy mock order |
| Vấn đề | Route `/staff` không cho Restaurant Admin vào, nên admin không thể dùng quyền complete qua staff page |

### Flow 7: Super Admin

| Hạng mục | Kết quả |
|---|---|
| Load danh sách nhà hàng thật | Có `restaurantService.getAll()` |
| Thêm nhà hàng | Có form/service |
| Sửa nhà hàng | Có form/service |
| Khóa/mở khóa nhà hàng | Có `toggleActive` |
| Reset password | Có `/api/restaurants/:id/reset-password` |
| Thống kê tổng quan | Có `/api/restaurants/stats/overview` |
| Không dùng dữ liệu fake | Không thấy fake data |
| Vấn đề backend | Nhiều route Super Admin đang public không auth: `GET /api/restaurants`, `POST /api/restaurants`, `PATCH /api/restaurants/:id`, `DELETE /api/restaurants/:id`, stats overview |

## 5. Kiểm tra MongoDB thật

| Hạng mục | Kết quả |
|---|---|
| Backend có dùng `MONGODB_URI` không | Có: `src/config/db.ts:6` |
| Có connect MongoDB thật không | Có: `mongoose.connect(uri)` ở `src/config/db.ts:9` |
| Có còn in-memory array không | Không thấy in-memory array cho restaurant/menu/category/order/table/staff |
| Có seed/demo data hard-code không | Không thấy demo data hard-code; `createSuperAdmin.ts` chỉ tạo user khi truyền username/password |
| Order tạo từ FE có vào MongoDB không | Backend dùng `Order.create`, nhưng chưa test end-to-end vì DB hiện có `restaurantsCount = 0` và FE đang lỗi `menuItemId` |
| Món/category/table/staff tạo từ FE có lưu MongoDB không | Backend dùng Mongoose models; chưa test live vì thiếu credential admin |

Kết quả API thật khi chạy backend:

- `GET /api/health`: OK.
- `GET /api/restaurants`: trả mảng rỗng, `restaurantsCount = 0`.
- `GET /api/menu` không query: `400 {"message":"Thiếu restaurantId"}`.
- `GET /api/orders` không query: `400 {"message":"Thiếu restaurantId hoặc tableNumber"}`.
- `GET /api/restaurants/stats/overview` không token: trả success, chứng minh route stats đang public.
- `POST /api/restaurants` không token với body `{}`: trả `400` validation thay vì `401`, chứng minh route create đang không bắt auth trước validation.

## 6. Kiểm tra build và lỗi kỹ thuật

Frontend:

| Lệnh | Kết quả |
|---|---|
| `npm install` | Không chạy vì `node_modules` đã tồn tại và build/lint chạy được |
| `npm run lint` | Fail: 117 errors, 6 warnings |
| `npm run typecheck` | Không có script `typecheck` trong `package.json`; `tsc -b` được chạy trong `npm run build` |
| `npm run build` | Pass |
| `npm run dev` | Pass: Vite trả HTTP 200 tại `http://127.0.0.1:5173` |

Lint lỗi chính:

- `no-explicit-any` nhiều nơi: `Dashboard.tsx`, `CustomerMenu.tsx`, `SuperAdmin.tsx`, services.
- Unused imports/variables: `CartDrawer.tsx`, `OrderHistoryDrawer.tsx`, `RestaurantHeader.tsx`, `SuperAdmin.tsx`.
- React hooks lint: set-state-in-effect/missing deps ở `useAuth`, `CustomerMenu`, `Dashboard`, `SuperAdmin`.
- React refresh export warning/error ở `components/ui/badge.tsx`, `button.tsx`, `tabs.tsx`.

Backend:

| Lệnh/kiểm tra | Kết quả |
|---|---|
| `npm run build` | Pass |
| Chạy server | Pass bằng `node dist/index.js` |
| `GET /api/health` | Pass |
| CORS | Backend dùng `cors()` mở toàn bộ origin ở `src/index.ts` |
| Auth middleware | Có middleware; nhưng không được gắn cho một số route super admin/public nhạy cảm |
| Env | `.env` có `MONGODB_URI`, `JWT_SECRET`, SMTP, app base URL |

Lỗi kỹ thuật đáng chú ý:

- FE build pass nhưng lint fail nặng.
- UI tiếng Việt ở `Login.tsx` bị mojibake encoding.
- FE service có endpoint không tồn tại: `GET /api/orders`, `PATCH /api/orders/:id`, `GET /api/menu` dashboard không query, `PATCH /api/menu/:id/toggle`.
- Backend route Super Admin thiếu auth.
- Không thể demo end-to-end do DB không có restaurant và không có credential test.

## 7. Bug list

| STT | Bug | File liên quan | Mức độ | Cách reproduce | Nguyên nhân | Cách sửa đề xuất | Đã sửa chưa |
|---:|---|---|---|---|---|---|---|
| 1 | Customer cart gửi `menuItemId` sai/undefined với data MongoDB | `src/hooks/useCart.ts:21`, `src/hooks/useCart.ts:30`; BE `models/Order.ts:41` | Critical | Load menu thật từ MongoDB rồi add cart/order | FE dùng `item.id`, backend trả `_id` | Normalize `_id -> id` trong service hoặc dùng helper lấy id an toàn | Chưa |
| 2 | Restaurant dashboard không load được menu | `src/services/menuService.ts:9`; `src/pages/Dashboard.tsx:169`; BE `routes/menuRoutes.ts:10` | Critical | Login restaurant admin, mở tab menu | FE gọi `GET /api/menu` thiếu `restaurantId` | Gọi `GET /api/menu?restaurantId=<id>&includeUnavailable=true` | Chưa |
| 3 | Dashboard order list sai API | `src/services/orderService.ts:28`; `src/pages/Dashboard.tsx:193`; BE `routes/orderRoutes.ts:70` | Critical | Mở dashboard orders | FE gọi customer history API không đúng query | Dùng `GET /api/staff/orders` cho admin/staff order management hoặc thêm API admin orders | Chưa |
| 4 | Dashboard update order status sai API | `src/services/orderService.ts:35`; `src/pages/Dashboard.tsx:504`; BE `routes/staffRoutes.ts:98` | Critical | Click cập nhật trạng thái đơn trong dashboard | Backend không có `PATCH /api/orders/:id` | Gọi `PATCH /api/staff/orders/:id` | Chưa |
| 5 | Menu nutrition/eco schema FE-BE không khớp | `src/pages/Dashboard.tsx:263-327`; `MenuItem.ts`; `menuRoutes.ts:50-77` | High | Tạo/sửa món có calories/eco rồi xem lại | FE gửi nested `nutrition`/`ecoInfo`, backend nhận flat fields | Map payload FE sang flat backend; normalize response về shape FE cần | Chưa |
| 6 | Health recommendation phụ thuộc field không tồn tại từ backend | `src/pages/CustomerMenu.tsx:105-116`; BE `models/MenuItem.ts:71-109` | High | Dùng menu thật có calories/protein | FE đọc `item.nutrition`, backend trả `calories/protein` flat | Normalize menu item trước khi dùng | Chưa |
| 7 | `/staff` route không cho Restaurant Admin | `src/App.tsx:67`; BE `routes/staffRoutes.ts:84-98` | High | Restaurant admin truy cập `/staff` | ProtectedRoute chỉ allow `STAFF` | Allow thêm `RESTAURANT_ADMIN` | Chưa |
| 8 | Staff page thiếu nút hoàn thành đơn cho admin | `src/pages/StaffDashboard.tsx:92-107`; BE `routes/staffRoutes.ts:119-150` | Medium | Admin cần complete order | UI không render action COMPLETED | Cho admin thấy nút complete/payment method khi order served | Chưa |
| 9 | Super Admin routes backend không bảo vệ auth | `restaurantRoutes.ts:22`, `132`, `182`, `698`, `763`, `820` | High | Gọi API không token | Route thiếu `requireAuth/requireRole` | Bảo vệ route admin; nếu customer cần public info thì thêm public endpoint riêng | Chưa |
| 10 | `CartDrawer` không bắt buộc tên khách tối thiểu 2 ký tự | `src/components/cart/CartDrawer.tsx:136-143` | Medium | Submit order không nhập tên | UI coi optional, backend cũng không validate min | Validate FE và/hoặc BE theo requirement | Chưa |
| 11 | Direct fetch tạo bàn không check lỗi từng response | `src/pages/Dashboard.tsx:426` | Medium | Tạo/sync nhiều bàn khi một request fail | `Promise.all` không kiểm `res.ok` trước toast success | Tạo `tableService`, check response/error thống nhất | Chưa |
| 12 | Customer VietQR không dùng backend generate QR | `OrderHistoryDrawer.tsx:120`; `restaurantService.ts:76` | Low | Mở invoice VietQR | FE tự build URL ngoài | Dùng `POST /api/restaurants/generate-qr` hoặc thống nhất design | Chưa |
| 13 | FE lint fail 117 errors | Nhiều file | Medium | Chạy `npm run lint` | Unused vars, `any`, hooks lint, react-refresh | Dọn lint sau khi fix flow chính | Chưa |
| 14 | Chữ tiếng Việt bị lỗi encoding ở login | `src/pages/Login.tsx` | Medium | Mở login page | File text mojibake | Sửa encoding/text tiếng Việt | Chưa |
| 15 | Backend order create chưa verify restaurant/table tồn tại đầy đủ | `routes/orderRoutes.ts:23-50` | Medium | POST order với restaurant id hợp lệ nhưng không tồn tại | Chỉ check ObjectId, rồi populate restaurant optional | Check restaurant exists/active và table exists trước khi tạo order | Chưa |

## 8. Kết luận nghiệm thu

Mức hoàn thành ước tính trước khi sửa: khoảng 55%.

Chức năng đã đạt một phần:

- Mock data file đã được xóa.
- FE không còn fake login/fake order/fake dashboard service rõ ràng.
- API layer đã tồn tại và nhiều endpoint customer/auth/staff đúng path.
- Backend dùng MongoDB/Mongoose thật.
- Build FE và BE đều pass.
- Dev server FE và backend health đều chạy được.

Chức năng chưa đạt:

- Customer order chưa đáng tin cậy vì lỗi `_id/id` làm `menuItemId` sai.
- Restaurant dashboard menu/order/status chưa gọi đúng backend.
- QDish nutrition/eco/allergen/recommendation chưa khớp schema backend hoàn toàn.
- Staff dashboard chưa đủ quyền admin/complete flow.
- Super Admin backend route nhạy cảm còn public.
- Lint fail nhiều lỗi.
- Không thể demo end-to-end vì database hiện không có restaurant/menu/table/staff và không có credential test.

Có còn mock data không:

- Không còn mock API data rõ ràng.
- Còn comment `Mock initial data structure` ở `src/types/index.ts:145`; cần sửa.
- Có constants UI/bank/health options nhưng không phải mock API data.

Có dùng MongoDB thật chưa:

- Backend có dùng `MONGODB_URI` và Mongoose thật.
- Chưa xác nhận được FE tạo order/menu/category/table/staff vào MongoDB end-to-end do dữ liệu/credential thiếu và lỗi FE nêu trên.

Có thể demo end-to-end chưa:

- Chưa. Cần sửa các lỗi Critical/High trước, sau đó seed/tạo dữ liệu test thật rồi chạy lại các flow.

Việc bắt buộc cần sửa trước khi nộp:

1. Normalize dữ liệu MongoDB `_id` và menu flat fields cho FE.
2. Sửa `menuService.getAll`/Dashboard menu dùng đúng `restaurantId`.
3. Sửa order management dashboard dùng `GET/PATCH /api/staff/orders`.
4. Sửa payload create/update món ăn gửi flat calories/protein/carbs/fat/allergens/eco fields.
5. Cho Restaurant Admin truy cập `/staff` hoặc có UI complete order đúng quyền.
6. Bảo vệ backend Super Admin routes hoặc tách public restaurant info endpoint riêng.
7. Validate customer name theo requirement.
8. Dọn lỗi lint quan trọng và sửa mojibake UI text.
9. Tạo dữ liệu test thật trên MongoDB, chạy lại order/menu/table/staff/super-admin end-to-end.

## 9. Cập nhật sau sửa code

Thời điểm cập nhật: 2026-05-23.

Các lỗi đã sửa:

| STT bug | Trạng thái sau sửa | Bằng chứng |
|---:|---|---|
| 1 | Đã sửa | `menuService` normalize `_id -> id`; `useCart` dùng `item.id || item._id`, không còn gửi `menuItemId` undefined với data MongoDB |
| 2 | Đã sửa | `menuService.getAll(restaurantId)` gọi `/api/menu?restaurantId=...&includeUnavailable=true`; `Dashboard.tsx` truyền `restaurantId` |
| 3 | Đã sửa | `orderService.getAll()` chuyển sang `/api/staff/orders` cho dashboard admin/staff |
| 4 | Đã sửa | `orderService.updateStatus()` chuyển sang `PATCH /api/staff/orders/:id` |
| 5 | Đã sửa | `menuService` map payload nested `nutrition/ecoInfo` sang backend flat fields `calories/protein/carbs/fat/ecoScore/carbonFootprint/...` |
| 6 | Đã sửa | `menuService.getPublicMenu()` normalize response flat fields thành `nutrition` và `ecoInfo`, giúp recommendation/health UI đọc đúng |
| 7 | Đã sửa | Route `/staff` allow thêm `RESTAURANT_ADMIN` |
| 8 | Đã sửa một phần | Staff page có nút `Hoàn thành` cho Restaurant Admin khi order ở trạng thái `SERVED`; staff thường vẫn chỉ thấy chờ thanh toán |
| 9 | Đã sửa phần route admin | Backend đã khóa `GET/POST/PATCH/DELETE /api/restaurants`, stats overview và revenue bằng `SUPER_ADMIN`; thêm `/api/restaurants/public/:id` cho customer QR. `generate-qr` vẫn public để customer payment không cần login |
| 10 | Đã sửa | `CartDrawer` yêu cầu `customerName` tối thiểu 2 ký tự; backend `POST /api/orders` cũng validate min 2 |
| 15 | Đã sửa | Backend `POST /api/orders` kiểm tra restaurant active, table active theo `code`, và item hợp lệ trước khi tạo order |

Các lỗi còn lại/chưa xử lý trong vòng sửa này:

| STT bug | Trạng thái | Lý do |
|---:|---|---|
| 11 | Chưa sửa | Dashboard vẫn dùng direct fetch cho table sync; build không lỗi nhưng nên tách `tableService` và check `res.ok` từng request |
| 12 | Chưa sửa | Customer VietQR vẫn build URL `img.vietqr.io` trực tiếp; backend `generate-qr` hiện trả raw response từ vietqr.co, cần thống nhất contract response trước khi thay UI |
| 13 | Chưa sửa hết | `npm run lint` vẫn fail do nền code còn nhiều `any`, unused import, hook lint và react-refresh rule |
| 14 | Chưa sửa | Một số UI text tiếng Việt vẫn bị mojibake, đặc biệt `Login.tsx` và nhiều label cũ |

Kết quả kiểm tra sau sửa:

| Lệnh/kiểm tra | Kết quả sau sửa |
|---|---|
| Contract check cho endpoint/menu/cart/staff route | Pass |
| Search `mockData/mock/fake/demo/sample` trong `src` | Không còn match |
| `src/lib/mockData.ts` | Không tồn tại |
| `setTimeout` mô phỏng API | Không có; còn `ResetPassword.tsx:59` dùng redirect sau success |
| Polling thật | `StaffDashboard.tsx:33` polling 5 giây; `OrderHistoryDrawer.tsx:64` polling 6 giây |
| `npm run build` FE | Pass |
| `npm run build` BE | Pass |
| `npm run dev` FE | Pass, HTTP 200 tại `http://127.0.0.1:5173` |
| Backend health | Pass, `GET /api/health` trả `status: ok` |
| `GET /api/restaurants` không token | Đã chặn: HTTP 401 `Thiếu token` |
| `GET /api/restaurants/stats/overview` không token | Đã chặn: HTTP 401 `Thiếu token` |
| `POST /api/restaurants` không token | Đã chặn: HTTP 401 `Thiếu token` |
| `GET /api/restaurants/public/not-an-id` | HTTP 400 đúng validation |
| `npm run lint` FE | Fail còn 115 errors, 6 warnings |

Kết luận nghiệm thu sau sửa:

- Mức hoàn thành ước tính tăng từ khoảng 55% lên khoảng 78%.
- Mock API data đã sạch theo search hiện tại.
- FE/BE build thành công.
- Các lỗi API Critical/High làm customer order và restaurant dashboard không gọi đúng backend đã được sửa ở code path chính.
- Backend đang dùng MongoDB/Mongoose thật và route tạo order đã validate restaurant/table/item trước khi ghi.
- Chưa thể xác nhận demo end-to-end thật qua UI vì MongoDB hiện đang không có restaurant (`GET /api/restaurants` trước khi khóa trả mảng rỗng) và không có credential test để login Super Admin/Restaurant Admin/Staff. Không tạo dữ liệu test vào MongoDB để tránh thay đổi dữ liệu thật ngoài phạm vi.
- Trước khi nộp cuối, cần xử lý tiếp lint, mojibake UI text, table service, VietQR contract, và tạo/seed dữ liệu test có kiểm soát để chạy end-to-end.

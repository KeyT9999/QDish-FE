# PERFORMANCE AUDIT REPORT - QDish

Ngày audit: 2026-05-24  
Phạm vi: `QR_FOOD_ORDER_FE`, đối chiếu các route API trong `QR_FOOD_ORDER_BE`.

## 1. Tổng quan vấn đề

Website có cảm giác lag chủ yếu ở dashboard và lần load đầu vì JavaScript bundle lớn, route import eager, API bị gọi dư, và một số list/table tính toán lại mỗi render.

Các URL đã kiểm tra:
- `/dashboard?tab=overview`
- `/dashboard?tab=orders`
- `/dashboard?tab=menu`
- `/dashboard?tab=categories`
- `/dashboard?tab=tables`
- `/dashboard?tab=staff`
- `/dashboard?tab=settings`
- `/order?r=6a11db0fb72df8e1efb5c22c&t=01`

Baseline đo bằng Playwright trên dev server hiện có:

| Route | Thời gian đến network idle | Số API call quan sát | Nhận xét |
|---|---:|---:|---|
| `/dashboard?tab=overview` | 1927 ms | 13 | Gọi trùng profile/stats/orders/categories, có request `restaurantId=` rỗng |
| `/dashboard?tab=orders` | 1118 ms | 13 | Gọi orders nhiều lần và vẫn gọi menu/categories không cần thiết |
| `/dashboard?tab=menu` | 680 ms | 13 | Gọi menu/categories dư do mount + active tab effect |
| `/dashboard?tab=categories` | 688 ms | 13 | Gọi categories dư, vẫn gọi orders/menu |
| `/dashboard?tab=tables` | 679 ms | 13 | Gọi tables với `restaurantId=` rỗng trước khi có user |
| `/dashboard?tab=staff` | 665 ms | 13 | Gọi staff 2 lần, orders/menu/categories vẫn bị gọi |
| `/dashboard?tab=settings` | 737 ms | 11 | Settings vẫn gọi orders/menu/categories |
| `/order?r=...&t=01` | 1190 ms | 6 | Dev StrictMode làm restaurant/menu/categories bị gọi 2 lần |

Lưu ý: số API call trong dev bị nhân đôi bởi React StrictMode, nhưng vẫn có lỗi thật trong production: `useAuth()` hiện decode token trong `useEffect`, khiến dashboard render lần đầu với `restaurantId=''`, rồi chạy request rỗng trước khi render lại với restaurantId đúng.

Route/tab lag nhất theo audit:
- Load đầu dashboard overview: nặng nhất vì bundle lớn + Recharts + nhiều API dư.
- Orders/Menu tab có nguy cơ lag khi dữ liệu tăng vì render toàn bộ table, không pagination/virtualization.
- Customer menu mobile có nguy cơ giật khi nhiều món vì render toàn bộ card, handler tạo mới, ảnh chưa có width/height rõ ràng trong mọi nơi.

## 2. Kiểm tra React render performance

Kết quả kiểm tra code:

| Khu vực | Vấn đề |
---|---|
| `src/App.tsx` | Import eager toàn bộ `Dashboard`, `SuperAdmin`, `CustomerMenu`, `StaffDashboard`, kéo Recharts/QR/menu drawer vào bundle đầu |
| `src/hooks/useAuth.ts` | Mỗi component gọi hook có state riêng; user được set sau effect nên dashboard có render đầu với `restaurantId=''` |
| `src/pages/Dashboard.tsx` | State đặt trong một component lớn; đổi filter/input/form làm toàn bộ dashboard render lại |
| `src/pages/Dashboard.tsx` | `filteredOrders = orders.filter(...)` chạy mỗi render, `order.items.map(...).join(...)` tính lại nhiều lần trong row |
| `src/pages/Dashboard.tsx` | `useEffect([restaurantId])` load profile/categories/menu/orders, sau đó `useEffect([activeTab, statsPeriod])` lại load theo tab, gây duplicate |
| `src/pages/CustomerMenu.tsx` | Initial fetch restaurant -> menu -> categories đang tuần tự, có thể chạy song song |
| `src/pages/CustomerMenu.tsx` | `checkIsRecommended`, `handleAddToCart`, `handleItemClick` tạo mới mỗi render và truyền xuống nhiều `MenuItemCard` |
| `src/pages/StaffDashboard.tsx` | Polling 5 giây set lại toàn bộ `orders`, sau đó filter 3 lần mỗi render |
| `src/components/menu/OrderHistoryDrawer.tsx` | Polling 6 giây khi mở drawer; `activeOrders`, `unpaidTotal`, QR URL tính lại mỗi render |
| `src/pages/SuperAdmin.tsx` | Search input gọi API theo từng ký tự, thiếu debounce |

Không thấy effect lặp vô hạn, nhưng thấy nhiều effect gây request dư và render dư.

## 3. Kiểm tra API/network

Đo trực tiếp bằng `Invoke-WebRequest` trên backend local đang chạy:

| Endpoint | Method | Avg ms | Số lần trong flow | Page gọi | Cache/Pagination/Debounce |
|---|---|---:|---:|---|---|
| `/api/restaurants/me` | GET | 101.8 | 3-4 lần/tab dev | Dashboard/Layout | Cache ngắn hạn/profile context nên có |
| `/api/restaurants/me/stats?period=today` | GET | 157.4 | 1-2 lần overview dev | Overview | Cache theo period, abort request cũ |
| `/api/staff/orders` | GET | 68.4 | 3-5 lần/tab dev | Dashboard orders + initial load | Cần tránh gọi ngoài tab orders; cần pagination/status |
| `/api/staff` | GET | 54.8 | 1-2 lần staff dev | Staff tab | Gọi chỉ khi tab staff |
| `/api/menu?restaurantId=...&includeUnavailable=true` | GET | 54.6 | 1-2 lần/tab dev | Dashboard menu + initial load | Gọi chỉ tab menu; có thể cache ngắn hạn |
| `/api/categories?restaurantId=...` | GET | 70.2 | nhiều lần/tab dev | Menu/Categories | Gọi chỉ khi cần; cache ngắn hạn |
| `/api/tables?restaurantId=...` | GET | 68.4 | 1-2 lần tables dev | Tables tab | Gọi chỉ tab tables |
| `/api/restaurants/public/:id` | GET | 145.4 | 2 lần dev | Customer order | Song song với menu/categories; cache trong drawer |
| `/api/menu?restaurantId=...` | GET | 110.6 | 2 lần dev | Customer order | Pagination/virtualization nếu menu lớn |
| `/api/orders?restaurantId=...&tableNumber=...` | GET | 102.0 | 6 giây/lần khi drawer mở | Order history | Polling chỉ khi drawer mở, nên giữ |

Nguyên nhân API dư:
- `Dashboard.tsx` gọi dữ liệu chung quá rộng lúc mount.
- `useAuth()` trả user muộn, gây request với `restaurantId=''`.
- React StrictMode trong dev làm effects chạy 2 lần, làm vấn đề dễ thấy hơn.
- `SuperAdmin.tsx` thiếu debounce search.

## 4. Kiểm tra bundle size

Baseline trước tối ưu:
- JS đang được `dist/index.html` dùng: `dist/assets/index-DAVcha_t.js` khoảng 1,074,105 bytes, gzip khoảng 318.83 KB.
- CSS chính: khoảng 84,838 bytes.
- Vite cảnh báo chunk lớn hơn 500 KB.

Sau tối ưu:
- Main JS hiện tại: `dist/assets/index-*.js` khoảng 331.08 KB, gzip khoảng 104.86 KB.
- Dashboard route chunk `Dashboard-*.js`: khoảng 143.58 KB, gzip khoảng 35.80 KB.
- Recharts được tách ra chunk riêng `BarChart-*.js`: khoảng 416.47 KB, gzip khoảng 126.92 KB, chỉ tải khi route dashboard/super admin cần chart.
- Customer menu chunk: khoảng 63.67 KB, gzip khoảng 18.93 KB.
- Không còn warning chunk chính 1 MB; phần chart vẫn lớn nhưng không còn nằm trong initial route bundle.

Vấn đề:
- `src/App.tsx` import eager tất cả page.
- `Dashboard.tsx` import Recharts trực tiếp nên chart code đi vào dashboard chunk.
- `SuperAdmin.tsx` import Recharts trực tiếp.
- `Dashboard.tsx` import `qrcode.react` trực tiếp, dù chỉ cần khi mở QR modal.
- Không thấy `import * as Icons`; lucide đang import named icons, tree-shaking ổn hơn.
- `framer-motion` có trong dependency nhưng không thấy dùng trong source audit, có thể là dependency thừa.

Đề xuất:
- Dùng `React.lazy` + `Suspense` cho page routes.
- Lazy load dashboard chart components hoặc ít nhất tách route chunk trước.
- Lazy load `qrcode.react` trong modal QR.
- Sau đó cân nhắc tách chart section riêng nếu bundle dashboard vẫn nặng.

## 5. Kiểm tra UI/CSS/animation

Các pattern gây repaint/reflow không cần thiết:
- Nhiều `transition-all` trong dashboard, layout, menu card, health form.
- `backdrop-blur` ở sticky customer menu, drawer footer, modal overlay.
- `hover:shadow-md`, `shadow-lg`, `ring`, `drop-shadow` dùng nhiều trong list/card.
- `animate-pulse` notification chạy liên tục.

Ưu tiên sửa nhẹ:
- Thay `transition-all` trên element lớn bằng `transition-colors`, `transition-shadow`, `transition-transform` tùy mục tiêu.
- Giữ animation UI nhưng giảm ở list/table nhiều item.
- Tránh blur trên vùng sticky lặp lại khi scroll mobile nếu thấy giật.

## 6. Kiểm tra list/table rendering

| List/table | Vấn đề | Đề xuất |
|---|---|---|
| Dashboard orders | Render toàn bộ 100 order, filter mỗi render, row tính string nhiều lần | `useMemo`, row component memo, pagination sau |
| Dashboard menu | Render toàn bộ món và ảnh; ảnh chưa `loading="lazy"` trong admin table | Thêm lazy image, row memo, pagination nếu >100 |
| Staff dashboard | Polling 5 giây re-render cả 3 cột | `useMemo` group orders, memo order card, tránh set state nếu dữ liệu không đổi |
| Customer menu | Render toàn bộ món trong grid | `React.memo(MenuItemCard)`, `useCallback`, image size/lazy |
| Super admin restaurants | API search từng phím | Debounce 300 ms |

## 7. Kiểm tra image/media

Vấn đề:
- `MenuItemCard` có `loading="lazy"` nhưng thiếu `width`/`height`.
- `MenuItemDetail` hero image chưa lazy/eager rõ ràng và thiếu size.
- `Dashboard` menu table image chưa `loading="lazy"`.
- Backend lưu URL ảnh, không resize/compress.

Đề xuất:
- Thêm `loading="lazy"`, `decoding="async"`, `width`, `height` cho ảnh trong list/table.
- Detail image giữ kích thước ổn định để tránh layout shift.
- Nếu backend về sau upload ảnh, cần resize/compress server-side.

## 8. Kiểm tra localStorage/session

Vấn đề:
- `useAuth` decode JWT trong effect ở từng nơi dùng hook, gây render trễ và request rỗng.
- `useCart` ghi localStorage mỗi lần cart đổi, chấp nhận được vì cart nhỏ.
- `useHealthProfile` chỉ đọc lazy init và ghi khi save, ổn.

Đề xuất:
- Decode token đồng bộ trong lazy initializer để user có sẵn ngay render đầu.
- Tách helper decode token tránh parse lặp trong login/init.
- Nếu mở rộng, nên dùng AuthContext để mọi layout/page dùng cùng user state.

## 9. Kiểm tra backend/MongoDB nếu API chậm

Backend hiện không quá chậm trên dữ liệu nhỏ, nhưng có rủi ro khi dữ liệu tăng:

| File/API | Rủi ro |
---|---|
| `Order` model | Chỉ index `restaurantId`; thiếu compound index cho `{ restaurantId, createdAt }`, `{ restaurantId, status, createdAt }`, `{ restaurantId, tableNumber, createdAt }` |
| `GET /api/staff/orders` | Trả 100 order gần nhất nhưng không filter status/page; staff polling sẽ tải lại cả danh sách |
| `GET /api/orders?restaurantId&tableNumber` | Thiếu limit/pagination, lịch sử bàn có thể lớn |
| `GET /api/restaurants/me/stats` | Dùng nhiều `Order.find()` rồi xử lý JS trong memory; thiếu `.lean()`, aggregation/projection |
| `GET /api/restaurants/stats/overview` | Lấy tất cả restaurants và orders completed/served toàn hệ thống rồi group trong JS |
| `GET /api/menu` | Không limit/pagination; thiếu `.lean()` |

Đề xuất backend:
- Thêm indexes cho orders: `{ restaurantId: 1, createdAt: -1 }`, `{ restaurantId: 1, status: 1, createdAt: -1 }`, `{ restaurantId: 1, tableNumber: 1, createdAt: -1 }`.
- Dùng `.lean()` cho GET list.
- Pagination cho orders/menu khi dữ liệu lớn.
- Aggregation cho stats thay vì load toàn bộ document.

## 10. Đề xuất tối ưu theo mức độ ưu tiên

| Vấn đề | File/component/API | Mức độ | Tác động UX | Cách fix | Rủi ro |
|---|---|---|---|---|---|
| Route import eager, bundle 1.07 MB | `src/App.tsx` | High | Load đầu chậm, TBT cao | `React.lazy` pages | Low |
| `useAuth` trả user muộn, request `restaurantId=` rỗng | `src/hooks/useAuth.ts`, `Dashboard.tsx` | High | API dư, tab chậm | Decode token sync, guard restaurantId | Low |
| Dashboard load mọi dữ liệu lúc mount | `src/pages/Dashboard.tsx` | High | Chuyển tab/load đầu chậm | Load theo tab, cache state đã load | Medium |
| Customer menu fetch tuần tự | `src/pages/CustomerMenu.tsx` | Medium | `/order` load chậm mobile | `Promise.all` | Low |
| Orders filter/string tính lại mỗi render | `Dashboard.tsx` | Medium | Gõ search/đổi filter giật | `useMemo`, precompute row display | Low |
| Staff polling render lại cả list | `StaffDashboard.tsx` | Medium | Bếp bị giật mỗi 5 giây | `useMemo`, avoid set same data | Low |
| Search super admin không debounce | `SuperAdmin.tsx` | Medium | API spam khi gõ | Debounce 300 ms | Low |
| Recharts/QR trong main dashboard chunk | `Dashboard.tsx`, `SuperAdmin.tsx` | Medium | JS parse chậm | Lazy chunk chart/QR | Medium |
| `transition-all` nhiều nơi | UI/page classes | Low | Repaint/scroll không mượt | Thay transition cụ thể | Low |
| Image thiếu dimensions/lazy | Dashboard/Menu detail | Low | Layout shift, scroll giật | Add width/height/lazy/decoding | Low |

## 11. Sau khi audit, tiến hành tối ưu

Các tối ưu đã thực hiện:
1. `src/App.tsx`: tách route bằng `React.lazy`/`Suspense` cho Login, Reset Password, Customer Menu, Dashboard, Staff Dashboard, Super Admin.
2. `src/hooks/useAuth.ts`: decode token đồng bộ bằng lazy initializer, tránh render đầu với `user=null` và `restaurantId=''`.
3. `src/services/api.ts`: gộp GET trùng đang in-flight và cache GET thành công trong 1 giây; tự clear cache khi có mutation.
4. `src/pages/Dashboard.tsx`: chỉ load API theo active tab, guard `restaurantId`, lazy load QR code, memo `filteredOrders`, giảm tính toán row order, chuyển table API sang `tableService`.
5. `src/services/tableService.ts`: thêm service bàn ăn dùng chung `apiFetch` thay cho `fetch` thủ công.
6. `src/pages/CustomerMenu.tsx`: fetch restaurant/menu/categories song song bằng `Promise.all`, dùng callback ổn định cho add/click/submit, giữ allergen array ổn định.
7. `src/hooks/useCart.ts`: memo hóa callback và derived values `cartTotal`, `cartCount`.
8. `src/components/menu/MenuItemCard.tsx`: bọc `React.memo`, thêm image `width`/`height`/`decoding`, thay `transition-all`.
9. `src/components/menu/OrderHistoryDrawer.tsx`: memo hóa fetch/calculation/QR URL, tránh set state nếu polling trả dữ liệu không đổi, thêm lazy image cho VietQR.
10. `src/pages/StaffDashboard.tsx`: memo group orders, callback ổn định, tránh set state khi polling trả dữ liệu không đổi.
11. `src/pages/SuperAdmin.tsx`: debounce search 300 ms và bỏ effect load restaurants trùng khi đổi tab.
12. CSS/UI: thay toàn bộ `transition-all` trong `src` bằng transition cụ thể.
13. Backend: thêm compound index cho `Order`, index cho `MenuItem`, dùng `.lean()` cho các GET list menu/category/table/order/staff.

## 12. Testing sau tối ưu

Đã chạy:
- `npm run build` trong `QR_FOOD_ORDER_FE`: pass.
- `npm run lint` trong `QR_FOOD_ORDER_FE`: pass exit code 0, còn 110 warning hiện hữu chủ yếu `any`/unused/exhaustive-deps.
- `npm run check:encoding` trong `QR_FOOD_ORDER_FE`: pass.
- `npm run build` trong `QR_FOOD_ORDER_BE`: pass.
- Dev servers đang chạy: FE `http://localhost:5173`, BE `http://localhost:5000`.
- Playwright headless mở đủ 7 dashboard tabs và `/order?r=6a11db0fb72df8e1efb5c22c&t=01`, đo API call thực.

Kết quả Playwright sau tối ưu:

| Route | Elapsed sau tối ưu | API call sau tối ưu | Baseline API call | Ghi chú |
|---|---:|---:|---:|---|
| `/dashboard?tab=overview` | 2460 ms | 2 | 13 | Chỉ còn profile + stats |
| `/dashboard?tab=orders` | 1792 ms | 2 | 13 | Chỉ còn profile + staff orders |
| `/dashboard?tab=menu` | 1758 ms | 3 | 13 | Profile + menu + categories |
| `/dashboard?tab=categories` | 1733 ms | 2 | 13 | Profile + categories |
| `/dashboard?tab=tables` | 1719 ms | 2 | 13 | Profile + tables, không còn fetch thủ công trùng |
| `/dashboard?tab=staff` | 1912 ms | 2 | 13 | Profile + staff |
| `/dashboard?tab=settings` | 1721 ms | 1 | 11 | Chỉ profile/settings |
| `/order?r=...&t=01` | 1737 ms | 3 | 6 | Restaurant + menu + categories song song |

API response quan sát sau tối ưu đa số trong khoảng 48-118 ms local. Riêng stats có lần 183 ms do route stats vẫn xử lý aggregate ở backend bằng JS; đây là khuyến nghị tiếp theo nếu dữ liệu tăng lớn.

## 13. Kết quả cuối cùng

Nguyên nhân lag thật sự:
- Initial JS bundle quá lớn do import eager toàn bộ pages và chart/QR.
- Dashboard load quá nhiều API không phụ thuộc tab, gây 11-13 request ban đầu.
- `useAuth` cập nhật user sau effect, tạo render/request rỗng với `restaurantId=''`.
- Polling staff/order history set state lại cả list dù dữ liệu không đổi.
- Search Super Admin gọi API theo từng ký tự.
- `transition-all` và image thiếu kích thước làm scroll/list kém ổn định.
- Backend list queries thiếu `.lean()` và index compound cho order/menu khi dữ liệu tăng.

Trước/sau đáng kể:
- Main JS giảm từ khoảng 1.07 MB xuống khoảng 331 KB.
- Dashboard API ban đầu giảm từ 11-13 call/tab xuống 1-3 call/tab.
- Customer order API giảm từ 6 call xuống 3 call.
- Không còn `transition-all` trong `src`.
- Build production FE/BE đều pass.

Vấn đề còn tồn tại:
- Lint còn 110 warning type/unused/exhaustive-deps nhưng không còn error.
- Dashboard vẫn là component lớn; nếu dữ liệu menu/orders tăng hàng trăm-nghìn item, cần pagination hoặc virtualization.
- Stats backend vẫn nên chuyển sang Mongo aggregation/projection để ổn định khi có nhiều orders.
- Lighthouse/Chrome Performance score chưa chạy trong turn này; Playwright timing và bundle output đã được ghi nhận.

Khuyến nghị tiếp theo:
- Pagination cho `/api/staff/orders`, `/api/orders`, `/api/menu`.
- Tách chart section khỏi dashboard tab nếu muốn giảm dashboard chunk thêm.
- Dọn warning lint theo từng nhóm để về 0 warning.

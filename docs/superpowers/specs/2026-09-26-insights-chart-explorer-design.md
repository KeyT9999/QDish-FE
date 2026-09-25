# Insights Chart Explorer Design

## Design read

Đây là một cải tiến targeted evolution cho dashboard vận hành nhà hàng, phục vụ chủ/quản trị nhà hàng cần đọc nhanh xu hướng đơn hàng và doanh thu. Giao diện giữ ngôn ngữ hiện có của QDish: nền sáng, emerald làm màu nhấn, slate/neutral cho dữ liệu, mật độ vừa phải và chuyển động tiết chế.

## Goal

Thêm nút **Xem biểu đồ** trong tab `/dashboard?tab=insights`. Khi mở, người dùng thấy một khu vực biểu đồ xổ xuống ngay trên các khối phân tích AI hiện có. Khu vực này giúp đọc dữ liệu vận hành bằng các biểu đồ trực quan, dùng số liệu thật từ API thống kê nhà hàng và payload insight hiện tại.

## Scope

### In scope

- Nút mở/đóng có trạng thái `aria-expanded`, focus ring và nhãn thay đổi giữa “Xem biểu đồ” và “Ẩn biểu đồ”.
- Khu vực `Bảng điều khiển biểu đồ` hiển thị dưới banner doanh thu và trước khối AI.
- Bộ lọc thời gian hiện tại của tab được chuẩn hóa thành `today`, `week`, `month`, `year` và dùng chung cho insight API và stats API.
- Sáu biểu đồ responsive:
  1. Doanh thu và số đơn theo thời gian: `ComposedChart` với area doanh thu và line số đơn.
  2. Khung giờ đặt món: `BarChart` theo 24 giờ, có tooltip doanh thu và số đơn.
  3. Top món bán chạy: `BarChart` ngang theo số lượng, tooltip kèm doanh thu.
  4. Doanh thu theo danh mục: `PieChart`/donut.
  5. Trạng thái đơn hàng: `PieChart`/donut.
  6. Phân khúc khách hàng: `BarChart` ngang từ insight khảo sát.
- Empty state cho từng chart khi API trả mảng rỗng; không sinh số giả ở frontend.
- Loading skeleton khi stats đang tải.
- Responsive ở mobile, tablet và desktop; không tạo overflow ngang.
- Unit tests cho các hàm chuyển đổi dữ liệu chart.
- Browser test cho luồng mở/đóng, tên biểu đồ và không có lỗi runtime với API mock.

### Out of scope

- Không thay đổi backend schema hoặc endpoint.
- Không thay đổi layout các tab khác.
- Không thêm export CSV/PDF, drill-down hoặc date-range picker tùy chỉnh.
- Không thay đổi quyền gói dịch vụ hiện tại; chart nào không có dữ liệu quyền sẽ hiển thị empty state phù hợp.

## Information architecture

Khi đóng, tab giữ nguyên nội dung hiện tại và chỉ hiển thị nút CTA. Khi mở:

1. Header chart explorer: tiêu đề, mô tả ngắn và trạng thái kỳ dữ liệu.
2. Hàng ưu tiên: doanh thu/số đơn theo thời gian, khung giờ đặt món.
3. Hàng phân tích: top món bán chạy, doanh thu theo danh mục.
4. Hàng vận hành: trạng thái đơn hàng, phân khúc khách hàng.

Trên mobile, tất cả chart chuyển thành một cột. Các chart vẫn giữ chiều cao tối thiểu đủ cho tooltip và nhãn trục, nhưng không dùng chiều cao cố định toàn viewport.

## Data flow and interfaces

- `Dashboard.tsx` tiếp tục sở hữu `statsPeriod`, `stats`, `isLoadingStats`; effect tải `/api/restaurants/me/stats` khi active tab là `overview` hoặc `insights`.
- `MerchantInsightsTab` nhận `stats`, `statsPeriod`, `isLoadingStats`, `onSetStatsPeriod` qua props. State kỳ dữ liệu không bị nhân đôi giữa parent và child.
- `MerchantInsightsCharts.tsx` chỉ nhận dữ liệu đã tải và callback trạng thái; component không tự gọi API.
- `merchantInsightsChartData.ts` chứa các hàm thuần:
  - `buildRevenueTrendData(stats)`
  - `buildHourlyOrderData(stats, insights)`
  - `buildTopDishData(stats, insights)`
  - `buildCategoryRevenueData(stats)`
  - `buildOrderStatusData(stats)`
  - `buildCustomerSegmentData(insights)`
- Mỗi hàm trả mảng an toàn, giữ `0` cho các giá trị số bị thiếu và không mutate payload gốc.
- `RestaurantStats` là nguồn cho doanh thu, số đơn, danh mục và trạng thái. `MerchantInsightsPayload` là nguồn cho phân khúc khách hàng và fallback menu/khung giờ khi stats chưa có dữ liệu.

## Visual and interaction rules

- Giữ emerald là accent chính; dùng blue/amber/rose/indigo chỉ để phân biệt ngữ nghĩa chart, không tạo gradient trang trí.
- Card chart dùng border neutral mảnh, bo góc theo scale hiện tại và shadow nhẹ; không thêm glassmorphism mới.
- Tooltip hiển thị nhãn tiếng Việt, đơn vị `đơn` hoặc `₫`; không để số thô khó hiểu.
- Chart có tiêu đề h3, mô tả ngắn hoặc `aria-label` mô tả nội dung.
- Nút mở/đóng là `<button>` thật, hỗ trợ Enter/Space tự nhiên; section có `aria-controls`.
- Animation mở section dùng transition ngắn; chart chỉ mount khi mở để tránh tải/render Recharts khi người dùng chưa yêu cầu.
- Skeleton và empty state giữ cùng kích thước card để giảm layout shift.

## Error handling

- Nếu insight API lỗi, flow hiện tại vẫn hiển thị error state của tab.
- Nếu stats API lỗi trong khi insight vẫn tải được, chart explorer hiển thị thông báo inline “Chưa tải được số liệu vận hành” và nút mở không làm crash trang.
- Nếu một dataset riêng lẻ rỗng, chỉ chart đó hiển thị “Chưa có dữ liệu trong kỳ này”; các chart khác vẫn hoạt động.
- Không log dữ liệu nhạy cảm vào console.

## Testing strategy

- Unit: kiểm tra các adapter với dữ liệu đầy đủ, mảng rỗng, giá trị thiếu và payload insight fallback.
- Browser: mock API cho profile, stats và customer insights; mở trang insights, click `Xem biểu đồ`, xác nhận section và sáu tiêu đề xuất hiện, click `Ẩn biểu đồ`, xác nhận section bị ẩn; kiểm tra console không có error.
- Verification: `npm run check:encoding`, `npm run lint`, `npm run test:ci`, `npm run build`, và Playwright spec focused cho chart explorer.

## Acceptance criteria

- Người dùng nhìn thấy nút **Xem biểu đồ** trên tab insights.
- Click nút mở đúng khu vực xổ xuống, không điều hướng khỏi tab.
- Bộ lọc thời gian cập nhật cả insight data và stats data.
- Sáu chart hiển thị đúng dạng, đúng đơn vị và không overflow ở mobile.
- Không có số liệu mock được tạo ở frontend.
- Empty/loading/error state không làm vỡ layout.
- Lint, unit tests, build và browser test đều pass.

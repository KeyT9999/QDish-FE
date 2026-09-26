# Merchant Analytics Information Architecture Design

## Design read

Đây là một targeted evolution cho dashboard quản lý nhà hàng hiện có. Giao diện giữ nền sáng, emerald làm accent thương hiệu QDish, slate/neutral cho nội dung và mật độ thông tin kiểu data-dense dashboard. Tra cứu UI/UX Pro Max xác nhận: trend dùng line/area, so sánh dùng bar, tỷ trọng dùng donut khi số nhóm ít, loading dùng skeleton, empty state phải có hướng dẫn và mobile không được tạo overflow ngang.

## Goal

Phân bố các số liệu vận hành vào đúng tab nghiệp vụ để chủ nhà hàng không phải tìm một loại dữ liệu ở nhiều nơi. Mỗi tab có một mục tiêu rõ ràng, trong khi `Insights` đóng vai trò lớp diễn giải và đề xuất hành động.

## Information architecture

### Tổng quan (`overview`)

Trả lời câu hỏi: “Nhà hàng đang hoạt động thế nào?”.

- Giữ bộ lọc kỳ dữ liệu ở đầu trang.
- Hiển thị sáu KPI: doanh thu, số đơn, giá trị đơn trung bình, món bán chạy, số khách và tỷ lệ huỷ.
- Giữ các chart tổng quan hiện có: doanh thu theo thời gian, giờ cao điểm, doanh thu theo danh mục và top món.
- Không đưa danh sách đơn lớn hoặc hiệu quả từng bàn vào đây.

### Insights (`insights`)

Trả lời câu hỏi: “Số liệu này có ý nghĩa gì và nên làm gì tiếp theo?”.

- Đặt khu vực “Đề xuất hôm nay” sau banner doanh thu và trước chart explorer.
- Mỗi đề xuất có tiêu đề, lý do và tone trạng thái; chỉ sinh từ dữ liệu thật, không có số liệu giả.
- Giữ nút `Xem biểu đồ` để mở inline chart explorer.
- Chart explorer vẫn có sáu chart: doanh thu theo thời gian, giờ cao điểm, top món, danh mục, trạng thái đơn và phân khúc khách.
- Các chart chi tiết có thể trùng dữ liệu với tab nghiệp vụ, nhưng Insights là nơi đọc mối liên hệ giữa các số liệu.

### Đơn hàng (`orders`)

Trả lời câu hỏi: “Đơn nào cần xử lý và chất lượng vận hành đang ra sao?”.

- Đặt summary trạng thái đơn phía trên bộ lọc danh sách.
- Đặt danh sách “Đơn có giá trị cao” dưới summary hoặc cạnh danh sách trên desktop.
- Dùng status strip/card và ranked list; không dùng donut lớn vì nhân viên cần hành động nhanh.

### Menu (`menu`)

Trả lời câu hỏi: “Món và nhóm món nào đang tạo doanh thu?”.

- Đặt summary top món và danh mục sau header quản lý menu, trước danh sách món.
- Dùng horizontal bar rows có số lượng/doanh thu, dễ quét hơn chart lớn trong màn hình CRUD.
- Chart explorer ở Insights là bản phân tích đầy đủ; Menu tab ưu tiên hành động chỉnh sửa món.

### Bàn (`tables`)

Trả lời câu hỏi: “Bàn nào đang hoạt động hiệu quả?”.

- Đặt bảng xếp hạng hiệu quả bàn sau summary số bàn và trước danh sách QR.
- Dùng horizontal bars kèm doanh thu và số đơn.
- Không hiển thị bàn không có dữ liệu như một lỗi; dùng empty state hướng dẫn nhận thêm đơn.

### Khách hàng (`customers`)

Trả lời câu hỏi: “Khách hàng của nhà hàng có nhu cầu gì?”.

- Đặt phân khúc khách hàng ở đầu tab CRM, trước danh sách khách.
- Dùng horizontal bars, kèm số lượt khảo sát và trạng thái quyền gói.
- Nếu gói chưa có customer insights, hiển thị locked state ngắn gọn, không gọi endpoint không được cấp quyền.

## Data flow

- `Dashboard.tsx` tiếp tục là container của `stats` và `statsPeriod`.
- Stats API được tải cho `overview`, `insights`, `orders`, `menu` và `tables`, dùng chung kỳ dữ liệu.
- `RestaurantOverviewTab`, `MerchantInsightsTab`, `RestaurantOrdersTab`, `RestaurantMenuTab` và `RestaurantTablesTab` nhận `stats` qua props.
- `RestaurantCustomersTab` tải customer insights khi tab mở và khi kỳ dữ liệu thay đổi, vì tab này đã tự quản lý server state CRM.
- Các summary component chỉ trình bày dữ liệu; logic chuyển đổi và recommendation logic là pure functions để test độc lập.

## Visual rules

- Dùng card nền trắng, border neutral mảnh, radius nhất quán và shadow nhẹ.
- Emerald là màu chính; blue, amber, rose, violet chỉ biểu thị loại trạng thái.
- Tất cả chart/list wrapper có `min-w-0`, mobile chuyển một cột và không overflow ngang.
- Không dùng emoji thay icon; dùng Lucide hiện có.
- Chart/list có heading semantic, `aria-label`, empty state và loading skeleton.
- Nút tương tác là button thật, có focus-visible state.
- Recommendation chỉ dùng motion nhẹ khi mở section; tôn trọng reduced motion.

## Error and entitlement behavior

- Stats lỗi: tab nghiệp vụ vẫn giữ layout và hiển thị error inline, không crash.
- Dataset rỗng: hiển thị “Chưa có dữ liệu trong kỳ này” và hướng dẫn ngắn.
- Customer insights bị khóa: không gọi API, hiển thị thông báo nâng cấp phù hợp.
- Customer insights lỗi: CRM list vẫn hoạt động, chỉ summary phân khúc hiển thị retry state.

## Testing strategy

- Unit test cho recommendation builder và các adapter summary.
- Browser test mở Insights, kiểm tra recommendations và chart explorer; chuyển sang Menu/Orders/Tables/Customers với mock data, kiểm tra summary đúng ngữ cảnh.
- Kiểm tra mobile 375px không có horizontal overflow và không có console error/warning.
- Chạy các gate của CI: encoding, lint, test:ci và build.

## Acceptance criteria

- Mỗi nhóm số liệu xuất hiện ở tab nghiệp vụ phù hợp.
- Overview có KPI nâng cao và không làm mất chart hiện có.
- Insights có đề xuất hành động và chart explorer mở/đóng được.
- Orders có status summary và largest-orders list.
- Menu có top dishes/category summary.
- Tables có table-performance ranking.
- Customers có customer-segment summary khi được cấp quyền.
- Tất cả state loading, empty, error và entitlement đều có UI rõ ràng.
- Không thêm backend endpoint/schema và không tạo số liệu giả ở frontend.

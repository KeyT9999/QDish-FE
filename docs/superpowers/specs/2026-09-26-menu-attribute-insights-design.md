# Thuộc tính thực đơn — design spec

## Mục tiêu

Biến khu vực “Thuộc tính thực đơn” từ danh sách chip khó diễn giải thành một báo cáo trực quan để chủ nhà hàng hiểu menu đang được phân loại như thế nào và biết điểm nào cần cải thiện.

## Người dùng và câu hỏi cần trả lời

Chủ nhà hàng cần trả lời nhanh:

1. Menu có bao nhiêu món đã được gắn dữ liệu dinh dưỡng?
2. Nhóm thuộc tính nào đang nổi bật trong menu?
3. Món được phân loại theo dinh dưỡng, chế độ ăn và ngữ cảnh sử dụng ra sao?
4. Có khoảng trống dễ nhận thấy nào cần cân nhắc bổ sung không?

## Quyết định UX/UI

- Đổi tiêu đề thành **Phân bố thuộc tính món ăn** để nói đúng nội dung.
- Dùng ba KPI nhỏ ở đầu: tổng số món, món có dữ liệu dinh dưỡng và số nhóm thuộc tính đang hoạt động.
- Dùng **thanh ngang có nhãn số** thay cho pie/donut: tên thuộc tính dài, nhiều hạng mục và các hạng mục có thể chồng lấp; thanh ngang giúp so sánh thứ hạng nhanh hơn.
- Chia dữ liệu thành ba nhóm: **Dinh dưỡng**, **Chế độ ăn**, **Ngữ cảnh sử dụng**.
- Bổ sung mô tả ngắn cho từng nhóm và tooltip native cho ngưỡng/ý nghĩa thuộc tính.
- Thêm vùng **Gợi ý cho nhà hàng** chỉ diễn giải dữ liệu hiện có, không khẳng định doanh thu hay nhu cầu khách hàng.
- Hiển thị chú thích rõ: số liệu là số món được gắn nhãn, không phải lượt bán; một món có thể nằm ở nhiều thuộc tính nên tổng các thanh không cộng thành tổng menu.
- Giữ empty state hiện có nhưng đưa vào cùng ngôn ngữ của báo cáo mới.

## Phạm vi dữ liệu

`attributeDistribution` từ API đếm số menu item có từng `foodAttributes`. `menuCoverage` cung cấp tổng món và số món có Recipe. Không thay đổi backend/API và không giả định rằng báo cáo này bị lọc theo kỳ doanh thu.

## Accessibility và responsive

- Các nhóm và danh sách thanh có heading/landmark rõ ràng.
- Mỗi thanh có accessible name gồm tên thuộc tính và số món.
- Màu chỉ dùng để hỗ trợ, không dùng làm kênh thông tin duy nhất.
- Layout chuyển từ ba cột sang một cột trên màn hình nhỏ, không tạo overflow ngang.
- Tôn trọng `prefers-reduced-motion`.

## Ngoài phạm vi

- Không thêm endpoint/backend.
- Không tạo biểu đồ pie/donut.
- Không làm bộ lọc drill-down sang danh sách món vì API hiện tại chưa có query theo thuộc tính.

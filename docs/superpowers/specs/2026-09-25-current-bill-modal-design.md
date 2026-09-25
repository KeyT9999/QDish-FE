# Current Bill Modal Design

## Goal

Khi chủ nhà hàng chọn `Xem bill` từ một bàn đang dùng, hiển thị bill trong một modal nổi ở trung tâm màn hình, thay vì thêm một thẻ ở cuối danh sách bàn.

## User experience

- Modal dùng `Dialog` hiện có, nền phía sau được làm mờ và người dùng có thể đóng bằng nút X, click nền hoặc phím Escape.
- Header hiển thị bàn, mã bill và trạng thái bill.
- Phần tổng quan hiển thị mã phiên, thời gian mở phiên, số order và tổng số món.
- Phần món đã gom hiển thị tên món, số lượng, đơn giá và thành tiền.
- Phần tài chính hiển thị tạm tính, giảm giá, phí dịch vụ, thuế và tổng thanh toán.
- Nếu API trả về danh sách order, modal hiển thị thêm từng order với mã rút gọn, trạng thái, món và số tiền.
- Footer có nút đóng và nút `Thanh toán bill` khi bill ở trạng thái có thể thanh toán.
- Nội dung modal có chiều cao giới hạn và cuộn bên trong để không làm tràn viewport ở màn hình nhỏ.

## Data flow

`RestaurantTablesTab` gọi `billService.getCurrentBill`, giữ lại cả `session`, `bill` và `orders`, rồi truyền vào `CurrentBillModal`. Nếu không có bill, giữ thông báo hiện tại. Nếu thanh toán thành công, modal đóng, dữ liệu bàn được refresh và trạng thái bill được làm mới.

## Constraints

- Tái sử dụng Dialog, Button, Card và icon từ codebase hiện tại.
- Không thêm dependency mới.
- Giữ nguyên API `/api/bills/current` và luồng `BillPaymentModal`.
- Không hiển thị thông tin nhạy cảm ngoài dữ liệu bill hiện có.
- Responsive ở 320, 768, 1024 và 1440px.

## Acceptance criteria

1. Click `Xem bill` mở modal nổi có tiêu đề bill tương ứng.
2. Modal hiển thị đầy đủ các nhóm thông tin ở trên với dữ liệu API.
3. Modal có thể đóng bằng nút X, Escape và nút Đóng.
4. Bill thiếu `activeSessionId` nhưng backend trả về bill vẫn hiển thị bình thường.
5. Nút thanh toán trong modal mở đúng `BillPaymentModal` và không làm mất dữ liệu bàn.
6. Không có horizontal overflow ở các breakpoint được kiểm tra.

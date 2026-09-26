import { OrderStatus } from '@/types';

const successMessages: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'Đơn hàng đang chờ xử lý',
  [OrderStatus.CONFIRMED]: 'Đã nhận đơn thành công',
  [OrderStatus.SERVED]: 'Đã ra món thành công',
  [OrderStatus.COMPLETED]: 'Đã hoàn tất đơn hàng',
  [OrderStatus.CANCELLED]: 'Đã hủy đơn hàng'
};

export const getOrderStatusSuccessMessage = (status: OrderStatus) => successMessages[status];

import React from 'react';
import { OrderStatus } from '@/types';
import { Badge } from '@/components/ui/badge';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, className = '' }) => {
  const getBadgeProps = () => {
    switch (status) {
      case OrderStatus.PENDING:
        return { variant: 'outline' as const, className: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
      case OrderStatus.CONFIRMED:
        return { variant: 'outline' as const, className: 'bg-blue-100 text-blue-800 border-blue-200' };
      case OrderStatus.SERVED:
        return { variant: 'outline' as const, className: 'bg-green-100 text-green-800 border-green-200' };
      case OrderStatus.COMPLETED:
        return { variant: 'outline' as const, className: 'bg-gray-100 text-gray-800 border-gray-200' };
      case OrderStatus.CANCELLED:
        return { variant: 'outline' as const, className: 'bg-red-100 text-red-800 border-red-200' };
      default:
        return { variant: 'outline' as const, className: '' };
    }
  };

  const getLabel = () => {
    switch (status) {
      case OrderStatus.PENDING: return 'Chờ nhận';
      case OrderStatus.CONFIRMED: return 'Đang nấu';
      case OrderStatus.SERVED: return 'Đã ra món';
      case OrderStatus.COMPLETED: return 'Hoàn thành';
      case OrderStatus.CANCELLED: return 'Đã hủy';
      default: return status;
    }
  };

  const badgeProps = getBadgeProps();

  return (
    <Badge 
      variant={badgeProps.variant} 
      className={`font-semibold ${badgeProps.className} ${className}`}
    >
      {getLabel()}
    </Badge>
  );
};

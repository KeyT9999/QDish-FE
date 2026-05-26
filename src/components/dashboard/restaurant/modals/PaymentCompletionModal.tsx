import React, { useState } from 'react';
import { Order, PaymentMethod } from '@/types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/utils';

export interface PaymentCompletionModalProps {
  order: Order | null;
  onClose: () => void;
  onConfirm: (orderId: string, paymentMethod: PaymentMethod) => Promise<void>;
}

export const PaymentCompletionModal: React.FC<PaymentCompletionModalProps> = ({
  order,
  onClose,
  onConfirm
}) => {
  const [invoicePaymentMethod, setInvoicePaymentMethod] = useState<PaymentMethod>(PaymentMethod.BANK_TRANSFER);

  const handleConfirm = async () => {
    if (!order) return;
    await onConfirm(order.id || (order as any)._id, invoicePaymentMethod);
  };

  return (
    <Dialog open={!!order} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md bg-white rounded-2xl p-6">
        <DialogHeader className="border-b border-gray-100 pb-3">
          <DialogTitle className="text-lg font-bold text-gray-900">Xác nhận thanh toán hóa đơn</DialogTitle>
          <DialogDescription className="text-xs text-gray-500">Hoàn thành đơn hàng bàn số {order?.tableNumber}.</DialogDescription>
        </DialogHeader>

        {order && (
          <div className="space-y-4 py-3">
            <div className="space-y-1.5 text-sm text-gray-600 border-b border-gray-100 pb-3">
              <div className="flex justify-between">
                <span>Mã đơn:</span>
                <span className="font-mono font-bold">#{String(order.id || (order as any)._id).slice(-6)}</span>
              </div>
              <div className="flex justify-between">
                <span>Khách hàng:</span>
                <span className="font-semibold text-gray-800">{order.customerName || 'Khách vãng lai'}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-dashed border-gray-100">
                <span className="font-bold text-gray-900">Tổng thanh toán:</span>
                <span className="font-bold text-green-700 text-base">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-700">Lựa chọn hình thức thanh toán:</Label>
              <div className="flex gap-4">
                <label className="flex items-center text-sm font-semibold text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="payMethod"
                    value={PaymentMethod.BANK_TRANSFER}
                    checked={invoicePaymentMethod === PaymentMethod.BANK_TRANSFER}
                    onChange={() => setInvoicePaymentMethod(PaymentMethod.BANK_TRANSFER)}
                    className="mr-2 w-4 h-4 text-green-600 focus:ring-green-500"
                  />
                  Chuyển khoản (VietQR)
                </label>
                <label className="flex items-center text-sm font-semibold text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="payMethod"
                    value={PaymentMethod.CASH}
                    checked={invoicePaymentMethod === PaymentMethod.CASH}
                    onChange={() => setInvoicePaymentMethod(PaymentMethod.CASH)}
                    className="mr-2 w-4 h-4 text-green-600 focus:ring-green-500"
                  />
                  Tiền mặt (Cash)
                </label>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="border-t border-gray-100 pt-3">
          <Button variant="outline" onClick={onClose} className="rounded-xl">Hủy</Button>
          <Button onClick={handleConfirm} className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-md shadow-green-600/10">Xác nhận thanh toán</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

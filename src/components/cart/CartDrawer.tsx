import React, { useState } from 'react';
import { CartItem as CartItemType } from '@/types';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CartItem } from './CartItem';
import { formatCurrency } from '@/lib/utils';
import { ShoppingBag, Loader2, ArrowRight } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItemType[];
  cartTotal: number;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onSubmitOrder: (details: { customerName?: string; note?: string }) => Promise<void>;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  cartTotal,
  onUpdateQuantity,
  onRemove,
  onSubmitOrder
}) => {
  const [customerName, setCustomerName] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<1 | 2>(1); // 1: Cart review, 2: Checkout details
  const isCustomerNameValid = customerName.trim().length === 0 || customerName.trim().length >= 2;

  const handleSubmit = async () => {
    if (!isCustomerNameValid) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmitOrder({
        customerName: customerName.trim() || undefined,
        note: note.trim() || undefined
      });
      // Reset form on success
      setCustomerName('');
      setNote('');
      setStep(1);
      onClose();
    } catch (error) {
      console.error('Failed to submit order', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEmpty = cart.length === 0;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => {
      if (!open) {
        setStep(1);
        onClose();
      }
    }}>
      <SheetContent side="bottom" className="h-[90vh] sm:h-[85vh] rounded-t-3xl p-0 flex flex-col bg-surface border-none shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        <div className="w-full flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
        </div>
        <SheetHeader className="px-5 pt-2 pb-4 border-b border-gray-100 text-left">
          <SheetTitle className="font-heading text-xl font-bold flex items-center">
            {step === 1 ? (
              <>
                <ShoppingBag className="w-5 h-5 mr-2 text-green-600" />
                Giỏ hàng của bạn
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="-ml-3 mr-1 p-2 h-auto rounded-full"
                  onClick={() => setStep(1)}
                >
                  <ArrowRight className="w-5 h-5 rotate-180" />
                </Button>
                Xác nhận thông tin
              </>
            )}
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 px-5 pt-2 pb-6">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center h-48 text-center text-gray-500">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8 text-gray-300" />
              </div>
              <p>Giỏ hàng trống</p>
              <Button variant="link" onClick={onClose} className="text-green-600 mt-2">
                Tiếp tục chọn món
              </Button>
            </div>
          ) : (
            <>
              {step === 1 && (
                <div className="space-y-1">
                  {cart.map((item) => (
                    <CartItem 
                      key={item.menuItemId} 
                      item={item} 
                      onUpdateQuantity={onUpdateQuantity}
                      onRemove={onRemove}
                    />
                  ))}
                  
                  <div className="mt-8 space-y-3">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Tạm tính</span>
                      <span>{formatCurrency(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Phí dịch vụ</span>
                      <span>{formatCurrency(0)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-3 border-t border-gray-200 text-gray-900">
                      <span>Tổng cộng</span>
                      <span className="text-green-600">{formatCurrency(cartTotal)}</span>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="customerName" className="font-semibold text-gray-700">
                      Tên của bạn (Tùy chọn)
                    </Label>
                    <Input 
                      id="customerName" 
                      placeholder="VD: Anh Minh" 
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="bg-white"
                    />
                    {!isCustomerNameValid && (
                      <p className="text-xs font-medium text-red-600">Tên khách cần ít nhất 2 ký tự hoặc để trống.</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="note" className="font-semibold text-gray-700">
                      Ghi chú cho quán (Tùy chọn)
                    </Label>
                    <Textarea 
                      id="note" 
                      placeholder="VD: Không hành, ít cay..." 
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="bg-white resize-none"
                      rows={3}
                    />
                  </div>

                </div>
              )}
            </>
          )}
        </ScrollArea>

        {!isEmpty && (
          <SheetFooter className="p-4 bg-white border-t border-gray-100 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] sm:justify-center">
            {step === 1 ? (
              <Button 
                className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl h-14 text-lg font-bold shadow-lg shadow-green-600/20"
                onClick={() => setStep(2)}
              >
                Tiếp tục • {formatCurrency(cartTotal)}
              </Button>
            ) : (
              <Button 
                className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl h-14 text-lg font-bold shadow-lg shadow-green-600/20"
                onClick={handleSubmit}
                disabled={isSubmitting || !isCustomerNameValid}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Đang đặt món...
                  </>
                ) : (
                  'Xác nhận đặt món'
                )}
              </Button>
            )}
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
};

import React, { useState } from 'react';
import { Allergen, CartItem as CartItemType } from '@/types';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CartItem } from './CartItem';
import { formatCurrency } from '@/lib/utils';
import { ShoppingBag, Loader2, ArrowRight } from 'lucide-react';
import { buildCustomerContactPayload, isOptionalVietnamesePhoneValid } from '@/services/customerContact';
import type { MenuLocale } from '@/types/menuTranslation';
import { getMenuMessage } from '@/lib/menuLocale';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItemType[];
  cartTotal: number;
  userAllergies: Allergen[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onSubmitOrder: (details: {
    customerName?: string;
    customerPhone?: string;
    marketingConsent?: boolean;
    consentVersion?: string;
    note?: string;
  }) => Promise<void>;
  locale?: MenuLocale;
  localizeItemName?: (menuItemId: string, fallbackName: string) => string;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  cartTotal,
  userAllergies,
  onUpdateQuantity,
  onRemove,
  onSubmitOrder,
  locale = 'vi',
  localizeItemName = (_id, name) => name,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<1 | 2>(1); // 1: Cart review, 2: Checkout details
  const isCustomerNameValid = customerName.trim().length === 0 || customerName.trim().length >= 2;
  const isCustomerPhoneValid = isOptionalVietnamesePhoneValid(customerPhone);

  const handleSubmit = async () => {
    if (!isCustomerNameValid || !isCustomerPhoneValid) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmitOrder({
        ...buildCustomerContactPayload({ customerName, customerPhone, marketingConsent }),
        note: note.trim() || undefined
      });
      // Reset form on success
      setCustomerName('');
      setCustomerPhone('');
      setMarketingConsent(false);
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
                {getMenuMessage(locale, 'cart')}
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
                {getMenuMessage(locale, 'checkout')}
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
              <p>{getMenuMessage(locale, 'emptyCart')}</p>
              <Button variant="link" onClick={onClose} className="text-green-600 mt-2">
                {getMenuMessage(locale, 'continueShopping')}
              </Button>
            </div>
          ) : (
            <>
              {step === 1 && (
                <div className="space-y-1">
                  {cart.map((item) => (
                    <CartItem 
                      key={item.menuItemId} 
                      item={{ ...item, name: localizeItemName(item.menuItemId, item.name) }}
                      userAllergies={userAllergies}
                      locale={locale}
                      onUpdateQuantity={onUpdateQuantity}
                      onRemove={onRemove}
                    />
                  ))}
                  
                  <div className="mt-8 space-y-3">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{getMenuMessage(locale, 'subtotal')}</span>
                      <span>{formatCurrency(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{getMenuMessage(locale, 'serviceFee')}</span>
                      <span>{formatCurrency(0)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-3 border-t border-gray-200 text-gray-900">
                      <span>{getMenuMessage(locale, 'total')}</span>
                      <span className="text-green-600">{formatCurrency(cartTotal)}</span>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="customerName" className="font-semibold text-gray-700">
                      {getMenuMessage(locale, 'customerName')} ({getMenuMessage(locale, 'optional')})
                    </Label>
                    <Input 
                      id="customerName" 
                      placeholder={getMenuMessage(locale, 'namePlaceholder')}
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="bg-white"
                    />
                    {!isCustomerNameValid && (
                      <p className="text-xs font-medium text-red-600">{locale === 'en' ? 'Name must be at least 2 characters or left blank.' : locale === 'zh-CN' ? '姓名至少需要2个字符，也可以留空。' : 'Tên khách cần ít nhất 2 ký tự hoặc để trống.'}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerPhone" className="font-semibold text-gray-700">
                      {getMenuMessage(locale, 'customerPhone')} ({getMenuMessage(locale, 'optional')})
                    </Label>
                    <Input
                      id="customerPhone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      maxLength={20}
                      placeholder="VD: 0912 345 678"
                      value={customerPhone}
                      onChange={(event) => setCustomerPhone(event.target.value)}
                      aria-invalid={!isCustomerPhoneValid}
                      aria-describedby="customerPhoneHelp"
                      className="bg-white"
                    />
                    <p id="customerPhoneHelp" className={`text-xs ${isCustomerPhoneValid ? 'text-gray-500' : 'font-medium text-red-600'}`}>
                      {isCustomerPhoneValid
                        ? getMenuMessage(locale, 'phoneHint')
                        : getMenuMessage(locale, 'invalidPhone')}
                    </p>
                  </div>

                  {customerPhone.trim() && isCustomerPhoneValid && (
                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={marketingConsent}
                        onChange={(event) => setMarketingConsent(event.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-green-600"
                      />
                      <span>
                        {getMenuMessage(locale, 'consent')}
                      </span>
                    </label>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="note" className="font-semibold text-gray-700">
                      {getMenuMessage(locale, 'note')} ({getMenuMessage(locale, 'optional')})
                    </Label>
                    <Textarea 
                      id="note" 
                      placeholder={getMenuMessage(locale, 'notePlaceholder')}
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
                {getMenuMessage(locale, 'continue')} • {formatCurrency(cartTotal)}
              </Button>
            ) : (
              <Button 
                className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl h-14 text-lg font-bold shadow-lg shadow-green-600/20"
                onClick={handleSubmit}
                disabled={isSubmitting || !isCustomerNameValid || !isCustomerPhoneValid}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {getMenuMessage(locale, 'placingOrder')}
                  </>
                ) : (
                  getMenuMessage(locale, 'placeOrder')
                )}
              </Button>
            )}
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
};

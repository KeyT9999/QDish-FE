import React, { useEffect, useMemo, useState } from 'react';
import { ActiveBill, Bill, PaymentMethod, RestaurantPaymentSettings } from '@/types';
import { billService } from '@/services/billService';
import { paymentSettingsService } from '@/services/paymentSettingsService';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { formatCurrency } from '@/lib/utils';
import { AlertCircle, Banknote, CheckCircle2, Landmark, Loader2, Maximize2, QrCode, Receipt, X } from 'lucide-react';
import { toast } from 'sonner';

type PayableBill = ActiveBill | Bill;

interface PaymentInfoItem {
  label: string;
  value: string;
  highlight?: boolean;
}

interface QrPreviewCardProps {
  qrImageUrl: string;
  accountHolder?: string;
  bankInfoItems: PaymentInfoItem[];
  onExpand: () => void;
}

const QrPreviewCard: React.FC<QrPreviewCardProps> = ({
  qrImageUrl,
  accountHolder,
  bankInfoItems,
  onExpand
}) => (
  <div className="flex flex-col items-center gap-3 text-center">
    <button
      type="button"
      onClick={onExpand}
      aria-label="Mở QR chuyển khoản cỡ lớn"
      className="group relative rounded-2xl border border-neutral-100 bg-white p-2 shadow-sm outline-none transition hover:border-emerald-300 hover:shadow-md focus-visible:border-emerald-500 focus-visible:ring-3 focus-visible:ring-emerald-500/20"
    >
      <img
        src={qrImageUrl}
        alt="QR chuyển khoản"
        className="h-56 w-56 cursor-pointer rounded-xl object-contain"
      />
      <span className="absolute inset-x-4 bottom-4 rounded-full bg-neutral-950/80 px-3 py-1.5 text-xs font-bold text-white opacity-95 transition group-hover:bg-emerald-700">
        Nhấn để phóng to
      </span>
    </button>

    <Button
      type="button"
      variant="outline"
      onClick={onExpand}
      className="h-10 w-full rounded-xl border-emerald-200 bg-emerald-50 text-sm font-bold text-emerald-800 hover:bg-emerald-100 sm:w-auto"
    >
      <Maximize2 className="mr-1.5 h-4 w-4" />
      Phóng to QR
    </Button>

    <div className="space-y-0.5 text-xs font-semibold text-neutral-600">
      {accountHolder && <p>Chủ TK: {accountHolder}</p>}
      {bankInfoItems
        .filter((item) => item.label !== 'Chủ tài khoản' && !item.highlight)
        .map((item) => (
          <p key={item.label}>{item.label}: {item.value}</p>
        ))}
    </div>
  </div>
);

interface QrFullscreenModalProps {
  open: boolean;
  qrImageUrl?: string;
  paymentInfoItems: PaymentInfoItem[];
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmPaid: () => void;
}

const QrFullscreenModal: React.FC<QrFullscreenModalProps> = ({
  open,
  qrImageUrl,
  paymentInfoItems,
  isSubmitting,
  onOpenChange,
  onConfirmPaid
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent
      showCloseButton={false}
      overlayClassName="z-[60] bg-black/60 supports-backdrop-filter:backdrop-blur-sm"
      className="z-[70] max-h-[94vh] w-[min(94vw,720px)] overflow-y-auto rounded-2xl bg-white p-4 sm:p-5"
    >
      <DialogHeader className="pr-10">
        <DialogTitle className="text-lg font-black text-neutral-950">QR chuyển khoản</DialogTitle>
        <DialogDescription>
          Đưa màn hình này cho khách quét, kiểm tra đúng tổng tiền trước khi xác nhận.
        </DialogDescription>
      </DialogHeader>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => onOpenChange(false)}
        aria-label="Đóng QR phóng to"
        className="absolute right-3 top-3 rounded-full"
      >
        <X className="h-5 w-5" />
      </Button>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px] md:items-center">
        <div className="flex justify-center rounded-2xl border border-neutral-100 bg-neutral-50 p-3 sm:p-4">
          {qrImageUrl && (
            <img
              src={qrImageUrl}
              alt="QR chuyển khoản phóng to"
              className="aspect-square w-[90vw] max-w-[520px] rounded-xl bg-white object-contain shadow-sm sm:w-full lg:max-w-[640px]"
            />
          )}
        </div>

        <div className="space-y-2 rounded-2xl border border-neutral-100 bg-white p-3 text-sm md:p-4">
          {paymentInfoItems.map((item) => (
            <div
              key={item.label}
              className={item.highlight ? 'rounded-xl bg-emerald-50 p-3' : 'border-b border-neutral-100 pb-2 last:border-b-0 last:pb-0'}
            >
              <span className={`block text-xs font-bold ${item.highlight ? 'text-emerald-700' : 'text-neutral-500'}`}>
                {item.label}
              </span>
              <span className={`break-words font-black ${item.highlight ? 'text-xl text-emerald-800' : 'text-neutral-950'}`}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <DialogFooter className="sm:justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={isSubmitting}
          className="h-10 rounded-xl"
        >
          Đóng
        </Button>
        <Button
          type="button"
          onClick={onConfirmPaid}
          disabled={isSubmitting}
          className="h-10 rounded-xl bg-emerald-600 font-bold text-white hover:bg-emerald-700"
        >
          {isSubmitting ? (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="mr-1.5 h-4 w-4" />
          )}
          Đã nhận tiền
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

interface BillPaymentModalProps {
  open: boolean;
  bill: PayableBill | null;
  restaurantId: string;
  onOpenChange: (open: boolean) => void;
  onPaid?: () => Promise<void> | void;
}

const getBillId = (bill: PayableBill | null) => {
  if (!bill) return '';
  return ('billId' in bill ? bill.billId : bill.id || bill._id || '') || '';
};

export const BillPaymentModal: React.FC<BillPaymentModalProps> = ({
  open,
  bill,
  restaurantId,
  onOpenChange,
  onPaid
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [cashReceived, setCashReceived] = useState('');
  const [settings, setSettings] = useState<RestaurantPaymentSettings | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isQrExpanded, setIsQrExpanded] = useState(false);

  const billId = getBillId(bill);
  const totalAmount = Number(bill?.totalAmount || 0);
  const totalItems = Number(bill?.totalItems || 0);
  const orderCount = Number(('orderCount' in (bill || {}) ? (bill as ActiveBill).orderCount : (bill as Bill | null)?.orderIds?.length) || 0);
  const receivedAmount = Number(cashReceived || 0);
  const changeAmount = Math.max(0, receivedAmount - totalAmount);
  const isCashInvalid = paymentMethod === PaymentMethod.CASH && (!cashReceived || !Number.isFinite(receivedAmount) || receivedAmount < totalAmount);

  useEffect(() => {
    if (!open) {
      setPaymentMethod(PaymentMethod.CASH);
      setCashReceived('');
      setSettings(null);
      setIsQrExpanded(false);
      return;
    }

    if (!restaurantId) return;
    setIsLoadingSettings(true);
    paymentSettingsService.getPaymentSettings(restaurantId)
      .then(setSettings)
      .catch(() => {
        setSettings(null);
      })
      .finally(() => setIsLoadingSettings(false));
  }, [open, restaurantId]);

  const paymentInfoItems = useMemo(() => {
    if (!settings) return [];
    return [
      settings.bankAccountHolder ? { label: 'Chủ tài khoản', value: settings.bankAccountHolder } : null,
      settings.bankName ? { label: 'Ngân hàng', value: settings.bankName } : null,
      settings.bankAccountNumber ? { label: 'Số tài khoản', value: settings.bankAccountNumber } : null,
      { label: 'Tổng bill cần chuyển', value: formatCurrency(totalAmount), highlight: true }
    ].filter(Boolean) as PaymentInfoItem[];
  }, [settings, totalAmount]);

  const handlePaymentMethodChange = (value: string) => {
    const nextMethod = value as PaymentMethod;
    setPaymentMethod(nextMethod);
    if (nextMethod !== PaymentMethod.BANK_TRANSFER) {
      setIsQrExpanded(false);
    }
  };

  const handleConfirm = async () => {
    if (!billId) {
      toast.error('Không xác định được bill cần thanh toán');
      return;
    }

    if (isCashInvalid) {
      toast.error('Tiền khách đưa phải lớn hơn hoặc bằng tổng bill');
      return;
    }

    setIsSubmitting(true);
    try {
      await billService.payBill(billId, {
        paymentMethod,
        cashReceived: paymentMethod === PaymentMethod.CASH ? receivedAmount : undefined
      });
      toast.success('Thanh toán bill thành công. Bàn đã được giải phóng.');
      onOpenChange(false);
      await onPaid?.();
    } catch (error: any) {
      toast.error(error.message || 'Không thể thanh toán bill');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto bg-white sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-neutral-950">
            <Receipt className="h-5 w-5 text-emerald-600" />
            Thanh toán bill - Bàn {bill?.tableNumber || '-'}
          </DialogTitle>
          <DialogDescription>
            Thanh toán một lần cho toàn bộ bill trong phiên bàn. Các order con sẽ được hoàn thành sau khi xác nhận.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 rounded-xl border border-neutral-100 bg-neutral-50 p-3 text-sm sm:grid-cols-4">
            <div>
              <span className="block text-xs font-semibold text-neutral-500">Bill</span>
              <span className="font-mono text-xs font-bold text-neutral-900">{bill?.billCode || '-'}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-neutral-500">Số order</span>
              <span className="font-bold text-neutral-900">{orderCount}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-neutral-500">Tổng món</span>
              <span className="font-bold text-neutral-900">{totalItems}</span>
            </div>
            <div className="text-left sm:text-right">
              <span className="block text-xs font-semibold text-neutral-500">Tổng bill</span>
              <span className="text-base font-black text-emerald-700">{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          <RadioGroup
            value={paymentMethod}
            onValueChange={handlePaymentMethodChange}
            className="grid gap-3 sm:grid-cols-2"
          >
            <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${paymentMethod === PaymentMethod.CASH ? 'border-emerald-500 bg-emerald-50' : 'border-neutral-200 bg-white hover:bg-neutral-50'}`}>
              <RadioGroupItem value={PaymentMethod.CASH} />
              <Banknote className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-bold text-neutral-900">Tiền mặt</span>
            </label>
            <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${paymentMethod === PaymentMethod.BANK_TRANSFER ? 'border-emerald-500 bg-emerald-50' : 'border-neutral-200 bg-white hover:bg-neutral-50'}`}>
              <RadioGroupItem value={PaymentMethod.BANK_TRANSFER} />
              <Landmark className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-bold text-neutral-900">Chuyển khoản / QR</span>
            </label>
          </RadioGroup>

          {paymentMethod === PaymentMethod.CASH ? (
            <div className="space-y-3 rounded-xl border border-neutral-100 bg-white p-4">
              <div className="space-y-1.5">
                <Label htmlFor="cashReceived" className="text-xs font-bold text-neutral-600">
                  Tiền khách đưa
                </Label>
                <Input
                  id="cashReceived"
                  type="number"
                  min={0}
                  step={1000}
                  value={cashReceived}
                  onChange={(event) => setCashReceived(event.target.value)}
                  placeholder="VD: 100000"
                  className="rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-neutral-50 p-3">
                  <span className="block text-xs font-semibold text-neutral-500">Tổng bill</span>
                  <span className="font-bold text-neutral-900">{formatCurrency(totalAmount)}</span>
                </div>
                <div className="rounded-lg bg-emerald-50 p-3">
                  <span className="block text-xs font-semibold text-emerald-700">Tiền trả lại</span>
                  <span className="font-bold text-emerald-800">{formatCurrency(changeAmount)}</span>
                </div>
              </div>
              {isCashInvalid && cashReceived && (
                <p className="text-xs font-semibold text-red-600">Tiền khách đưa chưa đủ để thanh toán bill.</p>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-neutral-100 bg-white p-4">
              {isLoadingSettings ? (
                <div className="flex items-center justify-center gap-2 py-10 text-sm font-semibold text-neutral-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang tải QR chuyển khoản...
                </div>
              ) : settings?.bankQrImageUrl ? (
                <QrPreviewCard
                  qrImageUrl={settings.bankQrImageUrl}
                  accountHolder={settings.bankAccountHolder}
                  bankInfoItems={paymentInfoItems}
                  onExpand={() => setIsQrExpanded(true)}
                />
              ) : (
                <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p className="font-bold">Chủ nhà hàng chưa cấu hình QR chuyển khoản.</p>
                    <p className="mt-1 text-xs font-medium">Restaurant Admin/Staff không thể upload tại đây. Vui lòng liên hệ Chủ nhà hàng.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Đóng
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting || isCashInvalid}
            className="bg-emerald-600 text-white hover:bg-emerald-700"
          >
            {isSubmitting ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-1.5 h-4 w-4" />
            )}
            {paymentMethod === PaymentMethod.CASH ? 'Xác nhận thanh toán' : 'Xác nhận đã nhận tiền'}
          </Button>
        </DialogFooter>

        <QrFullscreenModal
          open={isQrExpanded && paymentMethod === PaymentMethod.BANK_TRANSFER && Boolean(settings?.bankQrImageUrl)}
          qrImageUrl={settings?.bankQrImageUrl}
          paymentInfoItems={paymentInfoItems}
          isSubmitting={isSubmitting}
          onOpenChange={setIsQrExpanded}
          onConfirmPaid={handleConfirm}
        />
      </DialogContent>
    </Dialog>
  );
};

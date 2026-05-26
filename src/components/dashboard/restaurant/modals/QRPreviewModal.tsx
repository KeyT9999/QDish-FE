import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const QRCode = React.lazy(() =>
  import('qrcode.react').then((module) => ({ default: module.QRCodeSVG }))
);

export interface QRPreviewModalProps {
  tableCode: string | null;
  restaurantId: string;
  restaurantName: string;
  onClose: () => void;
}

export const QRPreviewModal: React.FC<QRPreviewModalProps> = ({
  tableCode,
  restaurantId,
  restaurantName,
  onClose
}) => {
  return (
    <Dialog open={!!tableCode} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-xs bg-white rounded-2xl p-6 text-center">
        <DialogHeader className="border-b border-gray-100 pb-2">
          <DialogTitle className="text-base font-bold text-gray-900">QR Code Bàn {tableCode}</DialogTitle>
          <DialogDescription className="text-[10px] text-gray-500">Dùng để in ấn dán trực tiếp tại bàn phục vụ.</DialogDescription>
        </DialogHeader>
        {tableCode && (
          <div className="flex flex-col items-center justify-center py-4 space-y-4">
            <div className="p-3 border border-gray-200 rounded-2xl bg-white shadow-inner">
              <React.Suspense fallback={<div className="w-[180px] h-[180px] rounded-xl bg-neutral-100 animate-pulse" />}>
                <QRCode
                  value={`${window.location.origin}/order?r=${restaurantId}&t=${tableCode}`}
                  size={180}
                  level="H"
                  includeMargin
                />
              </React.Suspense>
            </div>
            <p className="text-xs font-semibold text-gray-700">Bàn {tableCode} • {restaurantName}</p>
            <Button onClick={() => window.print()} className="bg-gray-900 hover:bg-black text-white rounded-xl font-bold w-full">In mã QR</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

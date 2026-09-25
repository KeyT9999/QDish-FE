import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Loader2, Printer, Sparkles } from 'lucide-react';
import { downloadSingleTableQR, getTableFileName } from '@/utils/qrDownload';
import { toast } from 'sonner';

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
  const [isDownloading, setIsDownloading] = useState(false);

  const fileName = tableCode ? getTableFileName(tableCode) : '';

  const handleDownload = async () => {
    if (!tableCode) return;
    setIsDownloading(true);
    try {
      await downloadSingleTableQR(restaurantId, tableCode, restaurantName);
      toast.success(`Đã tải thành công ảnh ${fileName}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Lỗi khi tải ảnh mã QR');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={!!tableCode} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-sm bg-white rounded-3xl p-6 text-center shadow-2xl border-neutral-200/80">
        <DialogHeader className="border-b border-neutral-100 pb-3 text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <Sparkles className="h-5 w-5" />
          </div>
          <DialogTitle className="text-lg font-extrabold text-neutral-900">
            Mã QR Bàn {tableCode}
          </DialogTitle>
          <DialogDescription className="text-xs text-neutral-500">
            Khách quét mã để xem thực đơn & đặt món tại chỗ.
          </DialogDescription>
        </DialogHeader>

        {tableCode && (
          <div className="flex flex-col items-center justify-center py-3 space-y-4">
            <div className="relative p-4 border border-emerald-100 rounded-3xl bg-gradient-to-b from-white to-emerald-50/30 shadow-md">
              <React.Suspense fallback={<div className="w-[190px] h-[190px] rounded-2xl bg-neutral-100 animate-pulse" />}>
                <QRCode
                  value={`${window.location.origin}/order?r=${restaurantId}&t=${tableCode}`}
                  size={190}
                  level="H"
                  includeMargin
                />
              </React.Suspense>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-bold text-neutral-800">
                Bàn {tableCode} {restaurantName ? `• ${restaurantName}` : ''}
              </p>
              <p className="text-[11px] font-mono font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block">
                Tên file xuất: {fileName}
              </p>
            </div>

            <div className="w-full space-y-2 pt-1">
              <Button
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm flex items-center justify-center gap-2 transition-all duration-150"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang tạo ảnh {fileName}...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Tải ảnh ({fileName})
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => window.print()}
                className="w-full h-10 border-neutral-200 text-neutral-700 hover:bg-neutral-50 rounded-xl font-semibold flex items-center justify-center gap-2 text-xs"
              >
                <Printer className="h-4 w-4 text-neutral-500" />
                In trực tiếp mã QR
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

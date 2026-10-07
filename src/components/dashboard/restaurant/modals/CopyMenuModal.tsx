import React, { useState, useEffect, useMemo } from 'react';
import { Restaurant } from '@/types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { ownerRestaurantService } from '@/services/ownerRestaurantService';
import { useOwnerConsoleLocale } from '@/i18n/OwnerConsoleLocaleContext';

export interface CopyMenuModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetRestaurant: Restaurant | null;
  restaurants: Restaurant[];
  onSuccess: () => void;
}

export const CopyMenuModal: React.FC<CopyMenuModalProps> = ({
  open,
  onOpenChange,
  targetRestaurant,
  restaurants,
  onSuccess
}) => {
  const { t } = useOwnerConsoleLocale();
  const [sourceId, setSourceId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter out the target restaurant from the options list
  const availableSources = useMemo(() => restaurants.filter(
    r => targetRestaurant && (r.id || r._id) !== (targetRestaurant.id || targetRestaurant._id)
  ), [restaurants, targetRestaurant]);

  useEffect(() => {
    if (open) {
      setSourceId(availableSources[0] ? (availableSources[0].id || availableSources[0]._id || '') : '');
    }
  }, [open, availableSources]);

  const handleCopy = async () => {
    if (!targetRestaurant) return;
    const targetId = targetRestaurant.id || targetRestaurant._id;
    if (!targetId || !sourceId) {
      toast.error(t('Vui lòng chọn chi nhánh nguồn để sao chép thực đơn.'));
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading(t('Đang tiến hành nhân bản thực đơn, vui lòng đợi...'));

    try {
      const response = await ownerRestaurantService.copyMenu(targetId, sourceId);
      toast.success(response.message || t('Sao chép thực đơn thành công!'), { id: toastId });
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || t('Có lỗi xảy ra trong quá trình sao chép thực đơn.'), { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Copy className="w-5 h-5 text-emerald-600" />
            {t('Sao chép thực đơn chi nhánh')}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            {t('Sao chép toàn bộ danh mục và món ăn từ một chi nhánh cũ sang chi nhánh {name}.', { name: targetRestaurant?.name || '' })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          {availableSources.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-xs">
              {t('Không có chi nhánh nguồn khả dụng. Hãy tạo thêm chi nhánh có thực đơn trước.')}
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="sourceBranch" className="text-xs text-slate-600 font-semibold">
                  {t('Chọn chi nhánh nguồn (Sao chép từ) *')}
                </Label>
                <select
                  id="sourceBranch"
                  value={sourceId}
                  onChange={(e) => setSourceId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {availableSources.map((r) => (
                    <option key={r.id || r._id} value={r.id || r._id}>
                      {r.name} (Admin: {r.username})
                    </option>
                  ))}
                </select>
              </div>

              {/* Warning Alert Panel */}
              <div className="flex gap-2.5 p-3.5 rounded-xl border border-amber-100 bg-amber-50/40 text-xs text-amber-800 font-medium leading-relaxed">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  {t('Hệ thống sao chép danh mục, món ăn, định lượng nguyên liệu và hồ sơ dinh dưỡng. Danh mục trùng tên sẽ được gộp thay vì tạo bản trùng lặp.')}
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="pt-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            className="rounded-xl text-xs font-bold"
            disabled={isSubmitting}
          >
            {t('Hủy')}
          </Button>
          <Button 
            onClick={handleCopy} 
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md"
            disabled={isSubmitting || availableSources.length === 0}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('Đang sao chép...')}
              </span>
            ) : (
              t('Bắt đầu sao chép')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useOwnerConsoleLocale } from '@/i18n/OwnerConsoleLocaleContext';

interface MenuRecommendationDialogProps {
  open: boolean;
  recommendations: string[];
  onOpenChange: (open: boolean) => void;
  onOpenRecipeBuilder: () => void;
  onOpenMenu: () => void;
}

export const MenuRecommendationDialog = ({
  open,
  recommendations,
  onOpenChange,
  onOpenRecipeBuilder,
  onOpenMenu,
}: MenuRecommendationDialogProps) => {
  const { t } = useOwnerConsoleLocale();
  return (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{t('Gợi ý tối ưu thực đơn')}</DialogTitle>
        <DialogDescription>
          {recommendations.length > 0
            ? t('Gợi ý dựa trên thuộc tính thực đơn đã khai báo. Trong Recipe Builder, bạn tự chọn món và nguyên liệu từ cơ sở dữ liệu QDish; hệ thống không tự tạo hoặc lưu món.')
            : t('Hiện không có khoảng trống thực đơn cần xử lý theo các thuộc tính đang theo dõi.')}
        </DialogDescription>
      </DialogHeader>

      {recommendations.length > 0 ? (
        <ul className="space-y-3" aria-label={t('Danh sách gợi ý thực đơn')}>
          {recommendations.map((recommendation, index) => (
            <li
              key={`${recommendation}-${index}`}
              className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3"
            >
              <span
                aria-hidden="true"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-emerald-700 shadow-sm"
              >
                {index + 1}
              </span>
              <p className="pt-1 text-sm leading-relaxed text-neutral-700">{recommendation}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p role="status" className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
          {t('Không có khoảng trống thực đơn cần xử lý. Các nhóm thuộc tính đang theo dõi đã có món phù hợp.')}
        </p>
      )}

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>{t('Đóng')}</Button>
        {recommendations.length > 0 ? (
          <Button onClick={onOpenRecipeBuilder}>{t('Mở Recipe Builder')}</Button>
        ) : (
          <Button onClick={onOpenMenu}>{t('Xem thực đơn')}</Button>
        )}
      </DialogFooter>
    </DialogContent>
  </Dialog>
  );
};

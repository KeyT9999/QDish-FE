import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Check, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Allergen, MenuItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  getInitialMenuReviewContains,
  normalizeMenuReviewAllergens,
  validateMenuAllergenReviewDraft,
  MenuAllergenReviewMethod,
  MenuAllergenReviewSourceType
} from '@/services/menuAllergenReviewPolicy';
import { MenuAllergenReviewPayload } from '@/services/menuService';
import { useOwnerConsoleLocale } from '@/i18n/OwnerConsoleLocaleContext';

const OPTIONS = [
  { code: Allergen.GLUTEN, label: 'Gluten / lúa mì' },
  { code: Allergen.DAIRY, label: 'Sữa' },
  { code: Allergen.PEANUT, label: 'Đậu phộng' },
  { code: Allergen.TREE_NUTS, label: 'Hạt cây (óc chó, hạnh nhân, hạt điều...)' },
  { code: Allergen.SESAME, label: 'Mè' },
  { code: Allergen.SHELLFISH, label: 'Hải sản có vỏ' },
  { code: Allergen.SOY, label: 'Đậu nành' },
  { code: Allergen.EGGS, label: 'Trứng' },
  { code: Allergen.FISH, label: 'Cá' }
] as const;

interface MenuAllergenReviewModalProps {
  open: boolean;
  item: MenuItem | null;
  onOpenChange: (open: boolean) => void;
  onSave: (itemId: string, payload: MenuAllergenReviewPayload) => Promise<void>;
}

export const MenuAllergenReviewModal: React.FC<MenuAllergenReviewModalProps> = ({ open, item, onOpenChange, onSave }) => {
  const { t } = useOwnerConsoleLocale();
  const recipeComplete = Boolean(
    item?.ingredients?.length
    && item.allergenCoverageStatus === 'COMPLETE'
    && (item.allergenUnverifiedIngredientCount ?? 0) === 0
  );
  const candidates = useMemo(
    () => normalizeMenuReviewAllergens(item?.allergens?.map(String)),
    [item?.allergens]
  );
  const [method, setMethod] = useState<MenuAllergenReviewMethod>('MANUAL');
  const [contains, setContains] = useState<string[]>([]);
  const [mayContain, setMayContain] = useState<string[]>([]);
  const [sourceType, setSourceType] = useState<MenuAllergenReviewSourceType>('STAFF_ATTESTATION');
  const [sourceNote, setSourceNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMethod(recipeComplete ? 'RECIPE' : 'MANUAL');
    setContains(getInitialMenuReviewContains(
      item?.allergenInfoStatus,
      item?.reviewedAllergens?.map(String),
      item?.allergens?.map(String)
    ));
    setMayContain((item?.mayContainAllergens ?? []).map(String));
    setSourceType(recipeComplete ? 'RESTAURANT_RECIPE' : 'STAFF_ATTESTATION');
    setSourceNote('');
  }, [open, item, recipeComplete]);

  const validation = useMemo(() => validateMenuAllergenReviewDraft({
    method,
    containsAllergens: contains,
    mayContainAllergens: mayContain,
    sourceType,
    sourceNote
  }, recipeComplete, candidates), [method, contains, mayContain, sourceType, sourceNote, recipeComplete, candidates]);

  const toggle = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, code: string) => {
    setList((current) => current.includes(code) ? current.filter((value) => value !== code) : [...current, code]);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!item || !validation.valid) return;
    const itemId = item.id || item._id || '';
    if (!itemId) return;
    setIsSubmitting(true);
    try {
      await onSave(itemId, {
        method,
        containsAllergens: contains,
        mayContainAllergens: mayContain,
        sourceType,
        sourceNote: sourceNote.trim()
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const reason = validation.valid ? '' : validation.reason === 'RECIPE_INCOMPLETE'
    ? t('Công thức còn thiếu hoặc có nguyên liệu chưa được xác minh. Hãy khai báo thủ công hoặc hoàn thiện nguyên liệu trước.')
    : validation.reason === 'EVIDENCE_REQUIRED'
    ? t('Nhập nguồn và nội dung đã đối chiếu (tối đa 500 ký tự).')
      : validation.reason === 'LISTS_OVERLAP'
        ? t('Không chọn cùng một allergen ở cả “Có chứa” và “Có thể chứa”.')
        : validation.reason === 'RECIPE_ALLERGENS_MISSING'
          ? t('Không thể bỏ allergen đã xác minh từ nguyên liệu của công thức.')
          : t('Xác minh theo công thức cần chọn nguồn “Công thức nhà hàng”.');

  const candidateLabels = candidates.map((code) => {
    const label = OPTIONS.find((option) => option.code === code.toUpperCase())?.label;
    return label ? t(label) : code;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-neutral-900">
            <ShieldCheck className="h-5 w-5 text-emerald-600" /> {t('Xác nhận dị ứng')} · {item?.name}
          </DialogTitle>
          <DialogDescription className="text-sm leading-6 text-neutral-600">
            {t('Khai báo allergen đã kiểm tra cho món này. Khách sẽ thấy danh sách và cảnh báo không chặn quyền gọi món.')}
          </DialogDescription>
        </DialogHeader>

        {item?.allergenInfoStatus === 'REVIEWED' && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs leading-5 text-emerald-900">
            {t('Món đã có khai báo được xác nhận. Lưu biểu mẫu này sẽ thay thế khai báo cũ bằng nội dung vừa rà soát.')}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <section className="space-y-2">
            <Label className="font-semibold text-neutral-800">{t('Cách kiểm tra')}</Label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  setMethod('RECIPE');
                  setSourceType('RESTAURANT_RECIPE');
                  setContains((current) => normalizeMenuReviewAllergens([...current, ...candidates]));
                }}
                disabled={!recipeComplete}
                aria-pressed={method === 'RECIPE'}
                className={`rounded-xl border p-3 text-left text-sm transition ${method === 'RECIPE' ? 'border-emerald-500 bg-emerald-50' : 'border-neutral-200'} disabled:cursor-not-allowed disabled:opacity-50`}
              >
                <span className="block font-semibold">{t('Theo công thức món')}</span>
                <span className="mt-1 block text-xs text-neutral-500">{t('Chỉ bật khi công thức đầy đủ và mọi nguyên liệu đã xác minh.')}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMethod('MANUAL');
                  setSourceType('STAFF_ATTESTATION');
                }}
                aria-pressed={method === 'MANUAL'}
                className={`rounded-xl border p-3 text-left text-sm transition ${method === 'MANUAL' ? 'border-emerald-500 bg-emerald-50' : 'border-neutral-200'}`}
              >
                <span className="block font-semibold">{t('Khai báo thủ công')}</span>
                <span className="mt-1 block text-xs text-neutral-500">{t('Dùng khi nhà hàng chưa quản lý công thức trong QDish.')}</span>
              </button>
            </div>
          </section>

          <section className="space-y-3">
            <div>
              <h3 className="text-sm font-bold text-neutral-800">{t('Có chứa')}</h3>
              <p className="text-xs text-neutral-500">{t('Chọn allergen có trong thành phần món ăn.')}{method === 'RECIPE' && candidates.length > 0 ? ` ${t('Allergen đã xác minh trong công thức được giữ cố định.')}` : ''}</p>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {OPTIONS.map((option) => (
                <label key={`contains-${option.code}`} className="flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-700">
                  <input
                    type="checkbox"
                    checked={contains.includes(option.code)}
                    disabled={method === 'RECIPE' && candidates.includes(option.code)}
                    onChange={() => toggle(contains, setContains, option.code)}
                  />
                  {t(option.label)}
                </label>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <div>
              <h3 className="text-sm font-bold text-neutral-800">{t('Có thể chứa do lây nhiễm chéo')}</h3>
              <p className="text-xs text-neutral-500">{t('Chọn nguy cơ có thể xảy ra khi dùng chung dụng cụ hoặc khu vực chế biến.')}</p>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {OPTIONS.map((option) => (
                <label key={`may-contain-${option.code}`} className="flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-700">
                  <input type="checkbox" checked={mayContain.includes(option.code)} onChange={() => toggle(mayContain, setMayContain, option.code)} />
                  {t(option.label)}
                </label>
              ))}
            </div>
          </section>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-950">
            <div className="flex gap-2 font-semibold"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {t('Danh sách để trống là một xác nhận có chủ ý')}</div>
            <p className="mt-1">{t('Các lựa chọn được gợi ý từ dữ liệu hiện có để tránh bỏ sót. Hãy đối chiếu từng mục với nguồn thực tế; chỉ bỏ chọn khi nguồn xác nhận món không chứa allergen đó. Danh sách để trống chỉ lưu khi nhân viên chủ động xác nhận đã kiểm tra đầy đủ.')}</p>
            <p className="mt-2"><strong>{t('Ứng viên hiện có')}:</strong> {candidateLabels.length ? candidateLabels.join(', ') : t('Chưa có allergen ứng viên.')}</p>
            {item?.allergenCoverageStatus !== 'COMPLETE' && (
              <p className="mt-1">{t('Độ bao phủ công thức: chưa đầy đủ')}{(item?.allergenUnverifiedIngredientCount ?? 0) > 0 ? ` · ${t('{count} ingredients not verified', { count: item?.allergenUnverifiedIngredientCount ?? 0 })}` : ''}.</p>
            )}
          </div>

          <section className="space-y-2">
            <Label htmlFor="allergen-review-source">{t('Nguồn xác nhận')}</Label>
            <select
              id="allergen-review-source"
              value={sourceType}
              disabled={method === 'RECIPE'}
              onChange={(event) => setSourceType(event.target.value as MenuAllergenReviewSourceType)}
              className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm"
            >
              {method === 'RECIPE' ? (
                <option value="RESTAURANT_RECIPE">{t('Công thức nhà hàng')}</option>
              ) : (
                <>
                  <option value="STAFF_ATTESTATION">{t('Nhân viên đối chiếu')}</option>
                  <option value="SUPPLIER_LABEL">{t('Nhãn nhà cung cấp')}</option>
                  <option value="RESTAURANT_RECIPE">{t('Công thức nhà hàng')}</option>
                </>
              )}
            </select>
            <Label htmlFor="allergen-review-note">{t('Ghi chú nguồn / nội dung đã kiểm tra *')}</Label>
            <Textarea
              id="allergen-review-note"
              value={sourceNote}
              onChange={(event) => setSourceNote(event.target.value)}
              maxLength={500}
              placeholder={t('Ví dụ: Đối chiếu công thức và nhãn của nhà cung cấp.')}
              className="min-h-20 resize-y"
            />
            <div className="text-right text-[11px] text-neutral-500">{sourceNote.trim().length}/500</div>
          </section>

          {!validation.valid && (
            <p role="alert" className="text-xs font-medium text-rose-700">{reason}</p>
          )}

          <DialogFooter className="gap-2 sm:justify-between">
            <div className="flex items-center gap-1 text-[11px] text-neutral-500"><ShieldAlert className="h-3.5 w-3.5" /> {t('Thông tin chỉ có hiệu lực sau khi lưu xác nhận.')}</div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('Hủy')}</Button>
              <Button type="submit" disabled={!validation.valid || isSubmitting} className="bg-emerald-600 text-white hover:bg-emerald-700">
                <Check className="mr-1.5 h-4 w-4" /> {isSubmitting ? t('Đang lưu...') : t('Lưu xác nhận')}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

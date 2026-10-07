import React, { useEffect, useState } from 'react';
import { Bot, Check, Languages, Loader2, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import type { ManagedTranslations, MenuLocale, TranslationReviewEntry } from '@/types/menuTranslation';

type TranslationValue = { name: string; description?: string };

interface TranslationEditorDialogProps<T extends TranslationValue> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceName: string;
  sourceDescription?: string;
  translations?: ManagedTranslations<T>;
  onGenerate: () => Promise<ManagedTranslations<T>>;
  onSave: (locale: Exclude<MenuLocale, 'vi'>, value: T, publish: boolean) => Promise<ManagedTranslations<T>>;
  kind: 'dish' | 'category';
  allowPublish?: boolean;
}

const LOCALES: Array<{ locale: Exclude<MenuLocale, 'vi'>; label: string; short: string }> = [
  { locale: 'en', label: 'English', short: 'EN' },
  { locale: 'zh-CN', label: '简体中文', short: '中文' },
];

function getStatusLabel<T>(entry?: TranslationReviewEntry<T>) {
  if (!entry) return { label: 'Chưa dịch', style: 'bg-neutral-100 text-neutral-600 border-neutral-200' };
  if (entry.displayStatus === 'DRAFT') return { label: 'Bản nháp', style: 'bg-amber-50 text-amber-800 border-amber-200' };
  if (entry.displayStatus === 'STALE') return { label: 'Cần dịch lại', style: 'bg-rose-50 text-rose-800 border-rose-200' };
  return { label: 'Đã duyệt', style: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
}

export function TranslationEditorDialog<T extends TranslationValue>({
  open,
  onOpenChange,
  sourceName,
  sourceDescription,
  translations,
  onGenerate,
  onSave,
  kind,
  allowPublish = true,
}: TranslationEditorDialogProps<T>) {
  const [locale, setLocale] = useState<Exclude<MenuLocale, 'vi'>>('en');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const entry = translations?.[locale];
    const value = entry?.draft?.value ?? entry?.approved?.value;
    setName(value?.name ?? '');
    setDescription(value?.description ?? '');
  }, [open, locale, sourceName, sourceDescription, translations]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await onGenerate();
      const value = result[locale]?.draft?.value;
      if (value) {
        setName(value.name);
        setDescription(value.description ?? '');
      }
      toast.success('Đã tạo bản nháp tiếng Anh và tiếng Trung. Hãy kiểm tra trước khi duyệt.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể tạo bản dịch lúc này.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async (publish: boolean) => {
    const cleanName = name.trim();
    if (!cleanName) return;
    setIsSaving(true);
    try {
      const value = (kind === 'dish'
        ? { name: cleanName, description: description.trim() }
        : { name: cleanName }) as T;
      const result = await onSave(locale, value, publish);
      const nextValue = publish ? result[locale]?.approved?.value : result[locale]?.draft?.value;
      if (nextValue) {
        setName(nextValue.name);
        setDescription(nextValue.description ?? '');
      }
      toast.success(publish ? 'Đã duyệt bản dịch và hiển thị cho khách.' : 'Đã lưu bản nháp.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể lưu bản dịch lúc này.');
    } finally {
      setIsSaving(false);
    }
  };

  const status = getStatusLabel(translations?.[locale]);
  const hasApproved = translations?.[locale]?.approved?.status === 'APPROVED';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="grid max-h-[92dvh] w-[calc(100vw-2rem)] min-w-0 max-w-2xl grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-0 shadow-xl max-sm:fixed max-sm:inset-x-0 max-sm:bottom-0 max-sm:left-0 max-sm:top-auto max-sm:h-[92dvh] max-sm:max-h-[92dvh] max-sm:w-full max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-b-none max-sm:rounded-t-2xl sm:max-h-[92vh] sm:max-w-2xl"
      >
        <DialogHeader className="relative min-w-0 border-b border-neutral-100 px-4 pb-3 pt-5 sm:px-6 sm:pb-4 sm:pt-6">
          <DialogTitle className="flex min-w-0 flex-wrap items-center gap-2 pr-12 text-lg font-bold text-neutral-900">
            <Languages className="h-5 w-5 shrink-0 text-emerald-700" />
            <span className="break-words">Bản dịch {kind === 'dish' ? 'món ăn' : 'danh mục'}</span>
          </DialogTitle>
          <DialogDescription className="min-w-0 break-words pr-8 text-xs leading-5 text-neutral-600 sm:pr-0 sm:text-sm sm:leading-6">
            Nội dung tiếng Việt là bản gốc. AI tạo bản nháp để nhà hàng kiểm tra và duyệt trước khi khách nhìn thấy.
          </DialogDescription>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Đóng bản dịch"
            onClick={() => onOpenChange(false)}
            className="absolute right-3 top-3 h-11 w-11 rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
          >
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>

        <div className="min-h-0 space-y-5 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5">
          <section className="min-w-0 rounded-xl border border-neutral-200 bg-neutral-50 p-3.5" aria-label="Nội dung tiếng Việt gốc">
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Bản gốc · Tiếng Việt</p>
            <p className="mt-1 break-words text-sm font-semibold text-neutral-900">{sourceName}</p>
            {sourceDescription && <p className="mt-1 break-words text-xs leading-5 text-neutral-600">{sourceDescription}</p>}
          </section>

          <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
            <div role="group" aria-label="Chọn ngôn ngữ bản dịch" className="flex rounded-xl border border-neutral-200 bg-neutral-50 p-1">
              {LOCALES.map((option) => (
                <button
                  key={option.locale}
                  type="button"
                  aria-pressed={locale === option.locale}
                  onClick={() => setLocale(option.locale)}
                  className={`min-h-11 rounded-lg px-4 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 ${locale === option.locale ? 'bg-emerald-700 text-white shadow-sm' : 'text-neutral-600 hover:bg-white hover:text-neutral-900'}`}
                >
                  {option.short}
                </button>
              ))}
            </div>
            <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold ${status.style}`}>
              {status.label}
            </span>
          </div>

          <div className="grid min-w-0 gap-4">
            <div className="min-w-0 space-y-2">
              <Label htmlFor="translation-name" className="text-xs font-bold text-neutral-700">Tên · {LOCALES.find((option) => option.locale === locale)?.label}</Label>
              <Input id="translation-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={200} className="min-h-11 rounded-xl bg-white" />
            </div>
            {kind === 'dish' && (
              <div className="min-w-0 space-y-2">
                <Label htmlFor="translation-description" className="text-xs font-bold text-neutral-700">Mô tả</Label>
                <Textarea id="translation-description" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={2000} rows={3} className="rounded-xl bg-white" />
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-2 border-t border-neutral-100 bg-white px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+1rem)] sm:grid-cols-[1fr_auto] sm:items-center sm:px-6 sm:py-4">
          <Button type="button" variant="outline" onClick={() => void handleGenerate()} disabled={isGenerating || isSaving} className="min-h-11 w-full rounded-xl border-emerald-200 text-emerald-800 hover:bg-emerald-50 sm:w-auto sm:justify-self-start">
            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            {isGenerating ? 'Đang dịch…' : 'Tạo bản nháp AI'}
          </Button>
          <div className={`grid min-w-0 gap-2 sm:flex sm:justify-end ${allowPublish ? 'grid-cols-2' : 'grid-cols-1'}`}>
            <Button type="button" variant="outline" onClick={() => void handleSave(false)} disabled={!name.trim() || isSaving || isGenerating} className="min-h-11 min-w-0 rounded-xl px-3 sm:px-4">
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu nháp
            </Button>
            {allowPublish && <Button type="button" onClick={() => void handleSave(true)} disabled={!name.trim() || isSaving || isGenerating} className="min-h-11 min-w-0 rounded-xl bg-emerald-700 px-3 text-white hover:bg-emerald-800 sm:px-4">
              {hasApproved ? <Check className="mr-2 h-4 w-4 shrink-0" /> : <Bot className="mr-2 h-4 w-4 shrink-0" />}
              <span className="truncate sm:hidden">Duyệt</span>
              <span className="hidden sm:inline">Duyệt & hiển thị</span>
            </Button>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

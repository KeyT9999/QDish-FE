import { useEffect, useRef, useState } from 'react';
import { AlertCircle, ArrowLeft, CheckCircle2, ChevronRight, Clock3, Edit2, FileText, Languages, Loader2, RotateCcw, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TranslationEditorDialog } from './TranslationEditorDialog';
import { isReadyForBulkTranslationPublish, planBulkMenuTranslations } from '@/lib/bulkMenuTranslation';
import { ApiError } from '@/services/api';
import type { MenuItem } from '@/types';
import type { MenuItemTranslationValue, MenuLocale, TranslationReviewEntry } from '@/types/menuTranslation';
import { useOwnerConsoleLocale, type OwnerConsoleLocaleValue } from '@/i18n/OwnerConsoleLocaleContext';

export interface BulkMenuTranslationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  menuItems: MenuItem[];
  onGenerate: (itemId: string, options: { preserveExisting: true }) => Promise<MenuItem>;
  onPublish?: (itemIds: string[]) => Promise<{ publishedCount: number; items: MenuItem[] }>;
  onRefreshMenuItems?: () => Promise<MenuItem[]>;
  onSaveTranslation: (itemId: string, locale: Exclude<MenuLocale, 'vi'>, value: MenuItemTranslationValue, publish: boolean) => Promise<MenuItem>;
}

type Attempt = { status: 'waiting' | 'running' | 'done' | 'failed' | 'paused'; error?: string };
const getId = (item: MenuItem) => item.id || item._id || '';
const hasDraft = (item: MenuItem) => Boolean(item.translationManagement?.en?.draft || item.translationManagement?.['zh-CN']?.draft);
const errorMessage = (error: unknown, fallback: string) => error instanceof Error ? error.message : fallback;
const shouldPauseGenerationQueue = (error: unknown) => error instanceof ApiError
  && (error.status === 429 || error.code?.startsWith('TRANSLATION_PROVIDER_') === true || (error.status === 502 && error.code !== 'INVALID_TRANSLATION_OUTPUT'));

function LocalePreview({ label, entry, t }: { label: string; entry?: TranslationReviewEntry<MenuItemTranslationValue>; t: OwnerConsoleLocaleValue['t'] }) {
  const value = entry?.draft?.value ?? entry?.approved?.value;
  const statusKey = entry?.draft ? 'Bản nháp' : entry?.approved?.status === 'APPROVED' ? 'Đã duyệt' : entry?.approved ? 'Cần dịch lại' : 'Chưa dịch';
  const approved = statusKey === 'Đã duyệt';
  return (
    <section className="min-w-0 rounded-lg border border-neutral-200 bg-white p-3" aria-label={label}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-bold text-neutral-700">{label}</span>
        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${approved ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
          {approved ? <CheckCircle2 className="h-3 w-3" /> : <Clock3 className="h-3 w-3" />}{t(statusKey)}
        </span>
      </div>
      <p className="mt-2 break-words text-sm font-semibold text-neutral-900">{value?.name || t('Chưa có tên bản dịch')}</p>
      <p className="mt-1 whitespace-pre-wrap break-words text-xs leading-5 text-neutral-600">{value?.description || t('Chưa có mô tả')}</p>
    </section>
  );
}

function AttemptStatus({ attempt, t }: { attempt?: Attempt; t: OwnerConsoleLocaleValue['t'] }) {
  if (!attempt) return <span className="text-xs font-semibold text-amber-800">{t('Bản nháp đã lưu')}</span>;
  const Icon = attempt.status === 'running' ? Loader2 : attempt.status === 'done' ? CheckCircle2 : attempt.status === 'failed' ? AlertCircle : Clock3;
  const labelKey = { waiting: 'Đang chờ', running: 'Đang dịch', done: 'Đã tạo bản nháp', failed: 'Dịch thất bại', paused: 'Tạm dừng' }[attempt.status] as Parameters<OwnerConsoleLocaleValue['t']>[0];
  return <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${attempt.status === 'failed' ? 'text-rose-800' : attempt.status === 'done' ? 'text-emerald-800' : attempt.status === 'paused' ? 'text-amber-800' : 'text-neutral-600'}`}><Icon className={`h-4 w-4 shrink-0 ${attempt.status === 'running' ? 'animate-spin' : ''}`} />{t(labelKey)}</span>;
}

// Mount a fresh session on each opening so saved management records determine the next plan.
export function BulkMenuTranslationDialog(props: BulkMenuTranslationDialogProps) {
  return props.open ? <BulkTranslationSession {...props} /> : null;
}

function BulkTranslationSession({ open, onOpenChange, menuItems, onGenerate, onPublish, onRefreshMenuItems, onSaveTranslation }: BulkMenuTranslationDialogProps) {
  const { t } = useOwnerConsoleLocale();
  const [plan] = useState(() => planBulkMenuTranslations(menuItems));
  const [phase, setPhase] = useState<'confirm' | 'progress' | 'review'>('confirm');
  const [reviewMode, setReviewMode] = useState<'all' | 'saved-drafts'>('all');
  const [results, setResults] = useState<Record<string, MenuItem>>({});
  const [attempts, setAttempts] = useState<Record<string, Attempt>>(() => Object.fromEntries(plan.generationItemIds.map((id) => [id, { status: 'waiting' }])));
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [completed, setCompleted] = useState(0);
  const [total, setTotal] = useState(plan.generationItemIds.length);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isEditingRequest, setIsEditingRequest] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshRequired, setRefreshRequired] = useState(false);
  const [publicationError, setPublicationError] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [publishedCount, setPublishedCount] = useState<number | null>(null);
  const running = useRef(false);
  const mounted = useRef(true);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const itemsById = Object.fromEntries(menuItems.map((item) => [getId(item), item]));
  Object.assign(itemsById, results);
  const reviewItems = plan.reviewItemIds.map((id) => itemsById[id]).filter((item): item is MenuItem => Boolean(item));
  const savedDraftItems = reviewItems.filter(hasDraft);
  const visibleReviewItems = reviewMode === 'saved-drafts' ? savedDraftItems : reviewItems;
  const currentPlan = planBulkMenuTranslations(Object.values(itemsById));
  const generationItemIds = currentPlan.generationItemIds.filter((id) => plan.generationItemIds.includes(id));
  const currentDraftCount = Object.values(itemsById).filter(hasDraft).length;
  const failedIds = plan.generationItemIds.filter((id) => attempts[id]?.status === 'failed');
  const pausedIds = plan.generationItemIds.filter((id) => attempts[id]?.status === 'paused');
  const retryableIds = plan.generationItemIds.filter((id) => ['failed', 'paused'].includes(attempts[id]?.status ?? ''));
  const successCount = Object.values(attempts).filter((attempt) => attempt.status === 'done').length;
  const readyIds = visibleReviewItems.filter((item) => attempts[getId(item)]?.status !== 'failed' && hasDraft(item) && isReadyForBulkTranslationPublish(item)).map(getId);
  const selectedIds = readyIds.filter((id) => selected.has(id));
  const editingItem = editingId ? itemsById[editingId] : undefined;
  const busy = phase === 'progress' || isPublishing || isRefreshing;
  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 100;

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  useEffect(() => {
    if (phase !== 'confirm') headingRef.current?.focus();
  }, [phase]);

  const storeItem = (item: MenuItem) => {
    if (mounted.current) setResults((current) => ({ ...current, [getId(item)]: item }));
  };

  const openSavedDrafts = () => {
    setReviewMode('saved-drafts');
    setSelected(new Set(savedDraftItems.filter(isReadyForBulkTranslationPublish).map(getId)));
    setPhase('review');
  };

  const returnToConfirmation = () => {
    setReviewMode('all');
    setPhase('confirm');
  };

  const runGeneration = async (ids: string[], firstRun = false) => {
    if (running.current || refreshRequired) return;
    running.current = true;
    setPhase('progress');
    setCompleted(0);
    setTotal(ids.length);
    setPublicationError(null);
    setGenerationError(null);
    setPublishedCount(null);
    setAttempts((current) => ({ ...current, ...Object.fromEntries(ids.map((id) => [id, { status: 'waiting' }])) }));
    const updatedItems = { ...itemsById };
    const newlyReady: string[] = [];
    try {
      for (let index = 0; index < ids.length; index += 1) {
        const id = ids[index];
        if (!mounted.current) return;
        setCurrentId(id);
        setAttempts((current) => ({ ...current, [id]: { status: 'running' } }));
        try {
          const updated = await onGenerate(id, { preserveExisting: true });
          if (!mounted.current) return;
          updatedItems[id] = updated;
          storeItem(updated);
          setAttempts((current) => ({ ...current, [id]: { status: 'done' } }));
          if (hasDraft(updated) && isReadyForBulkTranslationPublish(updated)) newlyReady.push(id);
        } catch (error) {
          if (!mounted.current) return;
          const message = errorMessage(error, t('Không thể dịch món này. Hãy thử lại.'));
          setAttempts((current) => ({ ...current, [id]: { status: 'failed', error: message } }));
          if (shouldPauseGenerationQueue(error)) {
            setGenerationError(message);
            const remainingIds = ids.slice(index + 1);
            setAttempts((current) => ({
              ...current,
              ...Object.fromEntries(remainingIds.map((remainingId) => [remainingId, {
                status: 'paused',
                error: t('Chưa gửi yêu cầu dịch món này. Hãy thử lại khi dịch vụ AI hoạt động bình thường.'),
              }])),
            }));
            break;
          }
        } finally {
          if (mounted.current) setCompleted((count) => count + 1);
        }
      }
      if (mounted.current) {
        setReviewMode('all');
        setSelected((current) => new Set([
          ...(firstRun ? plan.reviewItemIds.filter((id) => !ids.includes(id) && updatedItems[id] && hasDraft(updatedItems[id]) && isReadyForBulkTranslationPublish(updatedItems[id])) : current),
          ...newlyReady,
        ]));
        setCurrentId(null);
        setPhase('review');
      }
    } finally {
      running.current = false;
    }
  };

  const refreshManagement = async () => {
    if (!onRefreshMenuItems) return;
    setIsRefreshing(true);
    try {
      const refreshed = await onRefreshMenuItems();
      if (!mounted.current) return;
      const refreshedById = Object.fromEntries(refreshed.map((item) => [getId(item), item]));
      setResults(refreshedById);
      setSelected((current) => new Set([...current].filter((id) => refreshedById[id] && hasDraft(refreshedById[id]) && isReadyForBulkTranslationPublish(refreshedById[id]))));
      setRefreshRequired(false);
    } catch (error) {
      if (mounted.current) setPublicationError((current) => `${current ?? ''} ${t('Không thể tải lại trạng thái: {error}', { error: errorMessage(error, t('Hãy thử tải lại.')) })}`.trim());
    } finally {
      if (mounted.current) setIsRefreshing(false);
    }
  };

  const publishSelected = async () => {
    if (!onPublish || !selectedIds.length || busy || editingId || refreshRequired) return;
    setIsPublishing(true);
    setPublicationError(null);
    try {
      const result = await onPublish(selectedIds);
      if (!mounted.current) return;
      setResults((current) => ({ ...current, ...Object.fromEntries(result.items.map((item) => [getId(item), item])) }));
      setSelected(new Set());
      setPublishedCount(result.publishedCount);
      toast.success(t('Đã duyệt và hiển thị {count} món.', { count: result.publishedCount }));
    } catch (error) {
      if (!mounted.current) return;
      setPublicationError(errorMessage(error, t('Không thể duyệt các bản dịch.')));
      setRefreshRequired(true);
      await refreshManagement();
    } finally {
      if (mounted.current) setIsPublishing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!busy && !editingId) onOpenChange(nextOpen); }}>
      <DialogContent showCloseButton={false} className={`grid ${phase === 'confirm' ? 'max-h-[min(88dvh,44rem)] grid-rows-[auto_auto_auto]' : 'h-[92dvh] max-h-[92dvh] grid-rows-[auto_minmax(0,1fr)_auto]'} w-[calc(100vw-2rem)] min-w-0 gap-0 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-0 shadow-xl ${phase === 'confirm' ? 'max-w-xl sm:max-w-xl' : 'max-w-3xl sm:max-w-3xl'} max-sm:inset-x-0 max-sm:bottom-0 max-sm:left-0 max-sm:top-auto max-sm:w-full max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-b-none`}>
        <DialogHeader className="relative min-w-0 border-b border-neutral-200 px-4 pb-4 pt-5 sm:px-6">
          <div className="flex min-w-0 items-start gap-3 pr-10">
            <span aria-hidden="true" className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100">
              <Languages className="h-5 w-5" />
            </span>
            <div className="min-w-0 space-y-1">
              <DialogTitle ref={headingRef} tabIndex={-1} className="break-words text-lg font-bold text-neutral-900 outline-none">
                {t('Dịch menu hàng loạt')}
              </DialogTitle>
              <DialogDescription className="break-words text-xs leading-5 text-neutral-600">{t('Tạo bản nháp tiếng Anh và tiếng Trung để kiểm tra trước khi hiển thị cho khách.')}</DialogDescription>
            </div>
          </div>
          <Button type="button" variant="ghost" size="icon" aria-label={t('Đóng dịch menu hàng loạt')} disabled={busy || Boolean(editingId)} onClick={() => onOpenChange(false)} className="absolute right-3 top-3 h-11 w-11 rounded-full text-neutral-600"><X className="h-5 w-5" /></Button>
          <div role="status" aria-live="polite" aria-atomic="true" className={`break-words text-xs leading-5 ${phase === 'confirm' ? 'mt-3 flex items-center gap-2 rounded-lg bg-neutral-50 px-3 py-2 text-neutral-700' : 'text-neutral-700'}`}>
            {phase === 'confirm' && <CheckCircle2 aria-hidden="true" className="h-4 w-4 shrink-0 text-emerald-700" />}
            {phase === 'confirm' ? t('Bản dịch được lưu thành bản nháp, chưa hiển thị cho khách.') : phase === 'progress' ? t('Đã xử lý {completed}/{total} món · {percent}%. {activity}', { completed, total, percent: completionPercentage, activity: currentId ? t('Đang dịch: {name}', { name: itemsById[currentId]?.name ?? '' }) : t('Đang hoàn tất…') }) : reviewMode === 'saved-drafts' ? t('Đang xem {count} món có bản nháp đã lưu.', { count: visibleReviewItems.length }) : t('Hoàn tất: {success} món dịch thành công · {skipped} món bỏ qua · {failed} món thất bại · {paused} món tạm dừng.', { success: successCount, skipped: currentPlan.stableItemIds.length, failed: failedIds.length, paused: pausedIds.length })}
          </div>
          {phase === 'progress' && <progress aria-label={t('Tiến độ dịch món ăn')} value={completed} max={Math.max(1, total)} className="h-2 w-full overflow-hidden rounded-full accent-emerald-700" />}
        </DialogHeader>

        <div className="min-h-0 min-w-0 overflow-x-hidden overflow-y-auto overscroll-contain px-4 py-4 sm:px-6">
          {phase === 'confirm' ? (
            <div className="space-y-3">
              <section aria-label={t('Số món cần tạo bản dịch')} className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-900">{t('Sẵn sàng bắt đầu')}</p>
                    <p className="mt-1 text-xs leading-5 text-emerald-950/80">{t('AI sẽ tạo bản nháp cho các món chưa dịch đủ.')}</p>
                  </div>
                  <Sparkles aria-hidden="true" className="h-5 w-5 shrink-0 text-emerald-800" />
                </div>
                <div className="mt-3 flex items-baseline gap-3 border-t border-emerald-200/80 pt-3">
                  <span className="text-4xl font-bold leading-none tabular-nums tracking-tight text-emerald-900">{generationItemIds.length}</span>
                  <span className="text-sm font-semibold text-neutral-800">{t('món cần gọi AI')}</span>
                </div>
              </section>

              <dl className="grid grid-cols-2 gap-3">
                <div className="min-w-0 rounded-xl border border-neutral-200 bg-white p-3 sm:p-4">
                  <dt className="break-words text-xs font-medium leading-5 text-neutral-600">{t('Bản nháp hiện có')}</dt>
                  <dd className="mt-1 text-2xl font-bold tabular-nums text-neutral-900">{currentDraftCount}</dd>
                  <p className="mt-1 text-[11px] leading-4 text-neutral-600">{t('Được giữ lại để bạn xem')}</p>
                </div>
                <div className="min-w-0 rounded-xl border border-neutral-200 bg-white p-3 sm:p-4">
                  <dt className="break-words text-xs font-medium leading-5 text-neutral-600">{t('Đã duyệt hai ngôn ngữ')}</dt>
                  <dd className="mt-1 text-2xl font-bold tabular-nums text-neutral-900">{currentPlan.stableItemIds.length}</dd>
                  <p className="mt-1 text-[11px] leading-4 text-neutral-600">{t('Được bỏ qua lần này')}</p>
                </div>
              </dl>

              {savedDraftItems.length > 0 && <Button type="button" variant="outline" onClick={openSavedDrafts} className="min-h-11 w-full justify-start rounded-xl border-neutral-200 text-neutral-800 transition-colors duration-200 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-900">
                <FileText aria-hidden="true" className="mr-2 h-4 w-4 shrink-0 text-emerald-800" />
                <span className="flex-1 text-left">{t('Xem {count} bản nháp đã lưu', { count: savedDraftItems.length })}</span>
                <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-neutral-500" />
              </Button>}

              <p className="flex items-start gap-2 text-xs leading-5 text-neutral-600"><span aria-hidden="true" className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-700" />{t('Mỗi lượt AI xử lý một món. Món đang ngưng bán vẫn được tính vào danh sách dịch.')}</p>
              {!generationItemIds.length && !savedDraftItems.length && <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">{t(menuItems.length ? 'Menu đã có đầy đủ bản dịch được duyệt. Không có món cần xử lý.' : 'Chưa có món ăn. Hãy thêm món vào menu để tạo bản dịch.')}</p>}
            </div>
          ) : (
            <div className="space-y-3">
              {(publicationError || refreshRequired) && <div role="alert" className="space-y-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs leading-5 text-rose-900">{publicationError && <p className="break-words">{publicationError}</p>}<p>{isRefreshing ? t('Đang tải lại trạng thái đã lưu…') : refreshRequired ? t('Cần tải lại trạng thái đã lưu trước khi duyệt tiếp.') : t('Danh sách đã được tải lại theo trạng thái đã lưu. Các món đã duyệt không còn được chọn.')}</p>{refreshRequired && onRefreshMenuItems && <Button type="button" variant="outline" disabled={busy} onClick={() => void refreshManagement()} className="min-h-11 rounded-xl">{t('Tải lại trạng thái')}</Button>}</div>}
              {generationError && <div role="alert" className="break-words rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-950">{generationError} {t('Các món còn lại đã tạm dừng để tránh gửi thêm yêu cầu liên tiếp.')}</div>}
              {publishedCount !== null && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">{t('Đã duyệt và hiển thị {count} món cho khách.', { count: publishedCount })}</p>}
              {visibleReviewItems.map((item) => {
                const id = getId(item);
                const attempt = attempts[id];
                const ready = readyIds.includes(id);
                const alreadyPublished = !hasDraft(item) && isReadyForBulkTranslationPublish(item);
                return (
                  <article key={id} className="min-w-0 space-y-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3 sm:p-4" aria-label={t('Bản dịch {name}', { name: item.name })}>
                    <div className="flex min-w-0 items-start justify-between gap-2">
                      <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">{t('Bản gốc · Tiếng Việt')}</p><h3 className="mt-1 whitespace-pre-wrap break-words text-sm font-bold text-neutral-900">{item.name}</h3></div>
                      {phase === 'review' && <label className="flex min-h-11 shrink-0 items-center gap-2 text-xs font-semibold text-neutral-700"><input type="checkbox" checked={selectedIds.includes(id)} disabled={!ready || busy || Boolean(editingId)} aria-label={t('Chọn duyệt {name}', { name: item.name })} onChange={(event) => setSelected((current) => { const next = new Set(current); if (event.target.checked) next.add(id); else next.delete(id); return next; })} className="h-5 w-5 accent-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700" />{t('Chọn')}</label>}
                    </div>
                    {item.description && <p className="whitespace-pre-wrap break-words text-xs leading-5 text-neutral-600">{item.description}</p>}
                    <div>{alreadyPublished ? <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800"><CheckCircle2 className="h-4 w-4" />{t('Đã duyệt & hiển thị')}</span> : <AttemptStatus attempt={attempt?.status === 'waiting' && hasDraft(item) ? undefined : attempt} t={t} />}</div>
                    {attempt?.error && <p className="break-words text-xs leading-5 text-rose-800">{attempt.error}</p>}
                    <div className="grid min-w-0 gap-2 sm:grid-cols-2"><LocalePreview label="English · EN" entry={item.translationManagement?.en} t={t} /><LocalePreview label="简体中文 · 中文" entry={item.translationManagement?.['zh-CN']} t={t} /></div>
                    {phase === 'review' && <div className="flex min-w-0 flex-wrap items-center justify-between gap-2"><p className="text-xs text-neutral-600">{alreadyPublished ? t('Đã hiển thị cho khách') : ready ? t('Sẵn sàng duyệt hai ngôn ngữ') : attempt?.status === 'failed' ? t('Thử lại hoặc chỉnh sửa bản nháp để hoàn tất') : t('Cần hoàn tất cả hai ngôn ngữ')}</p><div className="flex flex-wrap gap-2">{attempt?.status === 'failed' && <Button type="button" variant="outline" disabled={busy || refreshRequired || Boolean(editingId)} onClick={() => void runGeneration([id])} className="min-h-11 rounded-xl text-xs"><RotateCcw className="mr-1 h-4 w-4" />{t('Thử lại')}</Button>}<Button type="button" variant="outline" disabled={busy || refreshRequired || Boolean(editingId)} onClick={() => setEditingId(id)} className="min-h-11 rounded-xl text-xs"><Edit2 className="mr-1 h-4 w-4" />{t('Sửa nháp')}</Button></div></div>}
                  </article>
                );
              })}
              {!visibleReviewItems.length && <p className="py-8 text-center text-sm text-neutral-600">{t(reviewMode === 'saved-drafts' ? 'Không còn bản nháp đã lưu để xem.' : 'Không có món cần kiểm tra bản dịch.')}</p>}
            </div>
          )}
        </div>

        <div className={`min-w-0 border-t border-neutral-200 bg-white px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+1rem)] sm:px-6 ${phase === 'confirm' ? 'sm:py-4' : 'sm:py-4'}`}>
          {phase === 'confirm' ? <div className="space-y-2">
            <p className="text-center text-[11px] leading-4 text-neutral-600 sm:text-left">{t('Bạn có thể chỉnh sửa từng món trước khi duyệt.')}</p>
            <Button type="button" disabled={!generationItemIds.length && !savedDraftItems.length} onClick={() => generationItemIds.length ? void runGeneration(generationItemIds, true) : openSavedDrafts()} className="min-h-12 w-full rounded-xl bg-emerald-700 text-white shadow-sm transition-colors duration-200 hover:bg-emerald-800"><Sparkles className="mr-2 h-4 w-4" />{generationItemIds.length ? t('Bắt đầu dịch {count} món', { count: generationItemIds.length }) : t('Kiểm tra bản nháp đã lưu')}</Button>
          </div> : phase === 'progress' ? <p className="text-xs leading-5 text-neutral-600">{t('Đang lưu bản nháp từng món. Vui lòng chờ hết lượt dịch để kiểm tra kết quả.')}</p> : <>
            <p className="text-xs text-neutral-700">{t('Đã chọn {selected}/{ready} món sẵn sàng duyệt.', { selected: selectedIds.length, ready: readyIds.length })}</p>
            {!onPublish && <p className="text-xs text-amber-800">{t('Chức năng duyệt hàng loạt chưa sẵn sàng.')}</p>}
            <div className="grid gap-2 sm:flex sm:flex-wrap sm:justify-end">
              {reviewMode === 'saved-drafts' && <Button type="button" variant="outline" disabled={busy || Boolean(editingId)} onClick={returnToConfirmation} className="min-h-11 rounded-xl"><ArrowLeft className="mr-2 h-4 w-4" />{t('Quay lại')}</Button>}
              {retryableIds.length > 0 && <Button type="button" variant="outline" disabled={busy || refreshRequired || Boolean(editingId)} onClick={() => void runGeneration(retryableIds)} className="min-h-11 rounded-xl"><RotateCcw className="mr-2 h-4 w-4" />{pausedIds.length ? t('Thử lại {count} món', { count: retryableIds.length }) : t('Thử lại {count} món lỗi', { count: failedIds.length })}</Button>}
              <Button type="button" disabled={!onPublish || !selectedIds.length || busy || refreshRequired || Boolean(editingId)} onClick={() => void publishSelected()} className="min-h-11 rounded-xl bg-emerald-700 text-white hover:bg-emerald-800">{isPublishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}{isPublishing ? t('Đang duyệt…') : t('Duyệt & hiển thị {count} món', { count: selectedIds.length })}</Button>
            </div>
          </>}
        </div>
      </DialogContent>
      <TranslationEditorDialog<MenuItemTranslationValue>
        open={Boolean(editingItem)}
        onOpenChange={(nextOpen) => { if (!nextOpen && !isEditingRequest) setEditingId(null); }}
        allowPublish={false}
        kind="dish"
        sourceName={editingItem?.name ?? ''}
        sourceDescription={editingItem?.description}
        translations={editingItem?.translationManagement}
        onGenerate={async () => {
          if (!editingId || refreshRequired) return {};
          setIsEditingRequest(true);
          try {
            const updated = await onGenerate(editingId, { preserveExisting: true });
            storeItem(updated);
            if (isReadyForBulkTranslationPublish(updated)) {
              setAttempts((current) => ({ ...current, [editingId]: { status: 'done' } }));
              setSelected((current) => new Set([...current, editingId]));
            }
            return updated.translationManagement ?? {};
          } finally { setIsEditingRequest(false); }
        }}
        onSave={async (locale, value) => {
          if (!editingId || refreshRequired) return {};
          setIsEditingRequest(true);
          try {
            const updated = await onSaveTranslation(editingId, locale, value, false);
            storeItem(updated);
            if (isReadyForBulkTranslationPublish(updated)) {
              setAttempts((current) => attempts[editingId]?.status === 'failed' ? { ...current, [editingId]: { status: 'done' } } : current);
              setSelected((current) => new Set([...current, editingId]));
            }
            return updated.translationManagement ?? {};
          } finally { setIsEditingRequest(false); }
        }}
      />
    </Dialog>
  );
}

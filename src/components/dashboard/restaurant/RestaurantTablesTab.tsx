import React, { useState } from 'react';
import { RestaurantTable, TableStatus, tableService } from '@/services/tableService';
import type { RestaurantStats } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  CheckCircle2,
  ChevronDown,
  Clock3,
  Copy,
  Download,
  ExternalLink,
  FileArchive,
  FolderDown,
  Loader2,
  MoreHorizontal,
  QrCode,
  Trash2,
  Users
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/useIsMobile';
import {
  downloadSingleTableQR,
  downloadAllTablesQRAsZip,
  downloadAllTablesQRIndividual,
  getTableFileName
} from '@/utils/qrDownload';
import { TableAnalyticsSummary } from './RestaurantAnalyticsSummary';

export interface RestaurantTablesTabProps {
  tables: RestaurantTable[];
  stats: RestaurantStats | null;
  isLoadingStats: boolean;
  hasStatsError: boolean;
  tableCountInput: string;
  restaurantId: string;
  restaurantName?: string;
  isLoadingTables: boolean;
  onSetTableCountInput: (value: string) => void;
  onSyncTables: () => Promise<void>;
  onSelectTableQR: (code: string) => void;
  onRefreshTables?: () => Promise<void> | void;
  onDeleteTable?: (table: RestaurantTable) => Promise<void>;
}

export const RestaurantTablesTab: React.FC<RestaurantTablesTabProps> = ({
  tables,
  stats,
  isLoadingStats,
  hasStatsError,
  tableCountInput,
  restaurantId,
  restaurantName = 'Nhà hàng',
  isLoadingTables,
  onSetTableCountInput,
  onSyncTables,
  onSelectTableQR,
  onRefreshTables,
  onDeleteTable
}) => {
  const isCompact = useIsMobile(1024);

  // Table deletion state
  const [tableToDelete, setTableToDelete] = useState<RestaurantTable | null>(null);
  const [isDeletingTable, setIsDeletingTable] = useState(false);

  // QR Download state
  const [downloadingTableCode, setDownloadingTableCode] = useState<string | null>(null);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<{
    current: number;
    total: number;
    fileName: string;
    mode: 'zip' | 'individual';
  } | null>(null);

  const tableSummary = tables.reduce(
    (summary, table) => {
      if (table.status === TableStatus.OCCUPIED) summary.occupied += 1;
      else if (table.status === TableStatus.PAYMENT_PENDING) summary.paymentPending += 1;
      else summary.available += 1;
      return summary;
    },
    { available: 0, occupied: 0, paymentPending: 0 }
  );

  const getStatusBadge = (status?: TableStatus) => {
    switch (status) {
      case TableStatus.OCCUPIED:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Đang dùng
          </span>
        );
      case TableStatus.PAYMENT_PENDING:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200/80 bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
            Chờ thanh toán
          </span>
        );
      case TableStatus.AVAILABLE:
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Bàn trống
          </span>
        );
    }
  };

  const executeDeleteTable = async () => {
    if (!tableToDelete) return;
    if (tableToDelete.status === TableStatus.OCCUPIED || tableToDelete.status === TableStatus.PAYMENT_PENDING) {
      toast.error(`Bàn ${tableToDelete.code} đang có khách hoặc chờ thanh toán, không thể xoá!`);
      return;
    }

    setIsDeletingTable(true);
    try {
      if (onDeleteTable) {
        await onDeleteTable(tableToDelete);
      } else {
        const idOrCode = tableToDelete._id || tableToDelete.id || tableToDelete.code;
        await tableService.delete(idOrCode);
        await onRefreshTables?.();
      }
      toast.success(`Đã xoá Bàn ${tableToDelete.code} thành công`);
      setTableToDelete(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Lỗi khi xoá bàn ăn');
    } finally {
      setIsDeletingTable(false);
    }
  };

  const handleCopyOrderUrl = (code: string, url: string) => {
    navigator.clipboard.writeText(url);
    toast.success(`Đã sao chép link đặt món Bàn ${code}`);
  };

  // ────────────────────────────────────────────────────
  // QR Download Handlers
  // ────────────────────────────────────────────────────
  const handleDownloadSingle = async (tableCode: string) => {
    const fileName = getTableFileName(tableCode);
    setDownloadingTableCode(tableCode);
    try {
      await downloadSingleTableQR(restaurantId, tableCode, restaurantName);
      toast.success(`Đã tải thành công ảnh ${fileName}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Lỗi khi tải ảnh mã QR');
    } finally {
      setDownloadingTableCode(null);
    }
  };

  const handleDownloadAllZip = async () => {
    if (!tables.length) {
      toast.warning('Chưa có bàn nào để tải mã QR');
      return;
    }
    setIsDownloadingAll(true);
    setDownloadProgress({ current: 0, total: tables.length, fileName: '', mode: 'zip' });

    try {
      await downloadAllTablesQRAsZip(
        restaurantId,
        tables,
        restaurantName,
        (current, total, fileName) => {
          setDownloadProgress({ current, total, fileName, mode: 'zip' });
        }
      );
      toast.success(`Đã tải thành công trọn bộ ZIP ${tables.length} mã QR bàn!`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Lỗi khi nén và tải mã QR');
    } finally {
      setIsDownloadingAll(false);
      setDownloadProgress(null);
    }
  };

  const handleDownloadAllIndividual = async () => {
    if (!tables.length) {
      toast.warning('Chưa có bàn nào để tải mã QR');
      return;
    }
    setIsDownloadingAll(true);
    setDownloadProgress({ current: 0, total: tables.length, fileName: '', mode: 'individual' });

    try {
      await downloadAllTablesQRIndividual(
        restaurantId,
        tables,
        restaurantName,
        (current, total, fileName) => {
          setDownloadProgress({ current, total, fileName, mode: 'individual' });
        }
      );
      toast.success(`Đã tải xong ${tables.length} file ảnh mã QR!`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Lỗi khi tải mã QR');
    } finally {
      setIsDownloadingAll(false);
      setDownloadProgress(null);
    }
  };

  // Reusable Download All Button & Dropdown
  const renderDownloadAllControl = () => (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            disabled={tables.length === 0 || isDownloadingAll}
            className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-600/20 px-4 flex items-center gap-2 transition-all duration-150 cursor-pointer disabled:opacity-50"
          >
            {isDownloadingAll ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>Tải tất cả mã QR</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-70 ml-0.5" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72 z-[60] p-1.5 rounded-2xl shadow-xl border-neutral-200/80 bg-white">
          <DropdownMenuItem
            onClick={handleDownloadAllZip}
            disabled={isDownloadingAll}
            className="cursor-pointer rounded-xl p-3 flex items-start gap-3 focus:bg-emerald-50 focus:text-emerald-900 transition-colors"
          >
            <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <FileArchive className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                Tải file nén ZIP
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded-md">
                  Khuyên dùng
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">
                Gói toàn bộ {tables.length} ảnh (ban1.jpg, ban2.jpg...) trong 1 tệp ZIP duy nhất.
              </p>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleDownloadAllIndividual}
            disabled={isDownloadingAll}
            className="cursor-pointer rounded-xl p-3 flex items-start gap-3 focus:bg-neutral-100 mt-1 transition-colors"
          >
            <div className="h-9 w-9 rounded-xl bg-neutral-100 text-neutral-700 flex items-center justify-center shrink-0 mt-0.5">
              <FolderDown className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-neutral-900">
                Tải từng file rời (.jpg)
              </div>
              <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">
                Tự động lưu lần lượt từng ảnh ban1.jpg, ban2.jpg trực tiếp vào máy.
              </p>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-neutral-900">Đồng bộ bàn ăn & Sinh mã QR</h2>
        <p className="text-neutral-500 text-xs mt-0.5">
          Sinh mã QR code dán bàn. Khách quét QR để xem thực đơn & đặt món tại chỗ mà không cần gọi nhân viên.
        </p>
      </div>

      {/* Sync Table Card */}
      <Card className="shadow-sm border-neutral-200/50 rounded-2xl bg-white overflow-hidden">
        <CardContent className="p-6 flex flex-col sm:flex-row gap-4 items-end bg-neutral-50/50 border-b border-neutral-100">
          <div className="space-y-2 flex-1 w-full">
            <Label htmlFor="tableCount" className="text-xs font-bold text-neutral-600">
              Số lượng bàn hoạt động tại nhà hàng
            </Label>
            <Input
              id="tableCount"
              type="number"
              placeholder="Nhập tổng số bàn (VD: 15)"
              value={tableCountInput}
              onChange={(e) => onSetTableCountInput(e.target.value)}
              className="rounded-xl border-neutral-200 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 text-sm bg-white"
            />
          </div>
          <Button
            onClick={onSyncTables}
            disabled={isLoadingTables}
            aria-busy={isLoadingTables}
            className="h-10 w-full rounded-xl bg-neutral-900 px-6 font-bold text-white shadow-sm hover:bg-black sm:w-auto"
          >
            {isLoadingTables ? 'Đang đồng bộ...' : 'Đồng bộ số bàn'}
          </Button>
        </CardContent>
      </Card>

      {/* Table Status Summary Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3" aria-label="Tổng quan trạng thái bàn">
        <div className="min-w-0 rounded-2xl border border-emerald-200/70 bg-emerald-50/60 p-3 sm:p-4">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 sm:h-9 sm:w-9">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-emerald-700 sm:text-xs">Bàn trống</p>
              <p className="mt-0.5 text-lg font-extrabold leading-none text-emerald-900 sm:text-xl">{tableSummary.available}</p>
            </div>
          </div>
        </div>
        <div className="min-w-0 rounded-2xl border border-amber-200/70 bg-amber-50/60 p-3 sm:p-4">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 sm:h-9 sm:w-9">
              <Users className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-amber-700 sm:text-xs">Đang dùng</p>
              <p className="mt-0.5 text-lg font-extrabold leading-none text-amber-900 sm:text-xl">{tableSummary.occupied}</p>
            </div>
          </div>
        </div>
        <div className="min-w-0 rounded-2xl border border-rose-200/70 bg-rose-50/60 p-3 sm:p-4">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700 sm:h-9 sm:w-9">
              <Clock3 className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-rose-700 sm:text-xs">Chờ thanh toán</p>
              <p className="mt-0.5 text-lg font-extrabold leading-none text-rose-900 sm:text-xl">{tableSummary.paymentPending}</p>
            </div>
          </div>
        </div>
      </div>

      <TableAnalyticsSummary stats={stats} isLoading={isLoadingStats} hasError={hasStatsError} />

      {/* Main Table List */}
      {isCompact ? (
        <div className="space-y-4">
          {/* Mobile Action Bar */}
          <div className="flex items-center justify-between gap-3 p-4 bg-white border border-neutral-200/60 rounded-2xl shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-neutral-800">Danh sách bàn</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-neutral-100 text-neutral-700">
                  {tables.length}
                </span>
              </div>
              <p className="text-[11px] text-neutral-500">Mã QR đặt món định danh từng bàn</p>
            </div>
            {renderDownloadAllControl()}
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
            {tables.map((tbl) => {
              const orderUrl = `${window.location.origin}/order?r=${restaurantId}&t=${tbl.code}`;
              const fileName = getTableFileName(tbl.code);
              const isDownloadingThis = downloadingTableCode === tbl.code;

              return (
                <div key={tbl._id || tbl.code} className="min-w-0 space-y-4 rounded-2xl border border-neutral-200/60 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md sm:p-5">
                  <div className="flex min-w-0 items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200/70 font-black text-emerald-800 text-sm shadow-xs">
                        {tbl.code}
                      </div>
                      <div className="min-w-0">
                        <span className="block text-sm font-extrabold text-neutral-900 leading-tight">
                          Bàn {tbl.code}
                        </span>
                        <span className="text-[10px] font-mono font-medium text-neutral-400">
                          {fileName}
                        </span>
                      </div>
                    </div>
                    <div className="min-w-0">{getStatusBadge(tbl.status)}</div>
                  </div>

                  <div className="border-t border-neutral-100 pt-3 text-xs">
                    <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      Đường dẫn gọi món
                    </span>
                    <div className="flex items-center gap-1.5">
                      <a
                        href={orderUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-between gap-1.5 truncate rounded-xl border border-neutral-200/70 bg-neutral-50/70 px-3 py-2 text-xs font-semibold text-neutral-700 hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-700 transition-colors"
                      >
                        <span className="truncate">order?r={restaurantId.slice(-6)}&t={tbl.code}</span>
                        <ExternalLink className="h-3 w-3 shrink-0 text-neutral-400" />
                      </a>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleCopyOrderUrl(tbl.code, orderUrl)}
                        className="h-9 w-9 shrink-0 rounded-xl border-neutral-200 hover:bg-neutral-50"
                        title="Sao chép link"
                      >
                        <Copy className="h-3.5 w-3.5 text-neutral-600" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 border-t border-neutral-100 pt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onSelectTableQR(tbl.code)}
                      aria-label={`Hiển thị mã QR bàn ${tbl.code}`}
                      className="h-10 rounded-xl border-neutral-200 text-xs font-bold hover:bg-neutral-50"
                    >
                      <QrCode className="h-4 w-4 text-neutral-500" />
                      Xem QR
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadSingle(tbl.code)}
                      disabled={isDownloadingThis || isDownloadingAll}
                      aria-label={`Tải ảnh ${fileName}`}
                      className="h-10 rounded-xl border-emerald-200 bg-emerald-50/50 text-xs font-bold text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 transition-colors"
                    >
                      {isDownloadingThis ? (
                        <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                      ) : (
                        <Download className="h-4 w-4 text-emerald-600" />
                      )}
                      Tải ảnh
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setTableToDelete(tbl)}
                      aria-label={`Xoá bàn ${tbl.code}`}
                      className="h-10 rounded-xl border-rose-200 bg-rose-50/50 text-xs font-bold text-rose-700 hover:bg-rose-100 hover:text-rose-800 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-rose-600" />
                      Xoá bàn
                    </Button>
                  </div>
                </div>
              );
            })}
            
            {tables.length === 0 && (
              <div className="text-center py-16 bg-white border border-neutral-200/60 rounded-2xl shadow-sm col-span-full">
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-50 border border-neutral-200/40 flex items-center justify-center">
                    <QrCode className="w-6 h-6 text-neutral-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-800">Chưa có bàn ăn nào được lưu</h3>
                    <p className="text-xs text-neutral-400 mt-1">Đồng bộ số lượng bàn hoạt động phía trên để tạo mã QR tự động.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <Card className="overflow-hidden rounded-2xl border-neutral-200/50 bg-white shadow-sm">
          {/* Desktop Card Header with Batch Download Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-neutral-100 bg-white">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-neutral-900">Danh sách bàn & mã QR dẫn bàn</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-neutral-100 text-neutral-700">
                  {tables.length} bàn
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Mỗi bàn có mã QR riêng biệt. Tải ảnh JPG độ phân giải cao sẵn sàng in ấn standee để bàn.
              </p>
            </div>
            {renderDownloadAllControl()}
          </div>

          <CardContent className="min-w-0 p-0">
            <Table className="w-full max-w-full table-fixed">
              <colgroup>
                <col className="w-[22%]" />
                <col className="w-[20%]" />
                <col className="w-[32%]" />
                <col className="w-[26%]" />
              </colgroup>
              <TableHeader>
                <TableRow className="border-neutral-100 hover:bg-transparent">
                  <TableHead className="pl-6 text-xs font-bold text-neutral-400">Mã bàn</TableHead>
                  <TableHead className="text-xs font-bold text-neutral-400">Trạng thái</TableHead>
                  <TableHead className="min-w-0 text-xs font-bold text-neutral-400">Đường dẫn đặt món tại bàn</TableHead>
                  <TableHead className="pr-6 text-right text-xs font-bold text-neutral-400">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tables.map((tbl) => {
                  const orderUrl = `${window.location.origin}/order?r=${restaurantId}&t=${tbl.code}`;
                  const fileName = getTableFileName(tbl.code);
                  const isDownloadingThis = downloadingTableCode === tbl.code;

                  return (
                    <TableRow key={tbl._id || tbl.code} className="border-neutral-100 hover:bg-neutral-50/40 transition-colors">
                      {/* Cột 1: Mã bàn & File QR */}
                      <TableCell className="pl-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200/70 font-black text-emerald-800 text-xs shadow-2xs">
                            {tbl.code}
                          </div>
                          <div className="min-w-0">
                            <span className="block text-xs font-extrabold text-neutral-900 leading-tight">
                              Bàn {tbl.code}
                            </span>
                            <span className="mt-0.5 inline-flex font-mono text-[10px] font-medium text-neutral-400">
                              {fileName}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Cột 2: Trạng thái */}
                      <TableCell className="py-4">
                        {getStatusBadge(tbl.status)}
                      </TableCell>

                      {/* Cột 3: Đường dẫn đặt món */}
                      <TableCell className="max-w-0 py-4">
                        <div className="flex items-center gap-2 max-w-[280px]">
                          <a
                            href={orderUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={orderUrl}
                            className="group flex items-center gap-1.5 truncate rounded-lg border border-neutral-200/70 bg-neutral-50/70 px-2.5 py-1 text-xs font-medium text-neutral-700 hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-700 transition-colors"
                          >
                            <span className="truncate">order?r={restaurantId.slice(-6)}&t={tbl.code}</span>
                            <ExternalLink className="h-3 w-3 shrink-0 text-neutral-400 group-hover:text-emerald-600 transition-colors" />
                          </a>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleCopyOrderUrl(tbl.code, orderUrl)}
                            title="Sao chép link"
                            className="h-7 w-7 shrink-0 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>

                      {/* Cột 4: Thao tác (3 nút thẳng hàng) */}
                      <TableCell className="pl-4 pr-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {/* Slot 1: Preview QR Modal - fixed width */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onSelectTableQR(tbl.code)}
                            aria-label={`Hiển thị mã QR bàn ${tbl.code}`}
                            title="Xem mã QR lớn"
                            className="h-8.5 w-[76px] shrink-0 justify-center rounded-lg border-neutral-200 px-2 text-xs font-semibold hover:bg-neutral-50"
                          >
                            <QrCode className="h-3.5 w-3.5 text-neutral-500" />
                            <span>Xem</span>
                          </Button>

                          {/* Slot 2: Download Single Table JPG - fixed width */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadSingle(tbl.code)}
                            disabled={isDownloadingThis || isDownloadingAll}
                            aria-label={`Tải ảnh ${fileName}`}
                            title={`Tải ảnh ${fileName}`}
                            className="h-8.5 w-[96px] shrink-0 justify-center rounded-lg border-emerald-200 bg-emerald-50/60 px-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 transition-colors"
                          >
                            {isDownloadingThis ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Download className="h-3.5 w-3.5 text-emerald-600" />
                            )}
                            <span>Tải ảnh</span>
                          </Button>

                          {/* Slot 3: Actions Popover Menu with Xoá bàn */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="icon"
                                variant="outline"
                                aria-label={`Mở thao tác bàn ${tbl.code}`}
                                title="Thao tác khác"
                                className="h-8.5 w-8.5 shrink-0 rounded-lg border-neutral-200 hover:bg-neutral-50"
                              >
                                <MoreHorizontal className="h-4 w-4 text-neutral-500" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="left" align="center" sideOffset={8} className="z-[60] w-36 rounded-xl shadow-lg border-neutral-200 p-1 bg-white">
                              <DropdownMenuItem
                                onClick={() => setTableToDelete(tbl)}
                                className="min-h-9 cursor-pointer gap-2 text-rose-600 focus:bg-rose-50 focus:text-rose-700 font-semibold rounded-lg"
                              >
                                <Trash2 className="h-4 w-4 text-rose-600" />
                                <span>Xoá bàn</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {tables.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-16">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-neutral-50 border border-neutral-200/40 flex items-center justify-center">
                          <QrCode className="w-6 h-6 text-neutral-400" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-neutral-800">Chưa có bàn ăn nào được lưu</h3>
                          <p className="text-xs text-neutral-400 mt-1">Đồng bộ số lượng bàn hoạt động phía trên để tạo mã QR tự động.</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Batch Download Progress Modal */}
      <Dialog open={isDownloadingAll} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md bg-white rounded-3xl p-6 shadow-2xl border-neutral-200/80 [&>button]:hidden">
          <div className="flex flex-col items-center text-center space-y-4 py-2">
            <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
              <Download className="h-7 w-7 animate-bounce" />
            </div>

            <div className="space-y-1">
              <DialogTitle className="text-lg font-extrabold text-neutral-900">
                Đang xuất mã QR bàn ăn
              </DialogTitle>
              <DialogDescription className="text-xs text-neutral-500">
                Hệ thống đang kết xuất file ảnh JPG độ phân giải cao cho từng bàn...
              </DialogDescription>
            </div>

            {downloadProgress && (
              <div className="w-full space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-neutral-700 truncate max-w-[240px]">
                    {downloadProgress.fileName ? `Đang tạo: ${downloadProgress.fileName}` : 'Đang xử lý tệp nén...'}
                  </span>
                  <span className="text-emerald-700 font-mono">
                    {downloadProgress.current} / {downloadProgress.total} ({Math.round((downloadProgress.current / Math.max(downloadProgress.total, 1)) * 100)}%)
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-2.5 w-full bg-neutral-100 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-200"
                    style={{
                      width: `${Math.round((downloadProgress.current / Math.max(downloadProgress.total, 1)) * 100)}%`
                    }}
                  />
                </div>
              </div>
            )}

            <p className="text-[11px] text-neutral-400">
              Vui lòng không đóng trang. File sẽ tự động tải xuống sau khi hoàn tất.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Table Confirmation Modal */}
      <Dialog open={Boolean(tableToDelete)} onOpenChange={(open) => !open && setTableToDelete(null)}>
        <DialogContent className="sm:max-w-md bg-white rounded-3xl p-6 shadow-2xl border-neutral-200/80">
          <div className="flex flex-col items-center text-center space-y-4 py-2">
            <div className="h-14 w-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-inner">
              <Trash2 className="h-7 w-7 text-rose-600" />
            </div>

            <div className="space-y-1">
              <DialogTitle className="text-lg font-extrabold text-neutral-900">
                Xác nhận xoá Bàn {tableToDelete?.code}
              </DialogTitle>
              <DialogDescription className="text-xs text-neutral-500">
                Bạn có chắc chắn muốn xoá bàn này không? Mã QR và thông tin bàn sẽ bị xoá khỏi hệ thống.
              </DialogDescription>
            </div>

            {tableToDelete && (tableToDelete.status === TableStatus.OCCUPIED || tableToDelete.status === TableStatus.PAYMENT_PENDING) && (
              <div className="w-full rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs font-medium text-amber-800 text-left">
                ⚠️ Bàn này đang có phiên khách hoạt động ({tableToDelete.status === TableStatus.OCCUPIED ? 'Đang dùng' : 'Chờ thanh toán'}). Bạn cần đóng phiên trước khi có thể xoá bàn.
              </div>
            )}

            <div className="flex items-center justify-end gap-3 w-full pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setTableToDelete(null)}
                disabled={isDeletingTable}
                className="flex-1 h-10 rounded-xl border-neutral-200 text-xs font-semibold hover:bg-neutral-50"
              >
                Huỷ
              </Button>
              <Button
                type="button"
                onClick={executeDeleteTable}
                disabled={isDeletingTable || tableToDelete?.status === TableStatus.OCCUPIED || tableToDelete?.status === TableStatus.PAYMENT_PENDING}
                className="flex-1 h-10 rounded-xl bg-rose-600 text-xs font-bold text-white hover:bg-rose-700 shadow-sm shadow-rose-600/20 disabled:opacity-50"
              >
                {isDeletingTable ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    Đang xoá...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                    Xác nhận xoá
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

import React from 'react';
import { Staff } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Edit2, Eye, EyeOff, Users, MoreHorizontal, RefreshCw } from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile';

export interface RestaurantStaffTabProps {
  staff: Staff[];
  isLoadingStaff: boolean;
  onOpenStaffModal: (item?: Staff) => void;
  onToggleStaffActive: (id: string) => Promise<void>;
}

export const RestaurantStaffTab: React.FC<RestaurantStaffTabProps> = ({
  staff,
  isLoadingStaff,
  onOpenStaffModal,
  onToggleStaffActive
}) => {
  const isMobile = useIsMobile(640);
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900">Quản lý Nhân viên</h2>
          <p className="text-neutral-500 text-xs mt-0.5">Tạo tài khoản đăng nhập phục vụ hoặc nấu bếp, giúp tự động hóa quá trình nhận món và cập nhật trạng thái.</p>
        </div>
        <Button onClick={() => onOpenStaffModal()} className="rounded-xl bg-neutral-900 hover:bg-black text-white font-semibold shadow-sm gap-1.5 h-9 self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Thêm nhân viên mới
        </Button>
      </div>

      {isLoadingStaff ? (
        <Card className="shadow-sm border-neutral-200/50 rounded-2xl overflow-hidden bg-white">
          <CardContent className="p-0">
            <div className="flex py-16 justify-center items-center">
              <RefreshCw className="w-6 h-6 animate-spin text-green-600 mr-2" />
              <span className="text-sm font-semibold text-neutral-500">Đang tải danh sách nhân viên...</span>
            </div>
          </CardContent>
        </Card>
      ) : isMobile ? (
        <div className="grid grid-cols-1 gap-4">
          {staff.map((st) => {
            const staffId = st.id || (st as any)._id;

            return (
              <div key={staffId} className="bg-white border border-neutral-200/60 rounded-2xl p-5 shadow-sm space-y-4 transition-all duration-200 hover:shadow-md">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-extrabold text-sm text-neutral-900 flex items-center gap-1.5">
                      👤 {st.name}
                    </h4>
                    <span className="text-[10px] text-neutral-450 font-bold block mt-0.5">Nhân viên Bếp / Phục vụ</span>
                  </div>
                  
                  {/* Action Menu (⋮) */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-9 w-9 rounded-lg hover:bg-neutral-50 shrink-0 -mt-1.5 -mr-1.5">
                        <MoreHorizontal className="w-4 h-4 text-neutral-500" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white rounded-xl shadow-lg border border-neutral-100 p-1 w-40">
                      <DropdownMenuItem
                        onClick={() => onOpenStaffModal(st)}
                        className="text-neutral-700 font-semibold text-xs rounded-lg cursor-pointer h-10 flex items-center"
                      >
                        <Edit2 className="w-3.5 h-3.5 mr-2 text-neutral-400" />
                        Sửa nhân viên
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-neutral-100 my-1" />
                      <DropdownMenuItem
                        onClick={() => onToggleStaffActive(staffId)}
                        className="text-rose-600 font-bold text-xs rounded-lg cursor-pointer focus:text-rose-700 focus:bg-rose-50 h-10 flex items-center"
                      >
                        {st.isActive ? <EyeOff className="w-3.5 h-3.5 mr-2 text-neutral-400" /> : <Eye className="w-3.5 h-3.5 mr-2 text-neutral-400" />}
                        {st.isActive ? 'Khóa tài khoản' : 'Mở khóa'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="border-t border-neutral-100 pt-3 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-neutral-450 text-[10px] font-bold uppercase tracking-wider">Tên đăng nhập</span>
                    <span className="font-mono text-neutral-700 font-bold">{st.username}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-450 text-[10px] font-bold uppercase tracking-wider">Trạng thái</span>
                    <div className="flex items-center gap-1.5">
                      <Switch checked={st.isActive} onCheckedChange={() => onToggleStaffActive(staffId)} className="scale-90" />
                      <span className={`text-[10px] font-extrabold ${st.isActive ? 'text-emerald-700' : 'text-neutral-400'}`}>
                        {st.isActive ? '🟢 Đang hoạt động' : '🔴 Đã khóa'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2 border-t border-neutral-100">
                  <Button
                    onClick={() => onOpenStaffModal(st)}
                    variant="outline"
                    className="flex-1 h-11 text-xs font-bold rounded-xl border-neutral-200 hover:bg-neutral-50"
                  >
                    <Edit2 className="w-3.5 h-3.5 mr-1.5 text-neutral-500" />
                    Sửa nhân viên
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => onToggleStaffActive(staffId)}
                    className="flex-1 h-11 text-xs font-bold rounded-xl border-neutral-200 hover:bg-neutral-50"
                  >
                    {st.isActive ? 'Khóa' : 'Mở khóa'}
                  </Button>
                </div>
              </div>
            );
          })}
          
          {staff.length === 0 && (
            <div className="text-center py-16 bg-white border border-neutral-200/60 rounded-2xl shadow-sm">
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-neutral-50 border border-neutral-200/40 flex items-center justify-center">
                  <Users className="w-6 h-6 text-neutral-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-800">Chưa có nhân viên nào</h3>
                  <p className="text-xs text-neutral-400 mt-1">Bấm nút "Thêm nhân viên mới" để bắt đầu thiết lập nhân sự.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <Card className="shadow-sm border-neutral-200/50 rounded-2xl overflow-hidden bg-white">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-neutral-100 hover:bg-transparent">
                  <TableHead className="text-xs font-bold text-neutral-400 pl-6">Tên nhân viên</TableHead>
                  <TableHead className="text-xs font-bold text-neutral-400">Username đăng nhập</TableHead>
                  <TableHead className="text-xs font-bold text-neutral-400">Trạng thái hoạt động</TableHead>
                  <TableHead className="text-right text-xs font-bold text-neutral-400 pr-6">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.map((st) => {
                  const staffId = st.id || (st as any)._id;
                  return (
                    <TableRow key={staffId} className="border-neutral-100 hover:bg-neutral-50/40 transition-colors">
                      <TableCell className="font-bold text-xs text-neutral-900 pl-6">{st.name}</TableCell>
                      <TableCell className="text-xs text-neutral-500 font-mono">{st.username}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch checked={st.isActive} onCheckedChange={() => onToggleStaffActive(staffId)} />
                          <span className={`text-[11px] font-bold ${st.isActive ? 'text-green-700' : 'text-neutral-400'}`}>
                            {st.isActive ? 'Đang hoạt động' : 'Đã khóa'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg border border-neutral-200/50 hover:bg-neutral-50">
                              <MoreHorizontal className="w-4 h-4 text-neutral-500" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white rounded-xl shadow-lg border border-neutral-100 p-1 w-40">
                            <DropdownMenuItem onClick={() => onOpenStaffModal(st)} className="text-neutral-700 font-semibold text-xs rounded-lg cursor-pointer">
                              <Edit2 className="w-3.5 h-3.5 mr-2 text-neutral-400" />
                              Sửa nhân viên
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onToggleStaffActive(staffId)} className="text-neutral-700 font-semibold text-xs rounded-lg cursor-pointer">
                              {st.isActive ? <EyeOff className="w-3.5 h-3.5 mr-2 text-neutral-400" /> : <Eye className="w-3.5 h-3.5 mr-2 text-neutral-400" />}
                              {st.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {staff.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-16">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-neutral-55 border border-neutral-200/40 flex items-center justify-center">
                          <Users className="w-6 h-6 text-neutral-400" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-neutral-800">Chưa có nhân viên nào</h3>
                          <p className="text-xs text-neutral-400 mt-1">Bấm nút "Thêm nhân viên mới" để tạo tài khoản phục vụ.</p>
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
    </div>
  );
};

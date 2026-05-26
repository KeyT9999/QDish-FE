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

      <Card className="shadow-sm border-neutral-200/50 rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-0">
          {isLoadingStaff ? (
            <div className="flex py-16 justify-center items-center">
              <RefreshCw className="w-6 h-6 animate-spin text-green-600 mr-2" />
              <span className="text-sm font-semibold text-neutral-500">Đang tải danh sách nhân viên...</span>
            </div>
          ) : (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

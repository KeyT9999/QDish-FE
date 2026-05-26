import React from 'react';
import { Owner } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Loader2, Plus, Edit2, Key, UserCheck } from 'lucide-react';

export interface OwnersTabProps {
  owners: Owner[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  isLoading: boolean;
  onAddClick: () => void;
  onEditClick: (owner: Owner) => void;
  onResetPwClick: (owner: Owner) => void;
  onOverrideClick: (owner: Owner) => void;
  onToggleActive: (id: string) => Promise<void>;
}

export const OwnersTab: React.FC<OwnersTabProps> = ({
  owners,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  isLoading,
  onAddClick,
  onEditClick,
  onResetPwClick,
  onOverrideClick,
  onToggleActive
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex gap-2 w-full sm:max-w-md">
          <Input 
            placeholder="Tìm kiếm họ tên, email, điện thoại..." 
            value={searchTerm} 
            onChange={(e) => onSearchChange(e.target.value)} 
            className="rounded-xl flex-1"
          />
          <Select value={statusFilter} onValueChange={(val) => onStatusFilterChange(val || 'ALL')}>
            <SelectTrigger className="w-36 rounded-xl bg-white">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="ALL">Tất cả</SelectItem>
              <SelectItem value="ACTIVE">Hoạt động</SelectItem>
              <SelectItem value="INACTIVE">Tạm khóa</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button 
          onClick={onAddClick} 
          className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-md shadow-green-600/10"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Thêm chủ nhà hàng mới
        </Button>
      </div>

      <Card className="shadow-sm border-gray-100">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex py-16 justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Họ tên chủ nhà hàng</TableHead>
                  <TableHead className="text-xs">Tên đăng nhập</TableHead>
                  <TableHead className="text-xs">Email / Điện thoại</TableHead>
                  <TableHead className="text-xs">Xác thực email</TableHead>
                  <TableHead className="text-xs">Nhà hàng quản lý</TableHead>
                  <TableHead className="text-xs">Gói dịch vụ</TableHead>
                  <TableHead className="text-xs">Ngày đăng ký</TableHead>
                  <TableHead className="text-xs">Trạng thái</TableHead>
                  <TableHead className="text-right text-xs">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {owners.map((owner) => (
                  <TableRow key={owner.id || (owner as any)._id}>
                    <TableCell className="font-bold text-xs text-gray-900">{owner.fullName}</TableCell>
                    <TableCell className="text-xs text-gray-600 font-mono">{owner.username}</TableCell>
                    <TableCell className="text-xs text-gray-500 space-y-0.5">
                      <span className="block">{owner.email}</span>
                      <span className="block">{owner.phone}</span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        owner.isEmailVerified
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {owner.isEmailVerified ? 'Đã xác minh' : 'Chưa xác minh'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          (owner.restaurantsCount || 0) > 0
                            ? 'bg-green-50 text-green-700 border border-green-150'
                            : 'bg-slate-50 text-slate-400 border border-slate-100'
                        }`}>
                          {owner.restaurantsCount || 0} chi nhánh
                        </span>
                        {owner.restaurants && owner.restaurants.length > 0 && (
                          <span className="block text-[10px] text-slate-400 truncate max-w-[180px] font-medium" title={owner.restaurants.join(', ')}>
                            {owner.restaurants.join(', ')}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          owner.planCode === 'PRO'
                            ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-sm'
                            : owner.planCode === 'PLUS'
                              ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {owner.planName || 'Starter / FREE'}
                        </span>
                        <span className="block text-[9px] font-mono text-slate-400 uppercase">
                          {owner.subscriptionStatus === 'ACTIVE' ? 'Đang kích hoạt' : 'Chờ thanh toán'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">
                      {owner.createdAt ? new Date(owner.createdAt).toLocaleDateString('vi-VN') : '---'}
                    </TableCell>
                    <TableCell>
                      <Switch 
                        checked={owner.isActive} 
                        onCheckedChange={() => onToggleActive(owner.id || (owner as any)._id)} 
                      />
                    </TableCell>
                    <TableCell className="text-right space-x-1.5">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => onOverrideClick(owner)} 
                        className="text-emerald-700 border-emerald-200/50 hover:bg-emerald-50 h-8 text-[11px] font-bold rounded-xl"
                      >
                        <UserCheck className="w-3.5 h-3.5 mr-1" /> Đổi gói
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => onEditClick(owner)} 
                        className="text-gray-600 hover:text-green-600 h-8 w-8"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => onResetPwClick(owner)} 
                        className="text-gray-600 hover:text-blue-600 h-8 w-8"
                      >
                        <Key className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {owners.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-gray-400 py-8 text-sm">
                      Không tìm thấy chủ nhà hàng nào
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

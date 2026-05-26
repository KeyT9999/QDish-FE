import React from 'react';
import { Restaurant, RestaurantStatus } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Loader2, Plus, Edit2, Key } from 'lucide-react';

export interface RestaurantsTabProps {
  restaurants: Restaurant[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  isLoading: boolean;
  onAddClick: () => void;
  onEditClick: (rest: Restaurant) => void;
  onResetPwClick: (rest: Restaurant) => void;
  onToggleActive: (id: string, currentStatus: RestaurantStatus) => Promise<void>;
}

export const RestaurantsTab: React.FC<RestaurantsTabProps> = ({
  restaurants,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  isLoading,
  onAddClick,
  onEditClick,
  onResetPwClick,
  onToggleActive
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex gap-2 w-full sm:max-w-md">
          <Input 
            placeholder="Tìm kiếm tên, email, địa chỉ..." 
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
              <SelectItem value={RestaurantStatus.ACTIVE}>Hoạt động</SelectItem>
              <SelectItem value={RestaurantStatus.INACTIVE}>Tạm khóa</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button 
          onClick={onAddClick} 
          className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-md shadow-green-600/10"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Thêm nhà hàng mới
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
                  <TableHead className="text-xs">Tên nhà hàng</TableHead>
                  <TableHead className="text-xs">Chủ sở hữu</TableHead>
                  <TableHead className="text-xs">Username</TableHead>
                  <TableHead className="text-xs">Email / Điện thoại</TableHead>
                  <TableHead className="text-xs">Hoạt động</TableHead>
                  <TableHead className="text-right text-xs">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {restaurants.map((rest) => (
                  <TableRow key={rest.id || (rest as any)._id}>
                    <TableCell className="font-bold text-xs text-gray-900">{rest.name}</TableCell>
                    <TableCell className="text-xs text-gray-800">{rest.ownerName}</TableCell>
                    <TableCell className="text-xs text-gray-600 font-mono">{rest.username}</TableCell>
                    <TableCell className="text-xs text-gray-500 space-y-0.5">
                      <span className="block">{rest.email}</span>
                      <span className="block">{rest.phone}</span>
                    </TableCell>
                    <TableCell>
                      <Switch 
                        checked={rest.status === RestaurantStatus.ACTIVE} 
                        onCheckedChange={() => onToggleActive(rest.id || (rest as any)._id, rest.status)} 
                      />
                    </TableCell>
                    <TableCell className="text-right space-x-1.5">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => onEditClick(rest)} 
                        className="text-gray-600 hover:text-green-600 h-8 w-8"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => onResetPwClick(rest)} 
                        className="text-gray-600 hover:text-blue-600 h-8 w-8"
                      >
                        <Key className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {restaurants.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-400 py-8 text-sm">
                      Không tìm thấy chi nhánh nào
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

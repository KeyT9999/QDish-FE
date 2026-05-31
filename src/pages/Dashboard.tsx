import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  enableRealtimeOrderAudio,
  REALTIME_ORDER_ALERT_DURATION_MS,
  startRealtimeOrderAlert,
  stopRealtimeOrderAlert,
  useRealtimeOrders,
  upsertRealtimeOrder
} from '@/hooks/useRealtimeOrders';
import { NewOrderAlertOverlay } from '@/components/shared/NewOrderAlertOverlay';
import { ActiveBill, MenuItem, Restaurant, Order, OrderStatus, RestaurantStats, Staff, Role } from '@/types';
import { menuService } from '@/services/menuService';
import { categoryService, CategoryItem } from '@/services/categoryService';
import { restaurantService } from '@/services/restaurantService';
import { orderService } from '@/services/orderService';
import { billService } from '@/services/billService';
import { staffService } from '@/services/staffService';
import { tableService, RestaurantTable } from '@/services/tableService';

import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { BellRing } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';

// Tab Components
import { RestaurantOverviewTab } from '@/components/dashboard/restaurant/RestaurantOverviewTab';
import { RestaurantOrdersTab } from '@/components/dashboard/restaurant/RestaurantOrdersTab';
import { RestaurantMenuTab } from '@/components/dashboard/restaurant/RestaurantMenuTab';
import { RestaurantCategoriesTab } from '@/components/dashboard/restaurant/RestaurantCategoriesTab';
import { RestaurantTablesTab } from '@/components/dashboard/restaurant/RestaurantTablesTab';
import { RestaurantBillsTab } from '@/components/dashboard/restaurant/RestaurantBillsTab';
import { RestaurantStaffTab } from '@/components/dashboard/restaurant/RestaurantStaffTab';
import { RestaurantSettingsTab } from '@/components/dashboard/restaurant/RestaurantSettingsTab';
import { RestaurantNotificationsTab } from '@/components/dashboard/restaurant/RestaurantNotificationsTab';

// Modal Components
import { MenuItemModal } from '@/components/dashboard/restaurant/modals/MenuItemModal';
import { CategoryModal } from '@/components/dashboard/restaurant/modals/CategoryModal';
import { QRPreviewModal } from '@/components/dashboard/restaurant/modals/QRPreviewModal';
import { StaffModal } from '@/components/dashboard/restaurant/modals/StaffModal';
import { EmailChangeOtpModal } from '@/components/dashboard/restaurant/modals/EmailChangeOtpModal';
import { BankChangeOtpModal } from '@/components/dashboard/restaurant/modals/BankChangeOtpModal';
import { BillPaymentModal } from '@/components/dashboard/restaurant/modals/BillPaymentModal';

const getOrderId = (order: Order) => String(order.id || (order as any)._id || '');

const banksList = [
  { code: 'vcb', name: 'Vietcombank' },
  { code: 'mb', name: 'MBBank' },
  { code: 'bidv', name: 'BIDV' },
  { code: 'tpb', name: 'TPBank' },
  { code: 'acb', name: 'ACB' },
  { code: 'vpb', name: 'VPBank' },
  { code: 'techcombank', name: 'Techcombank' },
  { code: 'agribank', name: 'Agribank' }
];

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  
  // Resolve restaurantId dynamically for RESTAURANT_OWNER
  const selectedRestId = localStorage.getItem('selected_restaurant_id') || '';
  const restaurantId = user?.role === 'RESTAURANT_OWNER' ? selectedRestId : (user?.restaurantId || '');

  // Tab State synced with URL query parameter
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const setActiveTab = (tab: string) => setSearchParams({ tab });

  // ============================================
  // Core Data States
  // ============================================
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeBills, setActiveBills] = useState<ActiveBill[]>([]);
  const [lastRealtimeOrder, setLastRealtimeOrder] = useState<Order | null>(null);
  const [activeRealtimeOrder, setActiveRealtimeOrder] = useState<Order | null>(null);
  const [realtimeAlertStartedAt, setRealtimeAlertStartedAt] = useState<number | null>(null);
  const [isConfirmingRealtimeOrder, setIsConfirmingRealtimeOrder] = useState(false);
  const [isRealtimeAudioReady, setIsRealtimeAudioReady] = useState(false);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [stats, setStats] = useState<RestaurantStats | null>(null);
  const [statsPeriod, setStatsPeriod] = useState<string>('today');

  // Search & Filter States
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('ALL');

  // Loading States
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);
  const [isLoadingTables, setIsLoadingTables] = useState(false);

  // Modal States
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [tableCountInput, setTableCountInput] = useState('');
  const [selectedTableQR, setSelectedTableQR] = useState<string | null>(null);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaffItem, setEditingStaffItem] = useState<Staff | null>(null);
  const [isEmailChangeModalOpen, setIsEmailChangeModalOpen] = useState(false);
  const [isBankChangeModalOpen, setIsBankChangeModalOpen] = useState(false);
  const [selectedPaymentBill, setSelectedPaymentBill] = useState<ActiveBill | null>(null);

  // Settings Form
  const [generalSettingsForm, setGeneralSettingsForm] = useState({
    name: '',
    ownerName: '',
    address: '',
    phone: '',
    bankName: '',
    bankAccount: ''
  });

  // ============================================
  // Data Fetching Functions
  // ============================================
  const loadRestaurantProfile = async () => {
    if (!restaurantId) return;
    try {
      const data = await restaurantService.getSettings();
      setRestaurant(data);
      setGeneralSettingsForm({
        name: data.name,
        ownerName: data.ownerName,
        address: data.address,
        phone: data.phone,
        bankName: data.bankName || '',
        bankAccount: data.bankAccount || ''
      });
    } catch (err) {
      toast.error('Không thể tải thông tin nhà hàng');
    }
  };

  const loadStats = async () => {
    if (!restaurantId) return;
    setIsLoadingStats(true);
    try {
      const data = await restaurantService.getMeStats(statsPeriod);
      setStats(data);
    } catch (err) {
      toast.error('Không thể tải thống kê doanh thu');
    } finally {
      setIsLoadingStats(false);
    }
  };

  const loadMenu = async () => {
    if (!restaurantId) return;
    setIsLoadingMenu(true);
    try {
      const data = await menuService.getAll(restaurantId);
      setMenuItems(data);
    } catch (err) {
      toast.error('Không thể tải thực đơn');
    } finally {
      setIsLoadingMenu(false);
    }
  };

  const loadCategories = async () => {
    if (!restaurantId) return;
    setIsLoadingCategories(true);
    try {
      const data = await categoryService.getAll(restaurantId);
      setCategories(data);
    } catch (err) {
      toast.error('Không thể tải danh mục');
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const loadOrderBillGroups = useCallback(async () => {
    if (!restaurantId) return;
    setIsLoadingOrders(true);
    try {
      const data = await billService.getBillGroups(restaurantId, {
        status: orderStatusFilter,
        search: orderSearch.trim() || undefined,
        page: 1,
        limit: 50
      });
      setActiveBills(data.bills);
      setOrders(data.bills.flatMap((bill) => bill.orders));
    } catch (err) {
      toast.error('Không thể tải danh sách bill');
    } finally {
      setIsLoadingOrders(false);
    }
  }, [restaurantId, orderSearch, orderStatusFilter]);

  const loadStaff = async () => {
    if (!restaurantId) return;
    setIsLoadingStaff(true);
    try {
      const data = await staffService.getAll();
      setStaff(data);
    } catch (err) {
      toast.error('Không thể tải danh sách nhân viên');
    } finally {
      setIsLoadingStaff(false);
    }
  };

  const loadTables = async () => {
    if (!restaurantId) return;
    setIsLoadingTables(true);
    try {
      const data = await tableService.getAll(restaurantId);
      setTables(data);
      if (data.length > 0) {
        setTableCountInput(data.length.toString());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingTables(false);
    }
  };

  useEffect(() => {
    if (!restaurantId) return;
    loadRestaurantProfile();
  }, [restaurantId]);

  useEffect(() => {
    if (!restaurantId) return;

    if (activeTab === 'overview') {
      loadStats();
    } else if (activeTab === 'menu') {
      loadMenu();
      loadCategories();
    } else if (activeTab === 'categories') {
      loadCategories();
    } else if (activeTab === 'orders') {
      loadOrderBillGroups();
    } else if (activeTab === 'tables') {
      loadTables();
    } else if (activeTab === 'staff') {
      loadStaff();
    }
  }, [activeTab, statsPeriod, restaurantId, loadOrderBillGroups]);

  // ============================================
  // CRUD Handlers (delegated to child components)
  // ============================================

  // Menu
  const handleOpenMenuModal = (item?: MenuItem) => {
    setEditingMenuItem(item || null);
    setIsMenuModalOpen(true);
  };

  const handleSaveMenuItem = async (payload: Partial<MenuItem>, editingItem: MenuItem | null) => {
    try {
      if (editingItem) {
        await menuService.update(editingItem.id || (editingItem as any)._id, payload);
        toast.success('Đã cập nhật món ăn thành công');
      } else {
        await menuService.create(payload);
        toast.success('Đã thêm món ăn mới thành công');
      }
      setIsMenuModalOpen(false);
      loadMenu();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi lưu món ăn');
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa món ăn này vĩnh viễn?')) return;
    try {
      await menuService.delete(id);
      toast.success('Đã xóa món ăn thành công');
      loadMenu();
    } catch (err) {
      toast.error('Không thể xóa món ăn');
    }
  };

  const handleToggleAvailable = async (id: string, currentAvailable: boolean) => {
    try {
      await menuService.update(id, { available: !currentAvailable });
      toast.success('Đã thay đổi trạng thái món ăn');
      loadMenu();
    } catch (err) {
      toast.error('Lỗi khi cập nhật trạng thái món ăn');
    }
  };

  // Category
  const handleOpenCategoryModal = (cat?: CategoryItem) => {
    setEditingCategory(cat || null);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (name: string, editingCat: CategoryItem | null) => {
    try {
      if (editingCat) {
        await categoryService.update(editingCat._id, name);
        toast.success('Đã cập nhật danh mục thành công');
      } else {
        await categoryService.create(name);
        toast.success('Đã tạo danh mục mới thành công');
      }
      setIsCategoryModalOpen(false);
      loadCategories();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi lưu danh mục');
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    const dishesInCat = menuItems.filter(item => item.category === name);
    if (dishesInCat.length > 0) {
      toast.error(`Danh mục đang chứa ${dishesInCat.length} món ăn. Vui lòng di chuyển hoặc xóa các món ăn trước.`);
      return;
    }
    if (!window.confirm('Bạn có chắc muốn xóa danh mục này?')) return;
    try {
      await categoryService.delete(id);
      toast.success('Đã xóa danh mục thành công');
      loadCategories();
    } catch (err) {
      toast.error('Lỗi khi xóa danh mục');
    }
  };

  // Tables & QR
  const handleSyncTables = async () => {
    const count = parseInt(tableCountInput, 10);
    if (isNaN(count) || count <= 0) {
      toast.error('Vui lòng nhập số lượng bàn hợp lệ');
      return;
    }
    try {
      for (let i = 1; i <= count; i++) {
        const tableCode = i < 10 ? `0${i}` : `${i}`;
        await tableService.createOrSync(tableCode);
      }
      toast.success(`Đã đồng bộ thành công ${count} bàn ăn`);
      loadTables();
    } catch (err) {
      toast.error('Lỗi khi đồng bộ bàn ăn');
    }
  };

  // Staff
  const handleOpenStaffModal = (item?: Staff) => {
    setEditingStaffItem(item || null);
    setIsStaffModalOpen(true);
  };

  const handleSaveStaff = async (data: { username: string; password: string; name: string }, editingStaff: Staff | null) => {
    try {
      if (editingStaff) {
        await staffService.update(editingStaff.id || (editingStaff as any)._id, {
          username: data.username,
          name: data.name,
          password: data.password || undefined
        });
        toast.success('Đã cập nhật thông tin nhân viên');
      } else {
        await staffService.create({
          username: data.username,
          name: data.name,
          password: data.password
        });
        toast.success('Đã thêm nhân viên mới thành công');
      }
      setIsStaffModalOpen(false);
      loadStaff();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi lưu nhân viên');
    }
  };

  const handleToggleStaffActive = async (id: string) => {
    try {
      await staffService.toggleActive(id);
      toast.success('Đã cập nhật trạng thái hoạt động của nhân viên');
      loadStaff();
    } catch (err) {
      toast.error('Lỗi khi toggle trạng thái hoạt động nhân viên');
    }
  };

  // Orders
  const handleUpdateOrderStatus = async (id: string, newStatus: OrderStatus) => {
    try {
      const updatedOrder = await orderService.updateStatus(id, newStatus);
      setOrders((current) => upsertRealtimeOrder(current, updatedOrder));
      if (newStatus === OrderStatus.CONFIRMED) {
        clearRealtimeAlert(id);
      }
      toast.success(`Đã chuyển đơn hàng sang trạng thái ${newStatus}`);
      loadOrderBillGroups();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi cập nhật trạng thái đơn hàng');
    }
  };

  const handlePayBill = async (billId: string) => {
    const bill = activeBills.find((item) => item.billId === billId);
    if (!bill) {
      toast.error('Không tìm thấy bill cần thanh toán');
      return;
    }
    setSelectedPaymentBill(bill);
  };

  // Settings & OTP
  const handleSaveGeneralSettings = async () => {
    if (!generalSettingsForm.name.trim() || !generalSettingsForm.phone.trim()) {
      toast.error('Tên nhà hàng và số điện thoại không được để trống');
      return;
    }
    try {
      await restaurantService.updateSettings({
        name: generalSettingsForm.name.trim(),
        ownerName: generalSettingsForm.ownerName.trim(),
        address: generalSettingsForm.address.trim(),
        phone: generalSettingsForm.phone.trim()
      });
      toast.success('Đã lưu thông tin cấu hình nhà hàng');
      loadRestaurantProfile();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi lưu cấu hình');
    }
  };

  const handleRequestEmailOtp = async (email: string) => {
    await restaurantService.requestEmailChangeOtp(email);
  };

  const handleSaveEmailChange = async (email: string, otp: string) => {
    try {
      await restaurantService.updateSettings({
        email,
        emailChangeOtp: otp
      });
      toast.success('Đã thay đổi email thành công');
      setIsEmailChangeModalOpen(false);
      loadRestaurantProfile();
    } catch (err: any) {
      toast.error(err.message || 'OTP không hợp lệ hoặc hết hạn');
    }
  };

  const handleRequestBankOtp = async (bankAccount: string, bankName: string) => {
    await restaurantService.requestBankChangeOtp(bankAccount, bankName);
  };

  const handleSaveBankChange = async (bankAccount: string, bankName: string, otp: string) => {
    try {
      await restaurantService.updateSettings({
        bankAccount,
        bankName,
        bankChangeOtp: otp
      });
      toast.success('Đã cập nhật thông tin tài khoản nhận tiền');
      setIsBankChangeModalOpen(false);
      loadRestaurantProfile();
    } catch (err: any) {
      toast.error(err.message || 'OTP không hợp lệ hoặc hết hạn');
    }
  };

  // ============================================
  // Realtime Order Alert Logic
  // ============================================
  const handleRealtimeNewOrder = useCallback((order: Order) => {
    setOrders((current) => upsertRealtimeOrder(current, order));
    setLastRealtimeOrder(order);
    setActiveRealtimeOrder(order);
    setRealtimeAlertStartedAt(Date.now());
    if (activeTab === 'orders') {
      void loadOrderBillGroups();
    }
  }, [activeTab, loadOrderBillGroups]);

  const handleRealtimeOrderUpdated = useCallback((order: Order) => {
    setOrders((current) => upsertRealtimeOrder(current, order));
    if (activeTab === 'orders') {
      void loadOrderBillGroups();
    }
  }, [activeTab, loadOrderBillGroups]);

  useRealtimeOrders({
    enabled: Boolean(restaurantId),
    onNewOrder: handleRealtimeNewOrder,
    onOrderUpdated: handleRealtimeOrderUpdated,
  });

  const handleEnableRealtimeAudio = useCallback(async () => {
    const enabled = await enableRealtimeOrderAudio();
    setIsRealtimeAudioReady(enabled);
    if (enabled && activeRealtimeOrder) {
      startRealtimeOrderAlert(activeRealtimeOrder);
    }
    toast[enabled ? 'success' : 'error'](
      enabled ? 'Đã bật âm báo đơn mới' : 'Trình duyệt chưa cho phép bật âm báo'
    );
  }, [activeRealtimeOrder]);

  const clearRealtimeAlert = useCallback((orderId?: string) => {
    stopRealtimeOrderAlert(orderId);
    setActiveRealtimeOrder((current) => {
      if (!current) return current;
      if (orderId && getOrderId(current) !== orderId) return current;
      return null;
    });
    setRealtimeAlertStartedAt(null);
    setIsConfirmingRealtimeOrder(false);
  }, []);

  useEffect(() => {
    if (!activeRealtimeOrder) return;

    const timeout = window.setTimeout(() => {
      clearRealtimeAlert(getOrderId(activeRealtimeOrder));
    }, REALTIME_ORDER_ALERT_DURATION_MS);

    return () => window.clearTimeout(timeout);
  }, [activeRealtimeOrder, clearRealtimeAlert]);

  useEffect(() => {
    if (!activeRealtimeOrder) return;

    const activeOrderId = getOrderId(activeRealtimeOrder);
    const latestOrder = orders.find((order) => getOrderId(order) === activeOrderId);
    if (latestOrder && latestOrder.status !== OrderStatus.PENDING) {
      clearRealtimeAlert(activeOrderId);
    }
  }, [activeRealtimeOrder, clearRealtimeAlert, orders]);

  const handleConfirmRealtimeOrder = async () => {
    if (!activeRealtimeOrder) return;

    const orderId = getOrderId(activeRealtimeOrder);
    if (!orderId) {
      clearRealtimeAlert();
      return;
    }

    if (activeRealtimeOrder.status !== OrderStatus.PENDING) {
      clearRealtimeAlert(orderId);
      return;
    }

    setIsConfirmingRealtimeOrder(true);
    try {
      const updatedOrder = await orderService.updateStatus(orderId, OrderStatus.CONFIRMED);
      setOrders((current) => upsertRealtimeOrder(current, updatedOrder));
      clearRealtimeAlert(orderId);
      toast.success('Đã xác nhận đơn mới');
      loadOrderBillGroups();
    } catch (err: any) {
      setIsConfirmingRealtimeOrder(false);
      toast.error(err.message || 'Không thể xác nhận đơn mới');
    }
  };

  // ============================================
  // Render
  // ============================================
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <NewOrderAlertOverlay
        order={activeRealtimeOrder}
        startedAt={realtimeAlertStartedAt}
        isAudioReady={isRealtimeAudioReady}
        isConfirming={isConfirmingRealtimeOrder}
        confirmLabel="Xác nhận đơn"
        onConfirm={handleConfirmRealtimeOrder}
        onEnableAudio={handleEnableRealtimeAudio}
      />

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-neutral-200/50 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Bảng điều khiển</h1>
          <p className="text-neutral-500 text-sm mt-1">
            Chào mừng quay lại, quản lý <span className="font-semibold text-neutral-800">{restaurant?.ownerName}</span>! Chúc {restaurant?.name} ngày mới kinh doanh phát đạt.
          </p>
        </div>
        <Button
          variant={isRealtimeAudioReady ? 'default' : 'outline'}
          size="sm"
          onClick={handleEnableRealtimeAudio}
          className="rounded-xl text-xs font-semibold"
        >
          <BellRing className="w-4 h-4 mr-1.5" />
          {isRealtimeAudioReady ? 'Chuông đã bật' : 'Bật chuông'}
        </Button>
      </div>

      {lastRealtimeOrder && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 shadow-sm">
          <div className="font-bold">Đơn mới vừa được đặt</div>
          <div className="mt-1 text-xs font-medium">
            Bàn {lastRealtimeOrder.tableNumber} • {lastRealtimeOrder.items.length} dòng món • {formatCurrency(lastRealtimeOrder.totalAmount)}
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsContent value="overview" className="space-y-6 outline-none">
          <RestaurantOverviewTab
            stats={stats}
            statsPeriod={statsPeriod}
            isLoadingStats={isLoadingStats}
            onSetStatsPeriod={setStatsPeriod}
          />
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <RestaurantOrdersTab
            activeBills={activeBills}
            orderSearch={orderSearch}
            orderStatusFilter={orderStatusFilter}
            isLoadingOrders={isLoadingOrders}
            onSetOrderSearch={setOrderSearch}
            onSetOrderStatusFilter={setOrderStatusFilter}
            onRefreshOrders={loadOrderBillGroups}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onPayBill={handlePayBill}
            userRole={user?.role as Role | undefined}
            canPayBill={user?.role === Role.RESTAURANT_ADMIN || user?.role === Role.RESTAURANT_OWNER}
          />
        </TabsContent>

        <TabsContent value="menu" className="space-y-6">
          <RestaurantMenuTab
            menuItems={menuItems}
            isLoadingMenu={isLoadingMenu}
            onOpenMenuModal={handleOpenMenuModal}
            onDeleteMenuItem={handleDeleteMenuItem}
            onToggleAvailable={handleToggleAvailable}
          />
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <RestaurantCategoriesTab
            categories={categories}
            menuItems={menuItems}
            isLoadingCategories={isLoadingCategories}
            onOpenCategoryModal={handleOpenCategoryModal}
            onDeleteCategory={handleDeleteCategory}
          />
        </TabsContent>

        <TabsContent value="tables" className="space-y-6">
          <RestaurantTablesTab
            tables={tables}
            tableCountInput={tableCountInput}
            restaurantId={restaurantId}
            isLoadingTables={isLoadingTables}
            onSetTableCountInput={setTableCountInput}
            onSyncTables={handleSyncTables}
            onSelectTableQR={setSelectedTableQR}
            onRefreshTables={loadTables}
          />
        </TabsContent>

        <TabsContent value="bills" className="space-y-6">
          <RestaurantBillsTab restaurantId={restaurantId} />
        </TabsContent>

        <TabsContent value="staff" className="space-y-6">
          <RestaurantStaffTab
            staff={staff}
            isLoadingStaff={isLoadingStaff}
            onOpenStaffModal={handleOpenStaffModal}
            onToggleStaffActive={handleToggleStaffActive}
          />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <RestaurantSettingsTab
            restaurant={restaurant}
            restaurantId={restaurantId}
            userRole={user?.role as Role | undefined}
            generalSettingsForm={generalSettingsForm}
            onSetGeneralSettingsForm={setGeneralSettingsForm}
            onSaveGeneralSettings={handleSaveGeneralSettings}
            onOpenEmailChangeModal={() => setIsEmailChangeModalOpen(true)}
            onOpenBankChangeModal={() => setIsBankChangeModalOpen(true)}
          />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <RestaurantNotificationsTab userRole={user?.role} />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <MenuItemModal
        open={isMenuModalOpen}
        onOpenChange={setIsMenuModalOpen}
        editingItem={editingMenuItem}
        categories={categories}
        onSave={handleSaveMenuItem}
      />

      <CategoryModal
        open={isCategoryModalOpen}
        onOpenChange={setIsCategoryModalOpen}
        editingCategory={editingCategory}
        onSave={handleSaveCategory}
      />

      <QRPreviewModal
        tableCode={selectedTableQR}
        restaurantId={restaurantId}
        restaurantName={restaurant?.name || ''}
        onClose={() => setSelectedTableQR(null)}
      />

      <StaffModal
        open={isStaffModalOpen}
        onOpenChange={setIsStaffModalOpen}
        editingStaff={editingStaffItem}
        onSave={handleSaveStaff}
      />

      <EmailChangeOtpModal
        open={isEmailChangeModalOpen}
        onOpenChange={setIsEmailChangeModalOpen}
        onRequestOtp={handleRequestEmailOtp}
        onSave={handleSaveEmailChange}
      />

      <BankChangeOtpModal
        open={isBankChangeModalOpen}
        onOpenChange={setIsBankChangeModalOpen}
        banksList={banksList}
        onRequestOtp={handleRequestBankOtp}
        onSave={handleSaveBankChange}
      />

      <BillPaymentModal
        open={Boolean(selectedPaymentBill)}
        bill={selectedPaymentBill}
        restaurantId={restaurantId}
        onOpenChange={(open) => {
          if (!open) setSelectedPaymentBill(null);
        }}
        onPaid={async () => {
          await Promise.all([loadOrderBillGroups(), loadTables()]);
        }}
      />
    </div>
  );
};

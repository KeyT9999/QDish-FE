import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { MenuItem, Restaurant, Order, OrderStatus, PaymentMethod, RestaurantStats, Staff, Allergen, HealthLabel, RestaurantStatus, Role } from '@/types';
import { menuService } from '@/services/menuService';
import { categoryService, CategoryItem } from '@/services/categoryService';
import { restaurantService } from '@/services/restaurantService';
import { orderService } from '@/services/orderService';
import { staffService } from '@/services/staffService';
import { tableService, RestaurantTable } from '@/services/tableService';
import { uploadService } from '@/services/uploadService';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  QrCode, 
  ClipboardList, 
  Users, 
  Settings, 
  Plus, 
  Edit2, 
  Trash2, 
  Landmark, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  ShieldAlert, 
  Award, 
  FileText, 
  CheckCircle2,
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Flame,
  Clock,
  MoreHorizontal,
  ArrowUpRight,
  Search,
  Filter,
  Tag,
  ChevronDown,
  Upload,
  BellRing
} from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { NotificationCenter } from '@/components/notification/NotificationCenter';
import { OwnerNotificationForm } from '@/components/notification/OwnerNotificationForm';

const QRCode = React.lazy(() =>
  import('qrcode.react').then((module) => ({ default: module.QRCodeSVG }))
);

const getOrderId = (order: Order) => String(order.id || (order as any)._id || '');

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  
  // Resolve restaurantId dynamically for RESTAURANT_OWNER
  const selectedRestId = localStorage.getItem('selected_restaurant_id') || '';
  const restaurantId = user?.role === 'RESTAURANT_OWNER' ? selectedRestId : (user?.restaurantId || '');

  // Tab State synced with URL query parameter
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const setActiveTab = (tab: string) => setSearchParams({ tab });

  const renderGrowthBadge = (change: number | null) => {
    if (change === null || change === undefined) return null;
    const isPositive = change >= 0;
    return (
      <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
        isPositive 
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-250/20' 
          : 'bg-rose-50 text-rose-700 border border-rose-250/20'
      }`}>
        {isPositive ? '↑' : '↓'} {Math.abs(change)}%
      </span>
    );
  };

  // Core Data States
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
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
  const [isUploadingMenuImage, setIsUploadingMenuImage] = useState(false);

  // Modals & Forms States
  // 1. Menu Modal
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [menuForm, setMenuForm] = useState({
    name: '',
    price: 0,
    category: '',
    categoryId: '',
    description: '',
    imageUrl: '',
    available: true,
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
    nutritionScore: 0,
    allergens: [] as Allergen[],
    healthLabels: [] as HealthLabel[]
  });

  // 2. Category Modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [categoryNameInput, setCategoryNameInput] = useState('');

  // 3. Table Modal / Sync
  const [tableCountInput, setTableCountInput] = useState('');
  const [selectedTableQR, setSelectedTableQR] = useState<string | null>(null);

  // 4. Staff Modal
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaffItem, setEditingStaffItem] = useState<Staff | null>(null);
  const [staffForm, setStaffForm] = useState({
    username: '',
    password: '',
    name: '',
    isActive: true
  });

  // 5. Payment Completion Modal
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<Order | null>(null);
  const [invoicePaymentMethod, setInvoicePaymentMethod] = useState<PaymentMethod>(PaymentMethod.BANK_TRANSFER);

  // 6. Settings Verification (OTP Profile changes)
  const [isEmailChangeModalOpen, setIsEmailChangeModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [isOtpSentForEmail, setIsOtpSentForEmail] = useState(false);

  const [isBankChangeModalOpen, setIsBankChangeModalOpen] = useState(false);
  const [newBankName, setNewBankName] = useState('');
  const [newBankAccount, setNewBankAccount] = useState('');
  const [bankOtp, setBankOtp] = useState('');
  const [isOtpSentForBank, setIsOtpSentForBank] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isSendingBankOtp, setIsSendingBankOtp] = useState(false);

  const [generalSettingsForm, setGeneralSettingsForm] = useState({
    name: '',
    ownerName: '',
    address: '',
    phone: '',
    bankName: '',
    bankAccount: ''
  });

  const allergensList = Object.values(Allergen);
  const healthLabelsList = Object.values(HealthLabel);
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
      // Admin gets all including unavailable
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

  const loadOrders = async () => {
    if (!restaurantId) return;
    setIsLoadingOrders(true);
    try {
      const data = await orderService.getAll();
      setOrders(data);
    } catch (err) {
      toast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setIsLoadingOrders(false);
    }
  };

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
      loadOrders();
    } else if (activeTab === 'tables') {
      loadTables();
    } else if (activeTab === 'staff') {
      loadStaff();
    }
  }, [activeTab, statsPeriod, restaurantId]);

  // ============================================
  // CRUD Handlers
  // ============================================
  // 1. Menu Management
  const handleOpenMenuModal = (item?: MenuItem) => {
    if (item) {
      setEditingMenuItem(item);
      setMenuForm({
        name: item.name,
        price: item.price,
        category: item.category,
        categoryId: item.categoryId || '',
        description: item.description,
        imageUrl: item.imageUrl,
        available: item.available,
        calories: item.nutrition?.calories || item.calories || 0,
        protein: item.nutrition?.protein || item.protein || 0,
        carbs: item.nutrition?.carbs || item.carbs || 0,
        fat: item.nutrition?.fat || item.fat || 0,
        fiber: item.nutrition?.fiber || item.fiber || 0,
        sugar: item.nutrition?.sugar || item.sugar || 0,
        sodium: item.nutrition?.sodium || item.sodium || 0,
        nutritionScore: item.nutrition?.nutritionScore || item.nutritionScore || 0,
        allergens: item.allergens || [],
        healthLabels: item.healthLabels || []
      });
    } else {
      setEditingMenuItem(null);
      setMenuForm({
        name: '',
        price: 0,
        category: categories[0]?.name || '',
        categoryId: categories[0]?._id || '',
        description: '',
        imageUrl: '',
        available: true,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0,
        nutritionScore: 0,
        allergens: [],
        healthLabels: []
      });
    }
    setIsMenuModalOpen(true);
  };

  const handleUploadMenuImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn đúng file ảnh');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ảnh món ăn không được vượt quá 5MB');
      return;
    }

    setIsUploadingMenuImage(true);
    try {
      const uploaded = await uploadService.uploadMenuImage(file);
      setMenuForm((current) => ({ ...current, imageUrl: uploaded.url }));
      toast.success('Đã upload ảnh món ăn lên Cloudinary');
    } catch (err: any) {
      toast.error(err.message || 'Không thể upload ảnh món ăn');
    } finally {
      setIsUploadingMenuImage(false);
    }
  };

  const handleSaveMenuItem = async () => {
    if (!menuForm.name.trim()) {
      toast.error('Tên món ăn là bắt buộc');
      return;
    }
    if (menuForm.price <= 0) {
      toast.error('Giá món ăn phải lớn hơn 0');
      return;
    }
    if (!menuForm.category) {
      toast.error('Danh mục món ăn là bắt buộc');
      return;
    }
    if (
      menuForm.calories < 0 ||
      menuForm.protein < 0 ||
      menuForm.carbs < 0 ||
      menuForm.fat < 0 ||
      menuForm.fiber < 0 ||
      menuForm.sugar < 0 ||
      menuForm.sodium < 0 ||
      menuForm.nutritionScore < 0 ||
      menuForm.nutritionScore > 100
    ) {
      toast.error('Các chỉ số dinh dưỡng không được nhỏ hơn 0, và Nutrition Score nằm trong khoảng 0-100');
      return;
    }

    const payload: Partial<MenuItem> = {
      name: menuForm.name.trim(),
      price: menuForm.price,
      category: menuForm.category,
      categoryId: menuForm.categoryId || undefined,
      description: menuForm.description.trim(),
      imageUrl: menuForm.imageUrl.trim(),
      available: menuForm.available,
      nutrition: {
        calories: menuForm.calories,
        protein: menuForm.protein,
        carbs: menuForm.carbs,
        fat: menuForm.fat,
        fiber: menuForm.fiber,
        sugar: menuForm.sugar,
        sodium: menuForm.sodium,
        nutritionScore: menuForm.nutritionScore
      },
      allergens: menuForm.allergens,
      healthLabels: menuForm.healthLabels
    };

    try {
      if (editingMenuItem) {
        await menuService.update(editingMenuItem.id || (editingMenuItem as any)._id, payload);
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

  // 2. Category Management
  const handleOpenCategoryModal = (cat?: CategoryItem) => {
    if (cat) {
      setEditingCategory(cat);
      setCategoryNameInput(cat.name);
    } else {
      setEditingCategory(null);
      setCategoryNameInput('');
    }
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryNameInput.trim()) {
      toast.error('Vui lòng nhập tên danh mục');
      return;
    }
    try {
      if (editingCategory) {
        await categoryService.update(editingCategory._id, categoryNameInput.trim());
        toast.success('Đã cập nhật danh mục thành công');
      } else {
        await categoryService.create(categoryNameInput.trim());
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

  // 3. Tables & QR Code
  const handleSyncTables = async () => {
    const count = parseInt(tableCountInput, 10);
    if (isNaN(count) || count <= 0) {
      toast.error('Vui lòng nhập số lượng bàn hợp lệ');
      return;
    }
    try {
      // Sync by adding each table number up to count
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

  // 4. Staff Management
  const handleOpenStaffModal = (item?: Staff) => {
    if (item) {
      setEditingStaffItem(item);
      setStaffForm({
        username: item.username,
        password: '',
        name: item.name,
        isActive: item.isActive
      });
    } else {
      setEditingStaffItem(null);
      setStaffForm({
        username: '',
        password: '',
        name: '',
        isActive: true
      });
    }
    setIsStaffModalOpen(true);
  };

  const handleSaveStaff = async () => {
    if (!staffForm.username.trim() || !staffForm.name.trim() || (!editingStaffItem && !staffForm.password)) {
      toast.error('Vui lòng điền đầy đủ các thông tin bắt buộc');
      return;
    }
    try {
      if (editingStaffItem) {
        await staffService.update(editingStaffItem.id || (editingStaffItem as any)._id, {
          username: staffForm.username.trim(),
          name: staffForm.name.trim(),
          password: staffForm.password || undefined
        });
        toast.success('Đã cập nhật thông tin nhân viên');
      } else {
        await staffService.create({
          username: staffForm.username.trim(),
          name: staffForm.name.trim(),
          password: staffForm.password
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

  // 5. Order Management & Status Updates
  const handleUpdateOrderStatus = async (id: string, newStatus: OrderStatus) => {
    try {
      const updatedOrder = await orderService.updateStatus(id, newStatus);
      setOrders((current) => upsertRealtimeOrder(current, updatedOrder));
      if (newStatus === OrderStatus.CONFIRMED) {
        clearRealtimeAlert(id);
      }
      toast.success(`Đã chuyển đơn hàng sang trạng thái ${newStatus}`);
      loadOrders();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi cập nhật trạng thái đơn hàng');
    }
  };

  const handleOpenCompletePaymentModal = (order: Order) => {
    setSelectedOrderForPayment(order);
    setInvoicePaymentMethod(PaymentMethod.BANK_TRANSFER);
  };

  const handleCompleteOrder = async () => {
    if (!selectedOrderForPayment) return;
    try {
      await orderService.updateStatus(
        selectedOrderForPayment.id || (selectedOrderForPayment as any)._id,
        OrderStatus.COMPLETED,
        invoicePaymentMethod
      );
      toast.success('Đơn hàng đã được thanh toán và hoàn thành!');
      setSelectedOrderForPayment(null);
      loadOrders();
    } catch (err) {
      toast.error('Lỗi khi hoàn thành đơn hàng');
    }
  };

  // ============================================
  // Settings & OTP Handlers
  // ============================================
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

  // Email Change
  const handleRequestEmailOtp = async () => {
    if (!newEmail.trim()) {
      toast.error('Vui lòng điền email mới');
      return;
    }
    setIsSendingOtp(true);
    try {
      await restaurantService.requestEmailChangeOtp(newEmail.trim());
      setIsOtpSentForEmail(true);
      toast.success('Mã OTP đổi email đã được gửi. Vui lòng kiểm tra email của bạn.');
    } catch (err: any) {
      toast.error(err.message || 'Lỗi gửi OTP đổi email');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleSaveEmailChange = async () => {
    if (!newEmail.trim() || !emailOtp.trim()) {
      toast.error('Vui lòng điền đầy đủ email mới và OTP');
      return;
    }
    try {
      await restaurantService.updateSettings({
        email: newEmail.trim(),
        emailChangeOtp: emailOtp.trim()
      });
      toast.success('Đã thay đổi email thành công');
      setIsEmailChangeModalOpen(false);
      setNewEmail('');
      setEmailOtp('');
      setIsOtpSentForEmail(false);
      loadRestaurantProfile();
    } catch (err: any) {
      toast.error(err.message || 'OTP không hợp lệ hoặc hết hạn');
    }
  };

  // Bank Change
  const handleRequestBankOtp = async () => {
    if (!newBankAccount.trim() || !newBankName) {
      toast.error('Vui lòng điền Số tài khoản và chọn Ngân hàng');
      return;
    }
    setIsSendingBankOtp(true);
    try {
      await restaurantService.requestBankChangeOtp(newBankAccount.trim(), newBankName);
      setIsOtpSentForBank(true);
      toast.success('Mã OTP đổi ngân hàng đã được gửi đến email hiện tại của nhà hàng.');
    } catch (err: any) {
      toast.error(err.message || 'Lỗi gửi OTP đổi ngân hàng');
    } finally {
      setIsSendingBankOtp(false);
    }
  };

  const handleSaveBankChange = async () => {
    if (!newBankAccount.trim() || !newBankName || !bankOtp.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin tài khoản bank và OTP');
      return;
    }
    try {
      await restaurantService.updateSettings({
        bankAccount: newBankAccount.trim(),
        bankName: newBankName,
        bankChangeOtp: bankOtp.trim()
      });
      toast.success('Đã cập nhật thông tin tài khoản nhận tiền');
      setIsBankChangeModalOpen(false);
      setNewBankAccount('');
      setNewBankName('');
      setBankOtp('');
      setIsOtpSentForBank(false);
      loadRestaurantProfile();
    } catch (err: any) {
      toast.error(err.message || 'OTP không hợp lệ hoặc hết hạn');
    }
  };

  // ============================================
  // Recharts Data Computations
  // ============================================
  const revenueChartData = stats?.revenueByDate || [];
  const hourlyChartData = stats?.revenueByHour || [];
  const categoryChartData = stats?.revenueByCategory || [];
  const topDishesData = stats?.topMenuItems || [];

  const COLORS = ['#22c55e', '#3b82f6', '#a855f7', '#f97316', '#06b6d4', '#ec4899'];

  const filteredOrders = useMemo(() => orders.filter(order => {
    // Check Status Filter
    if (orderStatusFilter !== 'ALL' && order.status !== orderStatusFilter) {
      return false;
    }
    // Check Search (Mã đơn, Số bàn, Tên khách, Tên món)
    if (orderSearch.trim()) {
      const searchLower = orderSearch.toLowerCase();
      const orderId = String(order.id || (order as any)._id).toLowerCase();
      const tableNum = String(order.tableNumber).toLowerCase();
      const customer = (order.customerName || '').toLowerCase();
      const itemsString = order.items.map(i => i.name).join(' ').toLowerCase();

      return (
        orderId.includes(searchLower) ||
        tableNum.includes(searchLower) ||
        customer.includes(searchLower) ||
        itemsString.includes(searchLower)
      );
    }
    return true;
  }), [orders, orderSearch, orderStatusFilter]);

  const handleRealtimeNewOrder = useCallback((order: Order) => {
    setOrders((current) => upsertRealtimeOrder(current, order));
    setLastRealtimeOrder(order);
    setActiveRealtimeOrder(order);
    setRealtimeAlertStartedAt(Date.now());
  }, []);

  const handleRealtimeOrderUpdated = useCallback((order: Order) => {
    setOrders((current) => upsertRealtimeOrder(current, order));
  }, []);

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
    } catch (err: any) {
      setIsConfirmingRealtimeOrder(false);
      toast.error(err.message || 'Không thể xác nhận đơn mới');
    }
  };

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

        {/* Tab 1: OVERVIEW */}
        <TabsContent value="overview" className="space-y-6 outline-none">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <h2 className="text-xl font-bold tracking-tight text-neutral-900">Số liệu kinh doanh</h2>
            <div className="bg-neutral-100/80 p-1 rounded-xl flex gap-1 w-fit border border-neutral-200/20">
              {['today', 'week', 'month', 'year'].map(p => (
                <button
                  key={p}
                  onClick={() => setStatsPeriod(p)}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors duration-200 ${
                    statsPeriod === p 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-neutral-500 hover:text-neutral-950'
                  }`}
                >
                  {p === 'today' ? 'Hôm nay' : p === 'week' ? 'Tuần này' : p === 'month' ? 'Tháng này' : 'Năm nay'}
                </button>
              ))}
            </div>
          </div>

          {isLoadingStats ? (
            <div className="flex py-24 justify-center items-center">
              <RefreshCw className="w-8 h-8 animate-spin text-green-600 mr-2" />
              <span className="text-sm font-semibold text-neutral-500">Đang tải báo cáo...</span>
            </div>
          ) : (
            <>
              {/* Stats Grid cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Card 1: Doanh thu tích lũy */}
                <div className="rounded-2xl border border-neutral-200/50 bg-white p-6 shadow-sm hover:shadow-md/5 transition-shadow duration-200 flex flex-col justify-between relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Doanh thu tích lũy</span>
                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-3xl font-bold tracking-tight text-neutral-900 block">
                      {formatCurrency(stats?.overview.totalRevenue || 0)}
                    </span>
                    <div className="flex items-center gap-2 mt-2">
                      {renderGrowthBadge(stats?.overview.revenueChange ?? null)}
                      <span className="text-[10px] text-neutral-400 font-semibold">So với chu kỳ trước</span>
                    </div>
                  </div>
                </div>

                {/* Card 2: Số lượng đơn hàng */}
                <div className="rounded-2xl border border-neutral-200/50 bg-white p-6 shadow-sm hover:shadow-md/5 transition-shadow duration-200 flex flex-col justify-between relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Số lượng đơn hàng</span>
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-3xl font-bold tracking-tight text-neutral-900 block">
                      {stats?.overview.totalOrders || 0} <span className="text-sm font-semibold text-neutral-400">đơn</span>
                    </span>
                    <div className="flex items-center gap-2 mt-2">
                      {renderGrowthBadge(stats?.overview.ordersChange ?? null)}
                      <span className="text-[10px] text-neutral-400 font-semibold">So với chu kỳ trước</span>
                    </div>
                  </div>
                </div>

                {/* Card 3: Đơn hàng trung bình */}
                <div className="rounded-2xl border border-neutral-200/50 bg-white p-6 shadow-sm hover:shadow-md/5 transition-shadow duration-200 flex flex-col justify-between relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Đơn hàng trung bình</span>
                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-orange-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-3xl font-bold tracking-tight text-neutral-900 block">
                      {formatCurrency(stats?.overview.averageOrderValue || 0)}
                    </span>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[10px] text-neutral-400 font-semibold">Đơn hoàn thành / Doanh số</span>
                    </div>
                  </div>
                </div>

                {/* Card 4: Món bán chạy nhất */}
                <div className="rounded-2xl border border-neutral-200/50 bg-white p-6 shadow-sm hover:shadow-md/5 transition-shadow duration-200 flex flex-col justify-between relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Món bán chạy nhất</span>
                    <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
                      <Flame className="w-4 h-4 text-rose-500" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-lg font-bold tracking-tight text-neutral-950 block truncate" title={stats?.overview.topSellingItem?.name || 'Không có'}>
                      {stats?.overview.topSellingItem?.name || 'Không có'}
                    </span>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="text-[10px] text-neutral-500 font-bold bg-neutral-100 px-2 py-0.5 rounded-md">
                        Đã bán {stats?.overview.topSellingItem?.quantity || 0} suất
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recharts Grid charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Chart 1: AreaChart */}
                <div className="rounded-2xl border border-neutral-200/50 bg-white p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold text-neutral-900">Doanh thu theo chu kỳ</h3>
                    <span className="text-[10px] text-neutral-400 font-bold bg-neutral-50 px-2 py-1 rounded-md">Đồ thị vùng</span>
                  </div>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height={288}>
                      <AreaChart data={revenueChartData}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="4" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} 
                          formatter={(value) => [formatCurrency(Number(value)), 'Doanh thu']}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Chart 2: BarChart */}
                <div className="rounded-2xl border border-neutral-200/50 bg-white p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold text-neutral-900">Doanh số theo giờ cao điểm</h3>
                    <span className="text-[10px] text-neutral-400 font-bold bg-neutral-50 px-2 py-1 rounded-md">Biểu đồ cột</span>
                  </div>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height={288}>
                      <BarChart data={hourlyChartData}>
                        <CartesianGrid strokeDasharray="4" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="hour" tickFormatter={(hour: number) => `${hour}h`} stroke="#94a3b8" fontSize={10} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} 
                          formatter={(value) => [formatCurrency(Number(value)), 'Doanh thu']}
                        />
                        <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Chart 3: PieChart */}
                <div className="rounded-2xl border border-neutral-200/50 bg-white p-6 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold text-neutral-900">Phần bổ Doanh thu danh mục</h3>
                    <span className="text-[10px] text-neutral-400 font-bold bg-neutral-50 px-2 py-1 rounded-md">Biểu đồ tròn</span>
                  </div>
                  <div className="h-72 flex items-center justify-center">
                    {categoryChartData.length === 0 ? (
                      <span className="text-neutral-400 text-xs font-semibold">Chưa có dữ liệu</span>
                    ) : (
                      <ResponsiveContainer width="100%" height={288}>
                        <PieChart>
                          <Pie
                            data={categoryChartData}
                            dataKey="revenue"
                            nameKey="category"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={(entry: any) => entry.category}
                          >
                            {categoryChartData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} 
                            formatter={(value) => [formatCurrency(Number(value)), 'Doanh thu']}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Chart 4: Top 10 Table */}
                <div className="rounded-2xl border border-neutral-200/50 bg-white p-6 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-neutral-900">Top 10 Món bán chạy nhất</h3>
                    <span className="text-[10px] text-neutral-400 font-bold bg-neutral-50 px-2 py-1 rounded-md">Xếp hạng</span>
                  </div>
                  <div className="overflow-x-auto flex-1">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-neutral-100 hover:bg-transparent">
                          <TableHead className="text-xs font-bold text-neutral-400">Món ăn</TableHead>
                          <TableHead className="text-center text-xs font-bold text-neutral-400">Số lượng</TableHead>
                          <TableHead className="text-right text-xs font-bold text-neutral-400">Doanh thu</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {topDishesData.map((item, idx) => (
                          <TableRow key={idx} className="border-neutral-100 hover:bg-neutral-50/50 transition-colors">
                            <TableCell className="font-semibold text-xs text-gray-800">{item.name}</TableCell>
                            <TableCell className="text-center text-xs text-gray-600 font-semibold">{item.quantity}</TableCell>
                            <TableCell className="text-right text-xs font-bold text-green-700">{formatCurrency(item.revenue)}</TableCell>
                          </TableRow>
                        ))}
                        {topDishesData.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center text-gray-400 text-xs py-6">Không có dữ liệu</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </>
          )}
        </TabsContent>

        {/* Tab 2: ORDER MANAGEMENT */}
        <TabsContent value="orders" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-neutral-900">Danh sách đơn hàng hiện tại</h2>
              <p className="text-neutral-500 text-xs mt-0.5">Theo dõi và cập nhật trạng thái đơn hàng của thực khách theo thời gian thực.</p>
            </div>
            <Button size="sm" onClick={loadOrders} className="rounded-xl bg-neutral-900 hover:bg-black text-white font-semibold shadow-sm gap-1.5 h-9 self-start sm:self-auto">
              <RefreshCw className="w-3.5 h-3.5" /> Làm mới
            </Button>
          </div>

          {/* Controls Toolbar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl border border-neutral-200/50 shadow-sm">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input
                placeholder="Tìm mã đơn, số bàn, khách..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="pl-10 rounded-xl border-neutral-200 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 text-sm"
              />
            </div>
            
            {/* Status Pills */}
            <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
              {[
                { label: 'Tất cả', value: 'ALL' },
                { label: 'Chờ duyệt', value: OrderStatus.PENDING },
                { label: 'Bếp nhận', value: OrderStatus.CONFIRMED },
                { label: 'Đã phục vụ', value: OrderStatus.SERVED },
                { label: 'Hoàn thành', value: OrderStatus.COMPLETED },
                { label: 'Đã hủy', value: OrderStatus.CANCELLED },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setOrderStatusFilter(tab.value)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors duration-200 ${
                    orderStatusFilter === tab.value
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                      : 'bg-neutral-50 text-neutral-600 border-neutral-200/60 hover:bg-neutral-100 hover:text-neutral-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <Card className="shadow-sm border-neutral-200/50 rounded-2xl overflow-hidden bg-white">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-neutral-100 hover:bg-transparent">
                    <TableHead className="text-xs font-bold text-neutral-400 pl-6 w-[120px]">Mã đơn</TableHead>
                    <TableHead className="text-xs font-bold text-neutral-400 w-[100px]">Bàn</TableHead>
                    <TableHead className="text-xs font-bold text-neutral-400 w-[140px]">Khách hàng</TableHead>
                    <TableHead className="text-xs font-bold text-neutral-400">Chi tiết món</TableHead>
                    <TableHead className="text-xs font-bold text-neutral-400 w-[130px]">Thời gian</TableHead>
                    <TableHead className="text-xs font-bold text-neutral-400 w-[120px]">Tổng tiền</TableHead>
                    <TableHead className="text-xs font-bold text-neutral-400 w-[130px]">Trạng thái</TableHead>
                    <TableHead className="text-right text-xs font-bold text-neutral-400 w-[150px] pr-6">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => {
                    const statusColors: Record<OrderStatus, string> = {
                      [OrderStatus.PENDING]: 'bg-amber-50 text-amber-700 border-amber-200/30',
                      [OrderStatus.CONFIRMED]: 'bg-blue-50 text-blue-700 border-blue-200/30',
                      [OrderStatus.SERVED]: 'bg-violet-50 text-violet-700 border-violet-200/30',
                      [OrderStatus.COMPLETED]: 'bg-emerald-50 text-emerald-700 border-emerald-250/20',
                      [OrderStatus.CANCELLED]: 'bg-rose-50 text-rose-700 border-rose-200/30'
                    };

                    const statusLabel: Record<OrderStatus, string> = {
                      [OrderStatus.PENDING]: 'Chờ duyệt',
                      [OrderStatus.CONFIRMED]: 'Bếp nhận',
                      [OrderStatus.SERVED]: 'Đã ra món',
                      [OrderStatus.COMPLETED]: 'Hoàn thành',
                      [OrderStatus.CANCELLED]: 'Đã hủy'
                    };

                    const orderId = order.id || (order as any)._id;
                    const orderIdShort = String(orderId).slice(-6).toUpperCase();
                    const orderItemsText = order.items.map(i => `${i.name} x${i.quantity}`).join(', ');

                    // Format order time
                    let timeStr = 'Vừa xong';
                    if (order.createdAt) {
                      try {
                        const date = new Date(order.createdAt);
                        timeStr = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
                      } catch {
                        timeStr = 'Vừa xong';
                      }
                    } else if (order.timestamp) {
                      try {
                        const date = new Date(order.timestamp);
                        timeStr = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                      } catch {
                        timeStr = 'Vừa xong';
                      }
                    }

                    return (
                      <TableRow key={orderId} className="border-neutral-100 hover:bg-neutral-50/40 transition-colors">
                        <TableCell className="font-mono font-bold text-xs text-neutral-500 pl-6">#{orderIdShort}</TableCell>
                        <TableCell className="font-bold text-xs text-neutral-900">Bàn {order.tableNumber}</TableCell>
                        <TableCell className="text-xs text-neutral-700 font-semibold">{order.customerName || 'Khách vãng lai'}</TableCell>
                        <TableCell className="text-xs max-w-xs truncate text-neutral-600" title={orderItemsText}>
                          <span className="font-medium">{orderItemsText}</span>
                        </TableCell>
                        <TableCell className="text-xs text-neutral-400 font-medium">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-neutral-350" />
                            {timeStr}
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-neutral-900 text-xs">{formatCurrency(order.totalAmount)}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${statusColors[order.status]}`}>
                            {statusLabel[order.status]}
                          </span>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Primary action based on current state */}
                            {order.status === OrderStatus.PENDING && (
                              <Button 
                                size="sm" 
                                onClick={() => handleUpdateOrderStatus(orderId, OrderStatus.CONFIRMED)} 
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1 h-8 rounded-lg shadow-sm"
                              >
                                Xác nhận
                              </Button>
                            )}
                            {order.status === OrderStatus.CONFIRMED && (
                              <Button 
                                size="sm" 
                                onClick={() => handleUpdateOrderStatus(orderId, OrderStatus.SERVED)} 
                                className="bg-violet-600 hover:bg-violet-750 text-white text-xs font-semibold px-3 py-1 h-8 rounded-lg shadow-sm"
                              >
                                Ra món
                              </Button>
                            )}
                            {order.status === OrderStatus.SERVED && (
                              <Button 
                                size="sm" 
                                onClick={() => handleOpenCompletePaymentModal(order)} 
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1 h-8 rounded-lg shadow-sm"
                              >
                                Thanh toán
                              </Button>
                            )}

                            {/* Row actions dropdown */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg border border-neutral-200/50 hover:bg-neutral-50">
                                  <MoreHorizontal className="w-4 h-4 text-neutral-500" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-white rounded-xl shadow-lg border border-neutral-100 p-1 w-44">
                                {order.status !== OrderStatus.COMPLETED && order.status !== OrderStatus.CANCELLED && (
                                  <>
                                    <DropdownMenuItem 
                                      onClick={() => handleUpdateOrderStatus(orderId, OrderStatus.CANCELLED)}
                                      className="text-rose-600 hover:bg-rose-50/50 focus:text-rose-700 focus:bg-rose-55 font-semibold text-xs rounded-lg cursor-pointer"
                                    >
                                      Hủy đơn hàng
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-neutral-100 my-1" />
                                  </>
                                )}
                                <DropdownMenuItem 
                                  onClick={() => {
                                    navigator.clipboard.writeText(orderId);
                                    toast.success('Đã copy mã đơn hàng');
                                  }}
                                  className="text-neutral-700 font-medium text-xs rounded-lg cursor-pointer"
                                >
                                  Sao chép mã đơn
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredOrders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-16">
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <div className="w-12 h-12 rounded-2xl bg-neutral-50 border border-neutral-200/40 flex items-center justify-center">
                            <ClipboardList className="w-6 h-6 text-neutral-400" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-neutral-800">Chưa có đơn hàng nào</h3>
                            <p className="text-xs text-neutral-400 mt-1">Không tìm thấy đơn hàng phù hợp với bộ lọc hiện tại.</p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: MENU MANAGEMENT */}
        <TabsContent value="menu" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-neutral-900">Quản lý Món ăn (Menu)</h2>
              <p className="text-neutral-500 text-xs mt-0.5">Quản lý danh sách món ăn, giá bán và thông tin dinh dưỡng.</p>
            </div>
            <Button onClick={() => handleOpenMenuModal()} className="rounded-xl bg-neutral-900 hover:bg-black text-white font-semibold shadow-sm gap-1.5 h-9 self-start sm:self-auto">
              <Plus className="w-4 h-4" /> Thêm món mới
            </Button>
          </div>

          <Card className="shadow-sm border-neutral-200/50 rounded-2xl overflow-hidden bg-white">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-neutral-100 hover:bg-transparent">
                    <TableHead className="text-xs font-bold text-neutral-400 pl-6 w-[80px]">Món</TableHead>
                    <TableHead className="text-xs font-bold text-neutral-400">Tên món</TableHead>
                    <TableHead className="text-xs font-bold text-neutral-400 w-[120px]">Giá</TableHead>
                    <TableHead className="text-xs font-bold text-neutral-400 w-[120px]">Danh mục</TableHead>
                    <TableHead className="text-xs font-bold text-neutral-400">Chỉ số QDish</TableHead>
                    <TableHead className="text-xs font-bold text-neutral-400 w-[110px]">Trạng thái</TableHead>
                    <TableHead className="text-right text-xs font-bold text-neutral-400 w-[100px] pr-6">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {menuItems.map((item) => {
                    const itemId = item.id || (item as any)._id;
                    
                    return (
                      <TableRow key={itemId} className="border-neutral-100 hover:bg-neutral-50/40 transition-colors">
                        <TableCell className="pl-6 py-4">
                          <img 
                            src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=60'} 
                            alt={item.name} 
                            width={48}
                            height={48}
                            loading="lazy"
                            decoding="async"
                            className="w-12 h-12 object-cover rounded-xl border border-neutral-200 shadow-sm" 
                          />
                        </TableCell>
                        <TableCell className="py-4">
                          <div>
                            <div className="font-bold text-xs text-neutral-900">{item.name}</div>
                            {item.description && (
                              <div className="text-[11px] text-neutral-400 line-clamp-1 max-w-sm mt-0.5" title={item.description}>
                                {item.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-neutral-955 text-xs py-4">
                          {formatCurrency(item.price)}
                        </TableCell>
                        <TableCell className="py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-700 border border-neutral-200/50">
                            {item.category}
                          </span>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="space-y-1.5">
                            {item.nutrition && (
                              <div className="text-[11px] text-neutral-500 font-medium flex flex-wrap gap-x-2 items-center">
                                <span className="font-bold text-neutral-750">{item.nutrition.calories} kcal</span>
                                <span className="w-1 h-1 rounded-full bg-neutral-300" />
                                <span>P: {item.nutrition.protein}g</span>
                                <span className="w-1 h-1 rounded-full bg-neutral-300" />
                                <span>C: {item.nutrition.carbs}g</span>
                                <span className="w-1 h-1 rounded-full bg-neutral-300" />
                                <span>F: {item.nutrition.fat}g</span>
                                {item.nutrition.fiber !== undefined && item.nutrition.fiber > 0 && (
                                  <>
                                    <span className="w-1 h-1 rounded-full bg-neutral-300" />
                                    <span>Fi: {item.nutrition.fiber}g</span>
                                  </>
                                )}
                                {item.nutrition.sugar !== undefined && item.nutrition.sugar > 0 && (
                                  <>
                                    <span className="w-1 h-1 rounded-full bg-neutral-300" />
                                    <span>Su: {item.nutrition.sugar}g</span>
                                  </>
                                )}
                                {item.nutrition.sodium !== undefined && item.nutrition.sodium > 0 && (
                                  <>
                                    <span className="w-1 h-1 rounded-full bg-neutral-300" />
                                    <span>Na: {item.nutrition.sodium}mg</span>
                                  </>
                                )}
                                {item.nutrition.nutritionScore !== undefined && item.nutrition.nutritionScore > 0 && (
                                  <>
                                    <span className="w-1 h-1 rounded-full bg-neutral-300" />
                                    <span className="text-emerald-600 font-bold">Score: {item.nutrition.nutritionScore}</span>
                                  </>
                                )}
                              </div>
                            )}
                            
                            <div className="flex flex-wrap gap-1">
                              {/* Health & Allergen tags */}
                              {item.healthLabels?.slice(0, 3).map((lbl) => (
                                <span key={lbl} className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-blue-50/70 text-blue-700 border border-blue-200/20">
                                  {lbl}
                                </span>
                              ))}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={item.available}
                              onCheckedChange={() => handleToggleAvailable(itemId, item.available)}
                            />
                            <span className={`text-[10px] font-bold ${item.available ? 'text-emerald-700' : 'text-neutral-400'}`}>
                              {item.available ? 'Bán' : 'Ngưng'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-6 py-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg border border-neutral-200/50 hover:bg-neutral-50">
                                <MoreHorizontal className="w-4 h-4 text-neutral-500" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white rounded-xl shadow-lg border border-neutral-100 p-1 w-36">
                              <DropdownMenuItem 
                                onClick={() => handleOpenMenuModal(item)}
                                className="text-neutral-700 font-semibold text-xs rounded-lg cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5 mr-2 text-neutral-400" />
                                Chỉnh sửa
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-neutral-100 my-1" />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteMenuItem(itemId)}
                                className="text-rose-600 font-bold text-xs rounded-lg cursor-pointer focus:text-rose-700 focus:bg-rose-50"
                              >
                                <Trash2 className="w-3.5 h-3.5 mr-2 text-rose-450" />
                                Xóa món ăn
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {menuItems.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-16">
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <div className="w-12 h-12 rounded-2xl bg-neutral-50 border border-neutral-200/40 flex items-center justify-center">
                            <ClipboardList className="w-6 h-6 text-neutral-400" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-neutral-800">Chưa có món ăn nào</h3>
                            <p className="text-xs text-neutral-400 mt-1">Bấm nút "Thêm món mới" để bắt đầu thiết lập menu.</p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: CATEGORY MANAGEMENT */}
        <TabsContent value="categories" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-neutral-900">Quản lý Danh mục món ăn</h2>
              <p className="text-neutral-500 text-xs mt-0.5">Phân loại món ăn theo các nhóm chính để khách hàng dễ dàng tìm kiếm.</p>
            </div>
            <Button onClick={() => handleOpenCategoryModal()} className="rounded-xl bg-neutral-900 hover:bg-black text-white font-semibold shadow-sm gap-1.5 h-9 self-start sm:self-auto">
              <Plus className="w-4 h-4" /> Thêm danh mục
            </Button>
          </div>

          <Card className="shadow-sm border-neutral-200/50 rounded-2xl overflow-hidden bg-white">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-neutral-100 hover:bg-transparent">
                    <TableHead className="text-xs font-bold text-neutral-400 pl-6 w-[240px]">ID Danh mục</TableHead>
                    <TableHead className="text-xs font-bold text-neutral-400">Tên danh mục</TableHead>
                    <TableHead className="text-right text-xs font-bold text-neutral-400 w-[100px] pr-6">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((cat) => (
                    <TableRow key={cat._id} className="border-neutral-100 hover:bg-neutral-50/40 transition-colors">
                      <TableCell className="font-mono text-xs text-neutral-400 pl-6">{cat._id}</TableCell>
                      <TableCell className="font-bold text-xs text-neutral-900">{cat.name}</TableCell>
                      <TableCell className="text-right pr-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg border border-neutral-200/50 hover:bg-neutral-50">
                              <MoreHorizontal className="w-4 h-4 text-neutral-500" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white rounded-xl shadow-lg border border-neutral-100 p-1 w-36">
                            <DropdownMenuItem 
                              onClick={() => handleOpenCategoryModal(cat)}
                              className="text-neutral-700 font-semibold text-xs rounded-lg cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5 mr-2 text-neutral-400" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-neutral-100 my-1" />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteCategory(cat._id, cat.name)}
                              className="text-rose-600 font-bold text-xs rounded-lg cursor-pointer focus:text-rose-700 focus:bg-rose-50"
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-2 text-rose-450" />
                              Xóa danh mục
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {categories.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-16">
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <div className="w-12 h-12 rounded-2xl bg-neutral-55 border border-neutral-200/40 flex items-center justify-center">
                            <Tag className="w-6 h-6 text-neutral-400" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-neutral-800">Chưa có danh mục nào</h3>
                            <p className="text-xs text-neutral-400 mt-1">Bấm nút "Thêm danh mục" để bắt đầu thiết lập menu.</p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 5: TABLES & QR CODE */}
        <TabsContent value="tables" className="space-y-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-neutral-900">Đồng bộ bàn ăn & Sinh mã QR</h2>
            <p className="text-neutral-500 text-xs mt-0.5">Sinh mã QR code dán bàn. Khách quét QR để xem thực đơn & đặt món tại chỗ mà không cần gọi nhân viên.</p>
          </div>

          <Card className="shadow-sm border-neutral-200/50 rounded-2xl bg-white overflow-hidden">
            <CardContent className="p-6 flex flex-col sm:flex-row gap-4 items-end bg-neutral-50/50 border-b border-neutral-100">
              <div className="space-y-2 flex-1 w-full">
                <Label htmlFor="tableCount" className="text-xs font-bold text-neutral-600">Số lượng bàn hoạt động tại nhà hàng</Label>
                <Input
                  id="tableCount"
                  type="number"
                  placeholder="Nhập tổng số bàn (VD: 15)"
                  value={tableCountInput}
                  onChange={(e) => setTableCountInput(e.target.value)}
                  className="rounded-xl border-neutral-200 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 text-sm bg-white"
                />
              </div>
              <Button onClick={handleSyncTables} className="bg-neutral-900 hover:bg-black text-white font-bold px-6 h-10 shadow-sm rounded-xl w-full sm:w-auto">
                Đồng bộ số bàn
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-neutral-200/50 rounded-2xl overflow-hidden bg-white">
            <CardHeader className="border-b border-neutral-100/60 pb-4">
              <CardTitle className="text-sm font-bold text-neutral-800">Danh sách bàn & Preview mã QR dẫn bàn</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-neutral-100 hover:bg-transparent">
                    <TableHead className="text-xs font-bold text-neutral-400 pl-6 w-[120px]">Mã bàn</TableHead>
                    <TableHead className="text-xs font-bold text-neutral-400">Đường dẫn đặt món tại bàn</TableHead>
                    <TableHead className="text-right text-xs font-bold text-neutral-400 w-[160px] pr-6">Mã QR</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tables.map((tbl) => {
                    const orderUrl = `${window.location.origin}/order?r=${restaurantId}&t=${tbl.code}`;
                    return (
                      <TableRow key={tbl._id} className="border-neutral-100 hover:bg-neutral-50/40 transition-colors">
                        <TableCell className="font-bold text-xs text-neutral-900 pl-6">Bàn {tbl.code}</TableCell>
                        <TableCell className="text-xs text-emerald-600 underline font-semibold select-all max-w-xs truncate" title={orderUrl}>
                          {orderUrl}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <Button size="sm" variant="outline" onClick={() => setSelectedTableQR(tbl.code)} className="rounded-lg text-xs font-semibold border-neutral-200 hover:bg-neutral-50 gap-1.5 h-8">
                            <QrCode className="w-3.5 h-3.5 text-neutral-500" /> Xem mã QR
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {tables.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-16">
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <div className="w-12 h-12 rounded-2xl bg-neutral-55 border border-neutral-200/40 flex items-center justify-center">
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
        </TabsContent>

        {/* Tab 6: STAFF MANAGEMENT */}
        <TabsContent value="staff" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-neutral-900">Quản lý Nhân viên</h2>
              <p className="text-neutral-500 text-xs mt-0.5">Tạo tài khoản đăng nhập phục vụ hoặc nấu bếp, giúp tự động hóa quá trình nhận món và cập nhật trạng thái.</p>
            </div>
            <Button onClick={() => handleOpenStaffModal()} className="rounded-xl bg-neutral-900 hover:bg-black text-white font-semibold shadow-sm gap-1.5 h-9 self-start sm:self-auto">
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
                              <Switch checked={st.isActive} onCheckedChange={() => handleToggleStaffActive(staffId)} />
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
                                <DropdownMenuItem onClick={() => handleOpenStaffModal(st)} className="text-neutral-700 font-semibold text-xs rounded-lg cursor-pointer">
                                  <Edit2 className="w-3.5 h-3.5 mr-2 text-neutral-400" />
                                  Sửa nhân viên
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleStaffActive(staffId)} className="text-neutral-700 font-semibold text-xs rounded-lg cursor-pointer">
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
        </TabsContent>

        {/* Tab 7: SETTINGS */}
        <TabsContent value="settings" className="space-y-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-neutral-900">Thiết lập cấu hình nhà hàng</h2>
            <p className="text-neutral-500 text-xs mt-0.5">Cấu hình thông tin địa chỉ hiển thị trên hóa đơn và thiết lập tài khoản ngân hàng thụ hưởng qua VietQR.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-sm border-neutral-200/50 rounded-2xl bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-neutral-900">Thông tin nhà hàng</CardTitle>
                <CardDescription className="text-xs">Các thông tin này được dùng trên hóa đơn và trang gọi món của khách.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="settingName" className="text-xs font-semibold text-neutral-600">Tên nhà hàng *</Label>
                    <Input id="settingName" value={generalSettingsForm.name} onChange={(e) => setGeneralSettingsForm({ ...generalSettingsForm, name: e.target.value })} className="rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="settingOwner" className="text-xs font-semibold text-neutral-600">Chủ sở hữu</Label>
                    <Input id="settingOwner" value={generalSettingsForm.ownerName} onChange={(e) => setGeneralSettingsForm({ ...generalSettingsForm, ownerName: e.target.value })} className="rounded-xl" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="settingAddress" className="text-xs font-semibold text-neutral-600">Địa chỉ</Label>
                  <Input id="settingAddress" value={generalSettingsForm.address} onChange={(e) => setGeneralSettingsForm({ ...generalSettingsForm, address: e.target.value })} className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="settingPhone" className="text-xs font-semibold text-neutral-600">Số điện thoại *</Label>
                  <Input id="settingPhone" value={generalSettingsForm.phone} onChange={(e) => setGeneralSettingsForm({ ...generalSettingsForm, phone: e.target.value })} className="rounded-xl" />
                </div>
                <Button onClick={handleSaveGeneralSettings} className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-sm">
                  Lưu cấu hình
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="shadow-sm border-neutral-200/50 rounded-2xl bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-neutral-500" />
                    Tài khoản Email & Bảo mật
                  </CardTitle>
                  <CardDescription className="text-xs">Thay đổi email cần xác minh OTP gửi về email hiện tại.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-xl bg-neutral-50 border border-neutral-100 p-3">
                    <p className="text-[11px] font-bold text-neutral-400 uppercase">Email hiện tại</p>
                    <p className="text-sm font-semibold text-neutral-900 mt-1">{restaurant?.email || 'Chưa có email'}</p>
                  </div>
                  <Button variant="outline" onClick={() => setIsEmailChangeModalOpen(true)} className="rounded-xl font-semibold">
                    Yêu cầu đổi Email
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-neutral-200/50 rounded-2xl bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-neutral-500" />
                    Ngân hàng nhận thanh toán (VietQR)
                  </CardTitle>
                  <CardDescription className="text-xs">Thông tin nhận tiền khi khách chọn chuyển khoản VietQR.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-xl bg-neutral-50 border border-neutral-100 p-3">
                      <p className="text-[11px] font-bold text-neutral-400 uppercase">Ngân hàng hiện tại</p>
                      <p className="text-sm font-semibold text-neutral-900 mt-1">{restaurant?.bankName || 'Chưa cấu hình'}</p>
                    </div>
                    <div className="rounded-xl bg-neutral-50 border border-neutral-100 p-3">
                      <p className="text-[11px] font-bold text-neutral-400 uppercase">Số tài khoản hiện tại</p>
                      <p className="text-sm font-semibold text-neutral-900 mt-1">{restaurant?.bankAccount || 'Chưa cấu hình'}</p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => setIsBankChangeModalOpen(true)} className="rounded-xl font-semibold">
                    Thay đổi Ngân hàng
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tab 8: NOTIFICATIONS */}
        <TabsContent value="notifications" className="space-y-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-neutral-900">Trung tâm thông báo</h2>
            <p className="text-neutral-500 text-xs mt-0.5">Theo dõi tin tức hệ thống và các cập nhật mới nhất cho nhà hàng của bạn.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {user?.role === Role.RESTAURANT_OWNER ? (
              <>
                <div className="lg:col-span-1 animate-fade-in">
                  <OwnerNotificationForm />
                </div>
                <div className="lg:col-span-2">
                  <NotificationCenter />
                </div>
              </>
            ) : (
              <div className="lg:col-span-3">
                <NotificationCenter />
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog 1: Add/Edit Menu Item Modal */}
      <Dialog open={isMenuModalOpen} onOpenChange={setIsMenuModalOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">{editingMenuItem ? 'Cập nhật món ăn' : 'Thêm món ăn mới'}</DialogTitle>
            <DialogDescription className="text-xs text-gray-500">Cung cấp đầy đủ thông tin dinh dưỡng, dị ứng và trạng thái hiển thị cho món ăn.</DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="dishName" className="text-xs text-gray-600 font-semibold">Tên món ăn *</Label>
                <Input id="dishName" value={menuForm.name} onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })} className="rounded-xl" placeholder="VD: Cơm gà healthy" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dishPrice" className="text-xs text-gray-600 font-semibold">Giá món (VNĐ) *</Label>
                <Input id="dishPrice" type="number" min={0} value={menuForm.price} onChange={(e) => setMenuForm({ ...menuForm, price: Number(e.target.value) || 0 })} className="rounded-xl" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-600 font-semibold">Danh mục *</Label>
                {categories.length > 0 ? (
                  <Select
                    value={menuForm.category || undefined}
                    onValueChange={(value) => {
                      const categoryName = value || '';
                      const selected = categories.find((cat) => cat.name === categoryName);
                      setMenuForm({ ...menuForm, categoryId: selected?._id || '', category: categoryName });
                    }}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {categories.map((cat) => (
                        <SelectItem key={cat._id} value={cat.name}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input value={menuForm.category} onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value, categoryId: '' })} className="rounded-xl" placeholder="Nhập tên danh mục" />
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dishImage" className="text-xs text-gray-600 font-semibold">Đường dẫn ảnh món ăn</Label>
                <div className="flex gap-2">
                  <Input id="dishImage" value={menuForm.imageUrl} onChange={(e) => setMenuForm({ ...menuForm, imageUrl: e.target.value })} className="rounded-xl" placeholder="https://..." />
                  <input
                    id="dishImageFile"
                    type="file"
                    accept="image/*"
                    onChange={handleUploadMenuImage}
                    className="hidden"
                    disabled={isUploadingMenuImage}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isUploadingMenuImage}
                    onClick={() => document.getElementById('dishImageFile')?.click()}
                    className="shrink-0 rounded-xl px-3"
                  >
                    <Upload className={`w-4 h-4 ${isUploadingMenuImage ? 'animate-pulse' : ''}`} />
                    <span className="sr-only">Upload ảnh món ăn</span>
                  </Button>
                </div>
                <p className="text-[11px] text-gray-400">Chọn file ảnh để upload lên Cloudinary, hoặc dán URL có sẵn.</p>
                {menuForm.imageUrl && (
                  <div className="mt-2 h-24 w-24 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                    <img
                      src={menuForm.imageUrl}
                      alt="Preview ảnh món ăn"
                      className="h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                      width={96}
                      height={96}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dishDesc" className="text-xs text-gray-600 font-semibold">Mô tả món ăn</Label>
              <Textarea id="dishDesc" value={menuForm.description} onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })} className="rounded-xl min-h-[88px]" placeholder="Mô tả nguyên liệu, khẩu vị hoặc lưu ý sức khỏe..." />
            </div>

            <div className="rounded-2xl border border-neutral-100 bg-neutral-50/60 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-neutral-700 uppercase">Chỉ số dinh dưỡng (QDish)</h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-neutral-500">Đang bán</span>
                  <Switch checked={menuForm.available} onCheckedChange={(checked) => setMenuForm({ ...menuForm, available: checked })} />
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="dishCalories" className="text-[11px] text-gray-500 font-semibold">Calo (kcal)</Label>
                  <Input id="dishCalories" type="number" min={0} value={menuForm.calories} onChange={(e) => setMenuForm({ ...menuForm, calories: Number(e.target.value) || 0 })} className="rounded-xl bg-white" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="dishProtein" className="text-[11px] text-gray-500 font-semibold">Đạm (g)</Label>
                  <Input id="dishProtein" type="number" min={0} value={menuForm.protein} onChange={(e) => setMenuForm({ ...menuForm, protein: Number(e.target.value) || 0 })} className="rounded-xl bg-white" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="dishCarbs" className="text-[11px] text-gray-500 font-semibold">Carbs (g)</Label>
                  <Input id="dishCarbs" type="number" min={0} value={menuForm.carbs} onChange={(e) => setMenuForm({ ...menuForm, carbs: Number(e.target.value) || 0 })} className="rounded-xl bg-white" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="dishFat" className="text-[11px] text-gray-500 font-semibold">Béo (g)</Label>
                  <Input id="dishFat" type="number" min={0} value={menuForm.fat} onChange={(e) => setMenuForm({ ...menuForm, fat: Number(e.target.value) || 0 })} className="rounded-xl bg-white" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="dishFiber" className="text-[11px] text-gray-500 font-semibold">Chất xơ (g)</Label>
                  <Input id="dishFiber" type="number" min={0} value={menuForm.fiber} onChange={(e) => setMenuForm({ ...menuForm, fiber: Number(e.target.value) || 0 })} className="rounded-xl bg-white" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="dishSugar" className="text-[11px] text-gray-500 font-semibold">Đường (g)</Label>
                  <Input id="dishSugar" type="number" min={0} value={menuForm.sugar} onChange={(e) => setMenuForm({ ...menuForm, sugar: Number(e.target.value) || 0 })} className="rounded-xl bg-white" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="dishSodium" className="text-[11px] text-gray-500 font-semibold">Sodium (mg)</Label>
                  <Input id="dishSodium" type="number" min={0} value={menuForm.sodium} onChange={(e) => setMenuForm({ ...menuForm, sodium: Number(e.target.value) || 0 })} className="rounded-xl bg-white" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="dishNutritionScore" className="text-[11px] text-gray-500 font-semibold">Nutrition Score (0-100)</Label>
                  <Input id="dishNutritionScore" type="number" min={0} max={100} value={menuForm.nutritionScore} onChange={(e) => setMenuForm({ ...menuForm, nutritionScore: Number(e.target.value) || 0 })} className="rounded-xl bg-white" />
                </div>
              </div>
            </div>


          </div>

          <DialogFooter className="border-t border-gray-100 pt-3">
            <Button variant="outline" onClick={() => setIsMenuModalOpen(false)} className="rounded-xl">Hủy</Button>
            <Button onClick={handleSaveMenuItem} className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-md shadow-green-600/10">Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog 2: Add/Edit Category Modal */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Sửa danh mục' : 'Thêm danh mục mới'}</DialogTitle>
            <DialogDescription className="text-xs text-gray-500">Tạo tên danh mục duy nhất trong thực đơn.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-3">
            <div className="space-y-1">
              <Label htmlFor="catName" className="text-xs text-gray-600 font-semibold">Tên danh mục *</Label>
              <Input id="catName" value={categoryNameInput} onChange={(e) => setCategoryNameInput(e.target.value)} className="rounded-xl" placeholder="VD: Khai vị, Healthy Bread" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoryModalOpen(false)} className="rounded-xl">Hủy</Button>
            <Button onClick={handleSaveCategory} className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-sm">Lưu danh mục</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog 3: Table QR Code Preview Modal */}
      <Dialog open={!!selectedTableQR} onOpenChange={() => setSelectedTableQR(null)}>
        <DialogContent className="sm:max-w-xs bg-white rounded-2xl p-6 text-center">
          <DialogHeader className="border-b border-gray-100 pb-2">
            <DialogTitle className="text-base font-bold text-gray-900">QR Code Bàn {selectedTableQR}</DialogTitle>
            <DialogDescription className="text-[10px] text-gray-500">Dùng để in ấn dán trực tiếp tại bàn phục vụ.</DialogDescription>
          </DialogHeader>
          {selectedTableQR && (
            <div className="flex flex-col items-center justify-center py-4 space-y-4">
              <div className="p-3 border border-gray-200 rounded-2xl bg-white shadow-inner">
                <React.Suspense fallback={<div className="w-[180px] h-[180px] rounded-xl bg-neutral-100 animate-pulse" />}>
                  <QRCode
                    value={`${window.location.origin}/order?r=${restaurantId}&t=${selectedTableQR}`}
                    size={180}
                    level="H"
                    includeMargin
                  />
                </React.Suspense>
              </div>
              <p className="text-xs font-semibold text-gray-700">Bàn {selectedTableQR} • {restaurant?.name}</p>
              <Button onClick={() => window.print()} className="bg-gray-900 hover:bg-black text-white rounded-xl font-bold w-full">In mã QR</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog 4: Staff Modal */}
      <Dialog open={isStaffModalOpen} onOpenChange={setIsStaffModalOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle>{editingStaffItem ? 'Sửa tài khoản nhân viên' : 'Thêm nhân viên mới'}</DialogTitle>
            <DialogDescription className="text-xs text-gray-500">Tạo tài khoản đăng nhập cho nhân viên bếp hoặc chạy bàn.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-1">
              <Label htmlFor="staffName" className="text-xs text-gray-600 font-semibold">Tên hiển thị *</Label>
              <Input id="staffName" value={staffForm.name} onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })} className="rounded-xl" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="staffUsername" className="text-xs text-gray-600 font-semibold">Username đăng nhập *</Label>
              <Input id="staffUsername" value={staffForm.username} onChange={(e) => setStaffForm({ ...staffForm, username: e.target.value })} className="rounded-xl" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="staffPw" className="text-xs text-gray-600 font-semibold">Mật khẩu {editingStaffItem ? '(Để trống nếu không đổi)' : '*'}</Label>
              <Input id="staffPw" type="password" value={staffForm.password} onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })} className="rounded-xl" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStaffModalOpen(false)} className="rounded-xl">Hủy</Button>
            <Button onClick={handleSaveStaff} className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold">Lưu tài khoản</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog 5: Invoice Payment Completion Modal */}
      <Dialog open={!!selectedOrderForPayment} onOpenChange={() => setSelectedOrderForPayment(null)}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl p-6">
          <DialogHeader className="border-b border-gray-100 pb-3">
            <DialogTitle className="text-lg font-bold text-gray-900">Xác nhận thanh toán hóa đơn</DialogTitle>
            <DialogDescription className="text-xs text-gray-500">Hoàn thành đơn hàng bàn số {selectedOrderForPayment?.tableNumber}.</DialogDescription>
          </DialogHeader>

          {selectedOrderForPayment && (
            <div className="space-y-4 py-3">
              <div className="space-y-1.5 text-sm text-gray-600 border-b border-gray-100 pb-3">
                <div className="flex justify-between">
                  <span>Mã đơn:</span>
                  <span className="font-mono font-bold">#{String(selectedOrderForPayment.id || (selectedOrderForPayment as any)._id).slice(-6)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Khách hàng:</span>
                  <span className="font-semibold text-gray-800">{selectedOrderForPayment.customerName || 'Khách vãng lai'}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-dashed border-gray-100">
                  <span className="font-bold text-gray-900">Tổng thanh toán:</span>
                  <span className="font-bold text-green-700 text-base">{formatCurrency(selectedOrderForPayment.totalAmount)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-700">Lựa chọn hình thức thanh toán:</Label>
                <div className="flex gap-4">
                  <label className="flex items-center text-sm font-semibold text-gray-700 cursor-pointer">
                    <input
                      type="radio"
                      name="payMethod"
                      value={PaymentMethod.BANK_TRANSFER}
                      checked={invoicePaymentMethod === PaymentMethod.BANK_TRANSFER}
                      onChange={() => setInvoicePaymentMethod(PaymentMethod.BANK_TRANSFER)}
                      className="mr-2 w-4 h-4 text-green-600 focus:ring-green-500"
                    />
                    Chuyển khoản (VietQR)
                  </label>
                  <label className="flex items-center text-sm font-semibold text-gray-700 cursor-pointer">
                    <input
                      type="radio"
                      name="payMethod"
                      value={PaymentMethod.CASH}
                      checked={invoicePaymentMethod === PaymentMethod.CASH}
                      onChange={() => setInvoicePaymentMethod(PaymentMethod.CASH)}
                      className="mr-2 w-4 h-4 text-green-600 focus:ring-green-500"
                    />
                    Tiền mặt (Cash)
                  </label>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="border-t border-gray-100 pt-3">
            <Button variant="outline" onClick={() => setSelectedOrderForPayment(null)} className="rounded-xl">Hủy</Button>
            <Button onClick={handleCompleteOrder} className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-md shadow-green-600/10">Xác nhận thanh toán</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog 6: Edit Email Modal with OTP */}
      <Dialog open={isEmailChangeModalOpen} onOpenChange={setIsEmailChangeModalOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle>Thay đổi Email nhà hàng</DialogTitle>
            <DialogDescription className="text-xs text-gray-500">Quy trình yêu cầu mã OTP gửi về email hiện tại của nhà hàng.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-1">
              <Label htmlFor="newEmail" className="text-xs text-gray-600 font-semibold">Email mới *</Label>
              <div className="flex gap-2">
                <Input id="newEmail" type="email" placeholder="email@moi.com" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="rounded-xl flex-1" />
                <Button onClick={handleRequestEmailOtp} disabled={isSendingOtp} className="bg-gray-900 hover:bg-black text-white rounded-xl font-semibold text-xs px-3">
                  {isSendingOtp ? 'Đang gửi...' : 'Gửi OTP'}
                </Button>
              </div>
            </div>

            {isOtpSentForEmail && (
              <div className="space-y-1">
                <Label htmlFor="emailOtp" className="text-xs text-gray-600 font-semibold">Mã OTP (6 số) *</Label>
                <Input id="emailOtp" placeholder="Nhập OTP" value={emailOtp} onChange={(e) => setEmailOtp(e.target.value)} className="rounded-xl" />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEmailChangeModalOpen(false)} className="rounded-xl">Hủy</Button>
            <Button onClick={handleSaveEmailChange} disabled={!isOtpSentForEmail} className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold">Xác nhận đổi email</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog 7: Edit Bank Modal with OTP */}
      <Dialog open={isBankChangeModalOpen} onOpenChange={setIsBankChangeModalOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle>Cấu hình ngân hàng VietQR</DialogTitle>
            <DialogDescription className="text-xs text-gray-500">Mã OTP đổi ngân hàng sẽ được gửi về email hiện tại của nhà hàng.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-1">
              <Label className="text-xs text-gray-600 font-semibold">Ngân hàng thụ hưởng *</Label>
              <Select value={newBankName} onValueChange={(val) => setNewBankName(val || '')}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Chọn ngân hàng" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {banksList.map(b => (
                    <SelectItem key={b.code} value={b.name}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="newBankAcc" className="text-xs text-gray-600 font-semibold">Số tài khoản ngân hàng mới *</Label>
              <div className="flex gap-2">
                <Input id="newBankAcc" placeholder="Nhập số tài khoản" value={newBankAccount} onChange={(e) => setNewBankAccount(e.target.value)} className="rounded-xl flex-1" />
                <Button onClick={handleRequestBankOtp} disabled={isSendingBankOtp} className="bg-gray-900 hover:bg-black text-white rounded-xl font-semibold text-xs px-3">
                  {isSendingBankOtp ? 'Đang gửi...' : 'Gửi OTP'}
                </Button>
              </div>
            </div>

            {isOtpSentForBank && (
              <div className="space-y-1">
                <Label htmlFor="bankOtp" className="text-xs text-gray-600 font-semibold">Mã OTP (6 số) *</Label>
                <Input id="bankOtp" placeholder="Nhập OTP" value={bankOtp} onChange={(e) => setBankOtp(e.target.value)} className="rounded-xl" />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBankChangeModalOpen(false)} className="rounded-xl">Hủy</Button>
            <Button onClick={handleSaveBankChange} disabled={!isOtpSentForBank} className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold">Xác nhận đổi ngân hàng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};


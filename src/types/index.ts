export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  RESTAURANT_ADMIN = 'RESTAURANT_ADMIN',
  STAFF = 'STAFF',
  CUSTOMER = 'CUSTOMER',
  GUEST = 'GUEST',
  RESTAURANT_OWNER = 'RESTAURANT_OWNER'
}

export enum RestaurantStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export interface Restaurant {
  id: string;
  _id?: string;
  name: string;
  username: string; // Used for login
  ownerName: string;
  email: string;
  address: string;
  phone: string;
  status: RestaurantStatus;
  active: boolean;
  bankAccount?: string; // Số tài khoản ngân hàng
  bankName?: string; // Tên ngân hàng
}

export interface NewRestaurantPayload {
  name: string;
  username: string;
  password?: string;
  ownerName: string;
  email: string;
  address: string;
  phone: string;
  status: RestaurantStatus;
}

// ============================================
// Nutrition & Health Additions for QDish
// ============================================

export interface NutritionInfo {
  calories: number; // kcal
  protein: number;  // grams
  carbs: number;    // grams
  fat: number;      // grams
  fiber?: number;   // grams
  sugar?: number;   // grams
  sodium?: number;  // mg
  nutritionScore?: number;
}

export enum Allergen {
  GLUTEN = 'GLUTEN',
  DAIRY = 'DAIRY',
  NUTS = 'NUTS',
  SHELLFISH = 'SHELLFISH',
  SOY = 'SOY',
  EGGS = 'EGGS',
  FISH = 'FISH',
}

export enum HealthLabel {
  VEGAN = 'VEGAN',
  VEGETARIAN = 'VEGETARIAN',
  LOW_CARB = 'LOW_CARB',
  HIGH_PROTEIN = 'HIGH_PROTEIN',
  KETO = 'KETO',
  GLUTEN_FREE = 'GLUTEN_FREE',
  LOW_FAT = 'LOW_FAT',
  SUGAR_FREE = 'SUGAR_FREE',
}

export interface HealthProfile {
  goals: ('WEIGHT_LOSS' | 'MUSCLE_GAIN' | 'MAINTENANCE' | 'GENERAL_HEALTH')[];
  allergies: Allergen[];
  conditions: ('DIABETES' | 'HYPERTENSION' | 'CELIAC')[];
  preferences: HealthLabel[];
}

// ============================================
// Core Entities
// ============================================

export interface MenuItem {
  id: string;
  _id?: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  available: boolean;
  categoryId?: string;
  
  // New fields for QDish
  nutrition?: NutritionInfo;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  nutritionScore?: number;
  allergens?: Allergen[];
  healthTags?: string[];
  healthLabels?: HealthLabel[];
}

export enum OrderStatus {
  PENDING = 'PENDING', // Mới đặt
  CONFIRMED = 'CONFIRMED', // Bếp đã nhận
  SERVED = 'SERVED', // Đã ra món
  COMPLETED = 'COMPLETED', // Đã thanh toán
  CANCELLED = 'CANCELLED'
}

export enum PaymentMethod {
  CASH = 'CASH', // Tiền mặt
  BANK_TRANSFER = 'BANK_TRANSFER' // Chuyển khoản
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  _id?: string;
  restaurantId: string;
  tableNumber: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  timestamp: number;
  note?: string;
  customerName?: string; // Tên khách hàng
  paymentMethod?: PaymentMethod; // Hình thức thanh toán
  confirmedByName?: string; // Tên nhân viên đã xác nhận đơn
  updatedByName?: string; // Tên người cập nhật đơn hàng (bất kỳ trạng thái nào)
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem extends OrderItem {}

// App state shape
export interface AppState {
  restaurants: Restaurant[];
  menuItems: MenuItem[];
  orders: Order[];
  currentUser: {
    role: Role;
    restaurantId?: string; // If role is RESTAURANT_ADMIN
    id?: string; // User ID
  } | null;
}

// ============================================
// Statistics Interfaces
// ============================================

export interface OverviewStats {
  totalActive: number;
  totalInactive: number;
  top5Restaurants: Array<{
    id: string;
    name: string;
    revenue: number;
  }>;
}

export interface RestaurantRevenueStats {
  restaurantId: string;
  restaurantName: string;
  totalRevenue: number;
  totalOrders: number;
  chartData: Array<{
    date: string;
    revenue: number;
  }>;
}

export type StatsPeriod = 'today' | 'week' | 'month' | 'year' | 'custom';

export interface RestaurantStats {
  period: {
    startDate: string;
    endDate: string;
  };
  previousPeriod: {
    startDate: string;
    endDate: string;
  };
  overview: {
    totalRevenue: number;
    previousRevenue: number;
    revenueChange: number | null; 
    totalOrders: number;
    previousOrders: number;
    ordersChange: number | null;
    averageOrderValue: number;
    previousAverageOrderValue: number;
    totalCustomers: number;
    cancellationRate: number;
    averageProcessingTime: number;
    topSellingItem: {
      name: string;
      quantity: number;
    } | null;
    peakHour: number;
  };
  revenueByDate: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  revenueByHour: Array<{
    hour: number;
    revenue: number;
    orders: number;
  }>;
  topMenuItems: Array<{
    menuItemId: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
  revenueByCategory: Array<{
    category: string;
    revenue: number;
    quantity: number;
  }>;
  revenueByTable: Array<{
    tableNumber: string;
    revenue: number;
    orders: number;
  }>;
  ordersByStatus: {
    pending: number;
    confirmed: number;
    served: number;
    completed: number;
    cancelled: number;
  };
  largestOrders: Array<{
    orderId: string;
    tableNumber: string;
    totalAmount: number;
    customerName?: string;
    createdAt: Date | string;
  }>;
}

export interface Staff {
  id: string;
  username: string;
  role: Role;
  isActive: boolean;
  name: string;
  password?: string;
}

export interface Owner {
  id: string;
  _id?: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  role: Role.RESTAURANT_OWNER;
  isActive: boolean;
  isEmailVerified?: boolean;
  restaurantsCount?: number;
  restaurants?: string[];
  planName?: string;
  planCode?: string;
  subscriptionStatus?: string;
  subscriptionExpiresAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface RegisterOwnerPayload {
  fullName: string;
  email: string;
  phone: string;
  username: string;
  password?: string;
  confirmPassword?: string;
}

export interface CreateOwnerPayload {
  fullName: string;
  email: string;
  phone: string;
  username: string;
  password?: string;
  isActive?: boolean;
}

// ============================================
// SaaS Subscription & Payment Additions
// ============================================

export interface Plan {
  id: string;
  _id?: string;
  name: string;
  code: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  restaurantLimit: number; // -1 for unlimited
  tableLimit: number;      // -1 for unlimited
  menuItemLimit: number;   // -1 for unlimited
  staffLimit: number;      // -1 for unlimited
  features: string[];
  unavailableFeatures: string[];
  isPopular: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED'
}

export enum BillingCycle {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY'
}

export interface Subscription {
  id: string;
  _id?: string;
  ownerId: string | Owner;
  planId: string | Plan;
  planCode: string;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  amount: number;
  startedAt?: string;
  expiresAt?: string;
  paymentOrderCode?: number;
  payosPaymentLinkId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED'
}

export interface PaymentTransaction {
  id: string;
  _id?: string;
  ownerId: string;
  planId: string;
  subscriptionId: string;
  orderCode: number;
  amount: number;
  status: PaymentStatus;
  paymentLinkId?: string;
  checkoutUrl?: string;
  qrCode?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlanLimitError {
  message: string;
  code: 'PLAN_LIMIT_REACHED';
  limitType: 'RESTAURANT_LIMIT' | 'TABLE_LIMIT' | 'MENU_ITEM_LIMIT' | 'STAFF_LIMIT';
  currentPlan: string;
  upgradeRequired: boolean;
}

// ============================================
// Notification System
// ============================================

export enum NotificationType {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  ORDER = 'ORDER',
  SUBSCRIPTION = 'SUBSCRIPTION',
  PAYMENT = 'PAYMENT',
  SYSTEM = 'SYSTEM'
}

export enum NotificationPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum NotificationTargetType {
  ALL_OWNERS = 'ALL_OWNERS',
  OWNER = 'OWNER',
  ALL_RESTAURANTS = 'ALL_RESTAURANTS',
  RESTAURANT = 'RESTAURANT',
  OWNER_RESTAURANTS = 'OWNER_RESTAURANTS',
  OWNER_STAFF = 'OWNER_STAFF',
  RESTAURANT_STAFF = 'RESTAURANT_STAFF',
  USER = 'USER',
  ROLE = 'ROLE'
}

export interface NotificationItem {
  id: string;
  notificationId: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  source: 'MANUAL' | 'AUTO';
  actionUrl?: string;
  orderId?: string;
  subscriptionId?: string;
  paymentTransactionId?: string;
  senderRole?: string;
  senderId?: string;
  sender?: {
    id: string;
    name: string;
  };
  restaurant?: {
    name: string;
  };
  metadata?: Record<string, any>;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface NotificationListResponse {
  notifications: NotificationItem[];
  unreadCount: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface NotificationTarget {
  id: string;
  name?: string;
  username?: string;
  fullName?: string;
  email?: string;
  ownerId?: string;
}

export interface AdminNotificationTargets {
  owners: NotificationTarget[];
  restaurants: NotificationTarget[];
}

export interface OwnerNotificationTargets {
  restaurants: NotificationTarget[];
}

export interface CreateNotificationPayload {
  title: string;
  message: string;
  type: NotificationType;
  priority?: NotificationPriority;
  targetType: NotificationTargetType;
  targetIds?: string[];
  restaurantId?: string;
  ownerId?: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

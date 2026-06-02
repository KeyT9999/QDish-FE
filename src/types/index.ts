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
  bankAccountNumber?: string;
  bankAccountHolder?: string;
  bankQrImageUrl?: string;
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
  confidenceScore?: number;
}

// QDish Step 1: Ingredient units & dish ingredient
export type IngredientUnit = 'g' | 'ml' | 'piece' | 'tbsp' | 'tsp' | 'cup' | 'bowl';

export interface DishIngredient {
  ingredientId: string;
  ingredientName?: string; // populated for display
  quantity: number;
  unit: IngredientUnit;
  gramsResolved: number;
}

// QDish Food Attributes (non-judgmental, context-based)
export type FoodAttribute =
  | 'HIGH_PROTEIN'
  | 'VERY_HIGH_PROTEIN'
  | 'ENERGY_DENSE'
  | 'HEAVY_MEAL'
  | 'LIGHT_MEAL'
  | 'LOW_SUGAR'
  | 'LOW_CALORIE'
  | 'HIGH_FIBER'
  | 'LOW_FAT'
  | 'HIGH_CARB'
  | 'KETO_FRIENDLY'
  | 'POST_WORKOUT'
  | 'SOCIAL_SHARING'
  | 'VEGETARIAN'
  | 'VEGAN'
  | 'GLUTEN_FREE'
  | 'DAIRY_FREE'
  | 'OFFICE_LUNCH'
  | 'QUICK_BITE'
  | 'FAMILY_MEAL'
  | 'LATE_NIGHT_FIT'
  | 'COMFORT_FOOD'
  | 'REFRESHING';

export const FOOD_ATTRIBUTE_LABELS: Record<FoodAttribute, string> = {
  HIGH_PROTEIN: '💪 High Protein',
  VERY_HIGH_PROTEIN: '🏋️ Very High Protein',
  ENERGY_DENSE: '⚡ Energy Dense',
  HEAVY_MEAL: '🍖 Heavy Meal',
  LIGHT_MEAL: '🥗 Light Meal',
  LOW_SUGAR: '🍬 Low Sugar',
  LOW_CALORIE: '🌿 Low Calorie',
  HIGH_FIBER: '🌾 High Fiber',
  LOW_FAT: '💧 Low Fat',
  HIGH_CARB: '🍚 High Carb',
  KETO_FRIENDLY: '🥑 Keto Friendly',
  POST_WORKOUT: '🏋️ Post Workout',
  SOCIAL_SHARING: '👥 Great for Sharing',
  VEGETARIAN: '🌿 Vegetarian',
  VEGAN: '🌱 Vegan',
  GLUTEN_FREE: '🌾 Gluten Free',
  DAIRY_FREE: '🥛 Dairy Free',
  OFFICE_LUNCH: '💼 Office Lunch',
  QUICK_BITE: '⏱️ Quick Bite',
  FAMILY_MEAL: '👨‍👩‍👧 Family Meal',
  LATE_NIGHT_FIT: '🌙 Late Night Fit',
  COMFORT_FOOD: '🫶 Comfort Food',
  REFRESHING: '🧊 Refreshing',
};

export const FOOD_ATTRIBUTE_COLORS: Record<FoodAttribute, string> = {
  HIGH_PROTEIN: 'bg-purple-100 text-purple-800 border-purple-200',
  VERY_HIGH_PROTEIN: 'bg-violet-100 text-violet-800 border-violet-200',
  ENERGY_DENSE: 'bg-amber-100 text-amber-800 border-amber-200',
  HEAVY_MEAL: 'bg-red-100 text-red-800 border-red-200',
  LIGHT_MEAL: 'bg-green-100 text-green-800 border-green-200',
  LOW_SUGAR: 'bg-sky-100 text-sky-800 border-sky-200',
  LOW_CALORIE: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  HIGH_FIBER: 'bg-lime-100 text-lime-800 border-lime-200',
  LOW_FAT: 'bg-blue-100 text-blue-800 border-blue-200',
  HIGH_CARB: 'bg-orange-100 text-orange-800 border-orange-200',
  KETO_FRIENDLY: 'bg-teal-100 text-teal-800 border-teal-200',
  POST_WORKOUT: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  SOCIAL_SHARING: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
  VEGETARIAN: 'bg-green-100 text-green-800 border-green-200',
  VEGAN: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  GLUTEN_FREE: 'bg-stone-100 text-stone-800 border-stone-200',
  DAIRY_FREE: 'bg-slate-100 text-slate-800 border-slate-200',
  OFFICE_LUNCH: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  QUICK_BITE: 'bg-orange-100 text-orange-800 border-orange-200',
  FAMILY_MEAL: 'bg-pink-100 text-pink-800 border-pink-200',
  LATE_NIGHT_FIT: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  COMFORT_FOOD: 'bg-rose-100 text-rose-800 border-rose-200',
  REFRESHING: 'bg-cyan-100 text-cyan-800 border-cyan-200',
};

export enum Allergen {
  GLUTEN = 'GLUTEN',
  DAIRY = 'DAIRY',
  NUTS = 'NUTS',
  SHELLFISH = 'SHELLFISH',
  SOY = 'SOY',
  EGGS = 'EGGS',
  FISH = 'FISH',
}

// DiningPreference replaces HealthLabel — non-judgmental, context-based
export type DiningPreference =
  | 'VEGAN'
  | 'VEGETARIAN'
  | 'LOW_CARB'
  | 'HIGH_PROTEIN'
  | 'KETO'
  | 'GLUTEN_FREE'
  | 'LOW_FAT'
  | 'SUGAR_FREE';

export interface DiningProfile {
  goals: ('MUSCLE_GAIN' | 'ENERGY_BOOST' | 'LIGHT_MEAL' | 'COMFORT' | 'BALANCED' | 'WEIGHT_LOSS' | 'MAINTENANCE' | 'GENERAL_HEALTH')[];
  allergies: Allergen[];
  conditions: ('DIABETES' | 'HYPERTENSION' | 'CELIAC')[];
  preferences: DiningPreference[];
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
  
  // QDish Nutrition (computed cache)
  nutrition?: NutritionInfo;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  confidenceScore?: number;
  allergens?: Allergen[] | string[];
  foodAttributes?: string[];     // context-based attribute keys e.g. ['HIGH_PROTEIN', 'POST_WORKOUT']

  // QDish Step 1: Recipe
  ingredients?: DishIngredient[];
  servingCount?: number;
  servingSizeGrams?: number;
  cookingMethod?: string;
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
  BANK_TRANSFER = 'BANK_TRANSFER', // Chuyển khoản
  PAYOS = 'PAYOS',
  UNKNOWN = 'UNKNOWN'
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
  tableSessionId?: string; // ID của phiên bàn ăn
  sessionCode?: string; // Mã code của phiên bàn ăn
  billId?: string;
  billCode?: string;
  billStatus?: BillStatus;
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

// ============================================
// Table Session Management
// ============================================

export enum TableSessionStatus {
  OPEN = 'OPEN',
  PAYMENT_REQUESTED = 'PAYMENT_REQUESTED',
  PAID = 'PAID',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED'
}

export interface TableSession {
  id: string;
  _id?: string;
  restaurantId: string;
  tableNumber: string;
  billId?: string;
  sessionCode: string;
  status: TableSessionStatus;
  openedAt: string;
  paymentRequestedAt?: string;
  paidAt?: string;
  closedAt?: string;
  cancelledAt?: string;
  openedBy?: string;
  closedBy?: string;
  totalAmount?: number;
  paymentMethod?: PaymentMethod;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export enum BillStatus {
  UNPAID = 'UNPAID',
  PAYMENT_REQUESTED = 'PAYMENT_REQUESTED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED'
}

export interface BillItemSnapshot {
  menuItemId?: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

export interface Bill {
  id: string;
  _id?: string;
  restaurantId: string;
  tableSessionId: string;
  tableNumber: string;
  sessionCode?: string;
  billCode: string;
  status: BillStatus;
  orderIds: string[];
  itemsSnapshot: BillItemSnapshot[];
  subtotal: number;
  discountAmount: number;
  serviceFee: number;
  taxAmount: number;
  totalAmount: number;
  totalItems: number;
  orderCount?: number;
  paymentMethod?: PaymentMethod;
  cashReceived?: number;
  changeAmount?: number;
  paidBy?: string;
  paidAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ActiveBill {
  billId: string;
  billCode: string;
  tableNumber: string;
  tableSessionId: string;
  sessionCode?: string;
  sessionStatus?: TableSessionStatus;
  status: BillStatus;
  totalAmount: number;
  totalItems: number;
  orderCount: number;
  paymentMethod?: PaymentMethod;
  cashReceived?: number;
  changeAmount?: number;
  paidAt?: string;
  createdAt?: string;
  updatedAt?: string;
  orders: Order[];
}

export interface RestaurantPaymentSettings {
  restaurantId: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
  bankQrImageUrl: string;
  updatedAt?: string;
}

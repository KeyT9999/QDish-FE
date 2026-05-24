export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  RESTAURANT_ADMIN = 'RESTAURANT_ADMIN',
  STAFF = 'STAFF',
  CUSTOMER = 'CUSTOMER',
  GUEST = 'GUEST'
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

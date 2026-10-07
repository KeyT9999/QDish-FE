import type {
  CategoryTranslationValue,
  BackendTranslations,
  ManagedTranslations,
  MenuItemTranslationValue,
  MenuLocale,
  PublicTranslations,
  TranslationReviewEntry,
} from '@/types/menuTranslation';

export const MENU_LOCALE_OPTIONS: Array<{ locale: MenuLocale; label: string; flag: string }> = [
  { locale: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { locale: 'en', label: 'English', flag: '🇬🇧' },
  { locale: 'zh-CN', label: '中文', flag: '🇨🇳' },
];

export const MENU_MESSAGES = {
  vi: {
    language: 'Ngôn ngữ', allCategories: 'Tất cả', search: 'Tìm món ăn, nguyên liệu...',
    outOfStock: 'Hết món', addDish: 'Thêm món', addToCart: 'Thêm vào giỏ hàng',
    allergenUnknown: 'Chưa xác minh dị ứng', cart: 'Giỏ hàng của bạn', checkout: 'Xác nhận thông tin',
    emptyCart: 'Giỏ hàng trống', continueShopping: 'Tiếp tục chọn món', subtotal: 'Tạm tính',
    serviceFee: 'Phí dịch vụ', total: 'Tổng cộng', continue: 'Tiếp tục', placeOrder: 'Xác nhận đặt món',
    placingOrder: 'Đang đặt món...', customerName: 'Tên của bạn', optional: 'Tùy chọn',
    customerPhone: 'Số điện thoại Việt Nam', phoneHint: 'Chỉ nhận số di động Việt Nam. Số này được lưu vào hồ sơ khách hàng của quán; bạn có thể bỏ trống và vẫn đặt món.',
    invalidPhone: 'Vui lòng nhập số điện thoại Việt Nam hợp lệ hoặc để trống.', namePlaceholder: 'VD: Anh Minh',
    note: 'Ghi chú cho quán', notePlaceholder: 'VD: Không hành, ít cay...', consent: 'Tôi đồng ý nhận thông tin ưu đãi từ nhà hàng qua số điện thoại này.',
    searchEmpty: 'Không tìm thấy món ăn phù hợp', filterHint: 'Thử đổi danh mục hoặc điều chỉnh bộ lọc.',
    viewCart: 'Xem giỏ hàng', cartHint: 'Bấm để gọi món', addedToCart: 'Đã thêm {name} vào giỏ',
    ordered: 'Món đã gọi', historyHint: 'Theo dõi đơn bàn', table: 'Bàn',
    detailUnavailable: 'Tạm hết món', allergenNote: 'Bạn vẫn có thể gọi món.',
    orderSuccess: 'Đặt món thành công! Bếp đang chuẩn bị món cho bạn.',
  },
  en: {
    language: 'Language', allCategories: 'All', search: 'Search dishes or ingredients...',
    outOfStock: 'Sold out', addDish: 'Add', addToCart: 'Add to cart',
    allergenUnknown: 'Allergen info not verified', cart: 'Your cart', checkout: 'Checkout details',
    emptyCart: 'Your cart is empty', continueShopping: 'Continue browsing', subtotal: 'Subtotal',
    serviceFee: 'Service fee', total: 'Total', continue: 'Continue', placeOrder: 'Place order',
    placingOrder: 'Placing order...', customerName: 'Your name', optional: 'Optional',
    customerPhone: 'Vietnam phone number', phoneHint: 'Only Vietnam mobile numbers are accepted and saved to the restaurant customer profile. You can leave this blank and still order.',
    invalidPhone: 'Enter a valid Vietnam phone number or leave this blank.', namePlaceholder: 'e.g. Alex',
    note: 'Note for the kitchen', notePlaceholder: 'e.g. No onion, mild spice...', consent: 'I agree to receive offers from this restaurant at this phone number.',
    searchEmpty: 'No matching dishes found', filterHint: 'Try another category or filter.',
    viewCart: 'View cart', cartHint: 'Tap to order', addedToCart: 'Added {name} to your cart',
    ordered: 'Your orders', historyHint: 'Track this table’s orders', table: 'Table',
    detailUnavailable: 'Currently unavailable', allergenNote: 'You can still order this dish.',
    orderSuccess: 'Order placed! The kitchen is preparing your food.',
  },
  'zh-CN': {
    language: '语言', allCategories: '全部', search: '搜索菜品或食材…',
    outOfStock: '暂时售罄', addDish: '添加', addToCart: '加入购物车',
    allergenUnknown: '过敏原信息尚未核实', cart: '您的购物车', checkout: '确认订单信息',
    emptyCart: '购物车为空', continueShopping: '继续浏览菜单', subtotal: '小计',
    serviceFee: '服务费', total: '总计', continue: '继续', placeOrder: '确认下单',
    placingOrder: '正在下单…', customerName: '您的姓名', optional: '选填',
    customerPhone: '越南手机号', phoneHint: '仅接受越南手机号，并会保存到餐厅顾客档案中。您可以留空并继续下单。',
    invalidPhone: '请输入有效的越南电话号码，或留空。', namePlaceholder: '例如：小明',
    note: '给厨房的备注', notePlaceholder: '例如：不要洋葱，少辣…', consent: '我同意通过此电话号码接收餐厅优惠信息。',
    searchEmpty: '没有找到符合条件的菜品', filterHint: '请尝试其他分类或筛选条件。',
    viewCart: '查看购物车', cartHint: '点击下单', addedToCart: '已将{name}加入购物车',
    ordered: '已点菜品', historyHint: '查看本桌订单', table: '桌号',
    detailUnavailable: '暂时无法供应', allergenNote: '您仍可点这道菜。',
    orderSuccess: '下单成功！厨房正在为您准备。',
  },
} as const;

export type MenuMessageKey = keyof typeof MENU_MESSAGES.vi;

export function getMenuMessage(locale: MenuLocale, key: MenuMessageKey): string {
  return MENU_MESSAGES[locale][key];
}

export function translateMenuItem<T extends { name: string; description?: string; category?: string }>(
  item: T,
  locale: MenuLocale,
  translations?: PublicTranslations<MenuItemTranslationValue>,
  categoryName?: string,
): T {
  const translated = locale === 'vi' ? undefined : translations?.[locale];
  return {
    ...item,
    name: translated?.name || item.name,
    description: translated?.description ?? item.description,
    ...(categoryName ? { category: categoryName } : {}),
  };
}

export function translateCategory(
  name: string,
  locale: MenuLocale,
  translations?: PublicTranslations<CategoryTranslationValue>,
): string {
  return (locale === 'vi' ? undefined : translations?.[locale]?.name) || name;
}

/** Convert the backend's `zhCN` storage key to the UI's canonical `zh-CN` locale key. */
export function normalizeBackendTranslations<T>(
  translations?: BackendTranslations<T>,
): PublicTranslations<T> | undefined {
  if (!translations) return undefined;

  const chinese = translations['zh-CN'] ?? translations.zhCN;
  return {
    ...(translations.en !== undefined ? { en: translations.en } : {}),
    ...(chinese !== undefined ? { 'zh-CN': chinese } : {}),
  };
}

export function normalizeBackendManagedTranslations<T>(
  translations?: BackendTranslations<TranslationReviewEntry<T>>,
): ManagedTranslations<T> | undefined {
  if (!translations) return undefined;

  const chinese = translations['zh-CN'] ?? translations.zhCN;
  return {
    ...(translations.en !== undefined ? { en: translations.en } : {}),
    ...(chinese !== undefined ? { 'zh-CN': chinese } : {}),
  };
}

export function getApprovedMenuItemTranslations(
  managed?: ManagedTranslations<MenuItemTranslationValue>,
): PublicTranslations<MenuItemTranslationValue> {
  const result: PublicTranslations<MenuItemTranslationValue> = {};
  for (const locale of ['en', 'zh-CN'] as const) {
    const entry = managed?.[locale];
    if (entry?.approved?.status === 'APPROVED') result[locale] = entry.approved.value;
  }
  return result;
}

export function getApprovedCategoryTranslations(
  managed?: ManagedTranslations<CategoryTranslationValue>,
): PublicTranslations<CategoryTranslationValue> {
  const result: PublicTranslations<CategoryTranslationValue> = {};
  for (const locale of ['en', 'zh-CN'] as const) {
    const entry = managed?.[locale];
    if (entry?.approved?.status === 'APPROVED') result[locale] = entry.approved.value;
  }
  return result;
}

export interface MenuLocaleStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function readMenuLocale(restaurantId: string, storage?: MenuLocaleStorage): MenuLocale {
  if (!restaurantId || !storage) return 'vi';
  try {
    const value = storage.getItem(`qdish_locale_${restaurantId}`);
    return MENU_LOCALE_OPTIONS.some((option) => option.locale === value) ? value as MenuLocale : 'vi';
  } catch {
    return 'vi';
  }
}

export function persistMenuLocale(restaurantId: string, locale: MenuLocale, storage?: MenuLocaleStorage): void {
  if (!restaurantId || !storage) return;
  try {
    storage.setItem(`qdish_locale_${restaurantId}`, locale);
  } catch {
    // Browsers may disable storage; the current page still keeps the selected locale in memory.
  }
}

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { tableSessionService } from '@/services/tableSessionService';
import { MenuItem, Restaurant, Allergen, TableSession } from '@/types';
import { useCart } from '@/hooks/useCart';
import { useApi } from '@/hooks/useApi';
import { useDiningProfile } from '@/hooks/useDiningProfile';
import { menuService } from '@/services/menuService';
import { orderService } from '@/services/orderService';
import { restaurantService } from '@/services/restaurantService';
import { categoryService } from '@/services/categoryService';
import { RestaurantHeader } from '@/components/menu/RestaurantHeader';
import { CategoryFilter } from '@/components/menu/CategoryFilter';
import { MenuItemCard } from '@/components/menu/MenuItemCard';
import { MenuItemDetail } from '@/components/menu/MenuItemDetail';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { DiningProfileForm } from '@/components/dining/DiningProfileForm';
import { DiningOnboarding } from '@/components/dining/DiningOnboarding';
import { OrderHistoryDrawer } from '@/components/menu/OrderHistoryDrawer';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Loader2, Info, Sparkles, Clock, Search, Heart } from 'lucide-react';
import { toast } from 'sonner';

const EMPTY_ALLERGIES: Allergen[] = [];

export const CustomerMenu: React.FC = () => {
  const [searchParams] = useSearchParams();
  // Get restaurantId and tableNumber from query params
  const restaurantId = searchParams.get('r') || '';
  const tableNumber = searchParams.get('t') || '';

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [session, setSession] = useState<TableSession | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedNutritionFilter, setSelectedNutritionFilter] = useState<string>('ALL');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHealthOpen, setIsHealthOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [pairingSuggestions, setPairingSuggestions] = useState<any[]>([]);
  const [isRecLoading, setIsRecLoading] = useState(false);

  const sessionId = session?.id || session?._id || '';
  const cart = useCart(restaurantId, tableNumber, sessionId || undefined);
  const { addToCart } = cart;
  const { profile, saveProfile } = useDiningProfile();
  const { execute: submitOrder, isLoading: isSubmitting } = useApi(orderService.createOrder);

  // Generate or retrieve persistent guest userId
  const guestUserId = useMemo(() => {
    let id = localStorage.getItem('qdish_guest_user_id');
    if (!id) {
      id = 'guest_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now();
      localStorage.setItem('qdish_guest_user_id', id);
    }
    return id;
  }, []);

  // Automatically trigger premium onboarding for new guest diners
  useEffect(() => {
    if (isLoading || !restaurant) return;
    // Chỉ tự động hiển thị bảng khảo sát khi gói dịch vụ nhà hàng cho phép cá nhân hóa thực đơn
    if (!restaurant.features?.personalizedMenuEnabled) return;

    const hasGoals = profile?.goals && profile.goals.length > 0;
    const hasPrefs = profile?.preferences && profile.preferences.length > 0;
    if (!hasGoals && !hasPrefs) {
      const timer = setTimeout(() => {
        setIsOnboardingOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, profile, restaurant]);

  // Fetch smart dining recommendations
  useEffect(() => {
    if (isLoading || !restaurantId || !restaurant) return;
    if (!restaurant.features?.recommendationEnabled) return;

    let isMounted = true;
    const fetchRecs = async () => {
      setIsRecLoading(true);
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const res = await fetch(`${baseUrl}/api/recommendations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            restaurantId,
            userId: guestUserId,
            context: {
              timeOfDay: new Date().getHours() < 11 ? 'breakfast' : new Date().getHours() < 15 ? 'lunch' : new Date().getHours() < 21 ? 'dinner' : 'late_night',
              postWorkout: profile?.goals?.includes('MUSCLE_GAIN')
            }
          })
        });
        
        if (!res.ok) throw new Error();
        const data = await res.json();
        
        if (isMounted) {
          setRecommendations(data.bestForYou || []);
          setPairingSuggestions(data.pairingSuggestions || []);
        }
      } catch (err) {
        console.error('Failed to load recommendations');
      } finally {
        if (isMounted) {
          setIsRecLoading(false);
        }
      }
    };

    fetchRecs();
    return () => {
      isMounted = false;
    };
  }, [restaurantId, profile, isLoading, guestUserId]);
  const userAllergies = profile?.allergies || EMPTY_ALLERGIES;

  // Fetch initial data
  useEffect(() => {
    if (!restaurantId) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const promises: [Promise<any>, Promise<any>, Promise<any>, Promise<any> | null] = [
          restaurantService.getPublicById(restaurantId),
          menuService.getPublicMenu(restaurantId),
          categoryService.getAll(restaurantId),
          tableNumber ? tableSessionService.resolveSession(restaurantId, tableNumber) : null
        ];

        const [rest, items, cats, sessionRes] = await Promise.all(promises);

        if (!isMounted) return;
        setRestaurant(rest);
        setMenuItems(items);
        setDbCategories(cats);
        if (sessionRes && sessionRes.session) {
          setSession(sessionRes.session);
        }
      } catch (error) {
        if (isMounted) {
          toast.error('Không thể tải menu từ máy chủ. Vui lòng kiểm tra kết nối.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [restaurantId, tableNumber]);

  useEffect(() => {
    if (!restaurantId || !tableNumber || !sessionId) return;

    try {
      localStorage.removeItem(`qdish_cart_${restaurantId}`);
      localStorage.removeItem(`qdish_cart_${restaurantId}_${tableNumber}_pending-session`);
    } catch (error) {
      // Ignore legacy cart cleanup errors.
    }
  }, [restaurantId, sessionId, tableNumber]);

  // Derived state: categories mapped from DB or derived from menuItems as fallback
  const categoriesList = useMemo(() => {
    if (dbCategories.length > 0) {
      return dbCategories.map(c => c.name);
    }
    const cats = new Set(menuItems.map(item => item.category));
    return Array.from(cats);
  }, [menuItems, dbCategories]);

  // Filter items by category, nutrition requirements, and search query
  const filteredItems = useMemo(() => {
    let items = menuItems;
    
    // 0. Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(item => 
        item.name.toLowerCase().includes(q) || 
        (item.description && item.description.toLowerCase().includes(q))
      );
    }
    
    // 1. Filter by category
    if (selectedCategory !== 'ALL') {
      items = items.filter(item => item.category === selectedCategory);
    }
    
    // 2. Filter by nutrition
    if (selectedNutritionFilter !== 'ALL') {
      items = items.filter(item => {
        const cal = item.nutrition?.calories ?? item.calories ?? 0;
        const prot = item.nutrition?.protein ?? item.protein ?? 0;
        const carb = item.nutrition?.carbs ?? item.carbs ?? 0;
        const fat = item.nutrition?.fat ?? item.fat ?? 0;
        const fib = item.nutrition?.fiber ?? item.fiber ?? 0;
        const sug = item.nutrition?.sugar ?? item.sugar ?? 0;
        const sod = item.nutrition?.sodium ?? item.sodium ?? 0;

        switch (selectedNutritionFilter) {
          case 'UNDER_400_KCAL':
            return cal < 400;
          case 'HIGH_PROTEIN':
            return prot >= 20 || item.foodAttributes?.includes('HIGH_PROTEIN');
          case 'LOW_CARB':
            return (carb > 0 && carb <= 20) || item.foodAttributes?.includes('KETO_FRIENDLY');
          case 'LOW_FAT':
            return (fat > 0 && fat <= 10) || item.foodAttributes?.includes('LOW_FAT');
          case 'LOW_SUGAR':
            return (sug > 0 && sug <= 5) || item.foodAttributes?.includes('LOW_SUGAR');
          case 'LOW_SODIUM':
            return sod > 0 && sod <= 140;
          case 'HIGH_FIBER':
            return fib >= 5;
          case 'AVOID_ALLERGENS':
            if (!profile || !profile.allergies || profile.allergies.length === 0) return true;
            return !item.allergens || !item.allergens.some(a => profile.allergies.includes(a as Allergen));
          default:
            return true;
        }
      });
    }
    
    return items;
  }, [menuItems, selectedCategory, selectedNutritionFilter, profile, searchQuery]);

  // Check if a menu item matches the health profile goals/diet for recommendations
  const checkIsRecommended = useCallback((item: MenuItem) => {
    if (!profile) return false;

    // 0. Do NOT recommend if contains user allergens
    const hasUserAllergen = item.allergens && item.allergens.some(a => profile.allergies.includes(a as Allergen));
    if (hasUserAllergen) return false;

    // 1. Matches dining preference via food attributes
    if (profile.preferences && profile.preferences.length > 0 && item.foodAttributes) {
      if (item.foodAttributes.some(attr => profile.preferences.includes(attr as any))) {
        return true;
      }
    }

    const cal = item.nutrition?.calories ?? item.calories ?? 0;
    const prot = item.nutrition?.protein ?? item.protein ?? 0;

    // 2. Fits calorie limits for Weight Loss goal
    if (profile.goals && profile.goals.includes('WEIGHT_LOSS' as any)) {
      if (cal > 0 && cal < 350) return true;
    }

    // 3. Fits protein limits for Muscle Gain goal
    if (profile.goals && profile.goals.includes('MUSCLE_GAIN' as any)) {
      if (prot > 20) return true;
    }

    // 4. Fits calorie limits for General Health goal
    if (profile.goals && profile.goals.includes('GENERAL_HEALTH' as any)) {
      if (cal > 0 && cal < 500) return true;
    }

    return false;
  }, [profile]);

  // Handlers
  const handleItemClick = useCallback((item: MenuItem) => {
    setSelectedItem(item);
    setIsDetailOpen(true);
  }, []);

  const handleAddToCart = useCallback((item: MenuItem) => {
    // Prevent ordering items containing allergens
    const hasAllergen = item.allergens && item.allergens.some(a => userAllergies.includes(a as Allergen));
    if (hasAllergen) {
      toast.error(`Món ${item.name} chứa thành phần gây dị ứng của bạn!`, {
        position: 'top-center'
      });
      return;
    }

    addToCart(item);
    toast.success(`Đã thêm ${item.name} vào giỏ`, {
      duration: 2000,
      position: 'top-center'
    });
  }, [addToCart, userAllergies]);

  const handleSessionClosed = useCallback(async () => {
    if (!restaurantId || !tableNumber) return;

    cart.clearCart();
    setIsHistoryOpen(false);

    try {
      const sessionRes = await tableSessionService.resolveSession(restaurantId, tableNumber);
      setSession(sessionRes.session);
    } catch (error) {
      // The next page load will resolve a new session if this refresh fails.
    }

    toast.success('Thanh toan thanh cong. Ban da duoc giai phong.');
  }, [cart, restaurantId, tableNumber]);

  const handleSubmitOrder = useCallback(async (details: any) => {
    if (!tableNumber) {
      toast.error('Không xác định được bàn. Vui lòng quét lại mã QR.');
      return;
    }

    try {
      let activeSession = session;
      if (!activeSession) {
        const sessionRes = await tableSessionService.resolveSession(restaurantId, tableNumber);
        activeSession = sessionRes.session;
        setSession(activeSession);
      }

      const orderPayload = {
        tableNumber,
        tableSessionId: activeSession?.id || activeSession?._id,
        sessionCode: activeSession?.sessionCode,
        items: cart.cart.map(i => ({
          menuItemId: i.menuItemId,
          name: i.name,
          price: i.price,
          quantity: i.quantity
        })),
        totalAmount: cart.cartTotal,
        customerName: details?.customerName?.trim() || undefined,
        note: details?.note?.trim() || undefined
      };
      
      await submitOrder(restaurantId, orderPayload);
      
      toast.success('Đặt món thành công! Bếp đang chuẩn bị món cho bạn.', {
        duration: 4000
      });
      cart.clearCart();
      setIsCartOpen(false);
      // Automatically open history to track the order
      setIsHistoryOpen(true);
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra khi đặt món. Vui lòng thử lại.');
      throw error;
    }
  }, [cart, restaurantId, submitOrder, tableNumber, session]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-green-600 mb-4" />
        <p className="text-gray-500 font-medium">Đang tải menu QDish...</p>
      </div>
    );
  }

  if (!restaurantId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <Info className="w-12 h-12 text-yellow-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Đường dẫn không hợp lệ</h2>
        <p className="text-gray-500 max-w-sm">Vui lòng quét lại mã QR tại bàn ăn để truy cập thực đơn.</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <Info className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy nhà hàng</h2>
        <p className="text-gray-500">Vui lòng kiểm tra lại đường dẫn hoặc quét lại mã QR tại bàn.</p>
      </div>
    );
  }

  return (
    <div className="relative pb-24 px-4 sm:max-w-md sm:mx-auto bg-surface min-h-screen">
      {/* Header */}
      <RestaurantHeader restaurant={restaurant} tableNumber={tableNumber} />
      
      {/* Search Bar */}
      <div className="sticky top-[68px] z-20 bg-surface/95 backdrop-blur-md px-4 py-3 -mx-4 sm:mx-0 sm:px-0">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm món ăn..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-100/80 border-transparent rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/20 transition-all outline-none shadow-inner"
          />
        </div>
      </div>
      
      {/* QDish Smart Buttons */}
      <div className={restaurant?.features?.personalizedMenuEnabled ? "grid grid-cols-2 gap-2.5 mb-3 px-1" : "mb-3 px-1"}>
        {restaurant?.features?.personalizedMenuEnabled && (
          <Button 
            type="button" 
            onClick={() => setIsHealthOpen(true)}
            className="bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-xl font-semibold shadow-sm text-xs py-2 flex items-center justify-center w-full"
          >
            <Sparkles className="w-4 h-4 mr-1 text-amber-500" />
            Hồ sơ ẩm thực
          </Button>
        )}
        <Button 
          type="button" 
          onClick={() => setIsHistoryOpen(true)}
          className="bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl font-semibold shadow-sm text-xs py-2 flex items-center justify-center w-full"
        >
          <Clock className="w-4 h-4 mr-1 text-blue-500" />
          Món đã gọi
        </Button>
      </div>

      {/* ── Best For You (Smart Recommendations Section) ── */}
      {restaurant?.features?.recommendationEnabled && recommendations.length > 0 && (
        <div className="mb-6 pt-2">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
            <h3 className="text-xs font-heading font-black text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
              Dành riêng cho bạn
            </h3>
            <span className="text-[9px] bg-green-50 text-green-700 font-extrabold px-2 py-0.5 rounded-full border border-green-200">
              QDish Match
            </span>
          </div>

          <div className="overflow-x-auto flex gap-4 scrollbar-none pb-3 -mx-4 px-4">
            {recommendations.map((rec) => {
              const dishItem = rec.dish;
              const itemId = dishItem._id || dishItem.id;
              
              return (
                <div 
                  key={itemId}
                  className="shrink-0 w-[260px] bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden flex flex-col justify-between"
                >
                  {/* Dish Image */}
                  <div className="relative aspect-[16/10] bg-neutral-50 overflow-hidden">
                    {dishItem.imageUrl ? (
                      <img 
                        src={dishItem.imageUrl} 
                        alt={dishItem.name} 
                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                        onClick={() => handleItemClick(dishItem)}
                        loading="lazy"
                      />
                    ) : (
                      <div 
                        className="w-full h-full flex items-center justify-center text-neutral-300 font-medium text-xs cursor-pointer"
                        onClick={() => handleItemClick(dishItem)}
                      >
                        Chưa có ảnh
                      </div>
                    )}
                    
                    {/* Fit Score Badge overlay */}
                    <div className="absolute top-2.5 right-2.5 bg-green-600 text-white font-extrabold text-xs px-2.5 py-1 rounded-full shadow-md border border-green-500 flex items-center gap-1">
                      <span>{rec.fitScore}%</span>
                      <span className="text-[9px] font-medium opacity-90">Fit</span>
                    </div>

                    <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                      {rec.bestContextLabel}
                    </div>
                  </div>

                  {/* Body details */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between gap-3">
                    <div className="space-y-1">
                      <h4 
                        className="font-bold text-xs text-neutral-800 line-clamp-1 hover:text-green-600 cursor-pointer transition-colors"
                        onClick={() => handleItemClick(dishItem)}
                      >
                        {dishItem.name}
                      </h4>
                      <p className="text-[10px] text-green-700 font-bold bg-green-50 px-2 py-1 rounded-xl leading-snug border border-green-100/30">
                        {rec.reason}
                      </p>
                    </div>

                    {/* Price and Add button */}
                    <div className="flex items-center justify-between pt-2 border-t border-neutral-50 shrink-0">
                      <span className="text-xs font-black text-neutral-900">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(dishItem.price)}
                      </span>
                      <Button
                        onClick={() => handleAddToCart(dishItem)}
                        className="bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold h-7 rounded-xl px-3"
                      >
                        Thêm món
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Pairing Suggestions ── */}
      {pairingSuggestions.length > 0 && (
        <div className="mb-6 p-4 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent rounded-2xl border border-amber-100/60">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
            <h4 className="text-[10px] font-black text-amber-900 uppercase tracking-wider">Mẹo kết hợp trọn vị</h4>
          </div>
          {pairingSuggestions.slice(0, 1).map((p, idx) => (
            <div key={idx} className="text-xs leading-relaxed text-neutral-700 space-y-2">
              <p className="font-semibold text-neutral-800">
                Ăn kèm {p.mainDishName} + <strong className="text-green-700">{p.pairedDish.name}</strong>:
              </p>
              <p className="text-[11px] text-neutral-500 leading-normal">{p.reason}</p>
              <div className="flex justify-end pt-1">
                <Button
                  onClick={() => handleAddToCart(p.pairedDish)}
                  variant="outline"
                  className="border-green-200 text-green-700 text-[9px] font-bold h-6 rounded-lg px-2 hover:bg-green-50"
                >
                  Thêm {p.pairedDish.name} (+{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.pairedDish.price)})
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Categories */}
      <CategoryFilter 
        categories={categoriesList} 
        selectedCategory={selectedCategory} 
        onSelect={setSelectedCategory} 
      />

      {/* Smart Nutrition Filter Bar */}
      <div className="mt-1 overflow-x-auto flex gap-1.5 pb-2 -mx-4 px-4 scrollbar-none sticky top-[182px] z-10 bg-surface/95 backdrop-blur-sm">
        {[
          { id: 'ALL', label: 'Tất cả chỉ số' },
          { id: 'UNDER_400_KCAL', label: 'Dưới 400 kcal' },
          { id: 'HIGH_PROTEIN', label: 'Giàu Đạm' },
          { id: 'LOW_CARB', label: 'Ít Tinh bột' },
          { id: 'LOW_FAT', label: 'Ít Chất béo' },
          { id: 'LOW_SUGAR', label: 'Ít Đường' },
          { id: 'LOW_SODIUM', label: 'Ít Muối' },
          { id: 'HIGH_FIBER', label: 'Nhiều Chất xơ' },
          { id: 'AVOID_ALLERGENS', label: 'Tránh dị ứng' }
        ].map((f) => {
          const active = selectedNutritionFilter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setSelectedNutritionFilter(f.id)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors duration-200 ${
                active 
                  ? 'bg-green-600 border-green-600 text-white shadow-sm'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Menu Grid */}
      <div className="py-4">
        <div className="grid grid-cols-1 gap-4">
          {filteredItems.map(item => (
            <MenuItemCard 
              key={item.id || (item as any)._id} 
              item={item} 
              cartItem={cart.cart.find(c => c.menuItemId === (item.id || (item as any)._id))}
              onAdd={handleAddToCart}
              onUpdateQuantity={cart.updateQuantity}
              onRemove={cart.removeFromCart}
              onClick={handleItemClick}
              userAllergies={userAllergies}
              isRecommended={checkIsRecommended(item)}
            />
          ))}
          
          {filteredItems.length === 0 && (
            <div className="py-12 text-center text-gray-400 text-sm">
              Không có món ăn nào trong danh mục này.
            </div>
          )}
        </div>
      </div>

      {/* Floating Cart Button */}
      <AnimatePresence>
        {cart.cartCount > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-0 right-0 z-40 px-4 md:max-w-md md:mx-auto"
          >
            <button 
              className="w-full bg-gray-900/95 backdrop-blur-md hover:bg-black text-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] h-14 rounded-full font-bold flex justify-between items-center px-2 pr-6 transition-transform active:scale-[0.98] outline-none"
              onClick={() => setIsCartOpen(true)}
            >
              <div className="flex items-center">
                <motion.div 
                  key={cart.cartCount}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className="bg-green-500 text-white w-10 h-10 rounded-full flex items-center justify-center text-sm mr-3 shadow-inner"
                >
                  {cart.cartCount}
                </motion.div>
                <span className="text-[15px]">Xem giỏ hàng</span>
              </div>
              <span className="text-[15px]">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cart.cartTotal)}
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlays */}
      <MenuItemDetail 
        item={selectedItem} 
        isOpen={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
        onAdd={handleAddToCart}
        userAllergies={userAllergies}
      />
      
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart.cart}
        cartTotal={cart.cartTotal}
        onUpdateQuantity={cart.updateQuantity}
        onRemove={cart.removeFromCart}
        onSubmitOrder={handleSubmitOrder}
      />

      {/* Dining Profile Sheet Drawer */}
      <Sheet open={isHealthOpen} onOpenChange={setIsHealthOpen}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl p-0 border-none shadow-[0_-10px_40px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col">
          <div className="w-full flex justify-center pt-3 pb-1 shrink-0 bg-surface">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
          </div>
          <DiningProfileForm
            initialProfile={profile}
            onSave={saveProfile}
            onClose={() => setIsHealthOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Order History Drawer */}
      <OrderHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        restaurantId={restaurantId}
        tableNumber={tableNumber}
        sessionId={sessionId}
        onSessionClosed={handleSessionClosed}
      />

      {/* Onboarding Dialog Wizard */}
      <DiningOnboarding
        open={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={saveProfile}
        userId={guestUserId}
      />
    </div>
  );
};

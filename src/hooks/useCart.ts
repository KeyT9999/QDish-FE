import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { CartItem, MenuItem } from '@/types';

export function useCart(restaurantId: string, tableNumber?: string, sessionId?: string) {
  const storageKey = useMemo(() => {
    const safeRestaurantId = restaurantId || 'unknown-restaurant';
    if (tableNumber && sessionId) {
      return `qdish_cart_${safeRestaurantId}_${tableNumber}_${sessionId}`;
    }
    if (tableNumber) {
      return `qdish_cart_${safeRestaurantId}_${tableNumber}_pending-session`;
    }
    return `qdish_cart_${safeRestaurantId}`;
  }, [restaurantId, sessionId, tableNumber]);

  const [cart, setCart] = useState<CartItem[]>([]);
  const loadedStorageKeyRef = useRef<string | null>(null);
  const skipNextSaveRef = useRef(false);

  useEffect(() => {
    skipNextSaveRef.current = true;
    try {
      const saved = localStorage.getItem(storageKey);
      setCart(saved ? JSON.parse(saved) : []);
    } catch (e) {
      setCart([]);
    }
    loadedStorageKeyRef.current = storageKey;
  }, [storageKey]);

  useEffect(() => {
    if (loadedStorageKeyRef.current !== storageKey) return;
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }
    localStorage.setItem(storageKey, JSON.stringify(cart));
  }, [cart, storageKey]);

  const addToCart = useCallback((item: MenuItem) => {
    const menuItemId = item.id || item._id;
    if (!menuItemId) {
      return;
    }

    setCart(prev => {
      const existing = prev.find(i => i.menuItemId === menuItemId);
      if (existing) {
        return prev.map(i =>
          i.menuItemId === menuItemId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, {
        menuItemId,
        name: item.name,
        price: item.price,
        quantity: 1
      }];
    });
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setCart(prev => prev.filter(i => i.menuItemId !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.menuItemId === itemId) {
        const newQty = Math.max(0, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }).filter(i => i.quantity > 0));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {
      // Ignore storage cleanup errors.
    }
  }, [storageKey]);

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  return useMemo(() => ({
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    cartCount
  }), [addToCart, cart, cartCount, cartTotal, clearCart, removeFromCart, updateQuantity]);
}

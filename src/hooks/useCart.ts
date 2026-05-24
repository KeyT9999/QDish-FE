import { useState, useEffect, useCallback, useMemo } from 'react';
import { CartItem, MenuItem } from '@/types';

export function useCart(restaurantId: string) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    // Load from local storage if exists for this restaurant
    try {
      const saved = localStorage.getItem(`qdish_cart_${restaurantId}`);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(`qdish_cart_${restaurantId}`, JSON.stringify(cart));
  }, [cart, restaurantId]);

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
  }, []);

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

"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";

export interface CartItem {
  id: string;
  name: string;
  variant: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  addToCartBatch: (item: Omit<CartItem, "quantity">, quantity: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isAuthenticated: boolean;
  authReady: boolean;
}

const MAX_UNIQUE_ITEMS = 10;
const MAX_ITEM_QUANTITY = 99;
const STORAGE_KEY = "van_honey_cart";

const CartContext = createContext<CartContextType | undefined>(undefined);

function parseStoredCart(value: string): CartItem[] {
  const parsed = JSON.parse(value);
  if (!Array.isArray(parsed)) return [];

  return parsed.filter((item): item is CartItem => {
    return (
      item &&
      typeof item.id === "string" &&
      item.id.length > 0 &&
      typeof item.name === "string" &&
      typeof item.variant === "string" &&
      typeof item.price === "number" &&
      Number.isFinite(item.price) &&
      Number.isInteger(item.quantity) &&
      item.quantity > 0 &&
      item.quantity <= MAX_ITEM_QUANTITY &&
      typeof item.image === "string"
    );
  });
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [supabase] = useState(() => createClient());

  // Load cart from localStorage after mount to avoid SSR hydration mismatches
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem(STORAGE_KEY);
      if (storedCart) {
        setCartItems(parseStoredCart(storedCart));
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    setIsInitialized(true);
  }, []);

  // Update localStorage when cart items change, but only after initial load
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    }
  }, [cartItems, isInitialized]);

  useEffect(() => {
    let mounted = true;
    const syncAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setIsAuthenticated(Boolean(data.session?.user));
      setAuthReady(true);
    };
    syncAuth();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session?.user));
      setAuthReady(true);
      if (!session?.user) {
        setIsCartOpen(false);
      }
    });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, [supabase]);

  const addToCart = useCallback((newItem: Omit<CartItem, "quantity">) => {
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((item) => item.id === newItem.id);

      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: Math.min(updatedItems[existingItemIndex].quantity + 1, MAX_ITEM_QUANTITY),
        };
        return updatedItems;
      }

      // Enforce unique item limit
      if (prevItems.length >= MAX_UNIQUE_ITEMS) {
        return prevItems;
      }

      return [...prevItems, { ...newItem, quantity: 1 }];
    });
    setIsCartOpen(true);
  }, []);

  const addToCartBatch = useCallback((newItem: Omit<CartItem, "quantity">, quantity: number) => {
    const safeQuantity = Math.max(1, Math.min(quantity, MAX_ITEM_QUANTITY));

    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((item) => item.id === newItem.id);

      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: Math.min(
            updatedItems[existingItemIndex].quantity + safeQuantity,
            MAX_ITEM_QUANTITY
          ),
        };
        return updatedItems;
      }

      // Enforce unique item limit
      if (prevItems.length >= MAX_UNIQUE_ITEMS) {
        return prevItems;
      }

      return [...prevItems, { ...newItem, quantity: safeQuantity }];
    });
    setIsCartOpen(true);
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
      return;
    }
    const nextQuantity = Math.min(quantity, MAX_ITEM_QUANTITY);
    setCartItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, quantity: nextQuantity } : item))
    );
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        addToCartBatch,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        isCartOpen,
        setIsCartOpen,
        isAuthenticated,
        authReady,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { CartDrawer } from "@/components/cart-drawer";
import { calculateCartTotals } from "@/lib/shop";
import type { CartItem, Product, ProductVariant } from "@/lib/types";

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotalInr: number;
  addItem: (product: Product, variant: ProductVariant) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const storageKey = "wholesale-india-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);

    if (saved) {
      setItems(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items]);

  const totals = useMemo(() => calculateCartTotals(items), [items]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount: totals.itemCount,
      subtotalInr: totals.subtotalInr,
      addItem(product, variant) {
        setItems((current) => {
          const existing = current.find((item) => item.variant.id === variant.id);

          if (existing) {
            return current.map((item) =>
              item.variant.id === variant.id
                ? { ...item, quantity: Math.min(99, item.quantity + 1) }
                : item
            );
          }

          return [...current, { product, variant, quantity: 1 }];
        });
        setIsCartOpen(true);
      },
      removeItem(variantId) {
        setItems((current) => current.filter((item) => item.variant.id !== variantId));
      },
      updateQuantity(variantId, quantity) {
        setItems((current) =>
          current.flatMap((item) => {
            if (item.variant.id !== variantId) {
              return [item];
            }

            if (quantity <= 0) {
              return [];
            }

            return [{ ...item, quantity: Math.min(99, Math.trunc(quantity)) }];
          })
        );
      },
      clearCart() {
        setItems([]);
      },
      isCartOpen,
      openCart() {
        setIsCartOpen(true);
      },
      closeCart() {
        setIsCartOpen(false);
      }
    }),
    [isCartOpen, items, totals.itemCount, totals.subtotalInr]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartDrawer />
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider.");
  }

  return context;
}

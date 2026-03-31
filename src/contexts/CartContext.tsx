import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CART_STORAGE_KEY } from "@/lib/constants";
import { getProductStock } from "@/services/api";
import { toast } from "@/hooks/use-toast";

export interface CourseBookItem {
  bookId: string;
  title: string;
  price: number;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
  image?: string;
  type?: "book" | "course";
  schoolName?: string;
  className?: string;
  courseType?: "new" | "old";
  books?: CourseBookItem[];
  pricePerCourse?: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    // Load from localStorage on mount
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      // If parsing fails, return empty array
    }
    return [];
  });

  // Save to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      // If storage fails, silently continue
    }
  }, [items]);

  // Defensive hardening: ensure cart cannot keep inactive/unavailable products
  useEffect(() => {
    let cancelled = false;

    const isProbablyBookId = (id: string): boolean => {
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    };

    const sanitize = async () => {
      if (items.length === 0) return;

      const validations = await Promise.all(
        items.map(async (item) => {
          if (!isProbablyBookId(item.id)) {
            return { id: item.id, latestStock: null as number | null };
          }
          const stockRes = await getProductStock(item.id);
          const latestStock = stockRes.success ? stockRes.data.stock : 0;
          return { id: item.id, latestStock };
        })
      );

      if (cancelled) return;

      const stockById = new Map<string, number | null>();
      validations.forEach((v) => stockById.set(v.id, v.latestStock));

      let didChange = false;

      setItems((prev) => {
        const next: CartItem[] = [];
        for (const item of prev) {
          const latestStock = stockById.get(item.id);
          if (latestStock === undefined || latestStock === null) {
            next.push(item);
            continue;
          }

          if (latestStock <= 0) {
            didChange = true;
            continue;
          }

          if (item.quantity > latestStock) {
            didChange = true;
            next.push({ ...item, quantity: latestStock });
            continue;
          }

          next.push(item);
        }
        return next;
      });

      if (didChange) {
        toast({
          description: "Cart updated because some items are unavailable.",
        });
      }
    };

    sanitize();

    return () => {
      cancelled = true;
    };
    // Intentionally run once on mount to sanitize localStorage cart
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addItem = (item: Omit<CartItem, "quantity">, quantity: number = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { ...item, quantity }];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotal = () => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const getItemCount = () => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotal,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

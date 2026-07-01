import { Link, useLocation } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";

const HIDDEN_ON = ["/cart", "/checkout", "/delivery-method", "/branch-selection", "/payment", "/order-success"];

export function MobileCartBar() {
  const { getItemCount } = useCart();
  const cartItemCount = getItemCount();
  const location = useLocation();

  if (cartItemCount <= 0 || HIDDEN_ON.includes(location.pathname)) {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-[#E8DEC8] bg-[#FFFDF8]/95 backdrop-blur-sm shadow-[0_-4px_20px_-8px_rgba(7,29,54,0.12)]">
      <div className="container flex items-center justify-between gap-3 py-3">
        <div className="flex items-center gap-2 text-[#071D36] min-w-0">
          <ShoppingCart className="h-4 w-4 shrink-0" />
          <span className="text-sm font-medium truncate">
            {cartItemCount} {cartItemCount === 1 ? "item" : "items"} in cart
          </span>
        </div>
        <Button
          asChild
          size="sm"
          className="shrink-0 bg-[#071D36] text-white hover:bg-[#071D36]/90"
        >
          <Link to="/cart">View Cart</Link>
        </Button>
      </div>
    </div>
  );
}

export function useShowMobileCartBar(): boolean {
  const { getItemCount } = useCart();
  const location = useLocation();
  const cartItemCount = getItemCount();
  return cartItemCount > 0 && !HIDDEN_ON.includes(location.pathname);
}

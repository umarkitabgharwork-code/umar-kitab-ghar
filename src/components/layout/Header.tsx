import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, BookOpen, ShoppingCart, Search, ChevronDown } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { NAV_MENU_ITEMS, type NavMenuItem } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openMobileDropdowns, setOpenMobileDropdowns] = useState<Set<string>>(new Set());
  const location = useLocation();
  const navigate = useNavigate();
  const { getItemCount } = useCart();
  const cartItemCount = getItemCount();

  const isActiveRoute = (item: NavMenuItem): boolean => {
    if (item.href) {
      return location.pathname === item.href;
    }
    if (item.children) {
      return item.children.some((child) => child.href === location.pathname);
    }
    return false;
  };

  const toggleMobileDropdown = (label: string) => {
    const newSet = new Set(openMobileDropdowns);
    if (newSet.has(label)) {
      newSet.delete(label);
    } else {
      newSet.add(label);
    }
    setOpenMobileDropdowns(newSet);
  };

  const renderDesktopNavItem = (item: NavMenuItem) => {
    if (item.children && item.children.length > 0) {
      const isActive = isActiveRoute(item);
      return (
        <DropdownMenu key={item.label}>
          <DropdownMenuTrigger
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
          >
            {item.label}
            <ChevronDown className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {item.children.map((child) => (
              <DropdownMenuItem key={child.label} asChild>
                <Link
                  to={child.href || "#"}
                  className={cn(
                    location.pathname === child.href && "bg-accent"
                  )}
                >
                  {child.label}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <Link
        key={item.label}
        to={item.href || "#"}
        className={cn(
          "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
          location.pathname === item.href
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
        )}
      >
        {item.label}
      </Link>
    );
  };

  const renderMobileNavItem = (item: NavMenuItem) => {
    if (item.children && item.children.length > 0) {
      const isOpen = openMobileDropdowns.has(item.label);
      const isActive = isActiveRoute(item);
      return (
        <div key={item.label} className="flex flex-col">
          <button
            onClick={() => toggleMobileDropdown(item.label)}
            className={cn(
              "px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-between w-full",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
          >
            {item.label}
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                isOpen && "rotate-180"
              )}
            />
          </button>
          {isOpen && (
            <div className="pl-4 mt-2 space-y-1">
              {item.children.map((child) => (
                <Link
                  key={child.label}
                  to={child.href || "#"}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors block",
                    location.pathname === child.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  {child.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.label}
        to={item.href || "#"}
        onClick={() => setIsMenuOpen(false)}
        className={cn(
          "px-4 py-3 rounded-lg text-sm font-medium transition-colors",
          location.pathname === item.href
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
        )}
      >
        {item.label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <BookOpen className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-foreground">Umar Kitab Ghar</span>
            <span className="text-xs text-muted-foreground">Your Book Store</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_MENU_ITEMS.map((item) => renderDesktopNavItem(item))}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hidden md:flex">
            <Search className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/checkout")}
            className="relative"
            title="View Cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                {cartItemCount > 9 ? "9+" : cartItemCount}
              </span>
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className="md:hidden border-t bg-card p-4 animate-fade-in">
          <div className="flex flex-col gap-2">
            {NAV_MENU_ITEMS.map((item) => renderMobileNavItem(item))}
          </div>
        </nav>
      )}
    </header>
  );
}

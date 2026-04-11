import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, BookOpen, ShoppingCart, Search, ChevronDown, Heart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { NAV_MENU_ITEMS, type NavMenuItem } from "@/lib/constants";
import { supabase } from "@/lib/supabase";
import { getNavCategories, searchProducts, type NavCategory, type SearchProduct } from "@/services/api";
import { cn } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";
import logo from "@/assets/logo.png";

const SEARCH_DEBOUNCE_MS = 300;

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openMobileDropdowns, setOpenMobileDropdowns] = useState<Set<string>>(new Set());
  const [categories, setCategories] = useState<NavCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchProduct[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { getItemCount } = useCart();
  const cartItemCount = getItemCount();
  const [user, setUser] = useState<User | null>(null);

  const runSearch = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    const res = await searchProducts(trimmed);
    setIsSearching(false);
    if (res.success) setSearchResults(res.data);
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    setSearchResults(null);
    searchTimeoutRef.current = setTimeout(() => runSearch(searchQuery), SEARCH_DEBOUNCE_MS);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery, runSearch]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      const res = await getNavCategories();
      if (!res.success) {
        console.error("Failed to load categories for navbar:", res.message);
        return;
      }
      setCategories(res.data);
    };

    loadCategories();
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!error) {
        setUser(data.user ?? null);
      }
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate("/");
  };

  const isActiveRoute = (item: NavMenuItem): boolean => {
    if (item.label === "Book") {
      return categories.some(
        (cat) =>
          cat.parent_group === "buy-book" &&
          location.pathname === `/category/${cat.slug}`
      );
    }

    if (item.label === "Other Items") {
      return categories.some(
        (cat) =>
          cat.parent_group === "other-items" &&
          location.pathname === `/category/${cat.slug}`
      );
    }

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

  const NAV_LABELS = ["Home", "Deals", "Course", "Upload List", "Book", "Other Items", "Track Order"] as const;
  const navItems = NAV_MENU_ITEMS.filter(
    (item) => NAV_LABELS.includes(item.label as (typeof NAV_LABELS)[number])
  );

  const bookCategories = categories.filter((cat) => cat.parent_group === "buy-book");
  const otherCategories = categories.filter((cat) => cat.parent_group === "other-items");

  const renderDesktopNavItem = (item: NavMenuItem) => {
    if (item.label === "Book") {
      const isActive = isActiveRoute(item);
      return (
        <DropdownMenu key={item.label}>
          <DropdownMenuTrigger
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1",
              isActive
                ? "bg-accent/10 text-accent"
                : "text-muted-foreground hover:text-accent hover:bg-secondary"
            )}
          >
            {item.label}
            <ChevronDown className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {bookCategories.map((cat) => (
              <DropdownMenuItem key={cat.id} asChild>
                <Link
                  to={`/category/${cat.slug}`}
                  className={cn(location.pathname === `/category/${cat.slug}` && "bg-accent")}
                >
                  {cat.name}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    if (item.label === "Other Items") {
      const isActive = isActiveRoute(item);
      return (
        <DropdownMenu key={item.label}>
          <DropdownMenuTrigger
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1",
              isActive
                ? "bg-accent/10 text-accent"
                : "text-muted-foreground hover:text-accent hover:bg-secondary"
            )}
          >
            {item.label}
            <ChevronDown className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {otherCategories.map((cat) => (
              <DropdownMenuItem key={cat.id} asChild>
                <Link
                  to={`/category/${cat.slug}`}
                  className={cn(location.pathname === `/category/${cat.slug}` && "bg-accent")}
                >
                  {cat.name}
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
            ? "bg-accent/10 text-accent"
            : "text-muted-foreground hover:text-accent hover:bg-secondary"
        )}
      >
        {item.label}
      </Link>
    );
  };

  const renderMobileNavItem = (item: NavMenuItem) => {
    const bookCategories = categories.filter(
      (cat) => cat.parent_group === "buy-book"
    );
    const otherCategories = categories.filter(
      (cat) => cat.parent_group === "other-items"
    );

    if (item.label === "Book") {
      const isOpen = openMobileDropdowns.has(item.label);
      const isActive = isActiveRoute(item);
      return (
        <div key={item.label} className="flex flex-col">
          <button
            onClick={() => toggleMobileDropdown(item.label)}
            className={cn(
              "px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-between w-full",
              isActive
                ? "bg-accent/10 text-accent"
                : "text-muted-foreground hover:text-accent hover:bg-secondary"
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
              {bookCategories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/category/${cat.slug}`}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors block",
                    location.pathname === `/category/${cat.slug}`
                      ? "bg-accent/10 text-accent"
                      : "text-muted-foreground hover:text-accent hover:bg-secondary"
                  )}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (item.label === "Other Items") {
      const isOpen = openMobileDropdowns.has(item.label);
      const isActive = isActiveRoute(item);
      return (
        <div key={item.label} className="flex flex-col">
          <button
            onClick={() => toggleMobileDropdown(item.label)}
            className={cn(
              "px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-between w-full",
              isActive
                ? "bg-accent/10 text-accent"
                : "text-muted-foreground hover:text-accent hover:bg-secondary"
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
              {otherCategories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/category/${cat.slug}`}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors block",
                    location.pathname === `/category/${cat.slug}`
                      ? "bg-accent/10 text-accent"
                      : "text-muted-foreground hover:text-accent hover:bg-secondary"
                  )}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

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
                ? "bg-accent/10 text-accent"
                : "text-muted-foreground hover:text-accent hover:bg-secondary"
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
                      ? "bg-accent/10 text-accent"
                      : "text-muted-foreground hover:text-accent hover:bg-secondary"
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
            ? "bg-accent/10 text-accent"
            : "text-muted-foreground hover:text-accent hover:bg-secondary"
        )}
      >
        {item.label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center">
          <img
            src={logo}
            alt="Logo"
            className="h-[72px] w-auto object-contain"
            loading="eager"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => renderDesktopNavItem(item))}
        </nav>

        <div className="flex items-center gap-2">
          <div
            ref={searchContainerRef}
            className="relative hidden md:block w-48 lg:w-56"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchDropdownOpen(true)}
              className="pl-9 h-9"
            />
            {searchDropdownOpen && searchQuery.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border bg-popover text-popover-foreground shadow-md z-50 overflow-hidden">
                {isSearching || searchResults === null ? (
                  <div className="p-4 text-sm text-muted-foreground">Searching...</div>
                ) : searchResults.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground">No products found</div>
                ) : (
                  <ul className="max-h-80 overflow-y-auto py-1">
                    {searchResults.map((item) => (
                      <li key={item.id}>
                        <Link
                          to={`/product/${item.id}`}
                          state={{ from: location.pathname }}
                          onClick={() => {
                            setSearchQuery("");
                            setSearchDropdownOpen(false);
                          }}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-accent focus:bg-accent outline-none"
                        >
                          <div className="w-10 h-10 flex-shrink-0 rounded bg-secondary/50 flex items-center justify-center overflow-hidden">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <BookOpen className="h-5 w-5 text-muted-foreground/50" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-sm line-clamp-2 truncate">
                              {item.title ?? "Untitled"}
                            </div>
                            <div className="text-xs text-yellow-400 font-semibold">Rs. {item.price ?? 0}</div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
          {user ? (
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700] hover:text-[#050B2D] font-semibold"
              >
                <Link to="/account">Account</Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700] hover:text-[#050B2D] font-semibold"
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700] hover:text-[#050B2D] font-semibold"
              >
                <Link to="/login">Login</Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700] hover:text-[#050B2D] font-semibold"
              >
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(user ? "/wishlist" : "/login")}
            title="Wishlist"
            aria-label="Wishlist"
            className="border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700] hover:text-[#050B2D] font-semibold"
          >
            <Heart className="h-5 w-5" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate("/checkout")}
            className="relative border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700] hover:text-[#050B2D] font-semibold"
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
            {navItems.map((item) => renderMobileNavItem(item))}
            <div className="mt-4 flex flex-col gap-2">
              <Button
                variant="outline"
                className="justify-center gap-2 border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700] hover:text-[#050B2D] font-semibold"
                onClick={() => {
                  navigate(user ? "/wishlist" : "/login");
                  setIsMenuOpen(false);
                }}
              >
                <Heart className="h-4 w-4" />
                Wishlist
              </Button>
              {user ? (
                <>
                  <Button
                    variant="outline"
                    className="justify-center border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700] hover:text-[#050B2D] font-semibold"
                    asChild
                  >
                    <Link to="/account" onClick={() => setIsMenuOpen(false)}>
                      Account
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-center border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700] hover:text-[#050B2D] font-semibold"
                    onClick={async () => {
                      await handleLogout();
                      setIsMenuOpen(false);
                    }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="justify-center border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700] hover:text-[#050B2D] font-semibold"
                    asChild
                  >
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                      Login
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-center border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700] hover:text-[#050B2D] font-semibold"
                    asChild
                  >
                    <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                      Sign Up
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}


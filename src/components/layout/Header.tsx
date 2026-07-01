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
import {
  Menu,
  X,
  BookOpen,
  ShoppingCart,
  Search,
  ChevronDown,
  Heart,
  Truck,
  MapPin,
  LayoutGrid,
  User,
} from "lucide-react";
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
              "px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1 whitespace-nowrap border-b-2",
              isActive
                ? "border-[#071D36] text-[#071D36] font-semibold"
                : "border-transparent text-[#071D36] hover:text-[#5F7F64]"
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
              "px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1 whitespace-nowrap border-b-2",
              isActive
                ? "border-[#071D36] text-[#071D36] font-semibold"
                : "border-transparent text-[#071D36] hover:text-[#5F7F64]"
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
          "px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap border-b-2",
          location.pathname === item.href
            ? "border-[#071D36] text-[#071D36] font-semibold"
            : "border-transparent text-[#071D36] hover:text-[#5F7F64]"
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
                ? "bg-secondary text-primary font-semibold"
                : "text-muted-foreground hover:text-primary hover:bg-secondary/70"
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
                      ? "bg-secondary text-primary font-semibold"
                      : "text-muted-foreground hover:text-primary hover:bg-secondary/70"
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
                ? "bg-secondary text-primary font-semibold"
                : "text-muted-foreground hover:text-primary hover:bg-secondary/70"
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
                      ? "bg-secondary text-primary font-semibold"
                      : "text-muted-foreground hover:text-primary hover:bg-secondary/70"
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
                ? "bg-secondary text-primary font-semibold"
                : "text-muted-foreground hover:text-primary hover:bg-secondary/70"
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
                      ? "bg-secondary text-primary font-semibold"
                      : "text-muted-foreground hover:text-primary hover:bg-secondary/70"
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
            ? "bg-secondary text-primary font-semibold"
            : "text-muted-foreground hover:text-primary hover:bg-secondary/70"
        )}
      >
        {item.label}
      </Link>
    );
  };

  const allBrowseCategories = [
    ...bookCategories,
    ...otherCategories,
  ];

  return (
    <header className="sticky top-0 z-50 w-full shadow-[0_4px_20px_-8px_rgba(7,29,54,0.08)]">
      {/* Top announcement bar */}
      <div className="bg-[#5F7F64] text-white text-xs">
        <div className="container flex flex-wrap items-center justify-between gap-2 py-2">
          <span className="font-medium">Welcome to UMAR KITAB GHAR — Your Trusted Learning Partner</span>
          <div className="flex flex-wrap items-center gap-4 text-white/90">
            <span className="inline-flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5" />
              Free Delivery on qualifying orders
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              Karachi, Pakistan
            </span>
          </div>
        </div>
      </div>

      <div className="bg-[#FFFDF8] border-b border-[#E8DEC8]">
        {/* Main header row */}
        <div className="container py-3 md:py-4">
          <div className="flex items-center gap-3 lg:gap-6">
            <Link to="/" className="flex shrink-0 items-center gap-2">
              <img src={logo} alt="Umar Kitab Ghar" className="brand-logo-gold h-16 md:h-[4.5rem] w-auto object-contain" loading="eager" />
            </Link>

            {/* Search — desktop */}
            <div
              ref={searchContainerRef}
              className="relative hidden lg:flex flex-1 max-w-2xl mx-auto"
            >
              <div className="flex w-full items-stretch rounded-xl border border-[#E8DEC8] bg-white overflow-hidden shadow-sm">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="search"
                    placeholder="Search books, stationery, courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchDropdownOpen(true)}
                    className="h-11 border-0 rounded-none pl-10 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger className="hidden xl:flex items-center gap-1 border-l border-[#E8DEC8] px-4 text-sm text-[#071D36] hover:bg-[#DDE8D8]/40 outline-none">
                    All Categories
                    <ChevronDown className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto">
                    {allBrowseCategories.map((cat) => (
                      <DropdownMenuItem key={cat.id} asChild>
                        <Link to={`/category/${cat.slug}`}>{cat.name}</Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <button
                  type="button"
                  className="flex h-11 w-12 shrink-0 items-center justify-center bg-[#071D36] text-white hover:bg-[#071D36]/90"
                  aria-label="Search"
                  onClick={() => searchQuery.trim() && runSearch(searchQuery)}
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
              {searchDropdownOpen && searchQuery.trim().length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-[#E8DEC8] bg-white shadow-lg z-50 overflow-hidden">
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
                            className="flex items-center gap-3 px-3 py-2 hover:bg-[#DDE8D8]/50 outline-none"
                          >
                            <div className="w-10 h-10 flex-shrink-0 rounded-lg bg-[#DDE8D8]/50 flex items-center justify-center overflow-hidden">
                              {item.image ? (
                                <img src={item.image} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <BookOpen className="h-5 w-5 text-muted-foreground/50" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-sm line-clamp-2">{item.title ?? "Untitled"}</div>
                              <div className="text-xs text-price">Rs. {item.price ?? 0}</div>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Utility links */}
            <div className="hidden md:flex items-center gap-5 lg:gap-6 ml-auto shrink-0">
              <Link
                to="/track-order"
                className="flex flex-col items-center gap-0.5 text-[#071D36] hover:text-[#5F7F64] transition-colors"
              >
                <Truck className="h-5 w-5" />
                <span className="text-[10px] font-medium">Track Order</span>
              </Link>
              {user ? (
                <Link
                  to="/account"
                  className="flex flex-col items-center gap-0.5 text-[#071D36] hover:text-[#5F7F64] transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span className="text-[10px] font-medium">Account</span>
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="flex flex-col items-center gap-0.5 text-[#071D36] hover:text-[#5F7F64] transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span className="text-[10px] font-medium whitespace-nowrap">Login / Sign Up</span>
                </Link>
              )}
              <button
                type="button"
                onClick={() => navigate(user ? "/wishlist" : "/login")}
                className="flex flex-col items-center gap-0.5 text-[#071D36] hover:text-[#5F7F64] transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5" />
                <span className="text-[10px] font-medium">Wishlist</span>
              </button>
              <button
                type="button"
                onClick={() => navigate("/checkout")}
                className="relative flex flex-col items-center gap-0.5 text-[#071D36] hover:text-[#5F7F64] transition-colors"
                aria-label="Cart"
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="text-[10px] font-medium">Cart</span>
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 right-0 h-4 min-w-4 px-1 rounded-full bg-[#5F7F64] text-white text-[10px] flex items-center justify-center">
                    {cartItemCount > 9 ? "9+" : cartItemCount}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile cart + hamburger */}
            <div className="flex items-center gap-0.5 ml-auto shrink-0">
              <button
                type="button"
                onClick={() => navigate("/cart")}
                className="relative flex h-10 w-10 items-center justify-center rounded-lg text-[#071D36] hover:bg-[#DDE8D8]/50 transition-colors md:hidden"
                aria-label={`Cart${cartItemCount > 0 ? `, ${cartItemCount} items` : ""}`}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 h-4 min-w-4 px-1 rounded-full bg-[#5F7F64] text-white text-[10px] font-semibold flex items-center justify-center leading-none">
                    {cartItemCount > 9 ? "9+" : cartItemCount}
                  </span>
                )}
              </button>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 lg:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Second nav row — desktop */}
        <div className="hidden lg:block border-t border-[#E8DEC8] bg-[#FBF7EF]/50">
          <div className="container flex items-center gap-3 py-2.5">
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center gap-2 rounded-xl bg-[#5F7F64] text-white px-5 py-2.5 text-sm font-semibold hover:bg-[#5F7F64]/90 outline-none transition-colors">
                <LayoutGrid className="h-4 w-4" />
                Browse All Categories
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 max-h-96 overflow-y-auto">
                {allBrowseCategories.length > 0 ? (
                  allBrowseCategories.map((cat) => (
                    <DropdownMenuItem key={cat.id} asChild>
                      <Link to={`/category/${cat.slug}`}>{cat.name}</Link>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled>No categories loaded</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <nav className="flex items-center gap-0.5 overflow-x-auto no-scrollbar flex-1">
              {navItems.map((item) => {
                const isHome = item.href === "/";
                const isActive = isHome
                  ? location.pathname === "/"
                  : item.href
                    ? location.pathname === item.href
                    : isActiveRoute(item);
                return item.label === "Book" || item.label === "Other Items" ? (
                  renderDesktopNavItem(item)
                ) : (
                  <Link
                    key={item.label}
                    to={item.href || "#"}
                    className={cn(
                      "px-4 py-2 text-sm font-medium text-[#071D36] whitespace-nowrap transition-colors border-b-2 border-transparent",
                      isActive
                        ? "border-[#071D36] text-[#071D36] font-semibold"
                        : "hover:text-[#5F7F64]"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className="md:hidden border-t bg-card p-4 animate-fade-in">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => renderMobileNavItem(item))}
            <Link
              to="/cart"
              onClick={() => setIsMenuOpen(false)}
              className={cn(
                "px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
                location.pathname === "/cart"
                  ? "bg-secondary text-primary font-semibold"
                  : "text-muted-foreground hover:text-primary hover:bg-secondary/70"
              )}
            >
              <ShoppingCart className="h-4 w-4" />
              Cart
              {cartItemCount > 0 && (
                <span className="ml-auto h-5 min-w-5 px-1.5 rounded-full bg-[#5F7F64] text-white text-xs font-semibold flex items-center justify-center">
                  {cartItemCount > 9 ? "9+" : cartItemCount}
                </span>
              )}
            </Link>
            <div className="mt-4 flex flex-col gap-2">
              <Button
                variant="outline"
                className="justify-center gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
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
                    className="justify-center border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    asChild
                  >
                    <Link to="/account" onClick={() => setIsMenuOpen(false)}>
                      Account
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-center border-primary text-primary hover:bg-primary hover:text-primary-foreground"
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
                    className="justify-center border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    asChild
                  >
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                      Login
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-center border-primary text-primary hover:bg-primary hover:text-primary-foreground"
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


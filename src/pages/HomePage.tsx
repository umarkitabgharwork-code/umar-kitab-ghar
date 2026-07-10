import {
  Star,
  BookOpen,
  FileText,
  Truck,
  ArrowRight,
  Flame,
  BadgeDollarSign,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Upload,
  GraduationCap,
  PenLine,
  Package,
  Headphones,
  RotateCcw,
  Shield,
  Lock,
  Heart,
  MapPin,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/lib/constants";
import {
  getActiveBanners,
  getActiveDeals,
  getBestSellerBooks,
  getNavCategories,
  getPublishedBlogPosts,
  getTrendingBooks,
  type Banner,
  type NavCategory,
} from "@/services/api";
import { supabase } from "@/lib/supabase";
import { TestimonialSlider, type Review as StoreReview } from "@/components/TestimonialSlider";
import { cn } from "@/lib/utils";
import { BRIGHT_CAREER_CAMPAIGN_ACTIVE } from "@/lib/brightCareerCampaign";
import { BrightCareerHeroContent } from "@/components/campaign/BrightCareerHeroContent";

const FEATURE_STRIP = [
  { icon: BookOpen, label: "Wide Range of Books" },
  { icon: GraduationCap, label: "School Course Orders" },
  { icon: Upload, label: "Upload Your List" },
  { icon: MapPin, label: "Local Support" },
] as const;

const HERO_BENEFITS = [
  { icon: Truck, title: "Free Delivery", subtitle: "On qualifying orders" },
  { icon: RotateCcw, title: "Easy Returns", subtitle: "Hassle-free process" },
  { icon: Headphones, title: "24/7 Support", subtitle: "We're here to help" },
] as const;

const DEFAULT_HERO_TITLE = "Everything You Need for Learning & Growth";
const DEFAULT_HERO_SUBTITLE =
  "Premium books, stationery, and complete school courses — curated for every learner.";
const DEFAULT_HERO_BUTTON_TEXT = "Shop Now";
const DEFAULT_HERO_BUTTON_LINK = "/category/study-books";

function pickBannerText(
  banner: Banner | null | undefined,
  field: keyof Pick<Banner, "title" | "subtitle" | "button_text" | "button_link">,
): string {
  if (!banner) return "";
  const record = banner as Record<string, unknown>;
  const keys =
    field === "button_text"
      ? ["button_text", "buttonText"]
      : field === "button_link"
        ? ["button_link", "buttonLink"]
        : [field];
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function isExternalUrl(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

function HeroPrimaryButton({ href, label }: { href: string; label: string }) {
  if (isExternalUrl(href)) {
    return (
      <Button asChild size="lg" variant="hero" className="rounded-full px-8 gap-2">
        <a href={href} target="_blank" rel="noreferrer">
          {label}
          <ArrowRight className="h-4 w-4" />
        </a>
      </Button>
    );
  }

  const internalHref = href.startsWith("/") ? href : `/${href}`;

  return (
    <Button asChild size="lg" variant="hero" className="rounded-full px-8 gap-2">
      <Link to={internalHref}>
        {label}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </Button>
  );
}

const TRUST_STRIP = [
  { icon: Shield, title: "100% Original Products", subtitle: "Authentic books & stationery" },
  { icon: Lock, title: "Secure Payments", subtitle: "Safe checkout every time" },
  { icon: Truck, title: "Fast Delivery", subtitle: "Pickup or home delivery" },
  { icon: Heart, title: "Happy Customers", subtitle: "Trusted since 1988" },
] as const;

function stripHtml(html: string): string {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent?.trim() ?? "";
}

function previewText(content: string | null, maxLen: number): string {
  if (!content) return "";
  const text = stripHtml(content);
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trim() + "…";
}

function categoryHref(categories: NavCategory[], ...keywords: string[]): string {
  const match = categories.find((c) => {
    const slug = c.slug.toLowerCase();
    const name = c.name.toLowerCase();
    return keywords.some((k) => slug.includes(k) || name.includes(k));
  });
  return match ? `/category/${match.slug}` : ROUTES.DEALS;
}

type QuickCategory = {
  label: string;
  href: string;
  icon: LucideIcon;
};

function buildQuickCategories(categories: NavCategory[]): QuickCategory[] {
  return [
    { label: "Books", href: categoryHref(categories, "study", "book", "academic"), icon: BookOpen },
    { label: "Stationery", href: categoryHref(categories, "stationery"), icon: PenLine },
    { label: "School Courses", href: ROUTES.BUY_COURSE, icon: GraduationCap },
    { label: "Other Items", href: categoryHref(categories, "other"), icon: Package },
    { label: "Deals & Offers", href: ROUTES.DEALS, icon: Sparkles },
    { label: "Upload List", href: ROUTES.UPLOAD_LIST, icon: Upload },
  ];
}

function ProductCard({
  imageUrl,
  title,
  price,
  badge,
  productId,
  fromPath,
  strikethroughPrice,
}: {
  imageUrl?: string | null;
  title: string;
  price: number;
  badge?: string;
  productId: string;
  fromPath: string;
  strikethroughPrice?: number;
}) {
  return (
    <Card variant="interactive" className="overflow-hidden rounded-2xl border-[#E8DEC8] bg-white shadow-[0_8px_24px_-8px_rgba(7,29,54,0.08)]">
      {imageUrl ? (
        <img src={imageUrl} alt={title} className="w-full aspect-[4/3] object-cover" />
      ) : (
        <div className="w-full aspect-[4/3] bg-[#DDE8D8]/50 flex items-center justify-center">
          <BookOpen className="h-10 w-10 text-[#5F7F64]/60" />
        </div>
      )}
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-[#071D36] text-base line-clamp-2">{title}</h3>
          {badge ? (
            <span className="shrink-0 rounded-full bg-[#DDE8D8] text-[#5F7F64] text-xs px-2.5 py-0.5 font-medium">
              {badge}
            </span>
          ) : null}
        </div>
        <div className="flex items-center justify-between pt-1">
          <div>
            {strikethroughPrice != null ? (
              <p className="text-xs text-muted-foreground line-through">Rs. {strikethroughPrice}</p>
            ) : null}
            <p className="text-sm text-price">Rs. {price}</p>
          </div>
          <Button asChild size="sm" variant="hero" className="rounded-full px-4">
            <Link to={`/product/${productId}`} state={{ from: fromPath }}>
              View
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

const HomePage = () => {
  const location = useLocation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isBannerHovered, setIsBannerHovered] = useState(false);
  const [isFading, setIsFading] = useState(false);

  const { data: bannersResponse } = useQuery({
    queryKey: ["activeBanners"],
    queryFn: async () => {
      const res = await getActiveBanners();
      if (!res.success) return [];
      return res.data;
    },
  });

  const banners = (bannersResponse ?? []) as Banner[];
  const currentBanner = banners.length > 0 ? banners[Math.min(currentIndex, banners.length - 1)] : null;

  useEffect(() => {
    if (banners.length <= 1) return;
    setIsFading(true);
    const t = window.setTimeout(() => setIsFading(false), 260);
    return () => window.clearTimeout(t);
  }, [currentIndex, banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    if (isBannerHovered) return;
    const id = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => window.clearInterval(id);
  }, [banners.length, isBannerHovered]);

  const goNextBanner = () => {
    if (banners.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const goPrevBanner = () => {
    if (banners.length === 0) return;
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const { data: blogPostsResponse, isLoading: isLoadingBlog } = useQuery({
    queryKey: ["publishedBlogPosts", "home"],
    queryFn: async () => {
      const response = await getPublishedBlogPosts();
      if (!response.success) return [];
      return response.data.slice(0, 3);
    },
  });

  const blogPosts = blogPostsResponse || [];

  const { data: dealsResponse, isLoading: isLoadingDeals } = useQuery({
    queryKey: ["activeDeals", "home"],
    queryFn: async () => {
      const res = await getActiveDeals();
      if (!res.success) return [];
      return res.data;
    },
  });

  const deals = dealsResponse ?? [];
  const newDeals = deals.filter((d) => d.section === "Deal");

  const { data: trendingResponse, isLoading: isLoadingTrending } = useQuery({
    queryKey: ["homeTrendingBooks"],
    queryFn: async () => {
      const res = await getTrendingBooks();
      if (!res.success) return [];
      return res.data;
    },
  });

  const { data: bestSellersResponse, isLoading: isLoadingBestSellers } = useQuery({
    queryKey: ["homeBestSellerBooks"],
    queryFn: async () => {
      const res = await getBestSellerBooks();
      if (!res.success) return [];
      return res.data;
    },
  });

  const trendingBooks = trendingResponse ?? [];
  const bestSellers = bestSellersResponse ?? [];

  const { data: storeReviews = [] } = useQuery({
    queryKey: ["store-reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("id, rating, comment, created_at")
        .eq("review_type", "store")
        .order("created_at", { ascending: false })
        .limit(12);
      if (error) return [];
      return (data ?? []) as StoreReview[];
    },
  });

  const { data: navCategoriesResponse = [] } = useQuery({
    queryKey: ["homeNavCategories"],
    queryFn: async () => {
      const res = await getNavCategories();
      if (!res.success) return [] as NavCategory[];
      return res.data.filter((c) => c.slug !== "home" && c.slug !== "track-order");
    },
  });

  const navCategories = navCategoriesResponse as NavCategory[];
  const quickCategories = useMemo(() => buildQuickCategories(navCategories), [navCategories]);
  const popularCategories = navCategories.slice(0, 4);

  const defaultShopLink = useMemo(() => {
    const fromNav = categoryHref(navCategories, "study", "book", "academic");
    return fromNav !== ROUTES.DEALS ? fromNav : DEFAULT_HERO_BUTTON_LINK;
  }, [navCategories]);

  const heroCopy = useMemo(() => {
    const titleFromBanner = pickBannerText(currentBanner, "title");
    const subtitleFromBanner = pickBannerText(currentBanner, "subtitle");
    const buttonTextFromBanner = pickBannerText(currentBanner, "button_text");
    const buttonLinkFromBanner = pickBannerText(currentBanner, "button_link");

    return {
      title: titleFromBanner || DEFAULT_HERO_TITLE,
      subtitle: subtitleFromBanner || DEFAULT_HERO_SUBTITLE,
      buttonText: buttonTextFromBanner || DEFAULT_HERO_BUTTON_TEXT,
      buttonLink: buttonLinkFromBanner || defaultShopLink,
      useDefaultTitle: !titleFromBanner,
    };
  }, [currentBanner, defaultShopLink]);

  const renderHeroBannerVisual = (className?: string) => {
    const imageUrl = currentBanner?.image_url;
    const videoUrl = currentBanner?.video_url;
    const mediaClass = cn(
      "h-full w-full object-cover transition-opacity duration-500",
      isFading ? "opacity-80" : "opacity-100",
      className
    );

    if (videoUrl) {
      return (
        <video
          className={mediaClass}
          src={videoUrl}
          autoPlay
          muted
          loop
          playsInline
        />
      );
    }

    if (imageUrl) {
      return <img src={imageUrl} alt="" className={mediaClass} />;
    }

    return (
      <div className="flex h-full w-full items-center justify-center bg-[#DDE8D8]/40">
        <BookOpen className="h-16 w-16 text-[#5F7F64]/50" />
      </div>
    );
  };

  return (
    <div className="home-page flex flex-col">
      {/* —— Hero —— */}
      <section
        className="pt-6 pb-4 md:pt-8 md:pb-6"
        onMouseEnter={() => setIsBannerHovered(true)}
        onMouseLeave={() => setIsBannerHovered(false)}
      >
        <div className="container max-w-[1400px]">
          <div className="home-hero-card relative overflow-hidden rounded-3xl border border-[#E8DEC8]">
            <div className="relative z-10 grid min-h-[360px] md:min-h-[400px] grid-cols-1 items-center gap-6 px-5 py-8 md:px-8 md:py-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.35fr)_minmax(0,0.85fr)] lg:gap-8">
              {/* Left — single banner panel */}
              <div className="order-2 lg:order-1 hidden md:block">
                <div className="relative mx-auto w-full max-w-[300px] lg:max-w-none h-[200px] md:h-[280px] lg:h-[320px] rounded-2xl overflow-hidden border border-[#E8DEC8] bg-[#DDE8D8]/25 shadow-sm">
                  {renderHeroBannerVisual()}
                </div>
              </div>

              {/* Center — headline & CTAs */}
              <div className="order-1 lg:order-2 flex flex-col items-center justify-center text-center px-1 lg:px-4">
                {BRIGHT_CAREER_CAMPAIGN_ACTIVE ? (
                  <>
                    <BrightCareerHeroContent />
                    {banners.length > 1 && (
                      <div className="mt-6 flex items-center justify-center gap-2">
                        {banners.map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setCurrentIndex(i)}
                            className={cn(
                              "h-2 rounded-full transition-all",
                              i === currentIndex ? "w-8 bg-[#5F7F64]" : "w-2 bg-[#E8DEC8] hover:bg-[#5F7F64]/40"
                            )}
                            aria-label={`Go to banner ${i + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                <div className="w-full max-w-[720px]">
                  <span className="inline-flex items-center rounded-full border border-[#E8DEC8] bg-white/80 px-4 py-1.5 text-xs font-medium text-[#5F7F64] mb-4">
                    Your Trusted Learning Partner
                  </span>

                  {heroCopy.useDefaultTitle ? (
                    <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-[#071D36] leading-[1.15] tracking-tight">
                      Everything You Need for Learning &{" "}
                      <span className="home-serif-accent">Growth</span>
                    </h1>
                  ) : (
                    <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-[#071D36] leading-[1.15] tracking-tight">
                      {heroCopy.title}
                    </h1>
                  )}

                  <p className="mt-3 text-base md:text-lg text-muted-foreground max-w-[680px] mx-auto leading-relaxed">
                    {heroCopy.subtitle}
                  </p>

                  <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    <HeroPrimaryButton href={heroCopy.buttonLink} label={heroCopy.buttonText} />
                    <Button asChild size="lg" variant="hero-outline" className="rounded-full px-8 gap-2 bg-white">
                      <Link to={ROUTES.UPLOAD_LIST}>
                        <Upload className="h-4 w-4" />
                        Upload Your List
                      </Link>
                    </Button>
                  </div>

                  {banners.length > 1 && (
                    <div className="mt-6 flex items-center justify-center gap-2">
                      {banners.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setCurrentIndex(i)}
                          className={cn(
                            "h-2 rounded-full transition-all",
                            i === currentIndex ? "w-8 bg-[#5F7F64]" : "w-2 bg-[#E8DEC8] hover:bg-[#5F7F64]/40"
                          )}
                          aria-label={`Go to banner ${i + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
                )}
              </div>

              {/* Right — benefit cards only (no banner image) */}
              <div className="order-3 hidden lg:flex flex-col justify-center gap-3">
                {HERO_BENEFITS.map((b) => (
                  <div
                    key={b.title}
                    className="flex items-center gap-3 rounded-2xl border border-[#E8DEC8] bg-white px-4 py-3 shadow-[0_8px_24px_-8px_rgba(7,29,54,0.08)]"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#DDE8D8] text-[#5F7F64]">
                      <b.icon className="h-5 w-5" />
                    </span>
                    <div className="text-left min-w-0">
                      <p className="text-sm font-semibold text-[#071D36]">{b.title}</p>
                      <p className="text-xs text-muted-foreground">{b.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Slider arrows */}
            {banners.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={goPrevBanner}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-[#E8DEC8] bg-white/90 text-[#071D36] shadow-sm hover:bg-white"
                  aria-label="Previous banner"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={goNextBanner}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-[#E8DEC8] bg-white/90 text-[#071D36] shadow-sm hover:bg-white"
                  aria-label="Next banner"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>

          {/* Mobile benefits row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 xl:hidden">
            {HERO_BENEFITS.map((b) => (
              <div
                key={b.title}
                className="flex items-center gap-3 rounded-2xl border border-[#E8DEC8] bg-white px-4 py-3 shadow-[0_8px_24px_-8px_rgba(7,29,54,0.08)]"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#DDE8D8] text-[#5F7F64]">
                  <b.icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#071D36]">{b.title}</p>
                  <p className="text-xs text-muted-foreground">{b.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* —— Quick category strip —— */}
      <section className="pb-6">
        <div className="container max-w-[1400px]">
          <div className="home-quick-strip rounded-2xl border border-[#E8DEC8]/80 px-3 py-4 md:px-6 md:py-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-2">
              {quickCategories.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className="group flex flex-col items-center text-center gap-2 rounded-xl p-2 hover:bg-white/50 transition-colors"
                >
                  <span className="flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-full border-2 border-white bg-white shadow-sm text-[#5F7F64] group-hover:border-[#C9A44C]/40">
                    <item.icon className="h-6 w-6 md:h-7 md:w-7" />
                  </span>
                  <span className="text-sm font-semibold text-[#071D36]">{item.label}</span>
                  <span className="text-xs text-[#5F7F64] group-hover:underline">Explore Now</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* —— Feature strip —— */}
      <section className="pb-8">
        <div className="container max-w-[1400px]">
          <div className="rounded-2xl border border-[#E8DEC8] bg-white/70 divide-y sm:divide-y-0 sm:divide-x divide-[#E8DEC8] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURE_STRIP.map((item, i) => (
              <div
                key={item.label}
                className={cn(
                  "flex items-center justify-center gap-3 px-4 py-4 text-center sm:text-left",
                  i > 0 && "sm:border-l sm:border-[#E8DEC8]"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0 text-[#5F7F64]" />
                <span className="text-sm font-medium text-[#071D36]">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* —— Popular Categories + Special Offer —— */}
      <section className="pb-10 md:pb-12">
        <div className="container max-w-[1400px]">
          <div className="grid lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px] gap-6 lg:gap-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#071D36] mb-6 font-serif tracking-tight">
                Popular Categories
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                {(popularCategories.length > 0 ? popularCategories : quickCategories.slice(0, 4)).map(
                  (cat) => {
                    const isNav = "slug" in cat;
                    const href = isNav ? `/category/${(cat as NavCategory).slug}` : (cat as QuickCategory).href;
                    const name = isNav ? (cat as NavCategory).name : (cat as QuickCategory).label;
                    const Icon = isNav ? BookOpen : (cat as QuickCategory).icon;
                    const dealImage = newDeals[0]?.book_image_url;

                    return (
                      <Link key={name + href} to={href} className="group">
                        <Card className="h-full rounded-2xl border-[#E8DEC8] bg-white overflow-hidden shadow-[0_8px_24px_-8px_rgba(7,29,54,0.08)] hover:shadow-[0_16px_40px_-12px_rgba(7,29,54,0.12)] transition-all hover:-translate-y-0.5">
                          <CardContent className="p-5 flex gap-4">
                            <div className="shrink-0">
                              {isNav && dealImage ? (
                                <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-[#E8DEC8]">
                                  <img src={dealImage} alt="" className="h-full w-full object-cover" />
                                </div>
                              ) : (
                                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[#DDE8D8] text-[#5F7F64]">
                                  <Icon className="h-8 w-8" />
                                </span>
                              )}
                            </div>
                            <div className="min-w-0 flex flex-col justify-center">
                              <h3 className="font-semibold text-[#071D36] text-lg mb-1">{name}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                Explore quality {name.toLowerCase()} for every need.
                              </p>
                              <span className="text-sm font-medium text-[#5F7F64] group-hover:text-[#071D36] inline-flex items-center gap-1">
                                Shop Now <ArrowRight className="h-3.5 w-3.5" />
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  }
                )}
              </div>
            </div>

            <div className="lg:pt-12">
              <Card className="h-full min-h-[280px] rounded-3xl border-[#E8DEC8] bg-[#FFFDF8] shadow-[0_8px_24px_-8px_rgba(7,29,54,0.08)] overflow-hidden">
                <CardContent className="p-6 md:p-8 flex flex-col justify-between h-full relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#DDE8D8]/50 rounded-full blur-2xl -mr-8 -mt-8" />
                  <div className="relative space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-[#5F7F64]">Special Offer</p>
                    <h3 className="text-3xl font-bold text-[#071D36] leading-tight">
                      Up to <span className="text-[#C9A44C]">20% OFF</span>
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Selected school courses and bundle deals for a limited time.
                    </p>
                  </div>
                  <Button asChild variant="hero" className="relative mt-6 rounded-full w-full sm:w-auto gap-2">
                    <Link to={ROUTES.DEALS}>
                      Shop The Deal
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* —— New Deals —— */}
      <section className="py-10 md:py-12">
        <div className="container max-w-[1400px]">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#071D36] flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-[#C9A44C]" />
                New Deals
              </h2>
              <p className="text-muted-foreground text-sm mt-1">Latest offers on selected books.</p>
            </div>
            <Button asChild variant="outline" className="hidden md:flex rounded-full border-[#E8DEC8]">
              <Link to="/deals">View All</Link>
            </Button>
          </div>

          {isLoadingDeals ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="rounded-2xl overflow-hidden">
                  <Skeleton className="aspect-[4/3] w-full" />
                  <CardContent className="p-5 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-8 w-24" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {newDeals.map((deal) => (
                <ProductCard
                  key={deal.id}
                  imageUrl={deal.book_image_url}
                  title={deal.book_title}
                  price={deal.deal_price}
                  strikethroughPrice={deal.original_price}
                  badge={deal.badge ?? undefined}
                  productId={deal.book_id}
                  fromPath={location.pathname}
                />
              ))}
            </div>
          )}

          <div className="mt-6 text-center md:hidden">
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/deals">View All</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* —— Trending —— */}
      <section className="py-10 md:py-12 bg-[#DDE8D8]/25">
        <div className="container max-w-[1400px]">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#071D36] flex items-center gap-2">
                <Flame className="h-6 w-6 text-[#C9A44C]" />
                Trending Books
              </h2>
              <p className="text-muted-foreground text-sm mt-1">Popular picks right now.</p>
            </div>
            <Button asChild variant="outline" className="hidden md:flex rounded-full">
              <Link to="/trending">View All</Link>
            </Button>
          </div>

          {isLoadingTrending ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {trendingBooks.map((b) => (
                <ProductCard
                  key={b.id}
                  imageUrl={b.image_url}
                  title={b.title}
                  price={b.price}
                  badge="Trending"
                  productId={b.id}
                  fromPath={location.pathname}
                />
              ))}
            </div>
          )}

          <div className="mt-6 text-center md:hidden">
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/trending">View All</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* —— Best Sellers —— */}
      <section className="py-10 md:py-12">
        <div className="container max-w-[1400px]">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#071D36] flex items-center gap-2">
                <BadgeDollarSign className="h-6 w-6 text-[#C9A44C]" />
                Best Sellers
              </h2>
              <p className="text-muted-foreground text-sm mt-1">Most purchased on offer.</p>
            </div>
            <Button asChild variant="outline" className="hidden md:flex rounded-full">
              <Link to="/best-sellers">View All</Link>
            </Button>
          </div>

          {isLoadingBestSellers ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {bestSellers.map((b) => (
                <ProductCard
                  key={b.id}
                  imageUrl={b.image_url}
                  title={b.title}
                  price={b.price}
                  badge="Best Seller"
                  productId={b.id}
                  fromPath={location.pathname}
                />
              ))}
            </div>
          )}

          <div className="mt-6 text-center md:hidden">
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/best-sellers">View All</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* —— Testimonials —— */}
      <section className="py-10 md:py-12 bg-white/50">
        <div className="container max-w-[1400px]">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-[#071D36]">Customer Testimonials</h2>
            <p className="text-muted-foreground text-sm mt-1">What our customers say about us</p>
          </div>
          <TestimonialSlider reviews={storeReviews} />
          <div className="mt-6 text-center">
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/reviews">Write a Review</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* —— Blog —— */}
      <section className="py-10 md:py-12">
        <div className="container max-w-[1400px]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#071D36]">From Our Blog</h2>
              <p className="text-muted-foreground text-sm mt-1">Tips, guides, and educational insights</p>
            </div>
            <Button asChild variant="outline" className="hidden md:flex rounded-full">
              <Link to={ROUTES.BLOG}>View All Posts</Link>
            </Button>
          </div>

          {isLoadingBlog ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="rounded-2xl">
                  <CardContent className="p-6 space-y-4">
                    <Skeleton className="h-40 w-full rounded-xl" />
                    <Skeleton className="h-6 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {blogPosts.map((post) => (
                <Link key={post.id} to={`/blog/${post.slug}`}>
                  <Card className="h-full rounded-2xl border-[#E8DEC8] bg-white hover:-translate-y-0.5 transition-transform">
                    <CardContent className="p-5 space-y-4">
                      {post.image_url ? (
                        <img
                          src={post.image_url}
                          alt={post.title}
                          className="w-full aspect-video object-cover rounded-xl border border-[#E8DEC8]"
                        />
                      ) : (
                        <div className="w-full aspect-video rounded-xl border border-[#E8DEC8] bg-[#DDE8D8]/30 flex items-center justify-center">
                          <FileText className="h-10 w-10 text-[#5F7F64]/50" />
                        </div>
                      )}
                      <h3 className="text-lg font-semibold text-[#071D36] line-clamp-2">{post.title}</h3>
                      <p className="text-muted-foreground text-sm line-clamp-3">
                        {previewText(post.content, 120)}
                      </p>
                      <span className="text-sm font-medium text-[#5F7F64] inline-flex items-center gap-1">
                        Read More <ArrowRight className="h-4 w-4" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-6 text-center md:hidden">
            <Button asChild variant="outline" className="rounded-full">
              <Link to={ROUTES.BLOG}>View All Posts</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* —— Trust strip —— */}
      <section className="pb-12 md:pb-14">
        <div className="container max-w-[1400px]">
          <div className="rounded-2xl border border-[#E8DEC8] bg-white px-4 py-6 md:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TRUST_STRIP.map((item) => (
              <div key={item.title} className="flex items-start gap-4 text-center sm:text-left justify-center sm:justify-start">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#DDE8D8] text-[#5F7F64] mx-auto sm:mx-0">
                  <item.icon className="h-6 w-6" />
                </span>
                <div>
                  <p className="font-semibold text-[#071D36] text-sm">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.subtitle}</p>
                  {item.title === "Happy Customers" && (
                    <div className="flex items-center gap-1 mt-1 justify-center sm:justify-start">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="h-3.5 w-3.5 fill-[#C9A44C] text-[#C9A44C]" />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

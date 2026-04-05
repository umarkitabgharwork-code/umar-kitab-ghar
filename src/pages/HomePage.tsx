import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  FileText,
  Clock,
  Truck,
  ArrowRight,
  Flame,
  BadgeDollarSign,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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

const features = [
  { icon: Star, title: "Quality Products", description: "Original books and premium stationery" },
  { icon: Clock, title: "Quick Processing", description: "Fast order preparation and dispatch" },
  { icon: Truck, title: "Easy Delivery", description: "Pickup or home delivery options" },
];

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
    }, 3000);

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

  // Fetch blog posts using React Query (only latest 3 for homepage)
  const { data: blogPostsResponse, isLoading: isLoadingBlog } = useQuery({
    queryKey: ["publishedBlogPosts", "home"],
    queryFn: async () => {
      const response = await getPublishedBlogPosts();
      if (!response.success) return [];
      return response.data.slice(0, 3); // Only show latest 3 on homepage
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

  const {
    data: navCategoriesResponse = [],
  } = useQuery({
    queryKey: ["homeNavCategories"],
    queryFn: async () => {
      const res = await getNavCategories();
      if (!res.success) return [] as NavCategory[];
      return res.data.filter(
        (c) => c.slug !== "home" && c.slug !== "track-order"
      );
    },
  });

  const navCategories = navCategoriesResponse as NavCategory[];

  useEffect(() => {
    if (navCategories.length <= 1) return;
    const id = window.setInterval(() => {
      const container = document.querySelector<HTMLDivElement>("#home-category-scroll");
      if (!container) return;
      const cardWidth = 260;
      const maxScrollLeft = container.scrollWidth - container.clientWidth;
      const nextLeft = container.scrollLeft + cardWidth;
      if (nextLeft >= maxScrollLeft) {
        container.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        container.scrollBy({ left: cardWidth, behavior: "smooth" });
      }
    }, 3500);
    return () => window.clearInterval(id);
  }, [navCategories.length]);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section
        className="relative overflow-hidden min-h-[70vh] flex items-stretch"
        onMouseEnter={() => setIsBannerHovered(true)}
        onMouseLeave={() => setIsBannerHovered(false)}
      >
        {/* Background (image or video) */}
        <div
          className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
            isFading ? "opacity-0" : "opacity-100"
          }`}
        >
          {currentBanner?.video_url ? (
            <video
              className="absolute inset-0 h-full w-full object-cover"
              src={currentBanner.video_url}
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: currentBanner?.image_url ? `url(${currentBanner.image_url})` : undefined,
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-background/20" />
          <div className="absolute inset-0 hero-gradient opacity-60" />
        </div>

        {/* Controls */}
        <div className="absolute inset-0 z-20">
          <div className="container relative h-full">
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-3 md:left-0 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full text-primary-foreground bg-black/20 hover:bg-black/35 backdrop-blur border border-white/10"
              onClick={goPrevBanner}
              aria-label="Previous banner"
              type="button"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-3 md:right-0 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full text-primary-foreground bg-black/20 hover:bg-black/35 backdrop-blur border border-white/10"
              onClick={goNextBanner}
              aria-label="Next banner"
              type="button"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="container relative flex-1 flex items-center py-16 md:py-24">
          <div className="max-w-2xl space-y-6 animate-slide-up">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight">
              {currentBanner?.title ?? (
                <>
                   <span className="text-accent"></span> 
                </>
              )}
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/90">
              {currentBanner?.subtitle ??
                ""}
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              {currentBanner?.button_text && currentBanner?.button_link ? (
                <Button asChild size="xl" variant="hero-outline">
                  <Link to={currentBanner.button_link}>{currentBanner.button_text}</Link>
                </Button>
              ) : null}
            </div>

            {banners.length > 1 && (
              <div className="flex items-center gap-2 pt-4">
                {banners.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrentIndex(i)}
                    className={`h-2.5 w-2.5 rounded-full transition-colors ${
                      i === currentIndex ? "bg-accent" : "bg-primary-foreground/30 hover:bg-primary-foreground/50"
                    }`}
                    aria-label={`Go to banner ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* New Deals */}
      <section className="py-16 md:py-24 bg-secondary/20">
        <div className="container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-2">
                <Sparkles className="h-7 w-7 text-accent" />
                New Deals
              </h2>
              <p className="text-muted-foreground">Latest offers on selected books.</p>
            </div>
            <Button asChild variant="outline" className="hidden md:flex">
              <Link to="/deals">View All</Link>
            </Button>
          </div>

          {isLoadingDeals ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-[4/3] w-full rounded-none" />
                  <CardContent className="p-5 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-8 w-32" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newDeals.map((deal) => (
                <Card
                  key={deal.id}
                  variant="interactive"
                  className="overflow-hidden card-shadow-hover hover:border-accent/60 transition-colors"
                >
                  {deal.book_image_url ? (
                    <img
                      src={deal.book_image_url}
                      alt={deal.book_title}
                      className="w-full aspect-[4/3] object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-[4/3] bg-secondary/50 flex items-center justify-center">
                      <BookOpen className="h-10 w-10 text-muted-foreground/70" />
                    </div>
                  )}
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold text-base line-clamp-2">{deal.book_title}</h3>
                      {deal.badge ? (
                        <span className="inline-flex items-center rounded-full bg-accent/10 text-accent text-xs px-3 py-1 whitespace-nowrap">
                          {deal.badge}
                        </span>
                      ) : null}
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground line-through">Rs. {deal.original_price}</p>
                        <p className="text-sm text-yellow-400 font-semibold">Rs. {deal.deal_price}</p>
                      </div>
                      <Button asChild size="sm" className="gold-gradient rounded-full px-4 py-1.5 text-xs">
                        <Link to={`/product/${deal.book_id}`} state={{ from: location.pathname }}>View</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-8 text-center md:hidden">
            <Button asChild variant="outline">
              <Link to="/deals">View All</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Trending Books */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-2">
                <Flame className="h-7 w-7 text-accent" />
                Trending Books
              </h2>
              <p className="text-muted-foreground">Popular picks parents are ordering right now.</p>
            </div>
            <Button asChild variant="outline" className="hidden md:flex">
              <Link to="/trending">View All</Link>
            </Button>
          </div>

          {isLoadingTrending ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-[4/3] w-full rounded-none" />
                  <CardContent className="p-5 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-8 w-32" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingBooks.map((b) => (
                <Card key={b.id} variant="interactive" className="overflow-hidden card-shadow-hover hover:border-accent/60 transition-colors">
                  {b.image_url ? (
                    <img src={b.image_url} alt={b.title} className="w-full aspect-[4/3] object-cover" />
                  ) : (
                    <div className="w-full aspect-[4/3] bg-secondary/50 flex items-center justify-center">
                      <BookOpen className="h-10 w-10 text-muted-foreground/70" />
                    </div>
                  )}
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold text-base line-clamp-2">{b.title}</h3>
                      <span className="inline-flex items-center rounded-full bg-accent/10 text-accent text-xs px-3 py-1 whitespace-nowrap">
                        Trending
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <p className="text-sm text-yellow-400 font-semibold">Rs. {b.price}</p>
                      <Button asChild size="sm" className="gold-gradient rounded-full px-4 py-1.5 text-xs">
                        <Link to={`/product/${b.id}`} state={{ from: location.pathname }}>View</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-8 text-center md:hidden">
            <Button asChild variant="outline">
              <Link to="/trending">View All</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-16 md:py-24 bg-secondary/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-2">
                <BadgeDollarSign className="h-7 w-7 text-accent" />
                Best Sellers
              </h2>
              <p className="text-muted-foreground">Most purchased books and bundles on offer.</p>
            </div>
            <Button asChild variant="outline" className="hidden md:flex">
              <Link to="/best-sellers">View All</Link>
            </Button>
          </div>

          {isLoadingBestSellers ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-[4/3] w-full rounded-none" />
                  <CardContent className="p-5 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-8 w-32" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {bestSellers.map((b) => (
                <Card key={b.id} variant="interactive" className="overflow-hidden card-shadow-hover hover:border-accent/60 transition-colors">
                  {b.image_url ? (
                    <img src={b.image_url} alt={b.title} className="w-full aspect-[4/3] object-cover" />
                  ) : (
                    <div className="w-full aspect-[4/3] bg-secondary/50 flex items-center justify-center">
                      <BookOpen className="h-10 w-10 text-muted-foreground/70" />
                    </div>
                  )}
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold text-base line-clamp-2">{b.title}</h3>
                      <span className="inline-flex items-center rounded-full bg-accent/10 text-accent text-xs px-3 py-1 whitespace-nowrap">
                        Best Seller
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <p className="text-sm text-yellow-400 font-semibold">Rs. {b.price}</p>
                      <Button asChild size="sm" className="gold-gradient rounded-full px-4 py-1.5 text-xs">
                        <Link to={`/product/${b.id}`} state={{ from: location.pathname }}>View</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-8 text-center md:hidden">
            <Button asChild variant="outline">
              <Link to="/best-sellers">View All</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Customer Testimonials</h2>
            <p className="text-muted-foreground">What our customers say about us</p>
          </div>
          <TestimonialSlider reviews={storeReviews} />
          <div className="mt-8 text-center">
            <Button asChild variant="outline">
              <Link to="/reviews">Write a Review</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Main Action Cards */}
      {/* Categories */}
      <section className="py-16 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Browse Categories</h2>
              <p className="text-muted-foreground">
                Explore our full catalog of books, stationery, and educational materials.
              </p>
            </div>
            {navCategories.length > 0 && (
              <div className="hidden md:flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  onClick={() => {
                    const container = document.querySelector<HTMLDivElement>("#home-category-scroll");
                    if (!container) return;
                    const cardWidth = 260;
                    container.scrollBy({ left: -cardWidth, behavior: "smooth" });
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  onClick={() => {
                    const container = document.querySelector<HTMLDivElement>("#home-category-scroll");
                    if (!container) return;
                    const cardWidth = 260;
                    container.scrollBy({ left: cardWidth, behavior: "smooth" });
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="relative">
            <div className="overflow-hidden">
              <div
                id="home-category-scroll"
                className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth"
              >
                {navCategories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/category/${category.slug}`}
                    className="min-w-[220px] max-w-[260px]"
                  >
                    <Card variant="interactive" className="h-full">
                      <CardContent className="p-5 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold text-base line-clamp-2">
                            {category.name}
                          </h3>
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs">
                            <ArrowRight className="h-3 w-3" />
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          Discover books and stationery in {category.name}.
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
                {navCategories.length === 0 && (
                  <div className="flex gap-4">
                    {[...Array(4)].map((_, i) => (
                      <Card key={i} className="min-w-[220px] max-w-[260px]">
                        <CardContent className="p-5 space-y-3">
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-3 w-3/4" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Features */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={feature.title} 
                className="text-center space-y-4"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Limited Time Deals Banner */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="relative overflow-hidden rounded-2xl hero-gradient card-shadow text-primary-foreground px-6 py-10 md:px-10 md:py-14 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 space-y-3 md:space-y-4">
              <p className="uppercase tracking-[0.2em] text-xs md:text-sm text-accent-foreground/80">
                Limited Time Offer
              </p>
              <h2 className="text-3xl md:text-4xl font-bold">
                Get up to <span className="text-accent">20% discount</span> on selected school courses
              </h2>
              <p className="text-sm md:text-base text-primary-foreground/90 max-w-xl">
                Perfect time to complete your child&apos;s school course with premium books and stationery from Umar Kitab Ghar.
              </p>
            </div>
            <div className="flex flex-col items-stretch gap-3 w-full md:w-auto">
              <Button
                asChild
                className="gold-gradient rounded-full px-8 py-3 text-sm md:text-base"
              >
                <Link to={ROUTES.BUY_COURSE}>Shop Now</Link>
              </Button>
              <span className="text-xs md:text-sm text-primary-foreground/80 text-center">
                Hurry! Offer valid for a limited time only.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="py-16 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Welcome to Umar Kitab Ghar - Your Premier Educational Store
            </h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              Umar Kitab Ghar is Pakistan's trusted destination for school books, stationery, and educational 
              supplies. We offer complete course packages from Nursery to Class 10 for all major schools, 
              ensuring your child has the right materials for academic success. Our extensive collection 
              includes textbooks, notebooks, art supplies, Islamic literature, novels, and all essential 
              stationery items. With options for both store pickup and home delivery, shopping for 
              educational materials has never been easier. Quality products, competitive prices, and 
              excellent customer service - that's the Umar Kitab Ghar promise.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">From Our Blog</h2>
              <p className="text-muted-foreground">Tips, guides, and educational insights</p>
            </div>
            <Button asChild variant="outline" className="hidden md:flex">
              <Link to={ROUTES.BLOG}>View All Posts</Link>
            </Button>
          </div>

          {/* Loading State */}
          {isLoadingBlog && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} variant="interactive" className="h-full">
                  <CardContent className="p-6 space-y-4">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Blog Posts List */}
          {!isLoadingBlog && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {blogPosts.map((post, index) => (
                <Link key={post.id} to={`/blog/${post.slug}`}>
                  <Card 
                    variant="interactive" 
                    className="h-full"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardContent className="p-6 space-y-4">
                      {post.image_url ? (
                        <img
                          src={post.image_url}
                          alt={post.title}
                          className="w-full aspect-video object-cover rounded-lg border border-border"
                        />
                      ) : (
                        <div className="w-full aspect-video rounded-lg border border-border bg-secondary/30 flex items-center justify-center">
                          <FileText className="h-10 w-10 text-muted-foreground/70" />
                        </div>
                      )}
                      <h3 className="text-lg font-semibold line-clamp-2">{post.title}</h3>
                      <p className="text-muted-foreground text-sm line-clamp-3">
                        {previewText(post.content, 120)}
                      </p>
                      <Button size="sm" variant="outline" className="w-fit border-accent/50 text-accent hover:bg-accent/10">
                        Read More <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-8 text-center md:hidden">
            <Button asChild variant="outline">
              <Link to={ROUTES.BLOG}>View All Posts</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

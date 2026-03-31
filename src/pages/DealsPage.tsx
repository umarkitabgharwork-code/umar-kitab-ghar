import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sparkles, BookOpen } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type DealForUI = {
  id: string;
  isCustom: boolean;
  bookId: string | null;
  title: string;
  imageUrl: string | null;
  dealPrice: number;
  originalPrice?: number;
  badge: string | null;
  section: string | null;
};

const DealsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { data: dealsResponse, isLoading } = useQuery({
    queryKey: ["activeDeals", "deals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deals")
        .select(
          `
          id,
          book_id,
          deal_price,
          badge,
          section,
          is_active,
          is_custom,
          custom_title,
          custom_image,
          custom_price,
          books:book_id (
            id,
            title,
            price,
            image_url,
            product_images ( image_url )
          )
        `
        )
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) return [];

      const rows = (data ?? []) as any[];

      const mapped: DealForUI[] = rows.flatMap((row) => {
        const isCustom = row?.is_custom === true;

        // Custom deals
        if (isCustom) {
          const dealPrice = Number(row?.custom_price ?? NaN);
          const title = String(row?.custom_title ?? "").trim();
          const imageUrl = row?.custom_image ?? null;
          if (!title || !Number.isFinite(dealPrice)) return [];

          return [
            {
              id: String(row.id),
              isCustom: true,
              bookId: row?.book_id ?? null,
              title,
              imageUrl,
              dealPrice,
              badge: row?.badge ?? null,
              section: row?.section ?? null,
            },
          ];
        }

        // Product deals
        const book = row?.books ?? null;
        const bookId = row?.book_id ?? book?.id ?? null;
        const dealPrice = Number(row?.deal_price ?? NaN);
        const originalPrice = Number(book?.price ?? NaN);
        const title = String(book?.title ?? "").trim();
        const imageUrl =
          book?.product_images?.[0]?.image_url ?? book?.image_url ?? null;

        if (!bookId || !title || !Number.isFinite(dealPrice) || !Number.isFinite(originalPrice)) {
          return [];
        }

        return [
          {
            id: String(row.id),
            isCustom: false,
            bookId: String(bookId),
            title,
            imageUrl,
            dealPrice,
            originalPrice,
            badge: row?.badge ?? null,
            section: row?.section ?? null,
          },
        ];
      });

      return mapped;
    },
  });

  const deals = (dealsResponse ?? []) as DealForUI[];
  const newDeals = useMemo(() => deals.filter((d) => d.section === "Deal"), [deals]);

  const goToProduct = (bookId: string | null) => {
    if (!bookId) return;
    navigate(`/product/${bookId}`, { state: { from: location.pathname } });
  };

  return (
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
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {newDeals.length === 0 ? (
              <div className="col-span-full text-center py-10 text-muted-foreground">
                No deals available right now.
              </div>
            ) : (
              newDeals.map((deal) => (
                <Card
                  key={deal.id}
                  variant="interactive"
                  className="overflow-hidden card-shadow-hover hover:border-accent/60 transition-colors"
                  role="button"
                  tabIndex={0}
                  onClick={() => goToProduct(deal.bookId)}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter" && e.key !== " ") return;
                    e.preventDefault();
                    goToProduct(deal.bookId);
                  }}
                >
                  {deal.imageUrl ? (
                    <img
                      src={deal.imageUrl}
                      alt={deal.title}
                      className="w-full aspect-[4/3] object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-[4/3] bg-secondary/50 flex items-center justify-center">
                      <BookOpen className="h-10 w-10 text-muted-foreground/70" />
                    </div>
                  )}

                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold text-base line-clamp-2">{deal.title}</h3>
                      {deal.badge ? (
                        <span className="inline-flex items-center rounded-full bg-accent/10 text-accent text-xs px-3 py-1 whitespace-nowrap">
                          {deal.badge}
                        </span>
                      ) : null}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="space-y-1">
                        {deal.isCustom ? (
                          <p className="text-sm text-yellow-400 font-semibold">Rs. {deal.dealPrice}</p>
                        ) : (
                          <>
                            <p className="text-xs text-muted-foreground line-through">Rs. {deal.originalPrice}</p>
                            <p className="text-sm text-yellow-400 font-semibold">Rs. {deal.dealPrice}</p>
                          </>
                        )}
                      </div>

                      <Button
                        size="sm"
                        className="gold-gradient rounded-full px-4 py-1.5 text-xs"
                        disabled={!deal.bookId}
                        onClick={(e) => {
                          e.stopPropagation();
                          goToProduct(deal.bookId);
                        }}
                      >
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default DealsPage;


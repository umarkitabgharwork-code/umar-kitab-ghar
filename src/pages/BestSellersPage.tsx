import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "react-router-dom";
import { getBestSellerBooks } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { BadgeDollarSign, BookOpen } from "lucide-react";

const BestSellersPage = () => {
  const location = useLocation();
  const { data: bestSellersResponse, isLoading } = useQuery({
    queryKey: ["bestSellerBooks", "page"],
    queryFn: async () => {
      const res = await getBestSellerBooks();
      if (!res.success) return [];
      return res.data;
    },
  });

  const bestSellers = bestSellersResponse ?? [];

  return (
    <div className="page-section">
      <div className="container max-w-7xl">
        <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="page-heading mb-2 flex items-center gap-2">
              <BadgeDollarSign className="h-7 w-7 text-[#C9A44C]" />
              Best Sellers
            </h1>
            <p className="text-muted-foreground">
              Our most purchased books and bundles.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
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
        ) : bestSellers.length === 0 ? (
          <p className="text-muted-foreground">No best sellers found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map((b) => (
              <Card
                key={b.id}
                variant="interactive"
                className="page-card overflow-hidden hover:-translate-y-0.5 transition-all"
              >
                {b.image_url ? (
                  <img
                    src={b.image_url}
                    alt={b.title}
                    className="w-full aspect-[4/3] object-cover"
                  />
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
                    {b.sale_price != null ? (
                      <div>
                        <p className="text-xs text-muted-foreground line-through">Rs. {b.price}</p>
                        <p className="text-sm text-price font-semibold">Rs. {b.sale_price}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-price font-semibold">Rs. {b.price}</p>
                    )}
                    <Button
                      asChild
                      size="sm"
                      variant="hero"
                      className="rounded-full"
                    >
                      <Link to={`/product/${b.id}`} state={{ from: location.pathname }}>View</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BestSellersPage;


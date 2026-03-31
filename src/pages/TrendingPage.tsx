import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "react-router-dom";
import { getTrendingBooks } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { BookOpen, Flame } from "lucide-react";

const TrendingPage = () => {
  const location = useLocation();
  const { data: trendingResponse, isLoading } = useQuery({
    queryKey: ["trendingBooks", "page"],
    queryFn: async () => {
      const res = await getTrendingBooks();
      if (!res.success) return [];
      return res.data;
    },
  });

  const trendingBooks = trendingResponse ?? [];

  return (
    <div className="py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-2">
              <Flame className="h-7 w-7 text-accent" />
              Trending Books
            </h1>
            <p className="text-muted-foreground">
              All books currently trending based on recent sales.
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
        ) : trendingBooks.length === 0 ? (
          <p className="text-muted-foreground">No trending books found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingBooks.map((b) => (
              <Card
                key={b.id}
                variant="interactive"
                className="overflow-hidden card-shadow-hover hover:border-accent/60 transition-colors"
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
                      Trending
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <p className="text-sm text-yellow-400 font-semibold">Rs. {b.price}</p>
                    <Button
                      asChild
                      size="sm"
                      className="gold-gradient rounded-full px-4 py-1.5 text-xs"
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

export default TrendingPage;


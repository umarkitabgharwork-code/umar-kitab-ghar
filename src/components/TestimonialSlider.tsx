import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export type Review = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

function getPerView(width: number): 1 | 2 | 3 {
  if (width >= 1024) return 3; // lg
  if (width >= 768) return 2; // md
  return 1;
}

export function TestimonialSlider({ reviews }: { reviews: Review[] }) {
  const [perView, setPerView] = useState<1 | 2 | 3>(() =>
    typeof window === "undefined" ? 3 : getPerView(window.innerWidth)
  );
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const onResize = () => setPerView(getPerView(window.innerWidth));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const slides = useMemo(() => {
    const chunks: Review[][] = [];
    for (let i = 0; i < reviews.length; i += perView) {
      chunks.push(reviews.slice(i, i + perView));
    }
    return chunks;
  }, [reviews, perView]);

  const slideCount = slides.length;

  useEffect(() => {
    if (currentSlide >= slideCount) setCurrentSlide(0);
  }, [currentSlide, slideCount]);

  useEffect(() => {
    if (slideCount <= 1) return;
    const id = window.setInterval(() => {
      setCurrentSlide((s) => (s + 1) % slideCount);
    }, 5000);
    return () => window.clearInterval(id);
  }, [slideCount]);

  const goPrev = () => setCurrentSlide((s) => (s - 1 + slideCount) % slideCount);
  const goNext = () => setCurrentSlide((s) => (s + 1) % slideCount);

  if (!reviews.length) {
    return (
      <div className="text-center text-muted-foreground">
        No testimonials yet. Be the first to leave a review.
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Slider viewport */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((group, idx) => (
            <div key={idx} className="w-full shrink-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {group.map((review) => (
                  <Card key={review.id} className="bg-white rounded-xl shadow-md h-full">
                    <CardContent className="p-6 space-y-3 h-full flex flex-col">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= review.rating
                                ? "fill-primary text-primary"
                                : "text-muted-foreground/40"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground flex-1">
                        {review.comment ?? ""}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      {slideCount > 1 && (
        <>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/70 hover:bg-background shadow-sm"
            onClick={goPrev}
            aria-label="Previous testimonials"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/70 hover:bg-background shadow-sm"
            onClick={goNext}
            aria-label="Next testimonials"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          {/* Dots */}
          <div className="mt-6 flex items-center justify-center gap-2">
            {Array.from({ length: slideCount }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentSlide(i)}
                className={`h-2.5 w-2.5 rounded-full transition-colors ${
                  i === currentSlide
                    ? "bg-accent"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}


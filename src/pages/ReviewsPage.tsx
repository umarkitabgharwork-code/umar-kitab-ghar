import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Star, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

const ReviewsPage = () => {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const r = Math.floor(rating);
    if (r < 1 || r > 5) {
      setError("Rating must be between 1 and 5.");
      return;
    }
    if (!comment.trim()) {
      setError("Please enter a comment.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error: insertError } = await supabase.from("reviews").insert({
        rating: r,
        comment: comment.trim(),
        review_type: "store",
      });

      if (insertError) {
        setError(insertError.message);
      } else {
        setSuccess("Thank you for your feedback!");
        setComment("");
        setName("");
        setRating(5);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="max-w-xl mx-auto">
          <Button
            type="button"
            variant="ghost"
            className="mb-4"
            onClick={() => navigate(-1)}
          >
            ← Back
          </Button>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Share Your Experience</h1>
              <p className="text-muted-foreground mb-4">
                Leave a general review about Umar Kitab Ghar to help other customers.
              </p>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <AlertTitle>Thank you!</AlertTitle>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="name">
                    Name (optional)
                  </label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-medium">Rating</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-0.5 rounded"
                        aria-label={`${star} star${star > 1 ? "s" : ""}`}
                      >
                        <Star
                          className={`h-7 w-7 ${
                            star <= rating ? "fill-primary text-primary" : "text-muted-foreground/40"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="comment">
                    Comment
                  </label>
                  <Textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    placeholder="Share your experience with our store..."
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Review"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReviewsPage;


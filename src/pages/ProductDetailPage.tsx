import { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, BookOpen, Plus, Minus, AlertCircle, ShoppingCart, Star } from "lucide-react";
import { WishlistButton } from "@/components/WishlistButton";
import { useCart } from "@/contexts/CartContext";
import {
  getProductDetail,
  getProductStock,
  getRelatedProducts,
} from "@/services/api";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

type ProductReviewRow = {
  id: string;
  product_id: string;
  user_id: string | null;
  rating: number;
  comment: string | null;
  review_type: string;
  created_at: string;
  is_approved?: boolean;
  is_deleted?: boolean;
};

type ProductReviewsBundle = {
  reviews: ProductReviewRow[];
  averageRating: number;
  totalCount: number;
};

/** Single source of truth for product reviews shown on the storefront — never query without these filters. */
async function fetchApprovedVisibleProductReviews(
  productId: string
): Promise<ProductReviewsBundle> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .eq("review_type", "product")
    .eq("is_approved", true)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  console.log("Fetched reviews:", data);

  if (error) {
    return { reviews: [], averageRating: 0, totalCount: 0 };
  }

  const raw = (data ?? []) as ProductReviewRow[];
  const reviews = raw.filter(
    (r) => r.is_approved === true && r.is_deleted === false
  );
  const totalCount = reviews.length;
  const averageRating =
    totalCount > 0
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / totalCount) * 10) / 10
      : 0;
  return { reviews, averageRating, totalCount };
}

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const handleBackToShop = () => {
    const state = location.state as { from?: string } | undefined;
    if (state?.from) {
      navigate(state.from);
    } else {
      navigate(-1);
    }
  };
  const { addItem, items, updateQuantity } = useCart();
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading, isError, error } = useQuery({
    queryKey: ["product-detail", id],
    queryFn: async () => {
      if (!id) throw new Error("No product ID");
      const response = await getProductDetail(id);
      if (!response.success || !response.data) {
        throw new Error(response.message ?? "Product not found");
      }
      return response.data;
    },
    enabled: !!id,
  });

  const relatedCategoryId = product?.category_id ?? null;
  const relatedProductId = product?.id ?? null;

  const {
    data: relatedProducts,
    isLoading: isLoadingRelated,
  } = useQuery({
    queryKey: ["related-products", relatedProductId, relatedCategoryId],
    enabled: !!relatedCategoryId && !!relatedProductId,
    queryFn: async () => {
      if (!relatedCategoryId || !relatedProductId) return [];
      const response = await getRelatedProducts(relatedCategoryId, relatedProductId);
      if (!response.success) {
        return [];
      }
      return response.data;
    },
  });

  const { data: reviewsData } = useQuery({
    queryKey: ["reviews", id],
    queryFn: async () => {
      if (!id) {
        return { reviews: [] as ProductReviewRow[], averageRating: 0, totalCount: 0 };
      }
      return fetchApprovedVisibleProductReviews(id);
    },
    enabled: !!id,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const queryClient = useQueryClient();
  const submitReviewMutation = useMutation({
    mutationFn: async ({ rating, comment }: { rating: number; comment: string }) => {
      if (!id) throw new Error("No product");
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user?.id) {
        navigate("/login");
        throw new Error("Please log in to submit a review.");
      }
      const r = Math.min(5, Math.max(1, Math.floor(rating)));
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", authData.user.id)
        .maybeSingle();
      const profileRow = profile as { full_name?: string | null; phone?: string | null } | null;
      const { error: insertError } = await supabase.from("reviews").insert({
        product_id: id,
        user_id: authData.user.id,
        rating: r,
        comment: comment.trim(),
        review_type: "product",
        is_approved: false,
        is_deleted: false,
        user_name: profileRow?.full_name ?? null,
        phone: profileRow?.phone ?? null,
      });
      if (insertError) throw new Error(insertError.message);
      return null;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["reviews", id] });
      await queryClient.refetchQueries({ queryKey: ["reviews", id] });
      toast({ description: "Review submitted successfully." });
    },
    onError: (err: Error) => {
      if (!err.message.includes("log in")) {
        toast({ variant: "destructive", description: err.message });
      }
    },
  });

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const reviews = reviewsData?.reviews ?? [];
  const averageRating = reviewsData?.averageRating ?? 0;
  const totalCount = reviewsData?.totalCount ?? 0;

  const fromGallery = product?.product_images?.map((img) => img.image_url).filter(Boolean) ?? [];
  const images =
    fromGallery.length > 0 ? fromGallery : product?.image_url ? [product.image_url] : [];
  useEffect(() => {
    // Reset gallery selection whenever the product changes.
    if (images.length > 0) setSelectedImage(images[0] ?? "");
    else setSelectedImage("");
  }, [product]);

  const mainImageUrl = (selectedImage || images[0] || null) as string | null;
  const stock = product?.stock ?? 0;
  const outOfStock = stock <= 0;
  const maxQty = Math.max(1, stock);

  useEffect(() => {
    setQuantity((q) => Math.min(Math.max(1, q), maxQty));
  }, [maxQty]);

  const quantityInCart = items.find((i) => i.id === product?.id)?.quantity ?? 0;

  const handleAddToCart = async () => {
    if (!product || outOfStock) return;
    const stockResponse = await getProductStock(product.id);
    if (!stockResponse.success) {
      toast({
        variant: "destructive",
        description: "This item is out of stock.",
      });
      return;
    }
    const latestStock = stockResponse.data.stock;
    if (latestStock <= 0) {
      toast({
        variant: "destructive",
        description: "This item is out of stock.",
      });
      return;
    }
    const totalWanted = quantityInCart + quantity;
    if (totalWanted > latestStock) {
      toast({
        variant: "destructive",
        description: "Maximum available stock reached.",
      });
      return;
    }
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.title ?? "Product",
        price: Number(product.price ?? 0),
        category: product.category_name ?? "Product",
        image: mainImageUrl ?? undefined,
      });
    }
  };

  const getStockStatus = () => {
    if (stock <= 0) return "Out of Stock";
    if (stock <= 4) return `Only ${stock} left`;
    return "In Stock";
  };

  if (!id) {
    return (
      <div className="py-8 md:py-12">
        <div className="container">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Invalid product</AlertTitle>
            <AlertDescription>No product ID provided.</AlertDescription>
          </Alert>
          <Button variant="outline" className="mt-4" onClick={handleBackToShop}>
            Back to shop
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="py-8 md:py-12">
        <div className="container max-w-4xl">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="py-8 md:py-12">
        <div className="container max-w-2xl">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Product not found</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : "This product may have been removed."}
            </AlertDescription>
          </Alert>
          <Button variant="outline" className="mt-4" onClick={handleBackToShop}>
            Back to shop
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 md:py-12">
      <div className="container max-w-4xl">
        <Button variant="ghost" className="mb-6" size="sm" onClick={handleBackToShop}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to shop
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Image gallery */}
          <Card variant="elevated">
            <CardContent className="p-4 relative">
              <div className="absolute top-2 right-2 z-10">
                <WishlistButton productId={product.id} />
              </div>
              <div className="aspect-square bg-secondary/50 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                {mainImageUrl ? (
                  <img
                    src={mainImageUrl}
                    alt={product.title ?? "Product"}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <BookOpen className="h-24 w-24 text-muted-foreground/50" />
                )}
              </div>
              {images.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {images.map((img) => (
                    <img
                      key={img}
                      src={img}
                      onClick={() => setSelectedImage(img)}
                      alt=""
                      className={`w-16 h-16 object-cover rounded cursor-pointer border ${
                        selectedImage === img
                          ? "border-yellow-400"
                          : "border-white/20"
                      }`}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Details */}
          <div className="space-y-4">
            <h1 className="text-2xl md:text-3xl font-bold">{product.title ?? "Untitled Product"}</h1>
            <p className="text-lg text-yellow-400 font-semibold">Rs. {product.price ?? 0}</p>
            <p className="text-sm text-muted-foreground">
              {outOfStock ? (
                <span className="font-medium text-red-600">{getStockStatus()}</span>
              ) : stock <= 4 ? (
                <span className="font-medium text-red-600">{getStockStatus()}</span>
              ) : (
                <span className="font-medium text-green-600">{getStockStatus()}</span>
              )}
            </p>
            {product.description && (
              <div className="prose prose-sm max-w-none text-muted-foreground">
                <p>{product.description}</p>
              </div>
            )}

            {/* Quantity selector */}
            {!outOfStock && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Quantity</span>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="h-9 w-9"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-10 text-center font-medium">{quantity}</span>
                  <Button
                    type="button"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                    disabled={quantity >= maxQty}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-xs text-muted-foreground">(max {maxQty})</span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="lg"
                className="w-full sm:w-auto"
                onClick={handleAddToCart}
                disabled={outOfStock}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
              <WishlistButton productId={product.id} showLabel size="lg" />
              <Button
                type="button"
                size="lg"
                variant="outline"
                onClick={() => document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" })}
              >
                Write Review
              </Button>
            </div>
          </div>
        </div>

        {/* Reviews section */}
        <div className="mt-10" id="reviews">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">Customer Reviews</h2>

          {/* Rating summary */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= Math.round(averageRating)
                      ? "fill-primary text-primary"
                      : "text-muted-foreground/40"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium">
              {averageRating > 0 ? averageRating.toFixed(1) : "—"} ({totalCount}{" "}
              {totalCount === 1 ? "review" : "reviews"})
            </span>
          </div>

          {/* Review form */}
          <Card className="mb-6">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-medium">Write a review</h3>
              <div>
                <span className="text-sm text-muted-foreground">Rating</span>
                <div className="flex gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-0.5 rounded"
                      aria-label={`${star} star${star > 1 ? "s" : ""}`}
                    >
                      <Star
                        className={`h-8 w-8 transition-colors ${
                          star <= reviewRating ? "fill-primary text-primary" : "text-muted-foreground/40"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Comment</span>
                <Textarea
                  placeholder="Share your experience with this product..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={4}
                  className="mt-1"
                />
              </div>
              <Button
                onClick={() => {
                  submitReviewMutation.mutate({
                    rating: reviewRating,
                    comment: reviewComment,
                  });
                  setReviewComment("");
                }}
                disabled={submitReviewMutation.isPending}
              >
                {submitReviewMutation.isPending ? "Submitting..." : "Submit review"}
              </Button>
            </CardContent>
          </Card>

          {/* Reviews list */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review!</p>
            ) : (
              reviews.map((review: ProductReviewRow) => (
                <Card key={review.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating ? "fill-primary text-primary" : "text-muted-foreground/40"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm mb-2">{review.comment ?? ""}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Related products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">You may also like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((item) => {
                const imageUrl = item.image;
                return (
                  <Card key={item.id} variant="elevated">
                    <CardContent className="p-4 relative">
                      <div className="absolute top-2 right-2 z-10">
                        <WishlistButton productId={item.id} />
                      </div>
                      <Link
                        to={`/product/${item.id}`}
                        state={{ from: location.pathname }}
                        className="block aspect-square bg-secondary/50 rounded-lg mb-4 flex items-center justify-center overflow-hidden"
                      >
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <BookOpen className="h-12 w-12 text-muted-foreground/50" />
                        )}
                      </Link>
                      <div className="space-y-1">
                        <Link to={`/product/${item.id}`} state={{ from: location.pathname }}>
                          <h3 className="font-medium text-sm line-clamp-2 hover:underline">
                            {item.name}
                          </h3>
                        </Link>
                        <div className="text-sm text-yellow-400 font-semibold">
                          Rs. {item.price}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;

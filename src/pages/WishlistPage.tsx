import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { getWishlist, removeFromWishlist } from "@/services/api";
import { getProductStock } from "@/services/api";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/lib/constants";
import { BookOpen, ShoppingCart, Heart, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const WishlistPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { addItem } = useCart();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user ?? null);
      setAuthLoading(false);
    };
    load();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const { data: wishlistItems, isLoading } = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const res = await getWishlist();
      if (!res.success) return [];
      return res.data;
    },
    enabled: !!user?.id,
  });

  const removeMutation = useMutation({
    mutationFn: (productId: string) => removeFromWishlist(productId),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["wishlist"] });
        toast({ description: "Removed from wishlist." });
      } else {
        toast({ variant: "destructive", description: res.message });
      }
    },
  });

  const items = wishlistItems ?? [];

  const handleAddToCart = async (product: { id: string; name: string; price: number; image?: string; category?: string }) => {
    const stockRes = await getProductStock(product.id);
    if (!stockRes.success || stockRes.data.stock <= 0) {
      toast({ variant: "destructive", description: "This item is out of stock." });
      return;
    }
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category ?? "Product",
      image: product.image,
    });
    toast({ description: "Added to cart." });
  };

  if (authLoading) {
    return (
      <div className="py-8 md:py-12">
        <div className="container">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} variant="elevated">
                <CardContent className="p-4">
                  <Skeleton className="aspect-square w-full mb-4" />
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-6 w-24 mb-4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate("/login", { replace: true });
    return null;
  }

  return (
    <div className="py-8 md:py-12">
      <div className="container max-w-4xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-2">
          <Heart className="h-8 w-8 text-red-500 fill-red-500" />
          My Wishlist
        </h1>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} variant="elevated">
                <CardContent className="p-4">
                  <Skeleton className="aspect-square w-full mb-4" />
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-6 w-24 mb-4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : items.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Heart className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">Your wishlist is empty</h3>
              <p className="text-muted-foreground mb-4">
                Save products you like by clicking the heart icon on product cards.
              </p>
              <Button asChild variant="outline">
                <Link to={ROUTES.HOME}>Browse products</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => {
              const p = item.product;
              if (!p) return null;
              const imageUrl = p.image;
              const outOfStock = p.inStock === false;

              return (
                <Card key={item.id} variant="elevated">
                  <CardContent className="p-4">
                    <Link
                      to={`/product/${item.book_id}`}
                      state={{ from: location.pathname }}
                      className="block aspect-square bg-secondary/50 rounded-lg mb-4 flex items-center justify-center overflow-hidden"
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <BookOpen className="h-12 w-12 text-muted-foreground/50" />
                      )}
                    </Link>
                    <Link to={`/product/${item.book_id}`} state={{ from: location.pathname }}>
                      <h3 className="font-medium line-clamp-2 hover:underline mb-1">{p.name}</h3>
                    </Link>
                    <p className="text-lg text-yellow-400 font-semibold mb-4">Rs. {p.price}</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleAddToCart(p)}
                        disabled={outOfStock}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeMutation.mutate(item.book_id)}
                        disabled={removeMutation.isPending}
                        aria-label="Remove from wishlist"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;

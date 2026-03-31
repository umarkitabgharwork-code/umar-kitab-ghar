import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getWishlist, addToWishlist, removeFromWishlist } from "@/services/api";
import { toast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface WishlistButtonProps {
  productId: string;
  className?: string;
  size?: "sm" | "default" | "lg" | "icon";
  /** When true, renders a labeled button "Add to Wishlist" / "Remove from Wishlist" instead of icon-only */
  showLabel?: boolean;
}

export function WishlistButton({ productId, className, size = "icon", showLabel = false }: WishlistButtonProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [user, setUser] = useState<{ id: string } | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user ?? null);
    };
    load();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const { data: wishlistData } = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const res = await getWishlist();
      if (!res.success) return [];
      return res.data;
    },
    enabled: !!user?.id,
  });

  const addMutation = useMutation({
    mutationFn: () => addToWishlist(productId),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["wishlist"] });
        toast({ description: "Added to wishlist." });
      } else {
        toast({ variant: "destructive", description: res.message });
      }
    },
  });

  const removeMutation = useMutation({
    mutationFn: () => removeFromWishlist(productId),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["wishlist"] });
        toast({ description: "Removed from wishlist." });
      } else {
        toast({ variant: "destructive", description: res.message });
      }
    },
  });

  const wishlistIds = new Set((wishlistData ?? []).map((w) => w.book_id));
  const isInWishlist = wishlistIds.has(productId);
  const isLoading = addMutation.isPending || removeMutation.isPending;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast({ variant: "destructive", description: "Please log in to use wishlist." });
      navigate("/login");
      return;
    }
    if (isInWishlist) {
      removeMutation.mutate();
    } else {
      addMutation.mutate();
    }
  };

  const heartIcon = (
    <Heart
      className={`transition-colors ${
        showLabel ? "h-4 w-4 mr-2" : "h-5 w-5"
      } ${isInWishlist ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
    />
  );

  if (showLabel) {
    return (
      <Button
        type="button"
        variant="outline"
        size={size === "icon" ? "sm" : size}
        className={className}
        onClick={handleClick}
        disabled={isLoading}
        aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
      >
        {heartIcon}
        {isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size={size}
      className={`h-9 w-9 p-0 ${className ?? ""}`}
      onClick={handleClick}
      disabled={isLoading}
      aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        className={`h-5 w-5 transition-colors ${
          isInWishlist ? "fill-red-500 text-red-500" : "text-muted-foreground"
        }`}
      />
    </Button>
  );
}

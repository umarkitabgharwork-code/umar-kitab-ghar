import { useParams, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BookOpen, ShoppingCart, Plus, Minus, AlertCircle } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { getProducts } from "@/services/api";
import { Product, ProductType, ProductCategory } from "@/types";

// Map route category to ProductCategory type
const categoryMap: Record<string, ProductCategory> = {
  islamic: "islamic",
  study: "study",
  novel: "novel",
  gift: "gift",
  birthday: "birthday",
  "art-craft": "art-craft",
  sketching: "sketching",
  painting: "painting",
  toys: "toys",
  bags: "bags",
  "geometry-box": "geometry-box",
  "pencil-box": "pencil-box",
  diaries: "diaries",
  customize: "customize",
};

// Map category to display name
const categoryDisplayNames: Record<ProductCategory, string> = {
  islamic: "Islamic Books",
  study: "Study Books",
  novel: "Novel Books",
  gift: "Gift Items",
  birthday: "Birthday Items",
  "art-craft": "Art & Craft",
  sketching: "Sketching",
  painting: "Painting & Canvas",
  toys: "Toy Items",
  bags: "Bags",
  "geometry-box": "Geometry Box",
  "pencil-box": "Pencil Box",
  diaries: "Diaries",
  customize: "Customize Item",
};

const CategoryPage = () => {
  const { category: categoryParam } = useParams<{ category: string }>();
  const location = useLocation();
  const { items, addItem, updateQuantity } = useCart();

  // Determine product type from route path
  const productType: ProductType = location.pathname.startsWith("/books/") ? "book" : "other";

  // Map route parameter to ProductCategory
  const category: ProductCategory | undefined = categoryParam
    ? categoryMap[categoryParam]
    : undefined;

  // Fetch products using React Query
  const {
    data: productsResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["products", productType, category],
    queryFn: async () => {
      const response = await getProducts(productType, category);
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch products");
      }
      return response.data;
    },
    enabled: !!category, // Only fetch if category is valid
  });

  const products = productsResponse || [];

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      category: categoryDisplayNames[product.category] || product.category,
      image: product.image,
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    const item = items.find((i) => i.id === productId);
    if (item) {
      updateQuantity(productId, item.quantity - 1);
    }
  };

  const getProductQuantity = (productId: string): number => {
    const item = items.find((i) => i.id === productId);
    return item?.quantity || 0;
  };

  // Display name for the category
  const displayName = category ? categoryDisplayNames[category] : "Category";

  // Invalid category
  if (!categoryParam || !category) {
    return (
      <div className="py-8 md:py-12">
        <div className="container">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Invalid Category</AlertTitle>
            <AlertDescription>
              The category "{categoryParam}" does not exist.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 md:py-12">
      <div className="container">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{displayName}</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Browse our collection of {displayName.toLowerCase()}.
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i} variant="elevated">
                <CardContent className="p-4">
                  <Skeleton className="aspect-square w-full mb-4" />
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-5 w-full mb-2" />
                  <Skeleton className="h-6 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error loading products</AlertTitle>
            <AlertDescription>
              {error instanceof Error
                ? error.message
                : "Failed to load products. Please try again later."}
            </AlertDescription>
          </Alert>
        )}

        {/* Products Grid */}
        {!isLoading && !isError && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product) => (
              <Card key={product.id} variant="elevated">
                <CardContent className="p-4">
                  <div className="aspect-square bg-secondary/50 rounded-lg mb-4 flex items-center justify-center">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <BookOpen className="h-12 w-12 text-muted-foreground/50" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs text-muted-foreground">
                      {categoryDisplayNames[product.category]}
                    </span>
                    <h3 className="font-medium line-clamp-2">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-primary">
                        Rs. {product.price}
                      </span>

                      {getProductQuantity(product.id) > 0 ? (
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() => handleRemoveFromCart(product.id)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-medium">
                            {getProductQuantity(product.id)}
                          </span>
                          <Button
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleAddToCart(product)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" onClick={() => handleAddToCart(product)}>
                          Add to Cart
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && products.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No products found</h3>
              <p className="text-muted-foreground mb-4">
                We don't have any products in this category yet. Check back soon!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;

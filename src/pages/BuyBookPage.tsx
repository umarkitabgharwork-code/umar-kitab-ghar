import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, ShoppingCart, Plus, Minus } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
}

const sampleProducts: Product[] = [
  { id: "1", name: "English Grammar Book", price: 350, category: "Books" },
  { id: "2", name: "Mathematics Workbook", price: 280, category: "Books" },
  { id: "3", name: "Science Lab Manual", price: 420, category: "Books" },
  { id: "4", name: "Urdu Composition", price: 320, category: "Books" },
  { id: "5", name: "Oxford Dictionary", price: 550, category: "Reference" },
  { id: "6", name: "Atlas & Maps", price: 480, category: "Reference" },
  { id: "7", name: "Drawing Book A4", price: 120, category: "Art" },
  { id: "8", name: "Color Pencil Set (24)", price: 380, category: "Art" },
];

const BuyBookPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { items, addItem, updateQuantity, getTotal, getItemCount } = useCart();

  const filteredProducts = sampleProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      image: product.image,
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    const item = items.find((i) => i.id === productId);
    if (item) {
      updateQuantity(productId, item.quantity - 1);
    }
  };

  const getProductQuantity = (productId: string) => {
    const item = items.find((i) => i.id === productId);
    return item?.quantity || 0;
  };

  const cartTotal = getTotal();
  const cartItemCount = getItemCount();

  return (
    <div className="py-8 md:py-12">
      <div className="container">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Buy Single Book or Item</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Search for any book or stationery item.
          </p>
        </div>

        {/* Search and Upload */}
        <div className="max-w-2xl mx-auto mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for books, items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-14"
            />
          </div>

        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Products Grid */}
          <div className="md:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredProducts.map((product) => (
                <Card key={product.id} variant="elevated">
                  <CardContent className="p-4">
                    <div className="aspect-square bg-secondary/50 rounded-lg mb-4 flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-muted-foreground/50" />
                    </div>
                    <div className="space-y-2">
                      <span className="text-xs text-muted-foreground">{product.category}</span>
                      <h3 className="font-medium line-clamp-2">{product.name}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-primary">Rs. {product.price}</span>
                        
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
                            <span className="w-8 text-center font-medium">{getProductQuantity(product.id)}</span>
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

            {filteredProducts.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No items found</h3>
                  <p className="text-muted-foreground mb-4">
                    We couldn't find what you're looking for. Try a different search or contact us.
                  </p>
                  <Button variant="outline" onClick={() => setSearchTerm("")}>
                    Clear Search
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Cart Sidebar */}
          <div className="md:col-span-1">
            <Card variant="elevated" className="sticky top-24">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Cart ({cartItemCount})</h3>
                </div>

                {cartItemCount === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-4">
                    Your cart is empty
                  </p>
                ) : (
                  <>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {item.name} × {item.quantity}
                          </span>
                          <span>Rs. {item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total</span>
                        <span>Rs. {cartTotal}</span>
                      </div>
                    </div>

                    <Button asChild className="w-full" size="lg">
                      <Link to="/checkout">Proceed to Checkout</Link>
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyBookPage;

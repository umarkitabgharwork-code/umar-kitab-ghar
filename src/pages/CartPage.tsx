import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { ROUTES } from "@/lib/constants";

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotal } = useCart();
  const total = getTotal();

  if (items.length === 0) {
    return (
      <div className="page-section">
        <div className="container max-w-2xl">
          <Card className="page-card-ivory">
            <CardContent className="p-8 text-center">
              <ShoppingCart className="h-10 w-10 mx-auto text-muted-foreground/60 mb-4" />
              <h2 className="page-heading text-2xl mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">Add some items to your cart before checking out.</p>
              <Button asChild variant="hero-outline">
                <Link to={ROUTES.HOME}>Continue Shopping</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="page-section">
      <div className="container max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="page-heading">Cart</h1>
          <Button asChild variant="hero">
            <Link to={ROUTES.CHECKOUT}>Checkout</Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="page-card">
                <CardContent className="p-5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{item.name}</div>
                    {item.type === "custom" ? (
                      <div className="text-sm text-muted-foreground mt-1">
                        Price will be confirmed via call or WhatsApp
                      </div>
                    ) : (
                      <div className="text-sm text-price">Rs. {item.price}</div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {item.type === "custom" ? (
                      <span className="w-8 text-center font-medium text-sm text-muted-foreground">×1</span>
                    ) : (
                      <>
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="md:col-span-1">
            <Card className="sticky top-24 page-card-ivory">
              <CardContent className="p-6 space-y-3">
                <h2 className="text-lg font-semibold text-[#071D36]">Summary</h2>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Items</span>
                  <span>{items.length}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-[#E8DEC8]">
                  <span>Total</span>
                  <span className="text-price">Rs. {total}</span>
                </div>
                <Button asChild variant="hero-outline" className="w-full">
                  <Link to={ROUTES.HOME}>Continue Shopping</Link>
                </Button>
                <Button asChild variant="hero" className="w-full" size="lg">
                  <Link to={ROUTES.CHECKOUT}>Proceed to Checkout</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

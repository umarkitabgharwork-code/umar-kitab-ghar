import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { ROUTES } from "@/lib/constants";

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotal } = useCart();
  const total = getTotal();
  const hasEstimatedPricing = items.some((i) => i.estimatedPriceLabel) && total === 0;

  if (items.length === 0) {
    return (
      <div className="page-section overflow-x-hidden">
        <div className="container max-w-2xl px-4">
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
    <div className="page-section overflow-x-hidden">
      <div className="container max-w-4xl px-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <h1 className="page-heading">Cart</h1>
          <Button asChild variant="hero" className="hidden md:inline-flex">
            <Link to={ROUTES.CHECKOUT}>Checkout</Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-4 md:gap-6">
          <div className="md:col-span-2 space-y-4 min-w-0">
            {items.map((item) => (
              <Card key={item.id} className="page-card overflow-hidden">
                <CardContent className="p-4 sm:p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-sm sm:text-base line-clamp-2 break-words">
                      {item.name}
                    </div>
                    {item.type === "custom" ? (
                      <div className="text-sm text-muted-foreground mt-1 break-words">
                        Price will be confirmed via call or WhatsApp
                      </div>
                    ) : item.estimatedPriceLabel ? (
                      <div className="text-sm text-[#5F7F64] mt-1">
                        Est. {item.estimatedPriceLabel}
                        <span className="block text-xs text-muted-foreground">
                          Final confirmation via call/WhatsApp
                        </span>
                      </div>
                    ) : (
                      <div className="text-sm text-price mt-1 shrink-0">Rs. {item.price}</div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                    {item.type === "custom" ? (
                      <span className="w-8 text-center font-medium text-sm text-muted-foreground">×1</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 shrink-0"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 shrink-0"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="h-8 shrink-0 px-2 sm:px-3"
                      onClick={() => removeItem(item.id)}
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="hidden sm:inline sm:ml-2">Remove</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="md:col-span-1 min-w-0">
            <Card className="md:sticky md:top-24 page-card-ivory w-full">
              <CardContent className="p-4 sm:p-6 space-y-3">
                <h2 className="text-lg font-semibold text-[#071D36]">Summary</h2>
                <div className="flex justify-between items-center gap-4 text-sm">
                  <span className="text-muted-foreground min-w-0">Items</span>
                  <span className="text-right shrink-0">{items.length}</span>
                </div>
                <div className="flex justify-between items-center gap-4 text-sm">
                  <span className="text-muted-foreground min-w-0">Subtotal</span>
                  <span className="text-right shrink-0 text-price">Rs. {total}</span>
                </div>
                {items.some((i) => i.estimatedPriceLabel) && (
                  <p className="text-xs text-[#5F7F64] break-words">
                    Special course pricing is estimated; final amount confirmed on call.
                  </p>
                )}
                <div className="flex justify-between items-center gap-4 text-lg font-semibold pt-2 border-t border-[#E8DEC8]">
                  <span className="min-w-0">Total</span>
                  {hasEstimatedPricing ? (
                    <span className="text-sm font-medium text-[#5F7F64] text-right shrink-0">
                      Confirmed on call
                    </span>
                  ) : (
                    <span className="text-price text-right shrink-0">Rs. {total}</span>
                  )}
                </div>
                <div className="flex flex-col gap-3 pt-1">
                  <Button asChild variant="hero-outline" className="w-full">
                    <Link to={ROUTES.HOME}>Continue Shopping</Link>
                  </Button>
                  <Button asChild variant="hero" className="w-full" size="lg">
                    <Link to={ROUTES.CHECKOUT}>Proceed to Checkout</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

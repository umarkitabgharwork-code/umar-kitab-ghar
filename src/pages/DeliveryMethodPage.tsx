import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useCart } from "@/contexts/CartContext";
import { useCheckout } from "@/contexts/CheckoutContext";
import { ArrowLeft, Package, Store } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { Link } from "react-router-dom";

const DeliveryMethodPage = () => {
  const { items, getTotal } = useCart();
  const { checkoutState, setDeliveryMethod } = useCheckout();
  const navigate = useNavigate();
  const total = getTotal();

  const handleContinue = () => {
    if (!checkoutState.deliveryMethod) {
      return;
    }

    if (checkoutState.deliveryMethod === "pickup") {
      navigate(ROUTES.BRANCH_SELECTION);
    } else {
      navigate(ROUTES.PAYMENT);
    }
  };

  if (items.length === 0) {
    return (
      <div className="py-8 md:py-12">
        <div className="container max-w-2xl">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">
                Add some items to your cart before checking out.
              </p>
              <Button asChild>
                <Link to={ROUTES.BUY_BOOK}>Continue Shopping</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 md:py-12">
      <div className="container max-w-4xl">
        <Button asChild variant="ghost" className="mb-6">
          <Link to={ROUTES.CHECKOUT}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Checkout
          </Link>
        </Button>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-6">Select Delivery Method</h2>
                <RadioGroup
                  value={checkoutState.deliveryMethod || undefined}
                  onValueChange={(value) => setDeliveryMethod(value as "pickup" | "delivery")}
                  className="space-y-4"
                >
                  <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <RadioGroupItem value="pickup" id="pickup" className="mt-1" />
                    <Label
                      htmlFor="pickup"
                      className="flex-1 cursor-pointer space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <Store className="h-5 w-5" />
                        <span className="font-semibold text-lg">Pickup from Branch</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Collect your order from one of our branches at your convenience.
                      </p>
                    </Label>
                  </div>

                  <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <RadioGroupItem value="delivery" id="delivery" className="mt-1" />
                    <Label
                      htmlFor="delivery"
                      className="flex-1 cursor-pointer space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        <span className="font-semibold text-lg">Home Delivery</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Get your order delivered to your address.
                      </p>
                    </Label>
                  </div>
                </RadioGroup>

                <Button
                  onClick={handleContinue}
                  className="w-full mt-6"
                  size="lg"
                  disabled={!checkoutState.deliveryMethod}
                >
                  Continue
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-1">
            <Card variant="elevated" className="sticky top-24">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-semibold">Order Summary</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-muted-foreground">
                          Rs. {item.price} × {item.quantity}
                        </div>
                      </div>
                      <div className="font-semibold">
                        Rs. {item.price * item.quantity}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>Rs. {total}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryMethodPage;

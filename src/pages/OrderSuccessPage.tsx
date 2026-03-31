import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCheckout } from "@/contexts/CheckoutContext";
import { CheckCircle2, Package, Store, CreditCard, Banknote, ShoppingBag, Hash } from "lucide-react";
import { ROUTES } from "@/lib/constants";

const OrderSuccessPage = () => {
  const { checkoutState, clearCheckout } = useCheckout();
  const navigate = useNavigate();
  const location = useLocation();
  const orderCode = (location.state as { orderCode?: string } | null)?.orderCode;

  // Redirect to home if no checkout data and no order ID (e.g. direct URL access)
  useEffect(() => {
    if (!orderCode && (!checkoutState.deliveryMethod || !checkoutState.paymentMethod)) {
      navigate(ROUTES.HOME, { replace: true });
    }
  }, [orderCode, checkoutState.deliveryMethod, checkoutState.paymentMethod, navigate]);

  const handleContinueShopping = () => {
    clearCheckout();
    navigate(ROUTES.HOME);
  };

  const getDeliveryMethodText = (): string => {
    if (checkoutState.deliveryMethod === "pickup") {
      return "Pickup from Branch";
    }
    return "Home Delivery";
  };

  const getPaymentMethodText = (): string => {
    switch (checkoutState.paymentMethod) {
      case "online":
        return "Online Advance Payment";
      case "cod":
        return "Cash on Delivery";
      case "cop":
        return "Cash on Pickup";
      default:
        return "N/A";
    }
  };

  const getPaymentIcon = () => {
    switch (checkoutState.paymentMethod) {
      case "online":
        return <CreditCard className="h-5 w-5" />;
      case "cod":
        return <Banknote className="h-5 w-5" />;
      case "cop":
        return <Store className="h-5 w-5" />;
      default:
        return null;
    }
  };

  // Show nothing while redirecting
  if (!orderCode && (!checkoutState.deliveryMethod || !checkoutState.paymentMethod)) {
    return null;
  }

  return (
    <div className="py-8 md:py-12">
      <div className="container max-w-2xl">
        <Card>
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-4">
                  <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-400" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">Thank You!</h1>
                <p className="text-lg text-muted-foreground">
                  Your order has been placed successfully.
                </p>
              </div>

              <Separator />

              <div className="text-left space-y-4">
                <h2 className="text-xl font-semibold">Order Confirmation</h2>
                
                {orderCode && (
                  <div className="flex items-center justify-between p-4 bg-primary/10 border-2 border-primary/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Hash className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Order Code:</span>
                    </div>
                    <span className="text-lg font-mono font-bold tracking-wider">{orderCode}</span>
                  </div>
                )}
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Delivery Method:</span>
                    </div>
                    <span className="text-sm">{getDeliveryMethodText()}</span>
                  </div>

                  {checkoutState.deliveryMethod === "pickup" && checkoutState.selectedBranch && (
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Store className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Branch:</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold">{checkoutState.selectedBranch.name}</span>
                        <p className="text-xs text-muted-foreground">{checkoutState.selectedBranch.address}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      {getPaymentIcon()}
                      <span className="text-sm font-medium">Payment Method:</span>
                    </div>
                    <span className="text-sm">{getPaymentMethodText()}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  We will process your order and contact you soon. You will receive a confirmation email shortly.
                </p>
                <Button onClick={handleContinueShopping} size="lg" className="w-full">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Continue Shopping
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderSuccessPage;

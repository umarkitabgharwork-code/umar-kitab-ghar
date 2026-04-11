import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { useCheckout } from "@/contexts/CheckoutContext";
import { ArrowLeft, CreditCard, Banknote, Store, Copy, CheckCircle2, Loader2 } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { Link } from "react-router-dom";
import { createOrder } from "@/services/orders";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const PaymentPage = () => {
  const { items, getTotal, clearCart } = useCart();
  const { checkoutState, setPaymentMethod, setPaymentCompleted, setPaymentScreenshotUrl } = useCheckout();
  const navigate = useNavigate();
  const [copied, setCopied] = useState<string | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isUploadingScreenshot, setIsUploadingScreenshot] = useState(false);
  const subtotal = getTotal();
  const discountAmount = checkoutState.appliedCoupon?.discountAmount ?? 0;
  const total = Math.max(0, subtotal - discountAmount);

  const handleContinue = async () => {
    if (!checkoutState.paymentMethod) {
      return;
    }

    if (checkoutState.paymentMethod === "online" && !checkoutState.paymentCompleted) {
      return;
    }

    setIsPlacingOrder(true);
    try {
      const orderCode = await createOrder({
        cartItems: items,
        deliveryMethod: checkoutState.deliveryMethod!,
        branch: checkoutState.deliveryMethod === "pickup" && checkoutState.selectedBranch
          ? {
              id: checkoutState.selectedBranch.id,
              name: checkoutState.selectedBranch.name,
              address: checkoutState.selectedBranch.address,
            }
          : null,
        paymentMethod: checkoutState.paymentMethod,
        formData: checkoutState.formData,
        total,
        couponId: checkoutState.appliedCoupon?.couponId ?? null,
      });

      // Attach payment screenshot + pending payment status (best-effort; does not change order creation flow)
      if (checkoutState.paymentMethod === "online" && checkoutState.paymentScreenshotUrl) {
        const { error } = await supabase
          .from("orders")
          .update({
            payment_screenshot: checkoutState.paymentScreenshotUrl,
            payment_status: "pending",
          })
          .eq("order_code", orderCode);
        if (error) {
          console.error("Failed to save payment screenshot:", error);
        }
      }

      const showCourseFollowUp = items.some((i) => i.type === "course");
      clearCart();
      navigate(ROUTES.ORDER_SUCCESS, { state: { orderCode, showCourseFollowUp } });
    } catch (error) {
      console.error("Failed to place order:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to place order. Please try again.";
      toast.error(message);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value as "online" | "cod" | "cop");
  };

  const handleCopyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const handlePaymentCompleted = () => {
    if (checkoutState.paymentMethod === "online" && !checkoutState.paymentScreenshotUrl) {
      toast.error("Please upload the payment screenshot first.");
      return;
    }
    setPaymentCompleted(true);
  };

  const handleScreenshotUpload = async (file: File) => {
    setIsUploadingScreenshot(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const filePath = `payments/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase
        .storage
        .from("payment-screenshots")
        .upload(filePath, file);

      if (uploadError) {
        toast.error(uploadError.message);
        return;
      }

      const { data: publicData } = supabase
        .storage
        .from("payment-screenshots")
        .getPublicUrl(filePath);

      setPaymentScreenshotUrl(publicData.publicUrl);
      toast.success("Screenshot uploaded.");
    } finally {
      setIsUploadingScreenshot(false);
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
                <Link to={ROUTES.HOME}>Continue Shopping</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!checkoutState.deliveryMethod) {
    return (
      <div className="py-8 md:py-12">
        <div className="container max-w-2xl">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-2">Invalid Route</h2>
              <p className="text-muted-foreground mb-6">
                Please complete the checkout steps first.
              </p>
              <Button asChild>
                <Link to={ROUTES.CHECKOUT}>Go to Checkout</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (checkoutState.deliveryMethod === "pickup" && !checkoutState.selectedBranch) {
    return (
      <div className="py-8 md:py-12">
        <div className="container max-w-2xl">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-2">Invalid Route</h2>
              <p className="text-muted-foreground mb-6">
                Please select a branch first.
              </p>
              <Button asChild>
                <Link to={ROUTES.BRANCH_SELECTION}>Go to Branch Selection</Link>
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
          <Link to={checkoutState.deliveryMethod === "pickup" ? ROUTES.BRANCH_SELECTION : ROUTES.DELIVERY_METHOD}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-6">Select Payment Method</h2>
                <RadioGroup
                  value={checkoutState.paymentMethod || undefined}
                  onValueChange={handlePaymentMethodChange}
                  className="space-y-4"
                >
                  <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <RadioGroupItem value="online" id="online" className="mt-1" />
                    <Label htmlFor="online" className="flex-1 cursor-pointer space-y-2">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        <span className="font-semibold text-lg">Online Advance Payment</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Pay in advance via bank transfer. Complete payment to proceed.
                      </p>
                    </Label>
                  </div>

                  <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <RadioGroupItem value="cod" id="cod" className="mt-1" />
                    <Label htmlFor="cod" className="flex-1 cursor-pointer space-y-2">
                      <div className="flex items-center gap-2">
                        <Banknote className="h-5 w-5" />
                        <span className="font-semibold text-lg">Cash on Delivery</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Pay with cash when your order is delivered.
                      </p>
                    </Label>
                  </div>

                  {checkoutState.deliveryMethod === "pickup" && (
                    <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <RadioGroupItem value="cop" id="cop" className="mt-1" />
                      <Label htmlFor="cop" className="flex-1 cursor-pointer space-y-2">
                        <div className="flex items-center gap-2">
                          <Store className="h-5 w-5" />
                          <span className="font-semibold text-lg">Cash on Pickup</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Pay with cash when you collect your order from the branch.
                        </p>
                      </Label>
                    </div>
                  )}
                </RadioGroup>

                {checkoutState.paymentMethod === "online" && (
                  <div className="mt-6 p-6 border rounded-lg bg-muted/50 space-y-4">
                    <h3 className="font-semibold text-lg">Bank Transfer Details</h3>
                    <Separator />
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Upload payment screenshot</Label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) void handleScreenshotUpload(file);
                        }}
                        disabled={isUploadingScreenshot}
                        className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-accent file:text-accent-foreground hover:file:bg-accent/90"
                      />
                      <p className="text-xs text-muted-foreground">
                        Required to place order. Numbers only are already supported in the checkout form.
                      </p>
                      {checkoutState.paymentScreenshotUrl ? (
                        <a
                          href={checkoutState.paymentScreenshotUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-accent underline"
                        >
                          View uploaded screenshot
                        </a>
                      ) : null}
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Bank:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">ABC Bank</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleCopyToClipboard("ABC Bank", "bank")}
                          >
                            {copied === "bank" ? (
                              <CheckCircle2 className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Account Title:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Umar Kitab Ghar</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleCopyToClipboard("Umar Kitab Ghar", "title")}
                          >
                            {copied === "title" ? (
                              <CheckCircle2 className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Account Number:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono">1234567890</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleCopyToClipboard("1234567890", "account")}
                          >
                            {copied === "account" ? (
                              <CheckCircle2 className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <p className="text-sm font-medium">QR Code:</p>
                      <div className="w-48 h-48 bg-muted border rounded-lg flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">QR Code Image</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Scan this QR code to make payment or transfer to the account above.
                      </p>
                    </div>
                    <Button
                      onClick={handlePaymentCompleted}
                      className="w-full"
                      variant={checkoutState.paymentCompleted ? "outline" : "default"}
                    >
                      {checkoutState.paymentCompleted ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Payment Completed
                        </>
                      ) : (
                        "I have completed payment"
                      )}
                    </Button>
                  </div>
                )}

                <Button
                  onClick={handleContinue}
                  className="w-full mt-6"
                  size="lg"
                  disabled={
                    isPlacingOrder ||
                    !checkoutState.paymentMethod ||
                    (checkoutState.paymentMethod === "online" && !checkoutState.paymentCompleted)
                  }
                >
                  {isPlacingOrder ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    "Place Order"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-1">
            <Card variant="elevated" className="sticky top-24">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-semibold">Order Summary</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {items.map((item) =>
                    item.type === "custom" ? (
                      <div key={item.id} className="text-sm space-y-1">
                        <div className="font-medium">Custom Order</div>
                        {item.customNote?.trim() ? (
                          <div className="text-muted-foreground text-xs">{item.customNote}</div>
                        ) : null}
                        <div className="text-muted-foreground">
                          Price will be confirmed via call or WhatsApp
                        </div>
                      </div>
                    ) : (
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
                    )
                  )}
                </div>
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>Rs. {subtotal}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>- Rs. {discountAmount}</span>
                    </div>
                  )}
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

export default PaymentPage;

import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getOrderByFormattedId, type TrackedOrder } from "@/services/orders";
import { ROUTES } from "@/lib/constants";
import {
  Hash,
  Search,
  AlertCircle,
  Package,
  CreditCard,
  Truck,
  MapPin,
  Phone,
} from "lucide-react";

const getStatusLabel = (status: string) => {
  if (!status) return "Unknown";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const getPaymentLabel = (method: string) => {
  switch (method) {
    case "online":
      return "Online Advance Payment";
    case "cod":
      return "Cash on Delivery";
    case "cop":
      return "Cash on Pickup";
    default:
      return method || "N/A";
  }
};

const getDeliveryLabel = (method: string) => {
  if (method === "pickup") return "Pickup from Branch";
  if (method === "delivery") return "Home Delivery";
  return method || "N/A";
};

const TrackOrderPage = () => {
  const [searchParams] = useSearchParams();
  const codeFromUrl = searchParams.get("code")?.trim() ?? "";
  const [orderCode, setOrderCode] = useState(codeFromUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!codeFromUrl) return;
    setOrderCode(codeFromUrl);
    let cancelled = false;
    const run = async () => {
      setIsLoading(true);
      setError(null);
      setOrder(null);
      try {
        const result = await getOrderByFormattedId(codeFromUrl);
        if (cancelled) return;
        if (!result) {
          setError("Order not found.");
          return;
        }
        setOrder(result);
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to track order:", err);
        setError("Unable to fetch order. Please try again.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [codeFromUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = orderCode.trim();
    if (!trimmed) {
      setError("Please enter your Order Code.");
      setOrder(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setOrder(null);

    try {
      const result = await getOrderByFormattedId(trimmed);
      if (!result) {
        setError("Order not found.");
        return;
      }
      setOrder(result);
    } catch (err) {
      console.error("Failed to track order:", err);
      setError("Unable to fetch order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const createdAt =
    order?.created_at ? new Date(order.created_at).toLocaleString() : null;

  return (
    <div className="py-8 md:py-12">
      <div className="container max-w-3xl">
        <Card>
          <CardContent className="p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Track Your Order</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Enter the Order Code you received after placing your order.
                </p>
              </div>
              <Hash className="hidden md:block h-10 w-10 text-primary" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder="Enter your Order Code (e.g. UKG-ABCD1234)"
                  value={orderCode}
                  onChange={(e) => setOrderCode(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="lg" disabled={isLoading}>
                  {isLoading ? (
                    "Tracking..."
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Track Order
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Example: <span className="font-mono">UKG-ABCD1234</span>
              </p>
            </form>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {order && (
              <div className="space-y-6">
                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/60">
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Order Code</span>
                    </div>
                    <span className="text-sm font-mono font-semibold">
                      {order.order_code}
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Status</span>
                      </div>
                      <span className="text-sm">{getStatusLabel(order.status)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Payment</span>
                      </div>
                      <span className="text-sm">
                        {getPaymentLabel(order.payment_method)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Delivery</span>
                      </div>
                      <span className="text-sm">
                        {getDeliveryLabel(order.delivery_method)}
                      </span>
                    </div>
                    {createdAt && (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Order Date</span>
                        </div>
                        <span className="text-xs text-right text-muted-foreground">
                          {createdAt}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {(order.address || order.google_maps_url) && (
                  <div className="space-y-2">
                    <h2 className="text-sm font-semibold flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Delivery Address
                    </h2>
                    <div className="p-3 rounded-lg bg-muted/40 space-y-1 text-sm">
                      {order.address && <p>{order.address}</p>}
                      {order.google_maps_url && (
                        <a
                          href={order.google_maps_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-primary underline"
                        >
                          View on Google Maps
                        </a>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <h2 className="text-sm font-semibold flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Customer
                  </h2>
                  <div className="p-3 rounded-lg bg-muted/40 text-sm space-y-1">
                    <p className="font-medium">{order.customer_name}</p>
                    <p className="text-muted-foreground">{order.phone}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-sm font-semibold">Items</h2>
                  <div className="rounded-lg border bg-card">
                    <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
                      {order.items.map((item, idx) => (
                        <div
                          key={`${item.title}-${idx}`}
                          className="flex items-center justify-between text-sm"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{item.title}</p>
                            <p className="text-xs text-muted-foreground">
                              Qty: {item.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              Rs. {item.price_at_time * item.quantity}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              (Rs. {item.price_at_time} each)
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Separator />
                    <div className="p-4 flex items-center justify-between text-sm font-semibold">
                      <span>Total</span>
                      <span>Rs. {order.total_amount}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button asChild variant="outline" size="sm">
                    <Link to={ROUTES.HOME}>Back to Home</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TrackOrderPage;


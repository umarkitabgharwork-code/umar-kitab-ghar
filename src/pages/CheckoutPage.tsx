import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useCart } from "@/contexts/CartContext";
import { useCheckout } from "@/contexts/CheckoutContext";
import { getProductStock, validateCoupon } from "@/services/api";
import { toast } from "@/hooks/use-toast";
import { ShoppingCart, MapPin, Loader2, AlertCircle, Tag, X } from "lucide-react";
import { ROUTES } from "@/lib/constants";

// Mock reverse geocoding function
const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  // In a real app, you would use a service like Google Maps Geocoding API
  // or OpenStreetMap Nominatim API
  // For now, return a mock address
  return `Street ${Math.floor(Math.random() * 100)}, Area near ${lat.toFixed(4)}, ${lng.toFixed(4)}, Karachi, Pakistan`;
};

const CheckoutPage = () => {
  const { items, getTotal, updateQuantity, removeItem } = useCart();
  const { checkoutState, updateFormData, setAppliedCoupon } = useCheckout();
  const navigate = useNavigate();
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const formData = checkoutState.formData;
  const subtotal = getTotal();
  const discountAmount = checkoutState.appliedCoupon?.discountAmount ?? 0;
  const total = Math.max(0, subtotal - discountAmount);

  const courseItem = items.find((item) => item.type === "course");

  // Validate cart items against latest stock on cart page load
  useEffect(() => {
    let cancelled = false;

    const isProbablyBookId = (id: string): boolean => {
      // Supabase book IDs are typically UUIDs; skip non-UUID IDs (e.g. course bundle items)
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    };

    const validateCart = async () => {
      if (items.length === 0) return;

      const validations = await Promise.all(
        items.map(async (item) => {
          if (!isProbablyBookId(item.id)) {
            return { id: item.id, currentQty: item.quantity, latestStock: null as number | null };
          }
          const stockResponse = await getProductStock(item.id);
          const latestStock = stockResponse.success ? stockResponse.data.stock : 0;
          return { id: item.id, currentQty: item.quantity, latestStock };
        })
      );

      if (cancelled) return;

      let didChange = false;
      for (const v of validations) {
        if (v.latestStock === null) continue;
        if (v.latestStock <= 0) {
          if (v.currentQty !== 0) {
            updateQuantity(v.id, 0);
            didChange = true;
          }
          continue;
        }

        if (v.currentQty > v.latestStock) {
          updateQuantity(v.id, v.latestStock);
          didChange = true;
        }
      }

      if (didChange) {
        toast({
          description: "Cart updated due to stock change.",
        });
      }
    };

    validateCart();

    return () => {
      cancelled = true;
    };
  }, [items, updateQuantity]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      return;
    }

    // Validate required fields
    if (!formData.name.trim() || !formData.primaryPhone.trim() || !formData.address.trim()) {
      return;
    }

    // Navigate to delivery method selection
    navigate(ROUTES.DELIVERY_METHOD);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    setIsLoadingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          const address = await reverseGeocode(latitude, longitude);
          updateFormData({
            address,
            latitude,
            longitude,
          });
        } catch (error) {
          setLocationError("Failed to get address from location. Please enter manually.");
        } finally {
          setIsLoadingLocation(false);
        }
      },
      (error) => {
        setIsLoadingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Location permission denied. Please enable location access or enter address manually.");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location information unavailable. Please enter address manually.");
            break;
          case error.TIMEOUT:
            setLocationError("Location request timed out. Please try again or enter address manually.");
            break;
          default:
            setLocationError("An error occurred while getting your location. Please enter address manually.");
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleApplyCoupon = async () => {
    const code = couponInput.trim();
    if (!code) {
      toast({ variant: "destructive", description: "Please enter a coupon code." });
      return;
    }
    if (subtotal <= 0) {
      toast({ variant: "destructive", description: "Add items to cart first." });
      return;
    }
    setIsValidatingCoupon(true);
    const res = await validateCoupon(code, subtotal);
    setIsValidatingCoupon(false);
    if (!res.success) {
      toast({ variant: "destructive", description: res.message });
      return;
    }
    if (res.data) {
      setAppliedCoupon({
        couponId: res.data.couponId,
        code: res.data.code,
        discountAmount: res.data.discountAmount,
      });
      toast({ description: `Coupon applied. You save Rs. ${res.data.discountAmount}.` });
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
  };

  // Generate map embed URL (using OpenStreetMap)
  const getMapEmbedUrl = (): string | null => {
    if (formData.latitude && formData.longitude) {
      return `https://www.openstreetmap.org/export/embed.html?bbox=${formData.longitude - 0.01},${formData.latitude - 0.01},${formData.longitude + 0.01},${formData.latitude + 0.01}&layer=mapnik&marker=${formData.latitude},${formData.longitude}`;
    }
    return null;
  };

  if (items.length === 0) {
    return (
      <div className="py-8 md:py-12">
        <div className="container max-w-2xl">
          <Card>
            <CardContent className="p-8 text-center">
              <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">
                Add some items to your cart before checking out.
              </p>
              <Button asChild>
                <Link to="/">Continue Shopping</Link>
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
        <div className="grid md:grid-cols-3 gap-8">
          {/* Customer Information Form */}
          <div className="md:col-span-2">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-6">Customer Information</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="primaryPhone">Primary Phone *</Label>
                    <Input
                      id="primaryPhone"
                      name="primaryPhone"
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={formData.primaryPhone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, "");
                        updateFormData({ primaryPhone: value });
                      }}
                      required
                      placeholder="03001234567"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondaryPhone">Secondary Phone (Optional)</Label>
                    <Input
                      id="secondaryPhone"
                      name="secondaryPhone"
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={formData.secondaryPhone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, "");
                        updateFormData({ secondaryPhone: value });
                      }}
                      placeholder="03001234567"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="address">Delivery Address *</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleUseCurrentLocation}
                        disabled={isLoadingLocation}
                        className="text-xs"
                      >
                        {isLoadingLocation ? (
                          <>
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Getting Location...
                          </>
                        ) : (
                          <>
                            <MapPin className="h-3 w-3 mr-1" />
                            Use Current Location
                          </>
                        )}
                      </Button>
                    </div>
                    <Textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      placeholder="Enter your complete delivery address"
                    />
                    {locationError && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Location Error</AlertTitle>
                        <AlertDescription>{locationError}</AlertDescription>
                      </Alert>
                    )}
                    {formData.latitude && formData.longitude && (
                      <div className="mt-2 space-y-2">
                        <p className="text-xs text-muted-foreground">
                          Location: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                        </p>
                        <div className="w-full h-48 rounded-md overflow-hidden border">
                          <iframe
                            title="Location Map"
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            scrolling="no"
                            marginHeight={0}
                            marginWidth={0}
                            src={getMapEmbedUrl() || undefined}
                            className="border-0"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={!formData.name.trim() || !formData.primaryPhone.trim() || !formData.address.trim()}
                  >
                    Continue to Delivery Method
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="md:col-span-1">
            <Card variant="elevated" className="sticky top-24">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-semibold">Order Summary</h3>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="coupon" className="text-sm font-medium flex items-center gap-1">
                      <Tag className="h-4 w-4" />
                      Coupon
                    </Label>
                  </div>
                  {checkoutState.appliedCoupon ? (
                    <div className="flex items-center justify-between gap-2 rounded-lg border bg-muted/50 px-3 py-2 text-sm">
                      <span className="font-medium">{checkoutState.appliedCoupon.code}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-muted-foreground"
                        onClick={handleRemoveCoupon}
                        aria-label="Remove coupon"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        id="coupon"
                        placeholder="Enter code"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        className="h-9"
                        disabled={isValidatingCoupon}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-9 shrink-0"
                        onClick={handleApplyCoupon}
                        disabled={isValidatingCoupon || !couponInput.trim()}
                      >
                        {isValidatingCoupon ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Apply"
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {courseItem ? (
                    <div className="space-y-3 text-sm">
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">School</span>
                          <span className="font-medium">{courseItem.schoolName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Class</span>
                          <span className="font-medium">{courseItem.className}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Course Type</span>
                          <span className="font-medium capitalize">{courseItem.courseType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Quantity</span>
                          <span className="font-medium">{courseItem.quantity}</span>
                        </div>
                      </div>

                      <div>
                        <p className="text-muted-foreground mb-1">Books included:</p>
                        <ul className="list-disc list-inside space-y-0.5">
                          {courseItem.books?.map((b) => (
                            <li key={b.bookId}>{b.title}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex justify-between font-semibold">
                        <span>Total Price</span>
                        <span>Rs. {courseItem.price * courseItem.quantity}</span>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="px-0 h-auto text-xs text-destructive"
                        onClick={() => removeItem(courseItem.id)}
                      >
                        Remove Course
                      </Button>
                    </div>
                  ) : (
                    items.map((item) => (
                      <div key={item.id} className="space-y-1 text-sm">
                        <div className="flex justify-between gap-2">
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
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="px-0 h-auto text-xs text-destructive"
                          onClick={() => removeItem(item.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))
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
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    onClick={() => navigate(ROUTES.HOME)}
                  >
                    Continue Shopping
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

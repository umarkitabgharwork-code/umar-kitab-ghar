import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useCart } from "@/contexts/CartContext";
import { useCheckout } from "@/contexts/CheckoutContext";
import { ArrowLeft, ShoppingCart, MapPin, Loader2, AlertCircle } from "lucide-react";
import { ROUTES } from "@/lib/constants";

// Mock reverse geocoding function
const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  // In a real app, you would use a service like Google Maps Geocoding API
  // or OpenStreetMap Nominatim API
  // For now, return a mock address
  return `Street ${Math.floor(Math.random() * 100)}, Area near ${lat.toFixed(4)}, ${lng.toFixed(4)}, Karachi, Pakistan`;
};

const CheckoutPage = () => {
  const { items, getTotal } = useCart();
  const { checkoutState, updateFormData } = useCheckout();
  const navigate = useNavigate();
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const formData = checkoutState.formData;
  const total = getTotal();

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
                <Link to="/buy-book">Continue Shopping</Link>
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
          <Link to="/buy-book">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Shopping
          </Link>
        </Button>

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
                      value={formData.primaryPhone}
                      onChange={handleInputChange}
                      required
                      placeholder="03XX-XXXXXXX"
                      pattern="[0-9]{4}-[0-9]{7}"
                    />
                    <p className="text-xs text-muted-foreground">Format: 03XX-XXXXXXX</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondaryPhone">Secondary Phone (Optional)</Label>
                    <Input
                      id="secondaryPhone"
                      name="secondaryPhone"
                      type="tel"
                      value={formData.secondaryPhone}
                      onChange={handleInputChange}
                      placeholder="03XX-XXXXXXX"
                      pattern="[0-9]{4}-[0-9]{7}"
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

export default CheckoutPage;
